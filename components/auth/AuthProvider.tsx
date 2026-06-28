'use client'

import { useEffect } from 'react'
import { initializeAuth } from '@/store/authStore'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  useEffect(() => {
    // Initialize auth from localStorage on app mount
    initializeAuth()
  }, [])

  return <>{children}</>
}
