'use client'

import { create } from 'zustand'
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
} from '@/lib/auth-client'

export interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'teacher' | 'admin'
  createdAt: string
  avatar?: string
  updatedAt?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  hasCompletedOnboarding: boolean

  // Actions
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, confirmPassword: string, phone?: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  setUser: (user: User) => void
  setOnboardingComplete: (complete: boolean) => void
  resetPassword: (email: string) => Promise<void>
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  hasCompletedOnboarding: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiLogin(email, password)

      if (!response.success) {
        throw new Error(response.error || 'שגיאה בכניסה')
      }

      const user = response.user as User
      localStorage.setItem('auth_user', JSON.stringify(user))

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'שגיאה בכניסה'
      set({
        isLoading: false,
        error: errorMsg,
        isAuthenticated: false,
      })
      throw error
    }
  },

  signup: async (name: string, email: string, password: string, confirmPassword: string, phone?: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiRegister(email, password, confirmPassword, name, phone)

      if (!response.success) {
        throw new Error(response.error || 'שגיאה בהרשמה')
      }

      const user = response.user as User
      localStorage.setItem('auth_user', JSON.stringify(user))

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'שגיאה בהרשמה'
      set({
        isLoading: false,
        error: errorMsg,
        isAuthenticated: false,
      })
      throw error
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null })
    try {
      await apiLogout()

      localStorage.removeItem('auth_user')
      localStorage.removeItem('onboarding_complete')

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        hasCompletedOnboarding: false,
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'שגיאה בהתנתקות'
      set({
        isLoading: false,
        error: errorMsg,
      })
      throw error
    }
  },

  clearError: () => set({ error: null }),

  setUser: (user: User) => {
    set({ user, isAuthenticated: true })
    localStorage.setItem('auth_user', JSON.stringify(user))
  },

  setOnboardingComplete: (complete: boolean) => {
    set({ hasCompletedOnboarding: complete })
    if (complete) {
      localStorage.setItem('onboarding_complete', 'true')
    }
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Implement password reset endpoint
      // For now, just validate email exists
      if (!email) {
        throw new Error('אימייל הוא שדה חובה')
      }

      set({ isLoading: false })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'שגיאה בהנעת סיסמה'
      set({
        isLoading: false,
        error: errorMsg,
      })
      throw error
    }
  },

  confirmPasswordReset: async (_token: string, newPassword: string) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Implement password reset confirmation endpoint
      if (newPassword.length < 6) {
        throw new Error('הסיסמה חייבת להיות לפחות 6 תווים')
      }

      set({ isLoading: false })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'שגיאה בעדכון הסיסמה'
      set({
        isLoading: false,
        error: errorMsg,
      })
      throw error
    }
  },

  checkAuth: async () => {
    try {
      const response = await getCurrentUser()
      if (response.success && response.user) {
        const user = response.user as User
        set({
          user,
          isAuthenticated: true,
        })
        localStorage.setItem('auth_user', JSON.stringify(user))
      } else {
        localStorage.removeItem('auth_user')
        set({
          user: null,
          isAuthenticated: false,
        })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('auth_user')
      set({
        user: null,
        isAuthenticated: false,
      })
    }
  },
}))

// Hydrate auth state from localStorage on mount
export const initializeAuth = () => {
  const storedUser = localStorage.getItem('auth_user')
  const onboardingComplete = localStorage.getItem('onboarding_complete')

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser) as User
      useAuthStore.setState({
        user,
        isAuthenticated: true,
        hasCompletedOnboarding: onboardingComplete === 'true',
      })
    } catch {
      localStorage.removeItem('auth_user')
      localStorage.removeItem('onboarding_complete')
    }
  }
}
