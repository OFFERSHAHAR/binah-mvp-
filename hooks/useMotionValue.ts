'use client'

import { useEffect, useRef } from 'react'
import { useMotionValue as useFramerMotionValue, useTransform } from 'framer-motion'

interface UseMotionValueConfig {
  initial?: number
  min?: number
  max?: number
}

export const useMotionValueWithConstraints = ({
  initial = 0,
  min = -Infinity,
  max = Infinity,
}: UseMotionValueConfig = {}) => {
  const value = useFramerMotionValue(initial)
  const constrainedValue = useTransform(value, (v) => Math.max(min, Math.min(max, v)))

  return { value, constrainedValue }
}

/**
 * Hook for scroll-based motion values
 * Syncs scroll position to Framer Motion values
 */
export const useScrollMotion = () => {
  const scrollY = useFramerMotionValue(0)
  const scrollYProgress = useTransform(scrollY, (latest) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    return maxScroll > 0 ? latest / maxScroll : 0
  })

  useEffect(() => {
    const handleScroll = () => {
      scrollY.set(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrollY])

  return { scrollY, scrollYProgress }
}

/**
 * Hook for mouse position tracking
 * Returns normalized coordinates (-1 to 1)
 */
export const useMousePosition = () => {
  const mouseX = useFramerMotionValue(0)
  const mouseY = useFramerMotionValue(0)

  const normalizedX = useTransform(mouseX, (v) => (v / window.innerWidth) * 2 - 1)
  const normalizedY = useTransform(mouseY, (v) => (v / window.innerHeight) * 2 - 1)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return { mouseX, mouseY, normalizedX, normalizedY }
}

/**
 * Hook for tracking element visibility in viewport
 */
export const useInViewport = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useFramerMotionValue(0)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      isInView.set(entry.isIntersecting ? 1 : 0)
    }, options)

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [isInView, options])

  return { ref, isInView }
}
