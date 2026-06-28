# Security Integration Checklist

Complete checklist for integrating security into existing API routes.

---

## Current Status

### Already Updated ✅
- [x] `app/api/auth/route.ts` - Full security implementation
  - CSRF token generation (GET)
  - Signin/signup with rate limiting (POST)
  - Logout with session invalidation
  - Audit logging for all auth events
  - Secure cookie handling

### Need Integration 🔄

- [ ] `app/api/dashboard/summary/route.ts`
- [ ] `app/api/data/route.ts`
- [ ] `app/api/messages/route.ts`
- [ ] `app/api/grades/route.ts`
- [ ] `app/api/assignments/route.ts`

---

## Route Integration Template

For each route that needs security, follow this pattern:

### Step 1: Add Imports
```typescript
import { NextRequest, NextResponse } from 'next/server'
import {
  extractSessionToken,
  getClientIp,
  createSecureResponse,
} from '@/lib/security/middleware'
import { getSession } from '@/lib/security/session'
import { hasPermission } from '@/lib/security/rbac'
import { logAuditEvent } from '@/lib/security/audit-logger'
```

### Step 2: Add Authentication Check
```typescript
const token = extractSessionToken(request)

if (!token) {
  logAuditEvent('UNAUTHORIZED_ACCESS', {
    ipAddress: getClientIp(request),
    userAgent: request.headers.get('user-agent') || undefined,
    status: 'failure',
  })
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

const session = getSession(token)

if (!session) {
  logAuditEvent('SESSION_EXPIRED', {
    ipAddress: getClientIp(request),
    userAgent: request.headers.get('user-agent') || undefined,
    status: 'failure',
  })
  return NextResponse.json({ error: 'Session expired' }, { status: 401 })
}
```

### Step 3: Add Permission Check (if needed)
```typescript
if (!hasPermission(session.user.role, 'resource', 'read')) {
  logAuditEvent('PERMISSION_DENIED', {
    userId: session.userId,
    email: session.user.email,
    ipAddress: getClientIp(request),
    resource: 'resource',
    action: 'read',
    status: 'failure',
  })
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### Step 4: Add Audit Logging
```typescript
logAuditEvent('DATA_ACCESS', {
  userId: session.userId,
  email: session.user.email,
  ipAddress: getClientIp(request),
  resource: 'dashboard',
  action: 'read',
  status: 'success',
})
```

### Step 5: Return Secure Response
```typescript
return createSecureResponse({
  data: { /* ... */ },
})
```

---

## Per-Route Integration

### 1. app/api/dashboard/summary/route.ts

**Needed**: Authentication + read permission

**Template**:
```typescript
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
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  logAuditEvent('DATA_ACCESS', {
    userId: session.userId,
    email: session.user.email,
    ipAddress: getClientIp(request),
    resource: 'dashboard',
    action: 'read',
    status: 'success',
  })

  return createSecureResponse({
    summary: {
      /* existing response data */
    },
  })
}
```

---

### 2. app/api/data/route.ts

**Needed**: Authentication + read permission + CSRF for mutations

**Template**:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import {
  extractSessionToken,
  getClientIp,
  createSecureResponse,
  verifyCSRFProtection,
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
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  logAuditEvent('DATA_ACCESS', {
    userId: session.userId,
    resource: 'data',
    status: 'success',
  })

  return createSecureResponse({
    data: { /* ... */ },
  })
}

export async function POST(request: NextRequest) {
  const token = extractSessionToken(request)

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = getSession(token)

  if (!session) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  // Verify CSRF for mutations
  const csrfVerification = await verifyCSRFProtection(request, token)

  if (!csrfVerification.success) {
    return NextResponse.json({ error: 'CSRF verification failed' }, { status: 403 })
  }

  logAuditEvent('DATA_MODIFIED', {
    userId: session.userId,
    resource: 'data',
    action: 'create',
    status: 'success',
  })

  return createSecureResponse({
    success: true,
  })
}
```

---

### 3. app/api/messages/route.ts

**Needed**: Authentication + read/create permissions + audit logging

**Template**:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import {
  extractSessionToken,
  getClientIp,
  createSecureResponse,
  verifyCSRFProtection,
} from '@/lib/security/middleware'
import { getSession } from '@/lib/security/session'
import { hasPermission } from '@/lib/security/rbac'
import { logAuditEvent } from '@/lib/security/audit-logger'

export async function GET(request: NextRequest) {
  const token = extractSessionToken(request)

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = getSession(token)

  if (!session) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  if (!hasPermission(session.user.role, 'messages', 'read')) {
    logAuditEvent('PERMISSION_DENIED', {
      userId: session.userId,
      resource: 'messages',
      action: 'read',
      status: 'failure',
    })
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  logAuditEvent('DATA_ACCESS', {
    userId: session.userId,
    resource: 'messages',
    action: 'read',
    status: 'success',
  })

  return createSecureResponse({
    messages: { /* ... */ },
  })
}

export async function POST(request: NextRequest) {
  const token = extractSessionToken(request)

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = getSession(token)

  if (!session) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  if (!hasPermission(session.user.role, 'messages', 'create')) {
    logAuditEvent('PERMISSION_DENIED', {
      userId: session.userId,
      resource: 'messages',
      action: 'create',
      status: 'failure',
    })
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const csrfVerification = await verifyCSRFProtection(request, token)

  if (!csrfVerification.success) {
    return NextResponse.json({ error: 'CSRF verification failed' }, { status: 403 })
  }

  logAuditEvent('DATA_MODIFIED', {
    userId: session.userId,
    resource: 'messages',
    action: 'create',
    status: 'success',
  })

  return createSecureResponse({
    success: true,
  })
}
```

---

### 4. app/api/grades/route.ts

**Needed**: Authentication + role-specific permissions (teacher/admin) + CSRF

**Template**:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import {
  extractSessionToken,
  createSecureResponse,
  verifyCSRFProtection,
} from '@/lib/security/middleware'
import { getSession } from '@/lib/security/session'
import { hasPermission } from '@/lib/security/rbac'
import { logAuditEvent } from '@/lib/security/audit-logger'

export async function GET(request: NextRequest) {
  const token = extractSessionToken(request)

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = getSession(token)

  if (!session) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  if (!hasPermission(session.user.role, 'grades', 'read')) {
    logAuditEvent('PERMISSION_DENIED', {
      userId: session.userId,
      resource: 'grades',
      status: 'failure',
    })
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  logAuditEvent('DATA_ACCESS', {
    userId: session.userId,
    resource: 'grades',
    status: 'success',
  })

  return createSecureResponse({
    grades: { /* ... */ },
  })
}

export async function POST(request: NextRequest) {
  const token = extractSessionToken(request)

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = getSession(token)

  if (!session) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  // Only teacher and admin can create grades
  if (!hasPermission(session.user.role, 'grades', 'create')) {
    logAuditEvent('PERMISSION_DENIED', {
      userId: session.userId,
      resource: 'grades',
      action: 'create',
      status: 'failure',
    })
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const csrfVerification = await verifyCSRFProtection(request, token)

  if (!csrfVerification.success) {
    return NextResponse.json({ error: 'CSRF verification failed' }, { status: 403 })
  }

  logAuditEvent('DATA_MODIFIED', {
    userId: session.userId,
    resource: 'grades',
    action: 'create',
    status: 'success',
  })

  return createSecureResponse({
    success: true,
  })
}
```

---

### 5. app/api/assignments/route.ts

**Needed**: Authentication + role-specific permissions + CSRF + detailed audit

**Template**:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import {
  extractSessionToken,
  createSecureResponse,
  verifyCSRFProtection,
} from '@/lib/security/middleware'
import { getSession } from '@/lib/security/session'
import { hasPermission } from '@/lib/security/rbac'
import { logAuditEvent } from '@/lib/security/audit-logger'

export async function GET(request: NextRequest) {
  const token = extractSessionToken(request)

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = getSession(token)

  if (!session) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  if (!hasPermission(session.user.role, 'assignments', 'read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  logAuditEvent('DATA_ACCESS', {
    userId: session.userId,
    resource: 'assignments',
    action: 'read',
    status: 'success',
  })

  return createSecureResponse({
    assignments: { /* ... */ },
  })
}

export async function POST(request: NextRequest) {
  const token = extractSessionToken(request)

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = getSession(token)

  if (!session) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  if (!hasPermission(session.user.role, 'assignments', 'create')) {
    logAuditEvent('PERMISSION_DENIED', {
      userId: session.userId,
      resource: 'assignments',
      action: 'create',
      status: 'failure',
    })
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const csrfVerification = await verifyCSRFProtection(request, token)

  if (!csrfVerification.success) {
    return NextResponse.json({ error: 'CSRF verification failed' }, { status: 403 })
  }

  const { title, description } = await request.json()

  logAuditEvent('DATA_MODIFIED', {
    userId: session.userId,
    resource: 'assignments',
    action: 'create',
    status: 'success',
    metadata: { title, createdBy: session.userId },
  })

  return createSecureResponse({
    success: true,
  })
}

export async function PUT(request: NextRequest) {
  const token = extractSessionToken(request)

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = getSession(token)

  if (!session) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  if (!hasPermission(session.user.role, 'assignments', 'update')) {
    logAuditEvent('PERMISSION_DENIED', {
      userId: session.userId,
      resource: 'assignments',
      action: 'update',
      status: 'failure',
    })
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const csrfVerification = await verifyCSRFProtection(request, token)

  if (!csrfVerification.success) {
    return NextResponse.json({ error: 'CSRF verification failed' }, { status: 403 })
  }

  const { id, title, description } = await request.json()

  logAuditEvent('DATA_MODIFIED', {
    userId: session.userId,
    resource: 'assignments',
    action: 'update',
    status: 'success',
    metadata: { assignmentId: id, title },
  })

  return createSecureResponse({
    success: true,
  })
}

export async function DELETE(request: NextRequest) {
  const token = extractSessionToken(request)

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = getSession(token)

  if (!session) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  if (!hasPermission(session.user.role, 'assignments', 'delete')) {
    logAuditEvent('PERMISSION_DENIED', {
      userId: session.userId,
      resource: 'assignments',
      action: 'delete',
      status: 'failure',
    })
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const csrfVerification = await verifyCSRFProtection(request, token)

  if (!csrfVerification.success) {
    return NextResponse.json({ error: 'CSRF verification failed' }, { status: 403 })
  }

  const { id } = await request.json()

  logAuditEvent('DATA_MODIFIED', {
    userId: session.userId,
    resource: 'assignments',
    action: 'delete',
    status: 'success',
    metadata: { assignmentId: id },
  })

  return createSecureResponse({
    success: true,
  })
}
```

---

## Priority Order

1. **High Priority** (Do First)
   - [ ] `app/api/auth/route.ts` ✅ DONE
   - [ ] `app/api/dashboard/summary/route.ts`
   - [ ] `app/api/grades/route.ts`

2. **Medium Priority** (Do Next)
   - [ ] `app/api/assignments/route.ts`
   - [ ] `app/api/messages/route.ts`

3. **Lower Priority** (Optional)
   - [ ] `app/api/data/route.ts`
   - [ ] Custom routes as needed

---

## Testing After Integration

### Test Each Route
```bash
# Without auth token - should fail 401
curl http://localhost:3000/api/dashboard/summary

# With auth token - should succeed
curl -H "Authorization: Bearer token" \
  http://localhost:3000/api/dashboard/summary

# Test CSRF on mutations
curl -X POST http://localhost:3000/api/assignments \
  -H "Authorization: Bearer token" \
  # Without X-CSRF-Token - should fail 403
```

### Verify Audit Logs
```bash
# Check audit logs were created
curl -H "Authorization: Bearer admin_token" \
  http://localhost:3000/api/security/audit?userId=123
```

---

## Quick Copy-Paste Blocks

### Auth Check Block
```typescript
const token = extractSessionToken(request)
if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
const session = getSession(token)
if (!session) return NextResponse.json({ error: 'Session expired' }, { status: 401 })
```

### Permission Check Block
```typescript
if (!hasPermission(session.user.role, 'resource', 'read')) {
  logAuditEvent('PERMISSION_DENIED', { userId: session.userId, resource: 'resource', status: 'failure' })
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### CSRF Check Block
```typescript
const csrfVerification = await verifyCSRFProtection(request, token)
if (!csrfVerification.success) {
  return NextResponse.json({ error: 'CSRF verification failed' }, { status: 403 })
}
```

### Audit Log Block
```typescript
logAuditEvent('DATA_ACCESS', {
  userId: session.userId,
  email: session.user.email,
  resource: 'resource',
  action: 'read',
  status: 'success',
})
```

---

## Completion Status

- [x] Security library implemented (100%)
- [x] Auth route updated (100%)
- [ ] Dashboard route updated (0%)
- [ ] Grades route updated (0%)
- [ ] Assignments route updated (0%)
- [ ] Messages route updated (0%)
- [ ] Data route updated (0%)

**Overall: 1/6 routes (17%)**

---

## Need Help?

1. Check `docs/SECURITY_INTEGRATION.md` for examples
2. Review `SECURITY.md` for component details
3. Copy templates from this checklist
4. Run tests: `curl http://localhost:3000/api/security/test`

All templates are ready to copy-paste!
