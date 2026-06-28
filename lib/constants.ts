// Color Palette
export const colors = {
  primary: '#5E5AA8',
  secondary: '#2E9E72',
  accent: '#E5821A',
  dark: '#2E2E48',
  light: '#F8F7FD',
  muted: '#7A7A92',
  white: '#FFFFFF',

  // Gradients
  gradients: {
    purple: 'linear-gradient(135deg, #9FB4F5, #C3A8EE)',
    teal: 'linear-gradient(135deg, #7FD3C0, #9AD9F0)',
    orange: 'linear-gradient(135deg, #FFD08A, #FFB0A0)',
    lavender: 'linear-gradient(135deg, #C3A8EE, #E0A8E8)',
    header: 'linear-gradient(120deg, #C7D4FF, #DACBFB 55%, #C6ECF1)',
  },

  // Glassmorphism
  glass: {
    light: 'rgba(255, 255, 255, 0.66)',
    intense: 'rgba(255, 255, 255, 0.7)',
    dark: 'rgba(43, 40, 64, 0.95)',
  },
} as const

// Animation Easing
export const easing = {
  // Signature easing: elastic feel with slight overshoot
  spring: 'cubic-bezier(0.34, 1.35, 0.5, 1)',
  // Smooth ease
  smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  // Sharp
  sharp: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
} as const

// Animation Durations (milliseconds)
export const durations = {
  instant: 150,
  fast: 300,
  standard: 600,
  standardLong: 700,
  slow: 1000,
  slowLong: 1200,
} as const

// Parallax Configuration
export const parallax = {
  scrollSpeed: 0.5,
  mouseStrength: 1,
  blobAnimationDuration: 22000, // 22 seconds for blob A
  blobAnimationDurationB: 26000, // 26 seconds for blob B
  blurRadius: {
    a: 40,
    b: 44,
  },
} as const

// Breakpoints
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// Z-Index layers
export const zIndex = {
  background: 0,
  content: 1,
  sidebar: 20,
  modal: 50,
  tooltip: 100,
  notification: 200,
} as const

// Typography
export const typography = {
  fonts: {
    primary: "'Heebo', system-ui, sans-serif",
    mono: "'ui-monospace', 'Menlo', monospace",
  },
  sizes: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
} as const

// Motion Presets
export const motionPresets = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: easing.smooth },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: easing.smooth },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: easing.smooth },
  },
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: easing.smooth },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, ease: easing.spring },
  },
  staggerContainer: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
} as const

// Screen sizes for responsive parallax
export const responsiveParallax = {
  mobile: { speed: 0.3 },
  tablet: { speed: 0.4 },
  desktop: { speed: 0.5 },
} as const
