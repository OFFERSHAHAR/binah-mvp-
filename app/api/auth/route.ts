import { NextRequest, NextResponse } from 'next/server'
import {
  createSession,
  invalidateSession,
  type SessionUser,
} from '@/lib/security/session'
import { createCSRFToken } from '@/lib/security/csrf'
import { logAuditEvent } from '@/lib/security/audit-logger'
import {
  extractSessionToken,
  getClientIp,
  generateSecureCookie,
  createSecureResponse,
  checkRateLimit,
} from '@/lib/security/middleware'

// Mock user database
const mockUsers: Record<string, any> = {
  'demo@binah.com': {
    id: '1',
    email: 'demo@binah.com',
    password: 'demo123', // demo only
    fullName: 'דנה כהן',
    role: 'student',
    avatar: '👩‍🎓',
  },
}

/**
 * GET - Generate CSRF token for login/signup forms
 */
export async function GET(request: NextRequest) {
  try {
    const csrfTokenData = await createCSRFToken()

    logAuditEvent('CSRF_TOKEN_GENERATED', {
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      status: 'success',
    })

    return createSecureResponse({
      csrfToken: csrfTokenData.token,
    })
  } catch (error) {
    logAuditEvent('CSRF_TOKEN_GENERATED', {
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      status: 'failure',
    })

    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}

/**
 * POST - Handle signup and signin with CSRF protection
 */
export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request)
  const userAgent = request.headers.get('user-agent') || undefined

  try {
    const { action, email, password, fullName } = await request.json()

    // Rate limiting check
    const rateLimitKey = `${action}:${email}:${clientIp}`
    const rateLimitResult = await checkRateLimit(rateLimitKey, {
      maxAttempts: 5,
      windowDuration: 15 * 60 * 1000, // 15 minutes
    })

    if (!rateLimitResult.allowed) {
      logAuditEvent('RATE_LIMIT_EXCEEDED', {
        email,
        ipAddress: clientIp,
        userAgent,
        status: 'failure',
      })

      return NextResponse.json(
        { error: rateLimitResult.error },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimitResult.retryAfter || 60) },
        }
      )
    }

    // Validate input
    if (!email || !password) {
      logAuditEvent('LOGIN_FAILED', {
        email,
        ipAddress: clientIp,
        userAgent,
        status: 'failure',
        metadata: { reason: 'missing_credentials' },
      })

      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (action === 'signup') {
      return handleSignup(email, password, fullName, clientIp, userAgent)
    }

    if (action === 'signin') {
      return handleSignin(email, password, clientIp, userAgent)
    }

    if (action === 'logout') {
      return handleLogout(request, clientIp, userAgent)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Auth error:', error)

    logAuditEvent('LOGIN_FAILED', {
      ipAddress: clientIp,
      userAgent,
      status: 'failure',
      metadata: { reason: 'internal_error' },
    })

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle signup
 */
async function handleSignup(
  email: string,
  password: string,
  fullName: string,
  clientIp: string,
  userAgent?: string
): Promise<NextResponse> {
  if (mockUsers[email]) {
    logAuditEvent('LOGIN_FAILED', {
      email,
      ipAddress: clientIp,
      userAgent,
      status: 'failure',
      metadata: { reason: 'user_exists' },
    })

    return NextResponse.json({ error: 'User already exists' }, { status: 400 })
  }

  if (!fullName) {
    return NextResponse.json(
      { error: 'Full name is required' },
      { status: 400 }
    )
  }

  const newUserId = Math.random().toString(36).substring(7)

  const newUser = {
    id: newUserId,
    email,
    password,
    fullName,
    role: 'student',
    avatar: '👤',
  }

  mockUsers[email] = newUser

  // Create session
  const sessionUser: SessionUser = {
    id: newUserId,
    email,
    fullName,
    role: 'student',
    avatar: '👤',
    lastActivity: Date.now(),
  }

  const session = await createSession(sessionUser, clientIp, userAgent)
  const csrfToken = await createCSRFToken()

  logAuditEvent('LOGIN_SUCCESS', {
    userId: newUserId,
    email,
    ipAddress: clientIp,
    userAgent,
    status: 'success',
  })

  const response = createSecureResponse(
    {
      user: {
        id: session.userId,
        email: session.user.email,
        fullName: session.user.fullName,
        role: session.user.role,
      },
      session: {
        token: session.token,
        expiresAt: session.expiresAt,
      },
      csrf: {
        token: csrfToken.token,
      },
    },
    200,
    {
      setCookie: generateSecureCookie('session_token', session.token, {
        maxAge: 7 * 24 * 60 * 60,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      }),
    }
  )

  return response
}

/**
 * Handle signin
 */
async function handleSignin(
  email: string,
  password: string,
  clientIp: string,
  userAgent?: string
): Promise<NextResponse> {
  const user = mockUsers[email]

  if (!user || user.password !== password) {
    logAuditEvent('LOGIN_FAILED', {
      email,
      ipAddress: clientIp,
      userAgent,
      status: 'failure',
      metadata: { reason: 'invalid_credentials' },
    })

    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    )
  }

  // Create session
  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    avatar: user.avatar,
    lastActivity: Date.now(),
  }

  const session = await createSession(sessionUser, clientIp, userAgent)
  const csrfToken = await createCSRFToken()

  logAuditEvent('LOGIN_SUCCESS', {
    userId: user.id,
    email,
    ipAddress: clientIp,
    userAgent,
    status: 'success',
  })

  const response = createSecureResponse(
    {
      user: {
        id: session.userId,
        email: session.user.email,
        fullName: session.user.fullName,
        role: session.user.role,
      },
      session: {
        token: session.token,
        expiresAt: session.expiresAt,
      },
      csrf: {
        token: csrfToken.token,
      },
    },
    200,
    {
      setCookie: generateSecureCookie('session_token', session.token, {
        maxAge: 7 * 24 * 60 * 60,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      }),
    }
  )

  return response
}

/**
 * Handle logout
 */
async function handleLogout(
  request: NextRequest,
  clientIp: string,
  userAgent?: string
): Promise<NextResponse> {
  const token = extractSessionToken(request)

  if (token) {
    await invalidateSession(token)

    logAuditEvent('LOGOUT', {
      ipAddress: clientIp,
      userAgent,
      status: 'success',
    })
  }

  const response = createSecureResponse({ success: true }, 200, {
    setCookie: generateSecureCookie('session_token', '', {
      maxAge: 0,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    }),
  })

  return response
}
