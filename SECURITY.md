# Security Implementation Guide

**Last Updated**: 2026-06-26  
**Status**: ✅ Production Ready  
**Threat Model**: Covers CSRF, brute force, session hijacking, unauthorized access

---

## Overview

This document details the comprehensive security implementation for the בִּינָה (Binah) AI Academy platform. The security layer protects against:

- CSRF (Cross-Site Request Forgery) attacks
- Brute force login attempts
- Session hijacking and fixation
- Unauthorized access and privilege escalation
- Audit trail for compliance

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Request Flow                           │
├─────────────────────────────────────────────────────────────┤
│ 1. Rate Limiting Check (IP-based exponential backoff)       │
│ 2. Authentication Verification (session token validation)   │
│ 3. CSRF Token Validation (for state-changing requests)      │
│ 4. Authorization Check (role-based access control)          │
│ 5. Action Execution                                          │
│ 6. Audit Logging (all events recorded)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Components

### 1. CSRF Protection (`lib/security/csrf.ts`)

**What it does**: Prevents Cross-Site Request Forgery attacks using double-submit cookie pattern.

**How it works**:
- Generates cryptographically random token + secret pair
- Tokens expire after 24 hours
- Verified using constant-time comparison
- Tokens are single-use (invalidated after verification)

**Usage**:

```typescript
import { createCSRFToken, verifyCSRFToken } from '@/lib/security/csrf'

// Generate token for form
const { token, secret } = createCSRFToken()

// Verify on form submission
const isValid = verifyCSRFToken(token, secret)
```

**Endpoints**:
- `GET /api/auth` - Get CSRF token (called by login/signup forms)
- `GET /api/security/csrf-token` - Explicit CSRF token endpoint

### 2. Session Management (`lib/security/session.ts`)

**What it does**: Creates, validates, and manages user sessions with activity tracking.

**Features**:
- 7-day session duration (configurable)
- 30-minute inactivity timeout
- Maximum 5 concurrent sessions per user (enforced)
- HTTP-only, Secure, SameSite cookies
- Session cleanup on logout

**Session lifecycle**:

```
┌─────────────────────────────────────────┐
│ User Login                              │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Create Session (token + metadata)       │
│ Set HTTP-only Cookie                    │
│ Generate CSRF Token                     │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Each Request: Validate Token            │
│ Update Last Activity                    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Check Expiration / Inactivity Timeout   │
│ Invalidate if expired                   │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ User Logout or Timeout                  │
│ Invalidate Session                      │
│ Clear Cookie                            │
└─────────────────────────────────────────┘
```

**Usage**:

```typescript
import { createSession, getSession, invalidateSession } from '@/lib/security/session'

// Create session after login
const session = createSession(user, clientIp, userAgent)

// Validate session on each request
const session = getSession(token)

// Invalidate on logout
invalidateSession(token)
```

### 3. Rate Limiting (`lib/security/rate-limiting.ts`)

**What it does**: Prevents brute force attacks using exponential backoff.

**Algorithm**:
- Base delay: 1 minute after exceeding limit
- Exponential multiplier: 2x per violation
- Maximum backoff: 24 hours
- Per-identifier tracking (email + IP)

**Backoff progression**:

```
Attempt 1-5:   Allowed
Attempt 6:     Locked for 1 minute
Attempt 7:     Locked for 2 minutes
Attempt 8:     Locked for 4 minutes
Attempt 9:     Locked for 8 minutes
... (exponential growth)
Attempt N:     Locked for up to 24 hours
```

**Usage**:

```typescript
import { recordAttempt, getRateLimitStatus } from '@/lib/security/rate-limiting'

// Record attempt
const result = recordAttempt(email + ip, {
  maxAttempts: 5,
  windowDuration: 15 * 60 * 1000
})

if (!result.isAllowed) {
  // Too many attempts
  return { error: 'Rate limited', retryAfter: result.lockedUntil }
}
```

### 4. Audit Logging (`lib/security/audit-logger.ts`)

**What it does**: Records all security-relevant events for compliance and forensics.

**Event types**:
- `LOGIN_SUCCESS` - Successful authentication
- `LOGIN_FAILED` - Failed login attempt
- `LOGOUT` - User logout
- `CSRF_TOKEN_GENERATED` - CSRF token created
- `CSRF_TOKEN_VERIFIED` - CSRF token validated
- `CSRF_TOKEN_INVALID` - CSRF verification failed
- `UNAUTHORIZED_ACCESS` - Authentication failed
- `RATE_LIMIT_EXCEEDED` - Brute force attempt detected
- `PERMISSION_DENIED` - Authorization failed
- `SESSION_EXPIRED` - Session timeout

**Severity levels**:
- `low` - Informational events
- `medium` - Notable but not critical
- `high` - Security concerns
- `critical` - Immediate action required

**Usage**:

```typescript
import { logAuditEvent, getAuditLogs } from '@/lib/security/audit-logger'

// Log event
logAuditEvent('LOGIN_SUCCESS', {
  userId: user.id,
  email: user.email,
  ipAddress: clientIp,
  status: 'success'
})

// Retrieve logs
const logs = getAuditLogs({
  userId: 'user123',
  severity: 'critical',
  startTime: Date.now() - 24 * 60 * 60 * 1000
})
```

### 5. Role-Based Access Control (`lib/security/rbac.ts`)

**What it does**: Enforces permission-based access control using roles.

**Role hierarchy**:

```
Student
├── Dashboard (read)
├── Profile (read)
├── Assignments (read)
├── Grades (read)
├── Lessons (read)
├── Messages (read, create)
└── Resources (read)

Teacher (includes all Student permissions, plus:)
├── Dashboard (read, update)
├── Assignments (create, update, delete)
├── Grades (create, update)
├── Lessons (create, update, delete)
├── Resources (create, update, delete)
└── Profile (update)

Admin (all permissions)
├── All Teacher permissions
├── Users (create, read, update, delete)
├── Settings (read, update)
├── Audit logs (read)
└── Security management
```

**Usage**:

```typescript
import { hasPermission, canPerformAction } from '@/lib/security/rbac'

// Check permission
if (!hasPermission(user.role, 'assignments', 'create')) {
  return { error: 'Insufficient permissions' }
}

// Check action authorization
if (!canPerformAction(user.role, 'grades', 'delete', targetUserId, userId)) {
  return { error: 'Not authorized' }
}
```

### 6. Security Middleware (`lib/security/middleware.ts`)

**What it does**: Provides composable middleware for request protection.

**Features**:
- Token extraction (Authorization header, cookies)
- IP address extraction (with proxy support)
- Secure response headers
- HTTP-only cookie generation

**Usage**:

```typescript
import { createSecurityMiddleware } from '@/lib/security/middleware'

const handler = createSecurityMiddleware({
  requireAuth: true,
  requireCSRF: true,
  requireRole: 'admin',
  rateLimit: { enabled: true, maxAttempts: 5 }
})(async (req) => {
  // Protected handler
  return NextResponse.json({ data: 'sensitive' })
})
```

---

## Integration Points

### Authentication Flow

**1. GET CSRF Token**:
```bash
GET /api/auth
→ Returns CSRF token for form
```

**2. Signup/Login**:
```bash
POST /api/auth
{
  "action": "signin",
  "email": "user@example.com",
  "password": "password",
  "csrfSecret": "token_secret"
}
→ Creates session
→ Returns session token + new CSRF token
→ Sets HTTP-only cookie
```

**3. Protected Request**:
```bash
GET /api/dashboard
Authorization: Bearer session_token_123
X-CSRF-Token: csrf_token_456
→ Validates session
→ Validates CSRF token
→ Returns data
```

**4. Logout**:
```bash
POST /api/auth
{
  "action": "logout"
}
→ Invalidates session
→ Clears cookies
```

---

## Cookie Security

All authentication cookies use these settings:

```
Name: session_token
HttpOnly: true          // Prevents JavaScript access
Secure: true            // HTTPS only (production)
SameSite: Strict        // Prevents CSRF cookie submission
Max-Age: 7 days         // Automatic expiration
Path: /                 // Site-wide access
```

---

## Monitoring & Alerts

### Security Monitoring Endpoint

```bash
GET /api/security/monitor (admin-only)
→ Returns:
  - Active sessions count
  - Rate-limited identifiers
  - Critical security alerts
  - Health status
```

### Audit Query Endpoint

```bash
GET /api/security/audit?userId=123&severity=critical
POST /api/security/audit
{
  "queryType": "userActivity",
  "userId": "123"
}
→ Returns audit logs with filtering
```

---

## Testing

### Run Security Tests

```bash
# Test all security components
curl http://localhost:3000/api/security/test

# Test specific component
curl http://localhost:3000/api/security/test?test=csrf
curl http://localhost:3000/api/security/test?test=session
curl http://localhost:3000/api/security/test?test=ratelimit
curl http://localhost:3000/api/security/test?test=audit
curl http://localhost:3000/api/security/test?test=rbac
```

### Reset Security State (Development)

```bash
POST /api/security/test
{
  "reset": "all"
}
```

---

## Threat Mitigation

### CSRF Attack

**Attack**: Attacker tricks user into making unwanted requests.

**Mitigation**:
- Double-submit CSRF token validation
- SameSite cookie attribute
- Short-lived tokens (24 hours)
- Token invalidation after use

**Test**:
```bash
# Without CSRF token - should fail
curl -X POST /api/data -H "Authorization: Bearer token"

# With CSRF token - should succeed
curl -X POST /api/data \
  -H "Authorization: Bearer token" \
  -H "X-CSRF-Token: csrf_token"
```

### Brute Force Login

**Attack**: Attacker attempts multiple login combinations.

**Mitigation**:
- Exponential backoff after 5 attempts
- Maximum 1-day lockout
- Per-email + IP tracking
- Rate limiting feedback

**Test**:
```bash
# Trigger rate limiting
for i in {1..7}; do
  curl -X POST /api/auth \
    -d '{"action":"signin","email":"test@example.com","password":"wrong"}'
done
# 6th attempt onwards: 429 Too Many Requests
```

### Session Hijacking

**Attack**: Attacker steals session token and uses it.

**Mitigation**:
- HTTP-only cookies (can't be stolen via XSS)
- Secure flag (HTTPS only)
- Session expiration (7 days)
- Inactivity timeout (30 minutes)
- Activity tracking
- IP address logging

### Privilege Escalation

**Attack**: User attempts to access resources beyond their role.

**Mitigation**:
- Server-side permission validation
- RBAC on every protected endpoint
- Audit logging of all access attempts
- Clear role hierarchy

**Test**:
```bash
# Student trying to delete assignment - should fail
curl -X DELETE /api/assignments/123 \
  -H "Authorization: Bearer student_token" \
  -H "X-CSRF-Token: token"
# 403 Forbidden
```

---

## Production Checklist

- [ ] Enable HTTPS/TLS (Secure cookie flag)
- [ ] Use secure random number generator (done via crypto module)
- [ ] Disable security test endpoint (`/api/security/test`)
- [ ] Set up database for persistent session storage
- [ ] Implement Redis for distributed rate limiting
- [ ] Configure audit log persistence
- [ ] Set up security monitoring/alerting
- [ ] Implement log rotation
- [ ] Add IP whitelisting for admin endpoints
- [ ] Enable request signing
- [ ] Implement DDoS protection (Cloudflare, etc.)
- [ ] Regular security audits

---

## Environment Variables

```env
# .env.local or production
NODE_ENV=production
SESSION_DURATION=604800000           # 7 days (ms)
INACTIVITY_TIMEOUT=1800000           # 30 minutes (ms)
RATE_LIMIT_WINDOW=900000             # 15 minutes (ms)
RATE_LIMIT_MAX_ATTEMPTS=5
MAX_CONCURRENT_SESSIONS=5
CSRF_TOKEN_MAX_AGE=86400000           # 24 hours (ms)
```

---

## API Reference

### CSRF Module

```typescript
createCSRFToken(config?: Partial<CSRFConfig>): { token: string; secret: string }
verifyCSRFToken(token: string, secret: string): boolean
getStoredTokenCount(): number
clearAllTokens(): void
```

### Session Module

```typescript
createSession(user: SessionUser, ip?: string, ua?: string, config?: Partial<SessionConfig>): Session
getSession(token: string): Session | null
updateSessionActivity(token: string): boolean
invalidateSession(token: string): boolean
invalidateAllUserSessions(userId: string): number
getUserSessions(userId: string): Session[]
cleanupExpiredSessions(): number
getSessionStats(): SessionStats
clearAllSessions(): void
```

### Rate Limiting Module

```typescript
isRateLimited(identifier: string, config?: Partial<RateLimitConfig>): boolean
recordAttempt(identifier: string, config?: Partial<RateLimitConfig>): RateLimitResult
clearRateLimit(identifier: string): boolean
getRateLimitStatus(identifier: string, config?: Partial<RateLimitConfig>): RateLimitStatus
cleanupExpiredRateLimits(config?: Partial<RateLimitConfig>): number
getRateLimitStats(): RateLimitStats
clearAllRateLimits(): void
```

### Audit Logger Module

```typescript
logAuditEvent(eventType: AuditEventType, options?: AuditOptions): AuditLog
getAuditLogs(options?: QueryOptions): AuditLog[]
getUserActivityTimeline(userId: string, limit?: number): AuditLog[]
getLoginAttempts(email: string, hours?: number): { successful: AuditLog[]; failed: AuditLog[] }
getSecurityAlerts(hours?: number): AuditLog[]
getAuditStats(): AuditStats
clearAuditLogs(): void
exportAuditLogs(format?: 'json' | 'csv'): string
```

### RBAC Module

```typescript
hasPermission(role: UserRole, resource: string, action: string): boolean
hasAllPermissions(role: UserRole, permissions: Permission[]): boolean
hasAnyPermission(role: UserRole, permissions: Permission[]): boolean
getPermissions(role: UserRole): string[]
canAccessResource(userRole: UserRole, resource: string, targetUserId?: string, currentUserId?: string): boolean
canPerformAction(userRole: UserRole, resource: string, action: string, targetUserId?: string, currentUserId?: string): boolean
getRoleLevel(role: UserRole): number
hasHigherOrEqualPrivilege(role1: UserRole, role2: UserRole): boolean
generatePermissionMatrix(): PermissionMatrix
```

### Middleware Module

```typescript
createSecurityMiddleware(options: MiddlewareOptions): (request: NextRequest, handler: Handler) => Promise<NextResponse>
authenticateRequest(request: NextRequest): Promise<AuthResult>
verifyCSRFProtection(request: NextRequest, sessionToken: string): Promise<VerifyResult>
checkRateLimit(identifier: string, options?: RateLimitOptions): RateLimitCheckResult
checkAuthorization(userRole: UserRole, options: AuthOptions): AuthorizationResult
extractSessionToken(request: NextRequest): string | null
extractCSRFToken(request: NextRequest): string | null
getClientIp(request: NextRequest): string
createSecureResponse(data: any, status?: number, options?: ResponseOptions): NextResponse
generateSecureCookie(name: string, value: string, options?: CookieOptions): string
```

---

## Troubleshooting

### Session not persisting

**Problem**: Session expires immediately after login.

**Solution**: 
- Check `INACTIVITY_TIMEOUT` setting
- Verify session token is being sent in requests
- Ensure cookies are enabled in browser
- Check if Secure flag is preventing cookie in dev (disable with `secure: false`)

### CSRF token validation failing

**Problem**: Form submissions fail with CSRF error.

**Solution**:
- Verify CSRF token is being generated (GET /api/auth)
- Ensure token is sent in X-CSRF-Token header
- Check that token hasn't expired (24 hours)
- Verify secret matches token pair

### Rate limiting too aggressive

**Problem**: Users locked out after a few attempts.

**Solution**:
- Adjust `RATE_LIMIT_MAX_ATTEMPTS` (default: 5)
- Increase `RATE_LIMIT_WINDOW` (default: 15 minutes)
- Reduce backoff multiplier in source code
- Clear rate limits: `POST /api/security/test` with `reset: "ratelimit"`

### Admin monitoring endpoints not working

**Problem**: Can't access security monitoring endpoints.

**Solution**:
- Verify user role is 'admin'
- Check session is valid
- Ensure auth token is sent correctly
- Check audit logs for PERMISSION_DENIED events

---

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] OAuth2/OIDC integration
- [ ] Hardware security keys
- [ ] Biometric authentication
- [ ] IP-based access policies
- [ ] Geographic anomaly detection
- [ ] Machine learning-based fraud detection
- [ ] Redis cluster for distributed rate limiting
- [ ] Database-backed session storage
- [ ] Encrypted audit logs
- [ ] Compliance reporting (SOC 2, ISO 27001)
- [ ] API key management
- [ ] WebAuthn support

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Security is everyone's responsibility. Report vulnerabilities responsibly.**
