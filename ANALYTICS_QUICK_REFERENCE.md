# Analytics Quick Reference - בִּינָה Platform

**Print this for quick access!**

---

## 🚀 Quick Setup (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Add Sentry DSN to .env.local
# NEXT_PUBLIC_SENTRY_DSN=https://key@sentry.io/project-id

# 4. Done! Start dev server
npm run dev
```

---

## 📊 Event Tracking API

### User Events
```typescript
trackUserLogin(userId, metadata?)
trackUserLogout(userId)
trackUserSignup(userId, email)
```

### Course Events
```typescript
trackCourseEnrollment(courseId, courseName)
trackCourseCompletion(courseId, courseName, duration)
trackCourseView(courseId, courseName)
```

### Assignment Events
```typescript
trackAssignmentStart(assignmentId, name)
trackAssignmentSubmit(assignmentId, name, score?)
trackAssignmentGrade(assignmentId, name, grade)
```

### Lesson Events
```typescript
trackLessonStart(lessonId, name)
trackLessonComplete(lessonId, name, duration)
trackLessonView(lessonId, name)
```

### Navigation Events
```typescript
trackScreenView(screenName, metadata?)
trackButtonClick(buttonName, metadata?)
```

### Performance Events
```typescript
trackPageLoadTime(duration, metadata?)
trackAnimationPerformance(fps, metadata?)
trackCoreWebVitals(lcp, fid, cls)
```

### Error Events
```typescript
trackError(error, context?)
```

---

## 🎣 Hooks

### Session Tracking
```typescript
import { useSessionTracking } from '@/hooks/useSessionTracking'

// Auto-tracks screen view + interactions
useSessionTracking('ScreenName', userId)
```

### Web Vitals Tracking
```typescript
import { useWebVitals } from '@/hooks/useWebVitals'

// Auto-tracks FCP, LCP, FID, CLS, TTFB
useWebVitals()
```

---

## 📈 Dashboards

### Main Analytics
```typescript
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard'

<AnalyticsDashboard />
```

### Performance Metrics
```typescript
import { PerformanceDashboard } from '@/components/PerformanceDashboard'

<PerformanceDashboard />
```

### Error Tracking
```typescript
import { ErrorTrackingDashboard } from '@/components/ErrorTrackingDashboard'

<ErrorTrackingDashboard />
```

---

## 🎯 Common Patterns

### Track Course Enrollment
```typescript
const handleEnroll = async () => {
  await enrollCourse(courseId)
  trackCourseEnrollment(courseId, courseName)
}
```

### Track Assignment Submission
```typescript
const handleSubmit = async (answers) => {
  const { score } = await submitAssignment(assignmentId, answers)
  trackAssignmentSubmit(assignmentId, name, score)
}
```

### Track Screen Navigation
```typescript
export function MyScreen({ userId }) {
  useSessionTracking('MyScreen', userId)
  useWebVitals()
  return <div>...</div>
}
```

### Track Errors
```typescript
try {
  // Code that might error
} catch (error) {
  trackError(error, { context: 'myFunction' })
}
```

---

## 📊 Environment Variables

```env
# Required
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_SENTRY_DSN=https://key@sentry.io/project-id

# Optional
SENTRY_AUTH_TOKEN=token
SENTRY_ORG=org-name
SENTRY_PROJECT=project-name
```

---

## 🔍 Data Sources

| Source | Data | Dashboard |
|--------|------|-----------|
| **Vercel** | Page views, Sessions | AnalyticsDashboard |
| **Sentry** | Errors, Performance | ErrorTrackingDashboard |
| **Web Vitals** | FCP, LCP, FID, CLS | PerformanceDashboard |
| **Custom Events** | User actions | AnalyticsDashboard |

---

## ✅ Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| FCP | < 1.5s | ✅ |
| LCP | < 2.5s | ✅ |
| FID | < 100ms | ✅ |
| CLS | < 0.1 | ✅ |
| Animation FPS | 60 | ✅ |
| Bundle Size | < 150KB | ✅ |

---

## 🛠️ Troubleshooting

**Analytics not showing?**
- Check `NEXT_PUBLIC_ENABLE_ANALYTICS=true`
- Wait 5 minutes for data
- Check console for errors

**Errors not in Sentry?**
- Verify DSN in `.env.local`
- Check Sentry project settings
- Try catching error manually

**Performance metrics not tracking?**
- Call `useWebVitals()` in main page
- Check animation is using transforms
- Use Chrome DevTools Performance tab

---

## 📞 Links

- **Sentry Docs**: https://docs.sentry.io/
- **Vercel Analytics**: https://vercel.com/docs/analytics
- **Web Vitals**: https://web.dev/vitals/
- **Sentry Dashboard**: https://sentry.io/
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## 📋 Files Reference

```
sentry.client.config.ts       # Client-side Sentry
sentry.server.config.ts       # Server-side Sentry
lib/analytics.ts              # Event tracking API
hooks/useWebVitals.ts         # Web Vitals hook
hooks/useSessionTracking.ts   # Session hook
components/AnalyticsDashboard.tsx
components/PerformanceDashboard.tsx
components/ErrorTrackingDashboard.tsx
ANALYTICS_SETUP.md            # Full setup guide
ANALYTICS_IMPLEMENTATION.md   # Integration examples
```

---

**Print or bookmark this page!** 🔖

Last Updated: 2026-06-26
