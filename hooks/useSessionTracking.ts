/**
 * useSessionTracking Hook
 * Tracks user sessions and interactions
 */

import { useEffect, useRef, useCallback } from 'react'
import {
  trackScreenView,
  trackButtonClick,
  initializeSessionTracking,
  getSessionId,
} from '@/lib/analytics'

interface SessionData {
  sessionId: string
  userId?: string
  startTime: number
  lastActivityTime: number
  screenViews: number
  interactions: number
  duration: number
}

export const useSessionTracking = (screenName: string, userId?: string): void => {
  const sessionRef = useRef<SessionData>({
    sessionId: getSessionId() || initializeSessionTracking(),
    userId,
    startTime: Date.now(),
    lastActivityTime: Date.now(),
    screenViews: 0,
    interactions: 0,
    duration: 0,
  })

  // Track screen view on mount
  useEffect(() => {
    trackScreenView(screenName, {
      sessionId: sessionRef.current.sessionId,
      userId,
    })

    sessionRef.current.screenViews += 1
    sessionRef.current.lastActivityTime = Date.now()
  }, [screenName, userId])

  // Track user interactions
  const trackInteraction = useCallback((): void => {
    sessionRef.current.interactions += 1
    sessionRef.current.lastActivityTime = Date.now()
  }, [])

  // Track button clicks
  const trackClick = useCallback((buttonName: string): void => {
    trackButtonClick(buttonName, {
      sessionId: sessionRef.current.sessionId,
      userId,
    })
    trackInteraction()
  }, [userId, trackInteraction])

  // Detect user inactivity (15 minutes)
  useEffect(() => {
    const handleActivity = (): void => {
      trackInteraction()
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((event) => {
      window.addEventListener(event, handleActivity)
    })

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [trackInteraction])

  // Track session duration periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      sessionRef.current.duration = now - sessionRef.current.startTime

      // Check for inactivity (no activity for 15 minutes)
      const inactivityTime = now - sessionRef.current.lastActivityTime
      if (inactivityTime > 15 * 60 * 1000) {
        if (process.env.NEXT_PUBLIC_ENV === 'development') {
          console.log('[Session Tracking] User inactive, ending session')
        }
      }
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Export tracking function for components to use
  if (typeof window !== 'undefined') {
    (window as any).__sessionTracking = {
      trackClick,
      trackInteraction,
      getSessionData: () => sessionRef.current,
    }
  }
}

/**
 * Get current session data
 */
export const getSessionData = (): SessionData | null => {
  if (typeof window !== 'undefined' && (window as any).__sessionTracking) {
    return (window as any).__sessionTracking.getSessionData()
  }
  return null
}

/**
 * Track interaction from component
 */
export const trackComponentInteraction = (buttonName: string): void => {
  if (typeof window !== 'undefined' && (window as any).__sessionTracking) {
    (window as any).__sessionTracking.trackClick(buttonName)
  }
}
