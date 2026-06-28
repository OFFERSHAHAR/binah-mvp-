/**
 * Audit logging system for security events
 */

export type AuditEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET'
  | 'SESSION_EXPIRED'
  | 'SESSION_INVALIDATED'
  | 'CSRF_TOKEN_GENERATED'
  | 'CSRF_TOKEN_VERIFIED'
  | 'CSRF_TOKEN_INVALID'
  | 'UNAUTHORIZED_ACCESS'
  | 'RATE_LIMIT_EXCEEDED'
  | 'PERMISSION_DENIED'
  | 'DATA_ACCESS'
  | 'DATA_MODIFIED'

export interface AuditLog {
  id: string
  timestamp: number
  eventType: AuditEventType
  userId?: string
  email?: string
  ipAddress?: string
  userAgent?: string
  resource?: string
  action?: string
  status: 'success' | 'failure'
  metadata?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// In-memory audit log storage (use database in production)
const auditLogs: AuditLog[] = []
const MAX_LOGS = 10000 // Keep last 10k logs in memory

/**
 * Generate unique log ID
 */
function generateLogId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Determine severity level based on event type
 */
function determineSeverity(
  eventType: AuditEventType,
  status: 'success' | 'failure'
): 'low' | 'medium' | 'high' | 'critical' {
  const criticalEvents = new Set([
    'CSRF_TOKEN_INVALID',
    'UNAUTHORIZED_ACCESS',
    'PERMISSION_DENIED',
    'RATE_LIMIT_EXCEEDED',
  ])

  const highSeverityEvents = new Set(['LOGIN_FAILED', 'PASSWORD_CHANGED', 'SESSION_INVALIDATED'])

  if (criticalEvents.has(eventType)) {
    return 'critical'
  }

  if (highSeverityEvents.has(eventType) && status === 'failure') {
    return 'high'
  }

  if (highSeverityEvents.has(eventType)) {
    return 'medium'
  }

  return 'low'
}

/**
 * Log an audit event
 */
export function logAuditEvent(
  eventType: AuditEventType,
  options: {
    userId?: string
    email?: string
    ipAddress?: string
    userAgent?: string
    resource?: string
    action?: string
    status?: 'success' | 'failure'
    metadata?: Record<string, any>
  } = {}
): AuditLog {
  const {
    userId,
    email,
    ipAddress,
    userAgent,
    resource,
    action,
    status = 'success',
    metadata = {},
  } = options

  const severity = determineSeverity(eventType, status)

  const log: AuditLog = {
    id: generateLogId(),
    timestamp: Date.now(),
    eventType,
    userId,
    email,
    ipAddress,
    userAgent,
    resource,
    action,
    status,
    metadata,
    severity,
  }

  auditLogs.push(log)

  // Maintain max size
  if (auditLogs.length > MAX_LOGS) {
    auditLogs.shift()
  }

  // Log critical events to console
  if (severity === 'critical') {
    console.warn('[SECURITY] Critical audit event:', log)
  }

  return log
}

/**
 * Get audit logs with filtering
 */
export function getAuditLogs(options: {
  userId?: string
  email?: string
  eventType?: AuditEventType
  startTime?: number
  endTime?: number
  severity?: 'low' | 'medium' | 'high' | 'critical'
  limit?: number
  offset?: number
} = {}): AuditLog[] {
  const {
    userId,
    email,
    eventType,
    startTime,
    endTime,
    severity,
    limit = 100,
    offset = 0,
  } = options

  let filtered = auditLogs.slice()

  if (userId) {
    filtered = filtered.filter((log) => log.userId === userId)
  }

  if (email) {
    filtered = filtered.filter((log) => log.email === email)
  }

  if (eventType) {
    filtered = filtered.filter((log) => log.eventType === eventType)
  }

  if (startTime) {
    filtered = filtered.filter((log) => log.timestamp >= startTime)
  }

  if (endTime) {
    filtered = filtered.filter((log) => log.timestamp <= endTime)
  }

  if (severity) {
    filtered = filtered.filter((log) => log.severity === severity)
  }

  // Sort by timestamp descending
  filtered.sort((a, b) => b.timestamp - a.timestamp)

  return filtered.slice(offset, offset + limit)
}

/**
 * Get user activity timeline
 */
export function getUserActivityTimeline(
  userId: string,
  limit: number = 50
): AuditLog[] {
  return getAuditLogs({
    userId,
    limit,
  })
}

/**
 * Get login attempts for a user
 */
export function getLoginAttempts(
  email: string,
  hours: number = 24
): { successful: AuditLog[]; failed: AuditLog[] } {
  const startTime = Date.now() - hours * 60 * 60 * 1000

  const logs = getAuditLogs({
    email,
    eventType: 'LOGIN_SUCCESS',
    startTime,
    limit: 1000,
  })

  const failedLogs = getAuditLogs({
    email,
    eventType: 'LOGIN_FAILED',
    startTime,
    limit: 1000,
  })

  return {
    successful: logs.filter((l) => l.status === 'success'),
    failed: failedLogs.filter((l) => l.status === 'failure'),
  }
}

/**
 * Get security alerts (critical events)
 */
export function getSecurityAlerts(hours: number = 24): AuditLog[] {
  const startTime = Date.now() - hours * 60 * 60 * 1000

  return getAuditLogs({
    severity: 'critical',
    startTime,
    limit: 1000,
  })
}

/**
 * Get audit stats
 */
export function getAuditStats() {
  const stats = {
    totalLogs: auditLogs.length,
    byEventType: {} as Record<AuditEventType, number>,
    bySeverity: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    },
    byStatus: {
      success: 0,
      failure: 0,
    },
    last24Hours: {
      loginAttempts: 0,
      failedLogins: 0,
      criticalEvents: 0,
    },
  }

  const last24Start = Date.now() - 24 * 60 * 60 * 1000

  auditLogs.forEach((log) => {
    // By event type
    stats.byEventType[log.eventType] = (stats.byEventType[log.eventType] || 0) + 1

    // By severity
    stats.bySeverity[log.severity]++

    // By status
    stats.byStatus[log.status]++

    // Last 24 hours
    if (log.timestamp > last24Start) {
      if (log.eventType === 'LOGIN_SUCCESS') {
        stats.last24Hours.loginAttempts++
      }
      if (log.eventType === 'LOGIN_FAILED') {
        stats.last24Hours.failedLogins++
      }
      if (log.severity === 'critical') {
        stats.last24Hours.criticalEvents++
      }
    }
  })

  return stats
}

/**
 * Clear audit logs (for testing)
 */
export function clearAuditLogs(): void {
  auditLogs.length = 0
}

/**
 * Export audit logs
 */
export function exportAuditLogs(format: 'json' | 'csv' = 'json'): string {
  if (format === 'json') {
    return JSON.stringify(auditLogs, null, 2)
  }

  // CSV format
  const headers = [
    'ID',
    'Timestamp',
    'EventType',
    'UserId',
    'Email',
    'IpAddress',
    'Resource',
    'Action',
    'Status',
    'Severity',
  ]

  const rows = auditLogs.map((log) => [
    log.id,
    new Date(log.timestamp).toISOString(),
    log.eventType,
    log.userId || '',
    log.email || '',
    log.ipAddress || '',
    log.resource || '',
    log.action || '',
    log.status,
    log.severity,
  ])

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

  return csv
}
