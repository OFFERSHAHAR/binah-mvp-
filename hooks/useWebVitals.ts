/**
 * useWebVitals Hook
 * Tracks Core Web Vitals: LCP, FID, CLS
 */

import { useEffect } from 'react'
import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals'
import { trackCoreWebVitals } from '@/lib/analytics'

interface WebVitalsMetrics {
  lcp?: number
  cls?: number
  fcp?: number
  ttfb?: number
}

const metrics: WebVitalsMetrics = {}

export const useWebVitals = (): void => {
  useEffect(() => {
    try {
      // Largest Contentful Paint
      onLCP((metric) => {
        metrics.lcp = metric.value
        if (process.env.NEXT_PUBLIC_ENV === 'development') {
          console.log('[Web Vitals] LCP:', metric.value)
        }
      })

      // Cumulative Layout Shift
      onCLS((metric) => {
        metrics.cls = metric.value
        if (process.env.NEXT_PUBLIC_ENV === 'development') {
          console.log('[Web Vitals] CLS:', metric.value)
        }
      })

      // First Contentful Paint
      onFCP((metric) => {
        metrics.fcp = metric.value
        if (process.env.NEXT_PUBLIC_ENV === 'development') {
          console.log('[Web Vitals] FCP:', metric.value)
        }
      })

      // Time to First Byte
      onTTFB((metric) => {
        metrics.ttfb = metric.value
        if (process.env.NEXT_PUBLIC_ENV === 'development') {
          console.log('[Web Vitals] TTFB:', metric.value)
        }
      })

      // Track metrics after page load
      const handleLoad = (): void => {
        // Send Core Web Vitals
        if (metrics.lcp || metrics.cls) {
          trackCoreWebVitals(
            metrics.lcp || 0,
            0,
            metrics.cls || 0,
          )
        }
      }

      if (document.readyState === 'complete') {
        handleLoad()
        return undefined
      }

      window.addEventListener('load', handleLoad)
      return () => window.removeEventListener('load', handleLoad)
    } catch (error) {
      console.error('Failed to track Web Vitals:', error)
      return undefined
    }
  }, [])
}
