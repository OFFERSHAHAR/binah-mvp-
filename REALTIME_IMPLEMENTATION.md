# בִּינָה Real-time Features Implementation Guide

**Status**: ✅ Complete | Phase 1 Integration Ready
**Last Updated**: 2026-06-26

---

## Overview

This document details the complete real-time update system for the בִּינָה AI Academy platform, including:

1. WebSocket-based live message updates
2. Real-time grade notifications
3. Real-time assignment status updates
4. Toast notification system with sound/badge
5. Dashboard auto-refresh (30-second interval)
6. Connection reconnection logic

---

## Architecture

```
┌─────────────────────────────────────────┐
│        Next.js Client Application       │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │    RealtimeProvider (wrapper)   │   │
│  │  - Initializes all real-time    │   │
│  │  - Orchestrates notifications   │   │
│  └─────────────────────────────────┘   │
│              ↓                          │
│  ┌─────────────────────────────────┐   │
│  │ useRealtimeMessages             │   │
│  │ useRealtimeGrades               │   │
│  │ useRealtimeAssignments          │   │
│  │ useDashboardRefresh             │   │
│  └─────────────────────────────────┘   │
│              ↓                          │
│  ┌─────────────────────────────────┐   │
│  │      useWebSocket (core)        │   │
│  │  - Connection management        │   │
│  │  - Reconnection logic           │   │
│  │  - Event subscription system    │   │
│  └─────────────────────────────────┘   │
│              ↓                          │
└─────────────────────────────────────────┘
         WebSocket Connection
              ↓
┌──────────────────────────────────┐
│    Dedicated WS Server (3001)    │
│                                  │
│  - Message routing               │
│  - User connection tracking      │
│  - Heartbeat/health check        │
│  - Broadcasting logic            │
└──────────────────────────────────┘
         HTTP Requests
              ↓
┌──────────────────────────────────┐
│     REST API (Next.js routes)    │
│                                  │
│  /api/messages                   │
│  /api/grades                     │
│  /api/assignments                │
│  /api/dashboard/summary          │
└──────────────────────────────────┘
         Database
              ↓
┌──────────────────────────────────┐
│        Supabase / PostgreSQL     │
└──────────────────────────────────┘
```

---

## Hooks Overview

### 1. `useWebSocket` (Core)

**File**: `hooks/useWebSocket.ts`

Lowest-level hook managing WebSocket connection, reconnection logic, and event subscription.

```typescript
const ws = useWebSocket({
  url: 'wss://localhost:3001',
  reconnectAttempts: 5,
  reconnectDelay: 3000, // exponential backoff
})

// Subscribe to events
const unsubscribe = ws.subscribe('message', (data) => {
  console.log('New message:', data)
})

// Send messages
ws.send({
  type: 'message',
  data: { text: 'Hello' },
  timestamp: Date.now(),
})

// Connection status
console.log(ws.isConnected) // boolean
console.log(ws.error) // string | null
```

**Features**:
- ✅ Automatic reconnection with exponential backoff
- ✅ Event-based subscription pattern
- ✅ Heartbeat/ping-pong support
- ✅ Clean unsubscribe handling
- ✅ Type-safe message passing

---

### 2. `useRealtimeMessages`

**File**: `hooks/useRealtimeMessages.ts`

High-level hook for real-time messaging with unread count tracking.

```typescript
const messages = useRealtimeMessages({
  userId: user?.id,
  wsUrl: process.env.NEXT_PUBLIC_WS_URL,
})

// Usage
console.log(messages.messages) // Message[]
console.log(messages.unreadCount) // number
console.log(messages.isConnected) // boolean

// Send message
await messages.sendMessage('Hello!', recipientId)

// Clear unread indicator
messages.clearUnread()
```

**State**:
- `messages`: Message[] - Full message history with `isNew` flag
- `unreadCount`: number - Count of unread messages
- `loading`: boolean - Initial load state
- `error`: string | null - Error message if any
- `isConnected`: boolean - WebSocket connection status

---

### 3. `useRealtimeGrades`

**File**: `hooks/useRealtimeGrades.ts`

Grade notifications with calculation utilities.

```typescript
const grades = useRealtimeGrades({
  userId: user?.id,
  wsUrl: process.env.NEXT_PUBLIC_WS_URL,
})

// Usage
console.log(grades.grades) // Grade[]
console.log(grades.newGradesCount) // number
console.log(grades.getAverageScore()) // number (0-100)

grades.clearNewIndicators()
```

**State**:
- `grades`: Grade[] - Full grade history with `isNew` flag
- `newGradesCount`: number - Count of new grades since last clear
- `loading`, `error`, `isConnected`: same as messages

---

### 4. `useRealtimeAssignments`

**File**: `hooks/useRealtimeAssignments.ts`

Assignment tracking with status updates.

```typescript
const assignments = useRealtimeAssignments({
  userId: user?.id,
  wsUrl: process.env.NEXT_PUBLIC_WS_URL,
})

// Usage
console.log(assignments.assignments) // Assignment[]
console.log(assignments.updatesCount) // number
console.log(assignments.getStatusCounts()) // { pending, submitted, graded, overdue }

// Submit assignment
await assignments.submitAssignment(assignmentId, content)

assignments.clearUpdatesIndicator()
```

**Status Values**: `'pending' | 'submitted' | 'graded' | 'overdue'`

---

### 5. `useDashboardRefresh`

**File**: `hooks/useDashboardRefresh.ts`

Automatic dashboard data refresh on 30-second interval.

```typescript
const dashboard = useDashboardRefresh({
  interval: 30000, // 30 seconds
  enabled: !!user,
})

// Usage
console.log(dashboard.isRefreshing) // boolean
console.log(dashboard.lastRefreshTime) // number (timestamp)

// Manual refresh
await dashboard.refresh()
```

**Endpoints Refreshed**:
- `/api/dashboard/summary`
- `/api/grades/latest`
- `/api/assignments/pending`

---

## Notification System

### Store: `notificationStore`

**File**: `store/notificationStore.ts`

Zustand store managing notification state and lifecycle.

```typescript
const { notifications, addNotification, removeNotification } = useNotificationStore()

// Direct API
addNotification({
  type: 'success',
  title: 'ההודעה שלי',
  message: 'פרטים נוספים',
  duration: 4000,
  sound: true,
})
```

**Notification Types**: `'success' | 'error' | 'info' | 'warning' | 'message' | 'grade'`

---

### Component: `NotificationToast`

**File**: `components/NotificationToast.tsx`

Renders notification toasts in top-right corner with:
- ✅ Glassmorphism design (matches app theme)
- ✅ Auto-dismiss with progress bar
- ✅ Smooth animations (Framer Motion)
- ✅ Type-specific icons and colors
- ✅ Sound playback (Web Audio API)
- ✅ Close button

```typescript
// In layout.tsx or root component
import { NotificationToast } from '@/components/NotificationToast'

export default function RootLayout() {
  return (
    <html>
      <body>
        {/* Your app */}
        <NotificationToast />
      </body>
    </html>
  )
}
```

---

### Helpers: `notificationHelpers`

**File**: `lib/notificationHelpers.ts`

Convenience functions for common notification patterns.

```typescript
import { notificationHelpers } from '@/lib/notificationHelpers'

// Predefined helpers
notificationHelpers.success('כותרת', 'הודעה', 4000)
notificationHelpers.error('כותרת', 'הודעה')
notificationHelpers.warning('כותרת', 'הודעה')
notificationHelpers.info('כותרת', 'הודעה')
notificationHelpers.message('כותרת', 'הודעה')
notificationHelpers.grade('שיעורי בית', 95, 100) // Calculates percentage

// Generic helper
notificationHelpers.custom('message', 'כותרת', 'הודעה', {
  duration: 5000,
  sound: true,
})

// Direct API
import { notify } from '@/lib/notificationHelpers'
notify('success', 'כותרת', 'הודעה', { duration: 3000 })
```

---

## Provider Component

### `RealtimeProvider`

**File**: `components/RealtimeProvider.tsx`

Top-level wrapper that orchestrates all real-time features.

```typescript
// In your root layout or page
import { RealtimeProvider } from '@/components/RealtimeProvider'

export default function Page() {
  return (
    <RealtimeProvider wsUrl="wss://your-ws-server.com">
      {/* Your app content */}
    </RealtimeProvider>
  )
}
```

**Functionality**:
- ✅ Initializes all real-time hooks
- ✅ Watches for new messages → shows toast
- ✅ Watches for new grades → shows toast with score
- ✅ Watches for assignment updates → shows status change
- ✅ Monitors connection status → shows warning if disconnected
- ✅ Renders NotificationToast component

---

## Setup Instructions

### 1. Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_WS_URL=wss://localhost:3001
WS_PORT=3001
```

For production:

```env
NEXT_PUBLIC_WS_URL=wss://your-domain.com/ws
WS_PORT=3001
```

---

### 2. Install WebSocket Dependency

```bash
npm install ws
npm install --save-dev @types/ws
```

---

### 3. Start WebSocket Server

Option A: Run as separate process:

```bash
npm run ws:dev
# In package.json:
# "ws:dev": "ts-node lib/websocketServer.ts"
```

Option B: Deploy to cloud (Heroku, Render, Railway):

```bash
# Compile
npx tsc lib/websocketServer.ts

# Run
node lib/websocketServer.js
```

Option C: Use managed service (e.g., Socket.io cloud)

---

### 4. Integrate into App

#### In `app/layout.tsx`:

```typescript
import { RealtimeProvider } from '@/components/RealtimeProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <RealtimeProvider wsUrl={process.env.NEXT_PUBLIC_WS_URL}>
          {children}
        </RealtimeProvider>
      </body>
    </html>
  )
}
```

---

### 5. Create API Routes

Create Next.js API routes to handle real-time data:

#### `/api/messages` (GET/POST)

```typescript
// app/api/messages/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  // Fetch from Supabase
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })

  return Response.json(data)
}

export async function POST(request: Request) {
  const { from, to, text } = await request.json()

  // Save to Supabase
  const { data } = await supabase.from('messages').insert({
    sender_id: from,
    recipient_id: to,
    content: text,
    created_at: new Date(),
  })

  return Response.json(data)
}
```

#### `/api/grades` (GET)

```typescript
// app/api/grades/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  const { data } = await supabase
    .from('grades')
    .select('*, assignments(name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return Response.json(data)
}
```

#### `/api/assignments` (GET/POST)

```typescript
// app/api/assignments/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  const { data } = await supabase
    .from('assignments')
    .select('*, submissions(status, submitted_at)')
    .eq('user_id', userId)

  return Response.json(data)
}

export async function POST(request: Request) {
  const { assignmentId, userId, content } = await request.json()

  const { data } = await supabase.from('submissions').insert({
    assignment_id: assignmentId,
    user_id: userId,
    content,
    submitted_at: new Date(),
  })

  return Response.json(data)
}
```

---

## Usage Examples

### Example 1: Messages Screen with Real-time Updates

```typescript
// components/screens/Messages.tsx
'use client'

import { motion } from 'framer-motion'
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages'
import { useAuth } from '@/hooks/useSupabase'

export const Messages = () => {
  const { user } = useAuth()
  const messages = useRealtimeMessages({
    userId: user?.id || null,
    wsUrl: process.env.NEXT_PUBLIC_WS_URL,
  })

  if (messages.loading) return <div>Loading...</div>
  if (messages.error) return <div>Error: {messages.error}</div>

  return (
    <main className="relative flex-1 h-screen overflow-y-auto pb-12 z-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 px-10 pt-8">
        <div className="text-3xl font-black text-dark mb-2">
          הודעות {messages.unreadCount > 0 && <span className="text-red-500">({messages.unreadCount})</span>}
        </div>
      </motion.div>

      <motion.div className="flex flex-col gap-3 px-10">
        {messages.messages.map((m) => (
          <motion.div key={m.id} className="rounded-2xl glass p-4 cursor-pointer hover:bg-white/40">
            <div className="flex items-start justify-between mb-1">
              <div className="font-bold text-dark text-sm">
                {m.from} {m.isNew && <span className="text-yellow-500 ml-2">●</span>}
              </div>
              <div className="text-xs text-muted">{m.time}</div>
            </div>
            <div className="text-sm text-muted">{m.text}</div>
          </motion.div>
        ))}
      </motion.div>
    </main>
  )
}
```

---

### Example 2: Grades Dashboard with Averages

```typescript
// components/screens/Grades.tsx
'use client'

import { useRealtimeGrades } from '@/hooks/useRealtimeGrades'
import { useAuth } from '@/hooks/useSupabase'

export const Grades = () => {
  const { user } = useAuth()
  const grades = useRealtimeGrades({
    userId: user?.id || null,
    wsUrl: process.env.NEXT_PUBLIC_WS_URL,
  })

  const average = grades.getAverageScore()
  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-500'
    if (percentage >= 80) return 'text-blue-500'
    if (percentage >= 70) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <main className="relative flex-1 h-screen overflow-y-auto pb-12 z-10">
      <div className="px-10 pt-8 mb-8">
        <h1 className="text-3xl font-black text-dark">ציוני</h1>
        <p className="text-lg font-bold text-dark mt-4">
          ממוצע: <span className={getGradeColor(average)}>{average}%</span>
        </p>
      </div>

      <div className="px-10 space-y-3">
        {grades.grades.map((g) => (
          <div
            key={g.id}
            className={`rounded-2xl glass p-4 border-l-4 ${
              g.isNew ? 'border-yellow-400' : 'border-transparent'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-dark">{g.assignmentName}</h3>
                <p className="text-sm text-muted">{g.feedback}</p>
              </div>
              <div className={`text-lg font-bold ${getGradeColor(g.percentage)}`}>
                {g.score}/{g.maxScore}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
```

---

## Performance Considerations

### WebSocket Best Practices

1. **Connection Pooling**: Limit simultaneous connections
2. **Message Batching**: Batch multiple updates into single message
3. **Heartbeat**: 30-second ping-pong to detect stale connections
4. **Throttling**: Throttle rapid status updates (100ms debounce)
5. **Reconnection Backoff**: Exponential backoff (3s, 4.5s, 6.75s, etc.)

### Dashboard Refresh

- **30-second interval**: Balances freshness with server load
- **Parallel requests**: All 3 endpoints in Promise.all()
- **Conditional refresh**: Only enabled when user exists
- **Manual override**: User can force refresh anytime

### Notification Toast

- **Max 5 simultaneous**: Prevents notification spam
- **Auto-dismiss**: 4-6 seconds depending on type
- **Memory efficient**: Old notifications removed from DOM
- **GPU animated**: transform/opacity only (60fps guaranteed)

---

## Testing

### Unit Tests (Example)

```typescript
// __tests__/hooks/useRealtimeMessages.test.ts
import { renderHook, act, waitFor } from '@testing-library/react'
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages'

describe('useRealtimeMessages', () => {
  it('should initialize with empty messages', () => {
    const { result } = renderHook(() =>
      useRealtimeMessages({ userId: 'test-user', wsUrl: 'wss://test' })
    )

    expect(result.current.messages).toEqual([])
    expect(result.current.unreadCount).toBe(0)
  })

  it('should add new message to list', async () => {
    const { result } = renderHook(() =>
      useRealtimeMessages({ userId: 'test-user', wsUrl: 'wss://test' })
    )

    act(() => {
      // Simulate WebSocket message
      result.current.messages.push({
        id: '1',
        from: 'teacher',
        text: 'Hello',
        time: '14:00',
        timestamp: Date.now(),
      })
    })

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(1)
    })
  })
})
```

---

## Troubleshooting

### WebSocket Connection Fails

**Issue**: `WebSocket is not connected` errors

**Solution**:
1. Check WebSocket server is running: `lsof -i :3001`
2. Verify `NEXT_PUBLIC_WS_URL` environment variable
3. Check browser console for CORS/CSP issues
4. Ensure TLS certificate is valid (for `wss://`)

### Messages Not Appearing

**Issue**: Messages received but not visible in UI

**Solution**:
1. Check `useRealtimeMessages` hook is rendering
2. Verify message payload structure matches schema
3. Check React DevTools Profiler for re-render issues
4. Look at Network tab for WebSocket frames

### High CPU Usage

**Issue**: Browser/server CPU high

**Solution**:
1. Reduce refresh interval (currently 30s)
2. Implement message throttling/debouncing
3. Check for memory leaks in component unmounting
4. Profile with Chrome DevTools Performance tab

---

## Deployment Checklist

- [ ] WebSocket server deployed (separate from Next.js)
- [ ] `NEXT_PUBLIC_WS_URL` set in production
- [ ] WebSocket server has TLS certificate (`wss://`)
- [ ] Firewall allows port 3001 (or configured port)
- [ ] Database connections pooled (not creating new per message)
- [ ] Monitoring alerts for WebSocket connection drops
- [ ] Error logging configured
- [ ] Performance monitoring (WebSocket lag, message latency)

---

## Next Steps

1. **Phase 2**: Add database-triggered real-time updates (Supabase real-time)
2. **Phase 3**: Add typing indicators for messages
3. **Phase 4**: Add read receipts
4. **Phase 5**: Add presence indicators (who's online)
5. **Phase 6**: Add video/voice call support

---

## File Structure

```
ai-ios/
├── hooks/
│   ├── useWebSocket.ts                    # Core WebSocket hook
│   ├── useRealtimeMessages.ts             # Messages with unread count
│   ├── useRealtimeGrades.ts               # Grades with average calc
│   ├── useRealtimeAssignments.ts          # Assignments with status
│   ├── useDashboardRefresh.ts             # 30s auto-refresh
│   └── index.ts                           # Export barrel
├── components/
│   ├── RealtimeProvider.tsx               # Top-level orchestrator
│   ├── NotificationToast.tsx              # Toast component
│   └── screens/
│       ├── Messages.tsx                   # Updated with real-time
│       ├── Grades.tsx                     # Updated with real-time
│       └── Assignments.tsx                # Updated with real-time
├── store/
│   └── notificationStore.ts               # Zustand notification state
├── lib/
│   ├── notificationHelpers.ts             # Convenience functions
│   └── websocketServer.ts                 # Reference WS implementation
├── app/
│   └── api/
│       ├── messages/
│       │   └── route.ts
│       ├── grades/
│       │   └── route.ts
│       └── assignments/
│           └── route.ts
└── REALTIME_IMPLEMENTATION.md             # This file
```

---

## Summary

| Feature | Status | Location | Notes |
|---------|--------|----------|-------|
| WebSocket core | ✅ Done | `hooks/useWebSocket.ts` | 5-attempt reconnection |
| Messages real-time | ✅ Done | `hooks/useRealtimeMessages.ts` | Unread count tracking |
| Grades real-time | ✅ Done | `hooks/useRealtimeGrades.ts` | Average calculation |
| Assignments real-time | ✅ Done | `hooks/useRealtimeAssignments.ts` | Status tracking |
| Dashboard refresh | ✅ Done | `hooks/useDashboardRefresh.ts` | 30s interval |
| Toast notifications | ✅ Done | `components/NotificationToast.tsx` | Glassmorphism UI |
| Notification helpers | ✅ Done | `lib/notificationHelpers.ts` | Convenience API |
| Real-time provider | ✅ Done | `components/RealtimeProvider.tsx` | Orchestrator |
| WS server reference | ✅ Done | `lib/websocketServer.ts` | Deploy separately |
| API routes | 🚧 Template | `app/api/*` | Implement with DB |
| Integration | 🚧 Pending | `app/layout.tsx` | Wrap with provider |

---

**Next Update**: When deploying WebSocket server
**Maintained By**: בִּינָה Development Team
**Support**: See CLAUDE.md for project guidelines
