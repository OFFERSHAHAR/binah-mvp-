'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { AuthButton } from '@/components/auth/AuthButton'
import { FormInput } from '@/components/auth/FormInput'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { validateSignupForm } from '@/lib/auth-utils'
import { useAuthStore } from '@/store/authStore'

export default function SignupPage() {
  const router = useRouter()
  const { signup, isLoading, error, clearError, isAuthenticated } = useAuthStore()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [agreedToTerms, setAgreedToTerms] = useState(false)
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

    if (!agreedToTerms) {
      setErrors((prev) => ({
        ...prev,
        terms: 'חובה להסכים לתנאי השימוש',
      }))
      return
    }

    const validation = validateSignupForm(
      formData.name,
      formData.email,
      formData.password,
      formData.confirmPassword
    )

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    try {
      await signup(formData.name, formData.email, formData.password, formData.confirmPassword, formData.phone)
      router.push('/onboarding')
    } catch {
      // Error is handled by the store
    }
  }

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.08 },
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
          <p className="text-[#7A7A92]">הצטרפות לקהילה</p>
        </motion.div>

        {/* Form Container */}
        <motion.div
          variants={itemVariants}
          className="glass rounded-2xl p-8 shadow-lg max-h-[90vh] overflow-y-auto"
        >
          <h2 className="text-2xl font-bold text-[#2E2E48] mb-6">הרשמה</h2>

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
            {/* Name Field */}
            <FormInput
              label="שם מלא"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="ישראל ישראלי"
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            />

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

            {/* Phone Field (optional — enables WhatsApp notifications) */}
            <FormInput
              label="טלפון (לקבלת עדכונים ב-WhatsApp)"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="050-123-4567"
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
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
              showStrength
              helpText="חובה להיות לפחות 8 תווים עם אותיות וספרות"
            />

            {/* Confirm Password Field */}
            <PasswordInput
              value={formData.confirmPassword}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, confirmPassword: value }))
              }
              error={errors.confirmPassword}
              label="אישור סיסמה"
            />

            {/* Terms Agreement */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked)
                    if (e.target.checked && errors.terms) {
                      setErrors((prev) => ({
                        ...prev,
                        terms: '',
                      }))
                    }
                  }}
                  className="w-4 h-4 mt-0.5 rounded border-[#E5E5E5] text-[#5E5AA8] focus:ring-[#5E5AA8] cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-[#7A7A92] cursor-pointer">
                  אני מסכים/ה ל{' '}
                  <a href="#" className="text-[#5E5AA8] hover:underline font-medium">
                    תנאי השימוש
                  </a>{' '}
                  ו{' '}
                  <a href="#" className="text-[#5E5AA8] hover:underline font-medium">
                    מדיניות הפרטיות
                  </a>
                </label>
              </div>
              {errors.terms && (
                <p className="text-xs text-red-500 font-medium">{errors.terms}</p>
              )}
            </div>

            {/* Submit Button */}
            <AuthButton
              type="submit"
              isLoading={isLoading}
              disabled={isLoading || !agreedToTerms}
            >
              {isLoading ? 'בטעינה...' : 'הרשם'}
            </AuthButton>
          </form>

          {/* Links */}
          <motion.div
            variants={itemVariants}
            className="mt-6 pt-6 border-t border-[#E5E5E5] text-center text-sm"
          >
            <span className="text-[#7A7A92]">כבר רשום? </span>
            <Link
              href="/auth/login"
              className="text-[#5E5AA8] hover:text-[#4C4A92] font-semibold transition-colors"
            >
              כנס למערכת
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
