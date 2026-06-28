'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Sidebar } from '@/components/Sidebar'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { ErrorTestPanel } from '@/components/ErrorTestPanel'
import { StudentProfile } from '@/components/screens/StudentProfile'
import { Dashboard } from '@/components/screens/Dashboard'
import { Calendar } from '@/components/screens/Calendar'
import { Curriculum } from '@/components/screens/Curriculum'
import { Lessons } from '@/components/screens/Lessons'
import { Assignments } from '@/components/screens/Assignments'
import { Grades } from '@/components/screens/Grades'
import { Messages } from '@/components/screens/Messages'
import { Resources } from '@/components/screens/Resources'
import { Record } from '@/components/screens/Record'
import { LessonBuilder } from '@/components/screens/LessonBuilder'
import { Admin } from '@/components/screens/Admin'
import { Settings } from '@/components/screens/Settings'
import { useNavigationStore, type ScreenKey } from '@/store/navigationStore'
import { useAuthStore } from '@/store/authStore'

/**
 * Screen component mapping
 * Maps screen IDs (URL params) to React components
 */
const SCREEN_COMPONENTS: Record<ScreenKey, React.ComponentType> = {
  'dashboard': Dashboard,
  'student-profile': StudentProfile,
  'calendar': Calendar,
  'curriculum': Curriculum,
  'lessons': Lessons,
  'assignments': Assignments,
  'grades': Grades,
  'messages': Messages,
  'resources': Resources,
  'record': Record,
  'lesson-builder': LessonBuilder,
  'settings': Settings,
  'admin': Admin,
  'analytics': Dashboard, // Fallback to Dashboard
}

/**
 * Valid screen keys from the store
 */
const VALID_SCREENS: ScreenKey[] = [
  'dashboard',
  'student-profile',
  'calendar',
  'curriculum',
  'lessons',
  'assignments',
  'grades',
  'messages',
  'resources',
  'record',
  'lesson-builder',
  'settings',
  'admin',
]

/**
 * ScreenContent - Renders the dynamic screen content
 */
function ScreenContent() {
  const router = useRouter()
  const params = useParams()
  const { currentScreen, setCurrentScreen } = useNavigationStore()
  const { user } = useAuthStore()

  const screenParam = params.screen as string | undefined

  // Validate and normalize screen parameter
  useEffect(() => {
    if (!screenParam) {
      router.push('/dashboard')
      return
    }

    // Normalize the screen parameter (URL-safe)
    const normalizedScreen = decodeURIComponent(screenParam).toLowerCase() as ScreenKey

    // Validate against allowed screens
    if (!VALID_SCREENS.includes(normalizedScreen)) {
      console.warn(`Invalid screen: ${normalizedScreen}. Redirecting to dashboard.`)
      router.push('/dashboard')
      return
    }

    // Admin area is admin-only
    if (normalizedScreen === 'admin' && user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    // Sync URL with store
    if (currentScreen !== normalizedScreen) {
      setCurrentScreen(normalizedScreen)
    }
  }, [screenParam, router, currentScreen, setCurrentScreen, user])

  // Determine which component to render
  const ScreenComponent = SCREEN_COMPONENTS[currentScreen as ScreenKey]

  if (!ScreenComponent) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex items-center justify-center"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark mb-2">Screen Not Found</h1>
          <p className="text-muted mb-6">The requested screen does not exist.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen flex overflow-hidden"
      dir="rtl"
    >
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatedBackground />
      </div>

      {/* Main Layout */}
      <Sidebar />
      <ScreenComponent />

      {/* Error Test Panel (Dev Only) */}
      {process.env.NODE_ENV === 'development' && <ErrorTestPanel />}
    </motion.div>
  )
}

/**
 * Page component
 * Wrapped with ProtectedRoute for authentication
 */
export default function ScreenPage() {
  return (
    <ProtectedRoute requireOnboarding={true}>
      <ScreenContent />
    </ProtectedRoute>
  )
}
