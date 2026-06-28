import { NextRequest, NextResponse } from 'next/server'
import { createCSRFToken } from '@/lib/security/csrf'
import { logAuditEvent } from '@/lib/security/audit-logger'
import { getClientIp, createSecureResponse } from '@/lib/security/middleware'

/**
 * GET /api/security/csrf-token
 * Generate a CSRF token for use in forms
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
      token: csrfTokenData.token,
      secret: csrfTokenData.secret,
    })
  } catch (error) {
    console.error('CSRF token generation error:', error)

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
