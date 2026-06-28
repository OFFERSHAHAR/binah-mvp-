import { NextRequest, NextResponse } from 'next/server'
import { getSession, updateSessionActivity } from './session'
import { verifyCSRFToken } from './csrf'
import { isRateLimited, recordAttempt } from './rate-limiting'
import { logAuditEvent } from './audit-logger'
import { hasPermission, UserRole } from './rbac'

export interface AuthenticatedRequest extends NextRequest {
  auth?: {
    userId: string
    email: string
    role: UserRole
    sessionId: string
  }
}

export interface MiddlewareOptions {
  requireAuth?: boolean
  requireCSRF?: boolean
  requireRole?: UserRole | UserRole[]
  requirePermission?: { resource: string; action: string }
  rateLimit?: {
    enabled: boolean
    maxAttempts?: number
    windowDuration?: number
  }
}

/**
 * Extract session token from request
 */
export function extractSessionToken(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Check cookies
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim())
    const sessionCookie = cookies.find((c) => c.startsWith('session_token='))
    if (sessionCookie) {
      return sessionCookie.substring(14)
    }
  }

  return null
}

/**
 * Extract CSRF token from request
 */
export function extractCSRFToken(request: NextRequest): string | null {
  // Check header
  const headerToken = request.headers.get('x-csrf-token')
  if (headerToken) {
    return headerToken
  }

  // Check body for POST requests
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
    // Note: We would need to parse the body here
    // For now, header-based extraction is sufficient
  }

  return null
}

/**
 * Get client IP address
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // No forwarded headers available
  return 'unknown'
}

/**
 * Authenticate request
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ success: boolean; error?: string; auth?: AuthenticatedRequest['auth'] }> {
  const token = extractSessionToken(request)

  if (!token) {
    return { success: false, error: 'No session token found' }
  }

  const session = await getSession(token)

  if (!session) {
    logAuditEvent('SESSION_EXPIRED', {
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      status: 'failure',
    })
    return { success: false, error: 'Session expired or invalid' }
  }

  // Update last activity
  await updateSessionActivity(token)

  return {
    success: true,
    auth: {
      userId: session.userId,
      email: session.user.email,
      role: session.user.role,
      sessionId: session.id,
    },
  }
}

/**
 * Verify CSRF protection
 */
export async function verifyCSRFProtection(
  request: NextRequest,
  sessionToken: string
): Promise<{ success: boolean; error?: string }> {
  // Only check CSRF for state-changing requests
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    return { success: true }
  }

  const csrfToken = extractCSRFToken(request)

  if (!csrfToken) {
    logAuditEvent('CSRF_TOKEN_INVALID', {
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      status: 'failure',
    })
    return { success: false, error: 'CSRF token required' }
  }

  const isValid = await verifyCSRFToken(csrfToken, sessionToken)

  if (!isValid) {
    logAuditEvent('CSRF_TOKEN_INVALID', {
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      status: 'failure',
      metadata: { attempted: true },
    })
    return { success: false, error: 'Invalid CSRF token' }
  }

  logAuditEvent('CSRF_TOKEN_VERIFIED', {
    ipAddress: getClientIp(request),
    userAgent: request.headers.get('user-agent') || undefined,
    status: 'success',
  })

  return { success: true }
}

/**
 * Check rate limiting
 */
export async function checkRateLimit(
  identifier: string,
  options: { maxAttempts?: number; windowDuration?: number } = {}
): Promise<{ allowed: boolean; error?: string; retryAfter?: number }> {
  if (await isRateLimited(identifier, options)) {
    const result = await recordAttempt(identifier, options)
    return {
      allowed: false,
      error: 'Too many attempts. Please try again later.',
      retryAfter: result.lockedUntil ? Math.ceil((result.lockedUntil - Date.now()) / 1000) : undefined,
    }
  }

  const result = await recordAttempt(identifier, options)

  if (!result.isAllowed) {
    logAuditEvent('RATE_LIMIT_EXCEEDED', {
      ipAddress: identifier,
      status: 'failure',
      metadata: { attemptsRemaining: result.attemptsRemaining },
    })
    return {
      allowed: false,
      error: 'Rate limit exceeded',
      retryAfter: result.lockedUntil ? Math.ceil((result.lockedUntil - Date.now()) / 1000) : undefined,
    }
  }

  return { allowed: true }
}

/**
 * Check authorization
 */
export function checkAuthorization(
  userRole: UserRole,
  options: { requireRole?: UserRole | UserRole[]; requirePermission?: { resource: string; action: string } }
): { authorized: boolean; error?: string } {
  if (options.requireRole) {
    const requiredRoles = Array.isArray(options.requireRole)
      ? options.requireRole
      : [options.requireRole]

    if (!requiredRoles.includes(userRole)) {
      return {
        authorized: false,
        error: `This action requires one of the following roles: ${requiredRoles.join(', ')}`,
      }
    }
  }

  if (options.requirePermission) {
    const { resource, action } = options.requirePermission

    if (!hasPermission(userRole, resource, action)) {
      return {
        authorized: false,
        error: `You do not have permission to ${action} ${resource}`,
      }
    }
  }

  return { authorized: true }
}

/**
 * Security middleware factory
 */
export function createSecurityMiddleware(options: MiddlewareOptions = {}) {
  return async (
    request: NextRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    const clientIp = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Rate limiting
    if (options.rateLimit?.enabled) {
      const rateLimitCheck = await checkRateLimit(clientIp, {
        maxAttempts: options.rateLimit.maxAttempts,
        windowDuration: options.rateLimit.windowDuration,
      })

      if (!rateLimitCheck.allowed) {
        logAuditEvent('RATE_LIMIT_EXCEEDED', {
          ipAddress: clientIp,
          userAgent,
          status: 'failure',
        })

        return NextResponse.json(
          { error: rateLimitCheck.error },
          { status: 429, headers: { 'Retry-After': String(rateLimitCheck.retryAfter || 60) } }
        )
      }
    }

    // Authentication
    if (options.requireAuth) {
      const authResult = await authenticateRequest(request)

      if (!authResult.success) {
        logAuditEvent('UNAUTHORIZED_ACCESS', {
          ipAddress: clientIp,
          userAgent,
          status: 'failure',
        })

        return NextResponse.json({ error: authResult.error }, { status: 401 })
      }

      // CSRF verification
      if (options.requireCSRF) {
        const sessionToken = extractSessionToken(request)

        if (sessionToken) {
          const csrfResult = await verifyCSRFProtection(request, sessionToken)

          if (!csrfResult.success) {
            return NextResponse.json({ error: csrfResult.error }, { status: 403 })
          }
        }
      }

      // Authorization
      if (options.requireRole || options.requirePermission) {
        const authCheck = checkAuthorization(authResult.auth!.role, {
          requireRole: options.requireRole,
          requirePermission: options.requirePermission,
        })

        if (!authCheck.authorized) {
          logAuditEvent('PERMISSION_DENIED', {
            userId: authResult.auth?.userId,
            email: authResult.auth?.email,
            ipAddress: clientIp,
            userAgent,
            status: 'failure',
          })

          return NextResponse.json({ error: authCheck.error }, { status: 403 })
        }
      }

      // Attach auth info to request
      const authRequest = request as AuthenticatedRequest
      authRequest.auth = authResult.auth

      return handler(authRequest)
    }

    // If no auth required, call handler
    return handler(request as AuthenticatedRequest)
  }
}

/**
 * Create a response with security headers
 */
export function createSecureResponse(
  data: any,
  status: number = 200,
  options: { setCookie?: string } = {}
): NextResponse {
  const response = NextResponse.json(data, { status })

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  // Set secure cookie if provided
  if (options.setCookie) {
    response.headers.set('Set-Cookie', options.setCookie)
  }

  return response
}

/**
 * Generate secure HTTP-only cookie value
 */
export function generateSecureCookie(
  name: string,
  value: string,
  options: { maxAge?: number; path?: string; secure?: boolean; sameSite?: 'Strict' | 'Lax' | 'None' } = {}
): string {
  const {
    maxAge = 7 * 24 * 60 * 60, // 7 days
    path = '/',
    secure = true,
    sameSite = 'Strict',
  } = options

  let cookie = `${name}=${value}`
  cookie += `; Path=${path}`
  cookie += `; Max-Age=${maxAge}`
  cookie += '; HttpOnly'
  if (secure) {
    cookie += '; Secure'
  }
  cookie += `; SameSite=${sameSite}`

  return cookie
}
