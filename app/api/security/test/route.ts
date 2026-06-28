import { NextRequest, NextResponse } from 'next/server'
import {
  createCSRFToken,
  verifyCSRFToken,
  clearAllTokens as clearAllCSRFTokens,
  getStoredTokenCount,
} from '@/lib/security/csrf'
import {
  createSession,
  invalidateSession,
  getSession,
  clearAllSessions,
  getSessionStats,
} from '@/lib/security/session'
import {
  recordAttempt,
  getRateLimitStatus,
  clearAllRateLimits,
  getRateLimitStats,
} from '@/lib/security/rate-limiting'
import {
  logAuditEvent,
  getAuditLogs,
  getAuditStats,
  clearAuditLogs,
} from '@/lib/security/audit-logger'
import {
  hasPermission,
  getPermissions,
  generatePermissionMatrix,
} from '@/lib/security/rbac'

/**
 * Security testing endpoint
 * WARNING: This should be disabled in production!
 */
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Security testing endpoint is disabled in production' },
      { status: 403 }
    )
  }

  try {
    const testType = new URL(request.url).searchParams.get('test') || 'all'

    const results: Record<string, any> = {}

    // Test CSRF
    if (testType === 'csrf' || testType === 'all') {
      const csrfToken = await createCSRFToken()
      const isValid = await verifyCSRFToken(csrfToken.token, csrfToken.secret)
      const isInvalid = await verifyCSRFToken(csrfToken.token, 'wrong_secret')

      results.csrf = {
        passed: isValid && !isInvalid,
        tests: {
          tokenGeneration: !!csrfToken.token,
          validTokenVerification: isValid,
          invalidTokenVerification: !isInvalid,
          storedTokens: getStoredTokenCount(),
        },
      }
    }

    // Test Sessions
    if (testType === 'session' || testType === 'all') {
      const sessionUser = {
        id: 'test-user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'student' as const,
        lastActivity: Date.now(),
      }

      const session = await createSession(sessionUser)
      const retrieved = await getSession(session.token)
      const invalidated = await invalidateSession(session.token)
      const notFound = await getSession(session.token)

      results.session = {
        passed: !!retrieved && invalidated && !notFound,
        tests: {
          sessionCreation: !!session,
          sessionRetrieval: !!retrieved,
          sessionInvalidation: invalidated,
          expiredSessionNotFound: !notFound,
          stats: await getSessionStats(),
        },
      }
    }

    // Test Rate Limiting
    if (testType === 'ratelimit' || testType === 'all') {
      const testId = 'test-ratelimit-user'
      clearAllRateLimits()

      const attempts = []
      for (let i = 0; i < 7; i++) {
        const result = await recordAttempt(testId)
        attempts.push(result)
      }

      const status = await getRateLimitStatus(testId)

      results.rateLimit = {
        passed: status.isLimited && attempts[5].isAllowed === false,
        tests: {
          allowedAttempts: attempts.slice(0, 5).every((a) => a.isAllowed),
          blockedAfterLimit: !attempts[5].isAllowed,
          exponentialBackoff: status.backoffLevel > 0,
          stats: getRateLimitStats(),
        },
      }
    }

    // Test Audit Logging
    if (testType === 'audit' || testType === 'all') {
      clearAuditLogs()

      logAuditEvent('LOGIN_SUCCESS', {
        userId: 'test-user',
        email: 'test@example.com',
        status: 'success',
      })

      logAuditEvent('LOGIN_FAILED', {
        email: 'test@example.com',
        status: 'failure',
      })

      const logs = getAuditLogs({ limit: 10 })
      const stats = getAuditStats()

      results.audit = {
        passed: logs.length === 2,
        tests: {
          eventLogging: logs.length === 2,
          severityAssignment: logs.some((l) => l.severity),
          statsGeneration: !!stats.totalLogs,
          stats,
        },
      }
    }

    // Test RBAC
    if (testType === 'rbac' || testType === 'all') {
      const studentPerms = getPermissions('student')
      const teacherPerms = getPermissions('teacher')
      const adminPerms = getPermissions('admin')

      const studentDashboard = hasPermission('student', 'dashboard', 'read')
      const studentGrades = hasPermission('student', 'grades', 'update')
      const adminUsers = hasPermission('admin', 'users', 'delete')

      results.rbac = {
        passed: studentDashboard && !studentGrades && adminUsers,
        tests: {
          studentRead: studentDashboard,
          studentCannotUpdate: !studentGrades,
          adminFullAccess: adminUsers,
          permissionCounts: {
            student: studentPerms.length,
            teacher: teacherPerms.length,
            admin: adminPerms.length,
          },
          permissionMatrix: generatePermissionMatrix(),
        },
      }
    }

    // Overall result
    const allPassed = Object.values(results).every((r) => r.passed !== false)

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: allPassed ? 'all_tests_passed' : 'some_tests_failed',
      results,
    })
  } catch (error) {
    console.error('Security test error:', error)

    return NextResponse.json(
      { error: 'Security test failed', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * POST - Reset security state for testing
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Security reset is disabled in production' },
      { status: 403 }
    )
  }

  try {
    const { reset } = await request.json()

    const results: Record<string, boolean> = {}

    if (reset === 'all' || reset === 'csrf') {
      clearAllCSRFTokens()
      results.csrf = true
    }

    if (reset === 'all' || reset === 'sessions') {
      clearAllSessions()
      results.sessions = true
    }

    if (reset === 'all' || reset === 'ratelimit') {
      clearAllRateLimits()
      results.rateLimit = true
    }

    if (reset === 'all' || reset === 'audit') {
      clearAuditLogs()
      results.audit = true
    }

    return NextResponse.json({
      message: 'Security state reset successful',
      reset: results,
    })
  } catch (error) {
    console.error('Security reset error:', error)

    return NextResponse.json(
      { error: 'Security reset failed' },
      { status: 500 }
    )
  }
}
