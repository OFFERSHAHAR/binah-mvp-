import { useRef, useEffect, useState } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

interface ParallaxConfig {
  speed?: number
  offset?: number
  trigger?: 'scroll' | 'mouse' | 'both'
}

export const useParallax = (config: ParallaxConfig = {}) => {
  const { speed = 0.5, offset = 0, trigger = 'scroll' } = config
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  const y = useMotionValue(0)
  const ySpring = useSpring(y, {
    damping: 30,
    mass: 0.2,
    stiffness: 100,
  })

  useEffect(() => {
    if (!ref.current) return

    const handleScroll = () => {
      if (trigger === 'scroll' || trigger === 'both') {
        const rect = ref.current!.getBoundingClientRect()
        const scrollY = window.scrollY
        const elementY = rect.top + scrollY
        const distance = scrollY - elementY
        y.set(distance * speed + offset)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (trigger === 'mouse' || trigger === 'both') {
        const rect = ref.current!.getBoundingClientRect()
        const mouseY = e.clientY - rect.top
        const centerY = rect.height / 2
        const distance = mouseY - centerY
        y.set(distance * speed + offset)
      }
    }

    if (trigger === 'scroll' || trigger === 'both') {
      window.addEventListener('scroll', handleScroll, { passive: true })
    }
    if (trigger === 'mouse' || trigger === 'both') {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [y, speed, offset, trigger])

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting)
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return { ref, y: ySpring, isInView }
}

export const usePointerParallax = (strength: number = 1) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const xSpring = useSpring(x, { damping: 25, mass: 0.1, stiffness: 100 })
  const ySpring = useSpring(y, { damping: 25, mass: 0.1, stiffness: 100 })

  const handleMouseMove = (e: MouseEvent) => {
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const distX = (e.clientX - centerX) * strength * 0.02
    const distY = (e.clientY - centerY) * strength * 0.02
    x.set(distX)
    y.set(distY)
  }

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [strength])

  return { x: xSpring, y: ySpring }
}
