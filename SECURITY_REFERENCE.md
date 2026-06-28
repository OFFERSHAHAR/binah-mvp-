# Security Implementation Reference

Quick reference for all security functions and their usage.

---

## Import Reference

```typescript
// CSRF Protection
import {
  createCSRFToken,
  verifyCSRFToken,
  getStoredTokenCount,
  clearAllTokens,
} from '@/lib/security/csrf'

// Session Management
import {
  createSession,
  getSession,
  updateSessionActivity,
  invalidateSession,
  invalidateAllUserSessions,
  getUserSessions,
  cleanupExpiredSessions,
  getSessionStats,
  clearAllSessions,
  type Session,
  type SessionUser,
} from '@/lib/security/session'

// Rate Limiting
import {
  isRateLimited,
  recordAttempt,
  clearRateLimit,
  getRateLimitStatus,
  cleanupExpiredRateLimits,
  getRateLimitStats,
  clearAllRateLimits,
} from '@/lib/security/rate-limiting'

// Audit Logging
import {
  logAuditEvent,
  getAuditLogs,
  getUserActivityTimeline,
  getLoginAttempts,
  getSecurityAlerts,
  getAuditStats,
  exportAuditLogs,
  clearAuditLogs,
  type AuditEventType,
  type AuditLog,
} from '@/lib/security/audit-logger'

// RBAC
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getPermissions,
  canAccessResource,
  canPerformAction,
  getRoleLevel,
  hasHigherOrEqualPrivilege,
  generatePermissionMatrix,
  getAllResources,
  type UserRole,
} from '@/lib/security/rbac'

// Middleware
import {
  createSecurityMiddleware,
  authenticateRequest,
  verifyCSRFProtection,
  checkRateLimit,
  checkAuthorization,
  extractSessionToken,
  extractCSRFToken,
  getClientIp,
  createSecureResponse,
  generateSecureCookie,
  type AuthenticatedRequest,
  type MiddlewareOptions,
} from '@/lib/security/middleware'
```

---

## CSRF Functions

### createCSRFToken()
Generate a new CSRF token pair.

```typescript
const { token, secret } = createCSRFToken()
```

**Returns**: `{ token: string; secret: string }`

### verifyCSRFToken(token, secret)
Verify a CSRF token against its secret.

```typescript
const isValid = verifyCSRFToken(token, secret)
```

**Returns**: `boolean`

### getStoredTokenCount()
Get number of active CSRF tokens.

```typescript
const count = getStoredTokenCount()
```

**Returns**: `number`

---

## Session Functions

### createSession(user, ip?, ua?, config?)
Create a new authenticated session.

```typescript
const session = createSession(
  { id, email, fullName, role, lastActivity },
  '192.168.1.1',
  'Mozilla/5.0...'
)
```

**Returns**: `Session`

### getSession(token)
Retrieve and validate a session.

```typescript
const session = getSession(token)
```

**Returns**: `Session | null`

### updateSessionActivity(token)
Update session's last activity.

```typescript
const updated = updateSessionActivity(token)
```

**Returns**: `boolean`

### invalidateSession(token)
Invalidate a single session.

```typescript
invalidateSession(token)
```

### getUserSessions(userId)
Get all active sessions for user.

```typescript
const sessions = getUserSessions('user-123')
```

**Returns**: `Session[]`

---

## Rate Limiting Functions

### isRateLimited(identifier, config?)
Check if currently rate limited.

```typescript
const limited = isRateLimited('user@example.com:192.168.1.1')
```

**Returns**: `boolean`

### recordAttempt(identifier, config?)
Record attempt and check if allowed.

```typescript
const result = recordAttempt('user@example.com:192.168.1.1')
// { isAllowed, attemptsRemaining, lockedUntil }
```

**Returns**: `RateLimitResult`

### getRateLimitStatus(identifier)
Get current rate limit state.

```typescript
const status = getRateLimitStatus('user@example.com:192.168.1.1')
```

**Returns**: `RateLimitStatus`

---

## Audit Logging Functions

### logAuditEvent(eventType, options?)
Log a security event.

```typescript
logAuditEvent('LOGIN_SUCCESS', {
  userId: 'user-123',
  email: 'user@example.com',
  ipAddress: '192.168.1.1',
  status: 'success',
})
```

**Event Types**:
`LOGIN_SUCCESS` | `LOGIN_FAILED` | `LOGOUT` | `CSRF_TOKEN_VERIFIED` | `CSRF_TOKEN_INVALID` | `UNAUTHORIZED_ACCESS` | `RATE_LIMIT_EXCEEDED` | `PERMISSION_DENIED` | `DATA_ACCESS` | `DATA_MODIFIED`

### getAuditLogs(options?)
Query audit logs.

```typescript
const logs = getAuditLogs({
  userId: 'user-123',
  eventType: 'LOGIN_SUCCESS',
  severity: 'high',
  limit: 50,
})
```

**Returns**: `AuditLog[]`

### getAuditStats()
Get audit statistics.

```typescript
const stats = getAuditStats()
```

**Returns**: `AuditStats`

---

## RBAC Functions

### hasPermission(role, resource, action)
Check if role has permission.

```typescript
if (hasPermission('student', 'assignments', 'read')) {
  // Can read
}
```

**Returns**: `boolean`

### getPermissions(role)
Get all permissions for role.

```typescript
const perms = getPermissions('admin')
```

**Returns**: `string[]`

### canAccessResource(role, resource, targetId?, currentId?)
Check resource access with ownership.

```typescript
const canAccess = canAccessResource('student', 'assignments', 'user-456', 'user-123')
```

**Returns**: `boolean`

---

## Middleware Functions

### extractSessionToken(request)
Extract token from request.

```typescript
const token = extractSessionToken(request)
```

**Returns**: `string | null`

### getClientIp(request)
Get client IP address.

```typescript
const ip = getClientIp(request)
```

**Returns**: `string`

### authenticateRequest(request)
Authenticate and get session info.

```typescript
const result = await authenticateRequest(request)
if (result.success) {
  const { userId, email, role } = result.auth
}
```

**Returns**: `{ success: boolean; error?: string; auth?: AuthData }`

### verifyCSRFProtection(request, token)
Verify CSRF token for mutations.

```typescript
const result = await verifyCSRFProtection(request, token)
if (!result.success) {
  return NextResponse.json({ error: result.error }, { status: 403 })
}
```

**Returns**: `{ success: boolean; error?: string }`

### checkRateLimit(identifier, options?)
Check rate limit status.

```typescript
const result = checkRateLimit(`${email}:${ip}`, {
  maxAttempts: 5,
  windowDuration: 15 * 60 * 1000,
})

if (!result.allowed) {
  return NextResponse.json(
    { error: result.error },
    { status: 429, headers: { 'Retry-After': String(result.retryAfter) } }
  )
}
```

**Returns**: `{ allowed: boolean; error?: string; retryAfter?: number }`

### createSecureResponse(data, status?, options?)
Create response with security headers.

```typescript
return createSecureResponse({
  data: 'value',
}, 200, {
  setCookie: generateSecureCookie('session_token', token),
})
```

**Returns**: `NextResponse`

### generateSecureCookie(name, value, options?)
Generate secure HTTP-only cookie.

```typescript
const cookie = generateSecureCookie('session_token', token, {
  maxAge: 7 * 24 * 60 * 60,
  secure: true,
  sameSite: 'Strict',
})
```

**Returns**: `string`

---

## Quick Examples

### Protected GET Route
```typescript
export async function GET(request: NextRequest) {
  const token = extractSessionToken(request)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = getSession(token)
  if (!session) return NextResponse.json({ error: 'Session expired' }, { status: 401 })

  logAuditEvent('DATA_ACCESS', { userId: session.userId, resource: 'data', status: 'success' })

  return createSecureResponse({ data: 'value' })
}
```

### Protected POST with CSRF
```typescript
export async function POST(request: NextRequest) {
  const token = extractSessionToken(request)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = getSession(token)
  if (!session) return NextResponse.json({ error: 'Session expired' }, { status: 401 })

  const csrf = await verifyCSRFProtection(request, token)
  if (!csrf.success) return NextResponse.json({ error: 'CSRF failed' }, { status: 403 })

  logAuditEvent('DATA_MODIFIED', { userId: session.userId, status: 'success' })
  return createSecureResponse({ success: true })
}
```

### Role-Protected Route
```typescript
if (!hasPermission(session.user.role, 'users', 'create')) {
  logAuditEvent('PERMISSION_DENIED', { userId: session.userId, status: 'failure' })
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### Login with Rate Limiting
```typescript
const rateLimit = checkRateLimit(`signin:${email}:${ip}`, { maxAttempts: 5 })
if (!rateLimit.allowed) {
  return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
}

const session = createSession(user, ip, userAgent)
logAuditEvent('LOGIN_SUCCESS', { userId: user.id, email, status: 'success' })

return createSecureResponse({ session }, 200, {
  setCookie: generateSecureCookie('session_token', session.token),
})
```

---

## Testing

```bash
# Run all security tests
curl http://localhost:3000/api/security/test

# Test specific component
curl http://localhost:3000/api/security/test?test=csrf
curl http://localhost:3000/api/security/test?test=session
curl http://localhost:3000/api/security/test?test=ratelimit
curl http://localhost:3000/api/security/test?test=audit
curl http://localhost:3000/api/security/test?test=rbac
```

---

For complete documentation, see `SECURITY.md`
