import { NextRequest, NextResponse } from 'next/server'
import { getSessionStats, cleanupExpiredSessions } from '@/lib/security/session'
import { getRateLimitStats, cleanupExpiredRateLimits } from '@/lib/security/rate-limiting'
import { getAuditStats, getSecurityAlerts } from '@/lib/security/audit-logger'
import { extractSessionToken, createSecureResponse } from '@/lib/security/middleware'
import { getSession } from '@/lib/security/session'

/**
 * GET /api/security/monitor
 * Security monitoring endpoint (admin-only in production)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication (admin-only)
    const token = extractSessionToken(request)

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await getSession(token)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Cleanup
    await cleanupExpiredSessions()
    cleanupExpiredRateLimits()

    // Get stats
    const sessionStats = await getSessionStats()
    const rateLimitStats = getRateLimitStats()
    const auditStats = getAuditStats()
    const securityAlerts = getSecurityAlerts(24)

    return createSecureResponse({
      timestamp: Date.now(),
      sessions: sessionStats,
      rateLimiting: rateLimitStats,
      audit: auditStats,
      alerts: {
        criticalCount: securityAlerts.length,
        recent: securityAlerts.slice(0, 10),
      },
      health: {
        sessionManagementHealthy: sessionStats.totalSessions < 1000,
        rateLimitingHealthy: rateLimitStats.lockedIdentifiers < 100,
        noUnusualActivity: securityAlerts.length < 50,
      },
    })
  } catch (error) {
    console.error('Security monitoring error:', error)

    return NextResponse.json(
      { error: 'Failed to retrieve security stats' },
      { status: 500 }
    )
  }
}
