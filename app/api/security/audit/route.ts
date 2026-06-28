import { NextRequest, NextResponse } from 'next/server'
import {
  getAuditLogs,
  getUserActivityTimeline,
  getLoginAttempts,
  exportAuditLogs,
} from '@/lib/security/audit-logger'
import { extractSessionToken, createSecureResponse } from '@/lib/security/middleware'
import { getSession } from '@/lib/security/session'

/**
 * GET /api/security/audit
 * Retrieve audit logs (admin-only)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = extractSessionToken(request)

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await getSession(token)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId') || undefined
    const eventType = url.searchParams.get('eventType')
    const severity = url.searchParams.get('severity')
    const limit = parseInt(url.searchParams.get('limit') || '100', 10)
    const offset = parseInt(url.searchParams.get('offset') || '0', 10)
    const format = url.searchParams.get('format') || 'json'

    // Get logs
    const logs = getAuditLogs({
      userId,
      eventType: eventType as any,
      severity: severity as any,
      limit,
      offset,
    })

    if (format === 'csv') {
      const csv = exportAuditLogs('csv')

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="audit-logs.csv"',
        },
      })
    }

    return createSecureResponse({
      logs,
      pagination: {
        limit,
        offset,
        total: logs.length,
      },
    })
  } catch (error) {
    console.error('Audit log retrieval error:', error)

    return NextResponse.json(
      { error: 'Failed to retrieve audit logs' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/security/audit
 * Query specific audit information
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = extractSessionToken(request)

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await getSession(token)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { queryType, userId, email, hours } = await request.json()

    switch (queryType) {
      case 'userActivity':
        return createSecureResponse({
          activity: getUserActivityTimeline(userId, 50),
        })

      case 'loginAttempts':
        return createSecureResponse({
          attempts: getLoginAttempts(email, hours || 24),
        })

      default:
        return NextResponse.json({ error: 'Invalid query type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Audit query error:', error)

    return NextResponse.json(
      { error: 'Failed to process audit query' },
      { status: 500 }
    )
  }
}
