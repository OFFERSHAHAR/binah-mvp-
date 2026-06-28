# בִּינָה Real-time Features - Quick Integration Guide

**For**: Developers integrating real-time features into production
**Time to Complete**: 30 minutes
**Last Updated**: 2026-06-26

---

## 🚀 5-Minute Quick Start

### Step 1: Install Dependencies
```bash
npm install ws
npm install --save-dev @types/ws
```

### Step 2: Add Environment Variables
```env
# .env.local (development)
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# .env.production (production)
NEXT_PUBLIC_WS_URL=wss://your-domain.com:3001
```

### Step 3: Update Root Layout
```typescript
// app/layout.tsx
'use client'

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

### Step 4: Use in Any Component
```typescript
// Example: components/screens/Messages.tsx
'use client'

import { useRealtimeMessages } from '@/hooks'

export const Messages = () => {
  const { user } = useAuth()
  const { messages, unreadCount, sendMessage } = useRealtimeMessages({
    userId: user?.id,
    wsUrl: process.env.NEXT_PUBLIC_WS_URL,
  })

  return <div>You have {unreadCount} unread messages</div>
}
```

That's it! Notifications appear automatically.

---

## 📋 Implementation Checklist

### Prerequisites
- [ ] Next.js 15 project running
- [ ] Supabase database configured
- [ ] TypeScript strict mode enabled

### Files Already Created (Copy/Paste)
- [x] `hooks/useWebSocket.ts`
- [x] `hooks/useRealtimeMessages.ts`
- [x] `hooks/useRealtimeGrades.ts`
- [x] `hooks/useRealtimeAssignments.ts`
- [x] `hooks/useDashboardRefresh.ts`
- [x] `components/NotificationToast.tsx`
- [x] `components/RealtimeProvider.tsx`
- [x] `store/notificationStore.ts`
- [x] `lib/notificationHelpers.ts`
- [x] `lib/websocketServer.ts`

### API Routes to Implement
- [ ] `app/api/messages/route.ts` (template provided)
- [ ] `app/api/grades/route.ts` (template provided)
- [ ] `app/api/assignments/route.ts` (template provided)
- [ ] `app/api/dashboard/summary/route.ts` (template provided)

### Database Tables Needed
```sql
-- messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- grades table
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  assignment_id UUID NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER DEFAULT 100,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- assignments table (extend if needed)
-- submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Start WebSocket Server (Development)
```bash
# Option 1: ts-node
npm run dev:ws
# Add to package.json: "dev:ws": "ts-node lib/websocketServer.ts"

# Option 2: Direct Node.js
npx ts-node lib/websocketServer.ts

# Option 3: Compiled
npx tsc lib/websocketServer.ts
node lib/websocketServer.js
```

### Test Connection
```bash
# In browser console, after app loads:
fetch('/api/messages?userId=test-user')
  .then(r => r.json())
  .then(console.log)
```

---

## 🔧 Configuration Options

### Dashboard Refresh Interval
```typescript
// In RealtimeProvider.tsx or your component
const dashboard = useDashboardRefresh({
  interval: 30000,  // milliseconds (default: 30s)
  enabled: !!user,  // only refresh when user exists
})
```

### Notification Toast Duration
```typescript
// In notificationHelpers.ts, customize:
success: (title, message, duration = 4000)  // 4 seconds
error: (title, message)                     // No auto-dismiss
warning: (title, message, duration = 5000)  // 5 seconds
```

### WebSocket Reconnection
```typescript
// In useWebSocket.ts hook config
const ws = useWebSocket({
  url: config.url,
  reconnectAttempts: 5,        // max attempts
  reconnectDelay: 3000,        // initial delay (ms), exponential backoff
})
```

---

## 🎨 UI Customization

### Toast Appearance
Edit `components/NotificationToast.tsx`:
```typescript
// Change colors
const getColorByType = (type: string) => {
  case 'success': return 'from-green-500/10 ...'  // Modify here
}

// Change position (currently top-right)
<div className="fixed right-6 top-6 z-50">  // Adjust here
```

### Add Custom Notification Type
```typescript
// 1. Add to notificationStore.ts
export type NotificationType = 'success' | 'error' | 'custom'

// 2. Add color mapping in NotificationToast.tsx
case 'custom': return 'from-pink-500/10 ...'

// 3. Add helper in notificationHelpers.ts
custom: (title, message) => {
  useNotificationStore.getState().addNotification({
    type: 'custom',
    title,
    message,
    duration: 4000,
    sound: true,
  })
}
```

---

## 🔐 Security Setup

### WebSocket Authentication
```typescript
// In websocketServer.ts (line 32):
ws.on('message', (data: string) => {
  const message = JSON.parse(data)
  if (!userId && message.data?.userId) {
    userId = message.data.userId
    // TODO: Add token verification here
    const isValid = verifyToken(message.data.token)
    if (!isValid) ws.close()
  }
})
```

### HTTPS/WSS in Production
```env
# .env.production
NEXT_PUBLIC_WS_URL=wss://your-domain.com  # Note: wss not ws
```

### CORS Configuration
```typescript
// Next.js automatically handles CORS for API routes
// For WebSocket, configure in websocketServer.ts if needed:
const wss = new WebSocket.Server({
  server,
  perMessageDeflate: false,
  // Add CORS if needed
})
```

---

## 📊 Monitoring & Debugging

### Enable Debug Logging
```typescript
// In hooks, add:
console.log('[WebSocket]', 'Connected:', isConnected)
console.log('[Message]', 'Received:', data)
console.log('[Dashboard]', 'Refresh at:', new Date())
```

### Check WebSocket Status
```typescript
// In browser console:
// See connection status
const store = useNotificationStore.getState()
console.log(store.getUnreadCount())

// View all notifications
console.log(store.notifications)
```

### Monitor Performance
```typescript
// Chrome DevTools → Performance tab
// Start recording → interact → stop → analyze
// Look for:
// - JavaScript execution time <100ms
// - Animation FPS = 60
// - No long tasks (>50ms)
```

### Check Memory Usage
```typescript
// Chrome DevTools → Memory tab
// Take heap snapshot → look for:
// - WebSocket connection object
// - Message array size
// - No detached DOM nodes
```

---

## 🧪 Quick Test Scenarios

### Test 1: Message Real-time
1. Open app in two browser tabs
2. Send message from tab 1
3. Verify it appears in tab 2 within 1 second
4. Check toast notification appears

### Test 2: Grade Notification
1. Open Grades screen
2. Simulate grade POST to `/api/grades` with test data
3. Verify toast shows with score
4. Verify average recalculates

### Test 3: Assignment Update
1. Open Assignments screen
2. Submit assignment
3. Verify status changes to "submitted"
4. Toast shows status update

### Test 4: Reconnection
1. Open DevTools → Network
2. Look for WebSocket connection
3. Right-click → Block URL (simulates disconnect)
4. Verify warning toast appears
5. Unblock URL → verify reconnection toast appears

### Test 5: Performance
1. Open DevTools → Performance tab
2. Start recording
3. Create 50 rapid messages (send in loop)
4. Stop recording
5. Verify FPS stays 60

---

## 🐛 Troubleshooting

### "WebSocket connection failed"
```typescript
// Check 1: Environment variable
console.log(process.env.NEXT_PUBLIC_WS_URL)  // Should log URL

// Check 2: WebSocket server running
// Terminal: lsof -i :3001  (should show node process)

// Check 3: Firewall
// Ensure port 3001 is not blocked
```

### "Messages not appearing"
```typescript
// Check 1: useRealtimeMessages hook mounted
// DevTools → React → Components → search "Messages"

// Check 2: WebSocket connected
// DevTools → Network → WS → verify "101 Switching Protocols"

// Check 3: Message structure
// Browser console:
//   ws.subscribe('message', (data) => console.log(data))
```

### "Notifications not showing"
```typescript
// Check 1: NotificationToast in root layout
// DevTools → Elements → search "NotificationToast"

// Check 2: RealtimeProvider wrapping app
// DevTools → React → Components → search "RealtimeProvider"

// Check 3: Zustand store
// Browser console:
//   useNotificationStore.getState().notifications
```

### "High CPU usage"
```typescript
// Reduce refresh interval
useDashboardRefresh({ interval: 60000 })  // 60s instead of 30s

// Limit concurrent toasts
// Modify NotificationToast.tsx max to 3 instead of 5

// Check for memory leaks
// DevTools → Memory → Take snapshot → Growth
```

---

## 📚 API Reference

### useRealtimeMessages
```typescript
const {
  messages,          // Message[]
  loading,           // boolean
  error,             // string | null
  sendMessage,       // (text, recipientId) => Promise
  unreadCount,       // number
  clearUnread,       // () => void
  isConnected,       // boolean
} = useRealtimeMessages({ userId, wsUrl })
```

### useRealtimeGrades
```typescript
const {
  grades,                // Grade[]
  loading,               // boolean
  error,                 // string | null
  newGradesCount,        // number
  clearNewIndicators,    // () => void
  getAverageScore,       // () => number
  isConnected,           // boolean
} = useRealtimeGrades({ userId, wsUrl })
```

### useRealtimeAssignments
```typescript
const {
  assignments,            // Assignment[]
  loading,                // boolean
  error,                  // string | null
  updatesCount,           // number
  getStatusCounts,        // () => { pending, submitted, graded, overdue }
  clearUpdatesIndicator,  // () => void
  submitAssignment,       // (assignmentId, content) => Promise
  isConnected,            // boolean
} = useRealtimeAssignments({ userId, wsUrl })
```

### useDashboardRefresh
```typescript
const {
  isRefreshing,       // boolean
  lastRefreshTime,    // number (timestamp)
  error,              // string | null
  refresh,            // () => Promise (manual refresh)
} = useDashboardRefresh({ interval, enabled })
```

### notificationHelpers
```typescript
notificationHelpers.success(title, message, duration?)
notificationHelpers.error(title, message)
notificationHelpers.warning(title, message, duration?)
notificationHelpers.info(title, message, duration?)
notificationHelpers.message(title, message)
notificationHelpers.grade(assignmentName, score, maxScore?)
notificationHelpers.custom(type, title, message, options?)
```

---

## 📱 Mobile Considerations

### Responsive Toast
- ✅ Already responsive (tested on mobile)
- Toast size adjusts on small screens
- Touch-friendly dismiss button (44px minimum)

### Battery Usage
- ⚠️ Keep dashboard refresh interval ≥ 30s
- ⚠️ Disable refresh when app in background
- Use `document.hidden` event to pause

### Network Efficiency
```typescript
// Auto-disable on mobile for data savings
const isMobile = /iPhone|iPad|Android/.test(navigator.userAgent)
const refreshInterval = isMobile ? 60000 : 30000  // 60s on mobile
```

---

## 🚀 Production Deployment

### 1. Deploy WebSocket Server
```bash
# Option A: Dedicated server
# Deploy lib/websocketServer.ts to Heroku, Railway, or own server

# Option B: Integrated
# Not recommended but possible - add Socket.io to Next.js

# Option C: Managed
# Use Socket.io Cloud or similar service
```

### 2. Configure Production URLs
```env
NEXT_PUBLIC_WS_URL=wss://your-domain.com/ws  # Production
```

### 3. SSL/TLS Certificate
```bash
# WebSocket MUST use wss:// (secure)
# Get certificate from Let's Encrypt (free)
# Configure in server deployment
```

### 4. Database Backup
```bash
# Ensure Supabase backups enabled
# Monitor message/grade growth
# Archive old messages if needed
```

### 5. Monitoring
```typescript
// Add error tracking (Sentry, LogRocket)
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'your-dsn',
  environment: 'production',
})
```

---

## ✅ Final Checklist

Before going live:

- [ ] All hooks imported and used
- [ ] RealtimeProvider wraps entire app
- [ ] NotificationToast rendered in root layout
- [ ] Environment variables set (both dev and prod)
- [ ] WebSocket server deployed and running
- [ ] API routes implemented with database integration
- [ ] Database tables created and seeded
- [ ] TLS/SSL certificate valid (for wss://)
- [ ] Error logging configured
- [ ] Performance tested (60fps, <100ms latency)
- [ ] Manual testing passed on device
- [ ] Security review completed
- [ ] Monitoring/alerting set up

---

## 📞 Support Resources

- **Full Documentation**: See `REALTIME_IMPLEMENTATION.md`
- **Status Report**: See `REALTIME_STATUS_REPORT.md`
- **Project Guidelines**: See `CLAUDE.md`
- **Code Examples**: Check `components/screens/*.tsx`

---

**Ready?** Start with Step 1 above and let real-time updates transform your בִּינָה platform! 🚀
