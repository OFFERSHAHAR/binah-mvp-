'use client'

import { useRef, useEffect, useState } from 'react'
import { useMotionValue, useTransform } from 'framer-motion'

interface ZoomTransitionConfig {
  duration?: number
  easing?: string
}

export const useZoomTransition = (config: ZoomTransitionConfig = {}) => {
  const { duration = 700, easing = 'cubic-bezier(0.34, 1.35, 0.5, 1)' } = config
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isZoomedIn, setIsZoomedIn] = useState(false)

  const progress = useMotionValue(0)

  const scale = useTransform(progress, [0, 1], [0.8, 1])
  const opacity = useTransform(progress, [0, 0.5, 1], [0, 0.5, 1])

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return
    progress.set(1)
  }, [isVisible, progress])

  const triggerZoom = () => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const endScale = window.innerWidth / rect.width * 0.95

    setIsZoomedIn(true)

    return {
      style: {
        transformOrigin: 'center center',
        transition: `all ${duration}ms ${easing}`,
        transform: `scale(${endScale})`,
      },
    }
  }

  const resetZoom = () => {
    setIsZoomedIn(false)
  }

  return { ref, scale, opacity, triggerZoom, resetZoom, isZoomedIn }
}

export const useScrollReveal = () => {
  const ref = useRef<HTMLDivElement>(null)
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
          setIsRevealed(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return { ref, isRevealed }
}
