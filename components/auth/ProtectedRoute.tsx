'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireOnboarding?: boolean
}

export const ProtectedRoute = ({
  children,
  requireOnboarding = false,
}: ProtectedRouteProps) => {
  const router = useRouter()
  const { isAuthenticated, user, hasCompletedOnboarding } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      router.push('/auth/login')
      return
    }

    // Check if onboarding is required
    if (
      requireOnboarding &&
      !hasCompletedOnboarding
    ) {
      router.push('/onboarding')
      return
    }

    setIsChecking(false)
  }, [isAuthenticated, user, hasCompletedOnboarding, requireOnboarding, router])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F7FD] via-[#F2F1FA] to-[#F2F9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#9FB4F5] to-[#C3A8EE] rounded-full mb-4 animate-pulse">
            <span className="text-xl">🧠</span>
          </div>
          <p className="text-[#7A7A92]">בטעינה...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return <>{children}</>
}
