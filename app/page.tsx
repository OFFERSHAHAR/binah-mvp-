'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

/**
 * Home page - Redirects to /dashboard
 * All screen content is now accessed via URL parameters: /{screen}
 */
function HomeContent() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard as the default screen
    router.push('/dashboard')
  }, [router])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center min-h-screen"
    >
      <div className="text-center">
        <div className="text-2xl font-bold text-dark mb-4">Loading...</div>
        <div className="text-muted">Redirecting to dashboard</div>
      </div>
    </motion.div>
  )
}

export default function Home() {
  return (
    <ProtectedRoute requireOnboarding={true}>
      <HomeContent />
    </ProtectedRoute>
  )
}
