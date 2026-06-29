import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/lib/password'
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt'
import { validateEmail, validatePassword } from '@/lib/auth-utils'
import { createUser, getUserPublicData } from '@/lib/db'
import { checkRateLimit, incrementRateLimit, DEFAULT_AUTH_RATE_LIMIT } from '@/lib/rate-limit'
import { kvSet } from '@/lib/store/kv'
import { sendVerificationEmail } from '@/lib/email'
import { sendWhatsApp } from '@/lib/whatsapp'

interface RegisterRequest {
  phone?: string
  email: string
  password: string
  confirmPassword: string
  name: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitKey = `register:${clientIp}`

    // Check rate limit
    const rateLimit = checkRateLimit(rateLimitKey, DEFAULT_AUTH_RATE_LIMIT)
    if (!rateLimit.allowed) {
      incrementRateLimit(rateLimitKey)
      return NextResponse.json(
        {
          error: 'בקשות רבות מדי. אנא נסה שוב מאוחר יותר.',
          retryAfter: rateLimit.resetIn,
        },
        { status: 429 }
      )
    }

    const body: RegisterRequest = await request.json()
    const { email, password, confirmPassword, name, phone } = body

    // Validation
    if (!email || !password || !confirmPassword || !name) {
      incrementRateLimit(rateLimitKey)
      return NextResponse.json(
        { error: 'כל השדות הם חובה' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      incrementRateLimit(rateLimitKey)
      return NextResponse.json(
        { error: 'כתובת דוא"ל לא תקינה' },
        { status: 400 }
      )
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      incrementRateLimit(rateLimitKey)
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      incrementRateLimit(rateLimitKey)
      return NextResponse.json(
        { error: 'הסיסמאות לא תואמות' },
        { status: 400 }
      )
    }

    if (name.trim().length < 2 || name.trim().length > 100) {
      incrementRateLimit(rateLimitKey)
      return NextResponse.json(
        { error: 'השם חייב להיות בין 2 ל-100 תווים' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const user = await createUser({
      email: email.toLowerCase(),
      passwordHash,
      name: name.trim(),
      role: 'student',
      phone: phone?.trim() || undefined,
    })

    // Send WhatsApp welcome (best-effort — no-op if no phone or gateway unconfigured)
    if (phone?.trim()) {
      try {
        await sendWhatsApp(
          phone.trim(),
          [
            '*בִּינָה*  ‹ / ›   בית הספר ל-AI',
            '━━━━━━━━━━━━━━━',
            '',
            `שלום *${user.name}*! 👋`,
            'ההרשמה הושלמה בהצלחה ✅',
            '',
            '```> initializing your journey...```',
            '',
            '🎓 *מה הלאה:*',
            '• הקורס הראשון מחכה לך בלוח הבקרה',
            '• שיעורים, תרגול ומבחנים — הכל במקום אחד',
            '• תזכורות ועדכונים יגיעו אליך לכאן',
            '',
            '_בהצלחה, ונתראה בכיתה!_',
            '— צוות בִּינָה',
          ].join('\n')
        )
      } catch (waErr) {
        console.error('WhatsApp welcome failed (signup still succeeded):', waErr)
      }
    }

    // Send confirmation email (best-effort — never fail signup if email is down/unconfigured)
    try {
      const verifyToken = crypto.randomBytes(32).toString('hex')
      await kvSet(`verify:${verifyToken}`, user.email, 24 * 60 * 60) // 24h
      const verifyUrl = `${request.nextUrl.origin}/api/auth/verify?token=${verifyToken}`
      await sendVerificationEmail(user.email, user.name, verifyUrl)
    } catch (emailErr) {
      console.error('Verification email failed (signup still succeeded):', emailErr)
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email)
    const refreshToken = generateRefreshToken(user.id, user.email)

    // Reset rate limit on success
    incrementRateLimit(rateLimitKey)

    const response = NextResponse.json(
      {
        success: true,
        user: getUserPublicData(user),
        tokens: {
          accessToken,
          refreshToken,
        },
      },
      { status: 201 }
    )

    // Set refresh token in HTTP-only cookie
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/api/auth',
    })

    return response
  } catch (error) {
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitKey = `register:${clientIp}`
    incrementRateLimit(rateLimitKey)

    if (error instanceof Error) {
      if (error.message === 'User already exists') {
        return NextResponse.json(
          { error: 'כתובת דוא"ל זו כבר רשומה' },
          { status: 409 }
        )
      }
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'שגיאה בהרשמה. אנא נסה שוב מאוחר יותר.' },
      { status: 500 }
    )
  }
}
