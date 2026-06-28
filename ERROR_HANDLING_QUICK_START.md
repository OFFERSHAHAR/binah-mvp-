# Error Handling - Quick Start Guide

## 🚀 Quick Start (5 minutes)

### 1. Log an Error

```typescript
import { errorLogger } from '@/lib/errorLogger'

// Simple error
errorLogger.logError('Something went wrong')

// With context
errorLogger.logError('Failed to save user', {
  severity: 'high',
  context: { userId: '123', endpoint: '/api/user' }
})

// Specialized loggers
errorLogger.logAuthError('Login failed')
errorLogger.logNetworkError('Connection timeout', 503)
errorLogger.logDataError('Failed to fetch data', '/api/data')
errorLogger.logValidationError('Invalid email', 'email_field')
```

### 2. Show Error to User

```tsx
import { ErrorCard, NetworkErrorModal, DataFetchErrorState } from '@/components/errors'

// Generic error card
<ErrorCard
  title="Error Title"
  message="User-friendly error message"
  type="error"
  onRetry={() => retry()}
/>

// Network error (full modal)
<NetworkErrorModal
  isOpen={hasNetworkError}
  onRetry={() => retryConnection()}
/>

// Data fetch error (as a state)
{error ? (
  <DataFetchErrorState
    title="Failed to Load"
    message={error.message}
    onRetry={() => retry()}
  />
) : (
  <Content />
)}
```

### 3. Handle API Errors

```tsx
const response = await fetch('/api/endpoint', {
  signal: AbortSignal.timeout(10000) // Add timeout
})

if (!response.ok) {
  const error = {
    message: `Error ${response.status}: ${response.statusText}`,
    statusCode: response.status,
    retryable: response.status >= 500
  }
  
  errorLogger.logNetworkError(error.message, response.status)
  setError(error)
}
```

### 4. Test Errors (Dev Only)

Click the **yellow alert icon** (bottom-left) to open Error Test Panel:
- Test Network Error
- Test Auth Error
- Test Data Error
- Test Error Card
- Throw Error (Test Error Boundary)

---

## 📚 Common Patterns

### Pattern 1: Fetch with Error Handling
```tsx
try {
  const response = await fetch('/api/data', {
    signal: AbortSignal.timeout(10000)
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return await response.json()
} catch (error) {
  errorLogger.logDataError('Failed to fetch', '/api/data')
  throw error
}
```

### Pattern 2: Component Error Boundary
```tsx
<ErrorBoundary>
  <ImportantComponent />
</ErrorBoundary>
```

### Pattern 3: Hook Error State
```tsx
const { data, error, loading, retry } = useAppData()

if (error) {
  return <ErrorCard title="Error" message={error.message} onRetry={retry} />
}
```

---

## 🎯 Error Types

| Type | Severity | Use Case |
|------|----------|----------|
| Network | Medium | Connection failed, timeout, 5xx errors |
| Auth | High | Login failed, session expired, unauthorized |
| Data | High | API returned invalid data |
| Validation | Low | User input validation failed |
| Component | High | React component rendering error |

---

## 🔍 Debugging

### View Error Logs
```typescript
console.log(errorLogger.getLogs())
console.log(errorLogger.getErrorsByCategory('auth'))
console.log(errorLogger.getRecentErrors(10))
```

### Export Logs
```typescript
console.log(errorLogger.exportLogs())
// Copy output to file for analysis
```

### Clear Logs
```typescript
errorLogger.clearLogs()
```

---

## ✅ File Structure

```
components/
├── ErrorBoundary.tsx          # Main error boundary
├── ErrorTestPanel.tsx         # Dev testing panel
└── errors/
    ├── ErrorCard.tsx          # Generic error card
    ├── NetworkErrorModal.tsx   # Network errors
    ├── AuthErrorModal.tsx      # Auth errors
    ├── DataFetchErrorState.tsx # Data load errors
    └── index.ts                # Exports

hooks/
├── useAppData.ts              # Enhanced with error handling

lib/
└── errorLogger.ts             # Error logging service

app/
└── layout.tsx                 # Wrapped with ErrorBoundary
```

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Error not caught | Use try-catch or Error Boundary |
| No error displayed | Check if error state set |
| Logs not showing | Check NODE_ENV = development |
| Can't see test panel | Must be in development mode |

---

## 📖 Full Documentation

See `ERROR_HANDLING.md` for complete API reference and best practices.

---

**Quick Links**:
- 📄 [Full Error Handling Guide](./ERROR_HANDLING.md)
- 🏗️ [Project Architecture](./ARCHITECTURE.md)
- 📋 [Component Guide](./COMPONENT_GUIDE.md)
