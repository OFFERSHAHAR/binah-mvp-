# Security Integration Guide

Quick reference for integrating security middleware into your API routes.

---

## Basic Protected Route

```typescript
// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import {
  extractSessionToken,
  getClientIp,
  createSecureResponse,
} from '@/lib/security/middleware'
import { getSession } from '@/lib/security/session'
import { logAuditEvent } from '@/lib/security/audit-logger'

export async function GET(request: NextRequest) {
  const token = extractSessionToken(request)

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = getSession(token)

  if (!session) {
    logAuditEvent('UNAUTHORIZED_ACCESS', {
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      status: 'failure',
    })
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  // Your protected logic here
  logAuditEvent('DATA_ACCESS', {
    userId: session.userId,
    email: session.user.email,
    ipAddress: getClientIp(request),
    resource: 'dashboard',
    status: 'success',
  })

  return createSecureResponse({
    dashboard: { /* data */ },
  })
}
```

---

## Role-Protected Route

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import {
  extractSessionToken,
  getClientIp,
  createSecureResponse,
} from '@/lib/security/middleware'
import { getSession } from '@/lib/security/session'
import { hasPermission } from '@/lib/security/rbac'
import { logAuditEvent } from '@/lib/security/audit-logger'

export async function POST(request: NextRequest) {
  const token = extractSessionToken(request)

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = getSession(token)

  if (!session) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  // Check permission
  if (!hasPermission(session.user.role, 'users', 'create')) {
    logAuditEvent('PERMISSION_DENIED', {
      userId: session.userId,
      email: session.user.email,
      ipAddress: getClientIp(request),
      resource: 'users',
      action: 'create',
      status: 'failure',
    })
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Your protected logic here
  logAuditEvent('DATA_MODIFIED', {
    userId: session.userId,
    email: session.user.email,
    ipAddress: getClientIp(request),
    resource: 'users',
    action: 'create',
    status: 'success',
  })

  return createSecureResponse({
    success: true,
  })
}
```

---

## CSRF-Protected Mutation

```typescript
// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import {
  extractSessionToken,
  extractCSRFToken,
  verifyCSRFProtection,
  getClientIp,
  createSecureResponse,
} from '@/lib/security/middleware'
import { getSession } from '@/lib/security/session'
import { logAuditEvent } from '@/lib/security/audit-logger'

export async function POST(request: NextRequest) {
  const token = extractSessionToken(request)

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = getSession(token)

  if (!session) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  // Verify CSRF token
  const csrfVerification = await verifyCSRFProtection(request, token)

  if (!csrfVerification.success) {
    logAuditEvent('CSRF_TOKEN_INVALID', {
      userId: session.userId,
      ipAddress: getClientIp(request),
      status: 'failure',
    })
    return NextResponse.json({ error: csrfVerification.error }, { status: 403 })
  }

  // Your protected mutation here
  logAuditEvent('DATA_MODIFIED', {
    userId: session.userId,
    resource: 'profile',
    status: 'success',
  })

  return createSecureResponse({ success: true })
}
```

---

## Rate-Limited Endpoint

```typescript
// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp, createSecureResponse } from '@/lib/security/middleware'
import { logAuditEvent } from '@/lib/security/audit-logger'

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request)

  // Rate limiting
  const rateLimitResult = checkRateLimit(clientIp, {
    maxAttempts: 100,
    windowDuration: 60 * 1000, // 1 minute
  })

  if (!rateLimitResult.allowed) {
    logAuditEvent('RATE_LIMIT_EXCEEDED', {
      ipAddress: clientIp,
      status: 'failure',
    })
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimitResult.retryAfter || 60) },
      }
    )
  }

  // Your logic here
  return createSecureResponse({ results: [] })
}
```

---

## Client-Side: Getting CSRF Token

```typescript
// Get CSRF token before form submission
async function getCsrfToken() {
  const response = await fetch('/api/auth')
  const data = await response.json()
  return data.csrfToken
}

// Submit form with CSRF token
async function submitForm(email: string, password: string) {
  const csrfToken = await getCsrfToken()

  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify({
      action: 'signin',
      email,
      password,
    }),
    credentials: 'include', // Include cookies
  })

  return response.json()
}
```

---

## Client-Side: Using Session Token

```typescript
// Store session token after login
function handleLoginSuccess(data: { session: { token: string } }) {
  sessionStorage.setItem('auth_token', data.session.token)
}

// Send token with requests
async function fetchProtected(endpoint: string) {
  const token = sessionStorage.getItem('auth_token')

  const response = await fetch(endpoint, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include', // Include cookies
  })

  return response.json()
}

// Clear on logout
function handleLogout() {
  sessionStorage.removeItem('auth_token')
  
  fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'logout' }),
  })
}
```

---

## Combining Protections

```typescript
// Full protection example
import { NextRequest, NextResponse } from 'next/server'
import {
  extractSessionToken,
  createSecureResponse,
  getClientIp,
  checkRateLimit,
} from '@/lib/security/middleware'
import { getSession, updateSessionActivity } from '@/lib/security/session'
import { hasPermission } from '@/lib/security/rbac'
import { verifyCSRFProtection } from '@/lib/security/middleware'
import { logAuditEvent } from '@/lib/security/audit-logger'

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request)

  // 1. Rate limiting
  const rateLimit = checkRateLimit(`${clientIp}:mutation`, {
    maxAttempts: 10,
    windowDuration: 5 * 60 * 1000,
  })

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    )
  }

  // 2. Authentication
  const token = extractSessionToken(request)
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = getSession(token)
  if (!session) {
    logAuditEvent('UNAUTHORIZED_ACCESS', {
      ipAddress: clientIp,
      status: 'failure',
    })
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  // 3. CSRF verification
  const csrfCheck = await verifyCSRFProtection(request, token)
  if (!csrfCheck.success) {
    logAuditEvent('CSRF_TOKEN_INVALID', {
      userId: session.userId,
      ipAddress: clientIp,
      status: 'failure',
    })
    return NextResponse.json({ error: 'CSRF verification failed' }, { status: 403 })
  }

  // 4. Authorization
  if (!hasPermission(session.user.role, 'data', 'update')) {
    logAuditEvent('PERMISSION_DENIED', {
      userId: session.userId,
      resource: 'data',
      action: 'update',
      status: 'failure',
    })
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 5. Update activity
  updateSessionActivity(token)

  // 6. Execute operation
  logAuditEvent('DATA_MODIFIED', {
    userId: session.userId,
    email: session.user.email,
    resource: 'data',
    action: 'update',
    status: 'success',
  })

  return createSecureResponse({ success: true })
}
```

---

## Monitoring

```typescript
// Check security status
async function checkSecurityStatus() {
  const response = await fetch('/api/security/monitor', {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  })
  return response.json()
}

// Get audit logs
async function getAuditLogs(userId?: string) {
  const params = new URLSearchParams()
  if (userId) params.append('userId', userId)
  params.append('limit', '100')

  const response = await fetch(`/api/security/audit?${params}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  })
  return response.json()
}

// Query specific events
async function queryUserActivity(userId: string) {
  const response = await fetch('/api/security/audit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      queryType: 'userActivity',
      userId,
    }),
  })
  return response.json()
}
```

---

## Testing

```typescript
// Run security tests
async function runSecurityTests() {
  const response = await fetch('/api/security/test')
  const results = await response.json()
  console.log('Security test results:', results)
}

// Test CSRF specifically
async function testCSRF() {
  const response = await fetch('/api/security/test?test=csrf')
  const results = await response.json()
  return results.results.csrf.passed
}

// Reset security state (development only)
async function resetSecurityState() {
  const response = await fetch('/api/security/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reset: 'all' }),
  })
  return response.json()
}
```

---

## Error Handling

```typescript
// Handle security errors gracefully
async function makeSecureRequest(endpoint: string) {
  try {
    const token = sessionStorage.getItem('auth_token')

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (response.status === 401) {
      // Session expired - redirect to login
      window.location.href = '/auth/login'
      return
    }

    if (response.status === 403) {
      // CSRF failed or permission denied
      if ((await response.json()).error.includes('CSRF')) {
        // Refresh CSRF token and retry
        console.error('CSRF token invalid')
      }
      return
    }

    if (response.status === 429) {
      // Rate limited
      const retryAfter = response.headers.get('Retry-After')
      console.error(`Rate limited. Retry after ${retryAfter} seconds`)
      return
    }

    return response.json()
  } catch (error) {
    console.error('Request failed:', error)
  }
}
```

---

## Common Patterns

### Pattern 1: Admin-Only Endpoint

```typescript
if (session.user.role !== 'admin') {
  return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
}
```

### Pattern 2: Owner or Admin Access

```typescript
const resourceOwnerId = 'user123'
const isOwner = session.userId === resourceOwnerId
const isAdmin = session.user.role === 'admin'

if (!isOwner && !isAdmin) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### Pattern 3: Timeout Session After Action

```typescript
// Require reauthentication for sensitive operations
const lastPasswordChange = session.user.lastPasswordChange
const now = Date.now()
const timeSinceChange = now - lastPasswordChange

if (timeSinceChange > 30 * 60 * 1000) {
  // 30 minutes - require password verification
  return NextResponse.json(
    { error: 'Reauthentication required for sensitive operation' },
    { status: 403 }
  )
}
```

---

## Best Practices

1. **Always authenticate before authorization**: Check token → then check role
2. **Log everything sensitive**: Use audit logging for compliance
3. **Never trust client input**: Validate all data server-side
4. **Use HTTPS in production**: Secure flag on cookies requires it
5. **Rotate secrets regularly**: Implement token rotation
6. **Monitor audit logs**: Set up alerting for critical events
7. **Keep rate limits reasonable**: Balance security with usability
8. **Test security often**: Run security tests in CI/CD pipeline
9. **Handle errors gracefully**: Don't leak security information
10. **Follow the principle of least privilege**: Users get minimum needed access

---

For more details, see [SECURITY.md](../SECURITY.md)
