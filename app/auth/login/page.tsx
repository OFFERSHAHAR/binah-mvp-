'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { AuthButton } from '@/components/auth/AuthButton'
import { FormInput } from '@/components/auth/FormInput'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { validateLoginForm } from '@/lib/auth-utils'
import { useAuthStore } from '@/store/authStore'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [rememberMe, setRememberMe] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Route guard: redirect authenticated users to home
    if (isAuthenticated) {
      router.push('/')
      return
    }
    setIsChecking(false)
  }, [isAuthenticated, router])

  useEffect(() => {
    clearError()
  }, [clearError])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validation = validateLoginForm(formData.email, formData.password)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    try {
      await login(formData.email, formData.password)

      if (rememberMe) {
        localStorage.setItem('remember_email', formData.email)
      }

      router.push('/')
    } catch {
      // Error is handled by the store
    }
  }

  useEffect(() => {
    // Load remembered email
    const rememberedEmail = localStorage.getItem('remember_email')
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
      }))
      setRememberMe(true)
    }
  }, [])

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F7FD] via-[#F2F1FA] to-[#F2F9F6] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#9FB4F5] to-[#C3A8EE] rounded-full mb-4 animate-pulse">
            <span className="text-xl">🧠</span>
          </div>
          <p className="text-[#7A7A92]">בטעינה...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F7FD] via-[#F2F1FA] to-[#F2F9F6] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-br from-[#9FB4F5] to-[#C3A8EE] rounded-full filter blur-3xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{ top: '-10%', right: '-5%' }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-br from-[#7FD3C0] to-[#9AD9F0] rounded-full filter blur-3xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, -60, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          style={{ bottom: '-10%', left: '-5%' }}
        />
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="w-full max-w-md z-10"
      >
        {/* Logo/Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#9FB4F5] to-[#C3A8EE] rounded-full mb-4">
            <span className="text-2xl">🧠</span>
          </div>
          <h1 className="text-3xl font-bold text-[#2E2E48] mb-2">בִּינָה</h1>
          <p className="text-[#7A7A92]">
            בית ספר AI - פלטפורמה אינטראקטיבית
          </p>
        </motion.div>

        {/* Form Container */}
        <motion.div
          variants={itemVariants}
          className="glass rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-[#2E2E48] mb-6">כניסה</h2>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <FormInput
              label="אימייל"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="your@email.com"
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              }
            />

            {/* Password Field */}
            <PasswordInput
              value={formData.password}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, password: value }))
              }
              error={errors.password}
              label="סיסמה"
            />

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#E5E5E5] text-[#5E5AA8] focus:ring-[#5E5AA8] cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="mr-2 text-sm text-[#7A7A92] cursor-pointer"
              >
                זכור אותי
              </label>
            </div>

            {/* Submit Button */}
            <AuthButton
              type="submit"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'בטעינה...' : 'כנס'}
            </AuthButton>
          </form>

          {/* Demo Credentials Hint */}
          <motion.div
            variants={itemVariants}
            className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <p className="text-xs font-medium text-blue-900 mb-2">
              🔍 אישורי הדמו:
            </p>
            <p className="text-xs text-blue-800 font-mono">
              demo@binah.com / demo123
            </p>
          </motion.div>

          {/* Links */}
          <div className="mt-6 space-y-3 text-center text-sm">
            <motion.div variants={itemVariants}>
              <Link
                href="/auth/forgot-password"
                className="text-[#5E5AA8] hover:text-[#4C4A92] font-medium transition-colors"
              >
                שכחת סיסמה?
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-3 border-t border-[#E5E5E5]">
              <span className="text-[#7A7A92]">עדיין לא רשום? </span>
              <Link
                href="/auth/signup"
                className="text-[#5E5AA8] hover:text-[#4C4A92] font-semibold transition-colors"
              >
                הרשם כאן
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          variants={itemVariants}
          className="text-center text-xs text-[#7A7A92] mt-8"
        >
          בכניסה למערכת, אתה מסכים ל{' '}
          <a href="#" className="text-[#5E5AA8] hover:underline">
            תנאי השימוש
          </a>{' '}
          ו{' '}
          <a href="#" className="text-[#5E5AA8] hover:underline">
            מדיניות הפרטיות
          </a>
        </motion.p>
      </motion.div>
    </div>
  )
}
