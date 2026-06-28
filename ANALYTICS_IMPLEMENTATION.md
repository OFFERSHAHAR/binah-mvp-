# Analytics Implementation Guide - בִּינָה Platform

**Status**: ✅ Ready to Implement  
**Target**: Integrate with existing components

---

## 🎯 Quick Start Examples

### Example 1: Track Course Enrollment

```typescript
'use client'

import { trackCourseEnrollment } from '@/lib/analytics'

export function CourseCard({ courseId, courseName, onEnroll }) {
  const handleEnroll = async () => {
    try {
      // Perform enrollment
      await enrollInCourse(courseId)

      // Track event
      trackCourseEnrollment(courseId, courseName)

      // Show success
      onEnroll()
    } catch (error) {
      console.error('Enrollment failed:', error)
    }
  }

  return (
    <button onClick={handleEnroll} className="btn-primary">
      Enroll in Course
    </button>
  )
}
```

### Example 2: Track Assignment Submission

```typescript
'use client'

import { trackAssignmentStart, trackAssignmentSubmit } from '@/lib/analytics'

export function AssignmentPage({ assignmentId, assignmentName }) {
  const [startTime] = useState(Date.now())

  useEffect(() => {
    // Track when user starts assignment
    trackAssignmentStart(assignmentId, assignmentName)
  }, [])

  const handleSubmit = async (answers) => {
    try {
      const response = await submitAssignment(assignmentId, answers)
      const score = response.score

      // Track submission with score
      trackAssignmentSubmit(assignmentId, assignmentName, score)

      showSuccessMessage(`Assignment submitted! Score: ${score}`)
    } catch (error) {
      console.error('Submission failed:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit">Submit Assignment</button>
    </form>
  )
}
```

### Example 3: Track Screen Navigation

```typescript
'use client'

import { useSessionTracking } from '@/hooks/useSessionTracking'
import { useWebVitals } from '@/hooks/useWebVitals'

export function StudentProfileScreen({ userId }) {
  // Initialize session tracking for this screen
  useSessionTracking('StudentProfile', userId)

  // Track Web Vitals for this page
  useWebVitals()

  return (
    <div>
      <h1>Student Profile</h1>
      {/* Screen content */}
    </div>
  )
}
```

### Example 4: Track Button Clicks

```typescript
'use client'

import { trackButtonClick } from '@/lib/analytics'

export function ActionButtons() {
  const handleSave = () => {
    trackButtonClick('save_button', { context: 'profile_edit' })
    // Perform save action
  }

  const handleCancel = () => {
    trackButtonClick('cancel_button', { context: 'profile_edit' })
    // Perform cancel action
  }

  return (
    <div>
      <button onClick={handleSave}>Save Changes</button>
      <button onClick={handleCancel}>Cancel</button>
    </div>
  )
}
```

### Example 5: Error Tracking

```typescript
'use client'

import { trackError } from '@/lib/analytics'
import * as Sentry from '@sentry/nextjs'

export function DataImport({ onSuccess }) {
  const handleImport = async () => {
    try {
      const result = await importData()
      onSuccess(result)
    } catch (error) {
      // Track error with context
      trackError(error, {
        action: 'data_import',
        timestamp: new Date().toISOString(),
      })

      // Also captured by Sentry automatically
      Sentry.captureException(error)

      showErrorMessage('Import failed. Our team has been notified.')
    }
  }

  return <button onClick={handleImport}>Import Data</button>
}
```

---

## 📱 Integration Patterns

### Pattern 1: Page/Screen Component

```typescript
'use client'

import { useSessionTracking } from '@/hooks/useSessionTracking'
import { useWebVitals } from '@/hooks/useWebVitals'
import { useEffect } from 'react'
import { trackScreenView } from '@/lib/analytics'

interface PageProps {
  userId: string
  screenName: string
}

export function MyPage({ userId, screenName }: PageProps) {
  // Option 1: Use hook (automatic tracking)
  useSessionTracking(screenName, userId)
  useWebVitals()

  // Option 2: Manual tracking (more control)
  useEffect(() => {
    trackScreenView(screenName, {
      userId,
      timestamp: new Date().toISOString(),
    })
  }, [])

  return (
    <div>
      {/* Page content */}
    </div>
  )
}
```

### Pattern 2: User Interaction Tracking

```typescript
'use client'

import { motion } from 'framer-motion'
import { trackButtonClick } from '@/lib/analytics'

export function InteractiveComponent() {
  const handleClick = (buttonName: string) => {
    // Track with metadata
    trackButtonClick(buttonName, {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    })
  }

  return (
    <motion.button
      onClick={() => handleClick('primary_cta')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Click Me
    </motion.button>
  )
}
```

### Pattern 3: Learning Events Tracking

```typescript
'use client'

import { useEffect, useState } from 'react'
import {
  trackLessonStart,
  trackLessonComplete,
  trackAssignmentStart,
  trackAssignmentSubmit,
} from '@/lib/analytics'

export function LearningModule({ lessonId, lessonName }) {
  const [lessonStartTime] = useState(Date.now())

  useEffect(() => {
    // Track lesson start
    trackLessonStart(lessonId, lessonName)

    return () => {
      // Track lesson completion on unmount
      const duration = Date.now() - lessonStartTime
      trackLessonComplete(lessonId, lessonName, duration)
    }
  }, [])

  const handleAssignmentSubmit = (score: number) => {
    trackAssignmentSubmit('assignment-id', 'Assignment Name', score)
  }

  return (
    <div>
      {/* Learning content */}
    </div>
  )
}
```

### Pattern 4: Form Analytics

```typescript
'use client'

import { trackButtonClick, trackError } from '@/lib/analytics'
import { useState } from 'react'

interface FormData {
  email: string
  password: string
}

export function LoginForm({ onSuccess }) {
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Track form submission attempt
      trackButtonClick('login_form_submit')

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      // Track successful login
      trackButtonClick('login_success', { email: formData.email })
      onSuccess()
    } catch (err) {
      // Track error
      trackError(err, { form: 'login', email: formData.email })
      setError('Login failed. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <button type="submit">Log In</button>
      {error && <p>{error}</p>}
    </form>
  )
}
```

---

## 🔄 Event Flow Examples

### User Journey: Course Enrollment

```
User visits Dashboard
  ↓ trackScreenView('Dashboard')
  ↓ [sees course cards]
  ↓ clicks "Enroll" button
  ↓ trackButtonClick('enroll_button')
  ↓ [API call to enroll]
  ↓ trackCourseEnrollment(courseId, courseName)
  ↓ navigates to Course Details
  ↓ trackScreenView('CourseDetails')
  ↓ [views materials]
  ↓ trackLessonStart(lessonId, lessonName)
```

### User Journey: Assignment Submission

```
User starts assignment
  ↓ trackAssignmentStart(assignmentId, name)
  ↓ [works on assignment - 30 minutes]
  ↓ [user activity tracked via useSessionTracking]
  ↓ clicks "Submit"
  ↓ trackButtonClick('submit_assignment')
  ↓ [API validates]
  ↓ trackAssignmentSubmit(assignmentId, name, score)
  ↓ [receives grade]
  ↓ trackAssignmentGrade(assignmentId, name, grade)
```

---

## 🛠️ Testing Analytics

### Test Event Tracking Locally

```typescript
// Development console
import { trackEvent } from '@/lib/analytics'

trackEvent({
  category: 'test',
  action: 'test_event',
  label: 'test',
  metadata: { test: true }
})

// Check browser console for logs
// Check Sentry dashboard for events
```

### Test Error Tracking

```typescript
import { trackError } from '@/lib/analytics'

// Trigger error
try {
  throw new Error('Test error')
} catch (error) {
  trackError(error, { test: true })
}

// Should appear in Sentry dashboard
```

### Test Web Vitals

```typescript
import { useWebVitals } from '@/hooks/useWebVitals'

// Use in test page component
export function TestPage() {
  useWebVitals()
  return <div>Check console for Web Vitals</div>
}
```

---

## 📊 Analytics Dashboard Integration

### Add Analytics Dashboard Page

```typescript
// app/dashboard/analytics/page.tsx
'use client'

import { AnalyticsDashboard } from '@/components/AnalyticsDashboard'
import { useSessionTracking } from '@/hooks/useSessionTracking'

export default function AnalyticsPage() {
  useSessionTracking('AnalyticsDashboard', 'admin-user')

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
      <AnalyticsDashboard />
    </div>
  )
}
```

### Add Performance Dashboard Page

```typescript
// app/dashboard/performance/page.tsx
'use client'

import { PerformanceDashboard } from '@/components/PerformanceDashboard'
import { useSessionTracking } from '@/hooks/useSessionTracking'

export default function PerformancePage() {
  useSessionTracking('PerformanceDashboard', 'admin-user')

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Performance Metrics</h1>
      <PerformanceDashboard />
    </div>
  )
}
```

### Add Error Tracking Dashboard Page

```typescript
// app/dashboard/errors/page.tsx
'use client'

import { ErrorTrackingDashboard } from '@/components/ErrorTrackingDashboard'
import { useSessionTracking } from '@/hooks/useSessionTracking'

export default function ErrorsPage() {
  useSessionTracking('ErrorTrackingDashboard', 'admin-user')

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Error Tracking</h1>
      <ErrorTrackingDashboard />
    </div>
  )
}
```

---

## ✅ Implementation Checklist

- [ ] Install dependencies: `npm install`
- [ ] Set up `.env.local` with Sentry DSN
- [ ] Create Sentry project: https://sentry.io/
- [ ] Enable Vercel Analytics (if using Vercel)
- [ ] Add `useSessionTracking` to main screens
- [ ] Add `useWebVitals` to main page layout
- [ ] Add event tracking to key user actions:
  - [ ] Course enrollment
  - [ ] Assignment submission
  - [ ] Lesson completion
  - [ ] User login/logout
- [ ] Create dashboard pages
- [ ] Test in development environment
- [ ] Deploy to production
- [ ] Monitor dashboards post-deployment
- [ ] Set up alerts in Sentry
- [ ] Create weekly reporting routine

---

## 🚀 Next Steps

1. **Phase 1**: Basic event tracking (user actions, page views)
2. **Phase 2**: Advanced analytics (cohort analysis, funnel tracking)
3. **Phase 3**: Machine learning (anomaly detection, predictive analytics)
4. **Phase 4**: Real-time dashboards (live metrics, alerts)

---

**Last Updated**: 2026-06-26  
**Ready for Integration**: ✅ Yes

Implement following this guide to add comprehensive analytics to བིའིନָה!
