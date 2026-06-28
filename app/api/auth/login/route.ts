import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword } from '@/lib/password'
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt'
import { validateEmail } from '@/lib/auth-utils'
import { findUserByEmail, updateUserLastLogin, getUserPublicData } from '@/lib/db'
import { checkRateLimit, incrementRateLimit, DEFAULT_AUTH_RATE_LIMIT } from '@/lib/rate-limit'

interface LoginRequest {
  email: string
  password: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitKey = `login:${clientIp}`

    // Check rate limit
    const rateLimit = checkRateLimit(rateLimitKey, DEFAULT_AUTH_RATE_LIMIT)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'בקשות כניסה רבות מדי. אנא נסה שוב מאוחר יותר.',
          retryAfter: rateLimit.resetIn,
        },
        { status: 429 }
      )
    }

    const body: LoginRequest = await request.json()
    const { email, password } = body

    // Validation
    if (!email || !password) {
      incrementRateLimit(rateLimitKey)
      return NextResponse.json(
        { error: 'כתובת דוא"ל וסיסמה הם שדות חובה' },
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

    // Find user
    const user = await findUserByEmail(email.toLowerCase())
    if (!user) {
      incrementRateLimit(rateLimitKey)
      return NextResponse.json(
        { error: 'כתובת דוא"ל או סיסמה לא נכונים' },
        { status: 401 }
      )
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.passwordHash)
    if (!passwordValid) {
      incrementRateLimit(rateLimitKey)
      return NextResponse.json(
        { error: 'כתובת דוא"ל או סיסמה לא נכונים' },
        { status: 401 }
      )
    }

    // Update last login
    await updateUserLastLogin(user.id)

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email)
    const refreshToken = generateRefreshToken(user.id, user.email)

    // Reset rate limit on success
    const successRateLimitKey = `login:${clientIp}:success`
    incrementRateLimit(successRateLimitKey)

    const response = NextResponse.json(
      {
        success: true,
        user: getUserPublicData(user),
        tokens: {
          accessToken,
          refreshToken,
        },
      },
      { status: 200 }
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
    const rateLimitKey = `login:${clientIp}`
    incrementRateLimit(rateLimitKey)

    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'שגיאה בכניסה. אנא נסה שוב מאוחר יותר.' },
      { status: 500 }
    )
  }
}
