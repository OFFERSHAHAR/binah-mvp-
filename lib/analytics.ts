/**
 * Analytics Event Tracking
 * Centralized event tracking for בִּינָה platform
 */

import * as Sentry from '@sentry/nextjs'

export type EventCategory =
  | 'user'
  | 'course'
  | 'assignment'
  | 'lesson'
  | 'navigation'
  | 'performance'
  | 'error'

export interface AnalyticsEvent {
  category: EventCategory
  action: string
  label?: string
  value?: number | string
  metadata?: Record<string, unknown>
  timestamp?: number
  userId?: string
  sessionId?: string
}

/**
 * Core event tracking with Vercel Analytics + Sentry integration
 */
export const trackEvent = (event: AnalyticsEvent): void => {
  try {
    const eventData = {
      ...event,
      timestamp: event.timestamp || Date.now(),
    }

    // Log to Sentry for error tracking
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureMessage(`Event: ${event.category}/${event.action}`, {
        level: 'info',
        extra: eventData,
      })
    }

    // Send to Vercel Analytics via Web Vitals hook
    if (typeof window !== 'undefined') {
      const analyticsEvent = new CustomEvent('analytics-event', {
        detail: eventData,
      })
      window.dispatchEvent(analyticsEvent)
    }

    // Console logging in development
    if (process.env.NEXT_PUBLIC_ENV === 'development') {
      console.log('[Analytics]', {
        category: event.category,
        action: event.action,
        ...event.metadata,
      })
    }
  } catch (error) {
    console.error('Failed to track event:', error)
  }
}

/**
 * User Events
 */
export const trackUserLogin = (userId: string, metadata?: Record<string, unknown>): void => {
  trackEvent({
    category: 'user',
    action: 'login',
    label: userId,
    metadata,
  })
}

export const trackUserLogout = (userId: string): void => {
  trackEvent({
    category: 'user',
    action: 'logout',
    label: userId,
  })
}

export const trackUserSignup = (userId: string, email: string): void => {
  trackEvent({
    category: 'user',
    action: 'signup',
    label: email,
    metadata: { userId },
  })
}

/**
 * Course Events
 */
export const trackCourseEnrollment = (courseId: string, courseName: string): void => {
  trackEvent({
    category: 'course',
    action: 'enroll',
    label: courseName,
    metadata: { courseId },
  })
}

export const trackCourseCompletion = (
  courseId: string,
  courseName: string,
  duration: number,
): void => {
  trackEvent({
    category: 'course',
    action: 'complete',
    label: courseName,
    value: duration,
    metadata: { courseId, duration },
  })
}

export const trackCourseView = (courseId: string, courseName: string): void => {
  trackEvent({
    category: 'course',
    action: 'view',
    label: courseName,
    metadata: { courseId },
  })
}

/**
 * Assignment Events
 */
export const trackAssignmentStart = (assignmentId: string, assignmentName: string): void => {
  trackEvent({
    category: 'assignment',
    action: 'start',
    label: assignmentName,
    metadata: { assignmentId },
  })
}

export const trackAssignmentSubmit = (
  assignmentId: string,
  assignmentName: string,
  score?: number,
): void => {
  trackEvent({
    category: 'assignment',
    action: 'submit',
    label: assignmentName,
    value: score,
    metadata: { assignmentId, score },
  })
}

export const trackAssignmentGrade = (
  assignmentId: string,
  assignmentName: string,
  grade: number,
): void => {
  trackEvent({
    category: 'assignment',
    action: 'grade_received',
    label: assignmentName,
    value: grade,
    metadata: { assignmentId, grade },
  })
}

/**
 * Lesson Events
 */
export const trackLessonStart = (lessonId: string, lessonName: string): void => {
  trackEvent({
    category: 'lesson',
    action: 'start',
    label: lessonName,
    metadata: { lessonId },
  })
}

export const trackLessonComplete = (
  lessonId: string,
  lessonName: string,
  duration: number,
): void => {
  trackEvent({
    category: 'lesson',
    action: 'complete',
    label: lessonName,
    value: duration,
    metadata: { lessonId, duration },
  })
}

export const trackLessonView = (lessonId: string, lessonName: string): void => {
  trackEvent({
    category: 'lesson',
    action: 'view',
    label: lessonName,
    metadata: { lessonId },
  })
}

/**
 * Navigation Events
 */
export const trackScreenView = (screenName: string, metadata?: Record<string, unknown>): void => {
  trackEvent({
    category: 'navigation',
    action: 'screen_view',
    label: screenName,
    metadata,
  })
}

export const trackButtonClick = (buttonName: string, metadata?: Record<string, unknown>): void => {
  trackEvent({
    category: 'navigation',
    action: 'button_click',
    label: buttonName,
    metadata,
  })
}

/**
 * Performance Events
 */
export const trackPageLoadTime = (duration: number, metadata?: Record<string, unknown>): void => {
  trackEvent({
    category: 'performance',
    action: 'page_load',
    value: duration,
    metadata: { duration, ...metadata },
  })
}

export const trackAnimationPerformance = (fps: number, metadata?: Record<string, unknown>): void => {
  trackEvent({
    category: 'performance',
    action: 'animation_fps',
    value: fps,
    metadata: { fps, ...metadata },
  })
}

export const trackCoreWebVitals = (
  lcp: number,
  fid: number,
  cls: number,
): void => {
  trackEvent({
    category: 'performance',
    action: 'core_web_vitals',
    metadata: { lcp, fid, cls },
  })
}

/**
 * Error Events
 */
export const trackError = (
  error: Error | string,
  context?: Record<string, unknown>,
): void => {
  const errorMessage = typeof error === 'string' ? error : error.message
  const errorStack = typeof error === 'string' ? undefined : error.stack

  trackEvent({
    category: 'error',
    action: 'exception',
    label: errorMessage,
    metadata: {
      stack: errorStack,
      ...context,
    },
  })

  // Also report to Sentry
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      contexts: {
        analytics: context,
      },
    })
  }
}

/**
 * Session Tracking
 */
export const initializeSessionTracking = (): string => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  if (typeof window !== 'undefined') {
    sessionStorage.setItem('analyticsSessionId', sessionId)
  }

  return sessionId
}

export const getSessionId = (): string | null => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('analyticsSessionId')
  }
  return null
}

/**
 * Batch Event Export
 */
export interface AnalyticsReport {
  sessionId: string
  startTime: number
  endTime: number
  totalEvents: number
  eventsByCategory: Record<EventCategory, number>
  topActions: Array<{ action: string; count: number }>
}

export const getAnalyticsReport = (): AnalyticsReport => {
  const sessionId = getSessionId() || 'unknown'

  return {
    sessionId,
    startTime: Date.now(),
    endTime: Date.now(),
    totalEvents: 0,
    eventsByCategory: {
      user: 0,
      course: 0,
      assignment: 0,
      lesson: 0,
      navigation: 0,
      performance: 0,
      error: 0,
    },
    topActions: [],
  }
}
