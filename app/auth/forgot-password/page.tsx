'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { AuthButton } from '@/components/auth/AuthButton'
import { FormInput } from '@/components/auth/FormInput'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { validateResetForm } from '@/lib/auth-utils'
import { useAuthStore } from '@/store/authStore'

function ForgotPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resetToken = searchParams.get('token')

  const { resetPassword, confirmPasswordReset, isLoading, error, clearError } =
    useAuthStore()

  const step = resetToken ? 'reset' : 'email'
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    clearError()
  }, [clearError])

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validation = validateResetForm(email)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    try {
      await resetPassword(email)
      setSuccessMessage(
        'התבקשה לאתחול סיסמה. בדוק את דוא"ל שלך לקבלת הוראות.'
      )
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch {
      // Error is handled by the store
    }
  }

  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!newPassword || !confirmPassword) {
      setErrors({
        password: 'שדה חובה',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      setErrors({
        confirmPassword: 'הסיסמאות לא תואמות',
      })
      return
    }

    if (newPassword.length < 6) {
      setErrors({
        password: 'הסיסמה חייבת להיות לפחות 6 תווים',
      })
      return
    }

    try {
      if (resetToken) {
        await confirmPasswordReset(resetToken, newPassword)
        setSuccessMessage('הסיסמה שונתה בהצלחה!')
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      }
    } catch {
      // Error is handled by the store
    }
  }

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
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="w-full max-w-md z-10"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FFB0A0] to-[#FFD08A] rounded-full mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-[#2E2E48] mb-2">
            אתחול סיסמה
          </h1>
          <p className="text-[#7A7A92]">
            {step === 'email'
              ? 'הזן את אימייל החשבון שלך'
              : 'הגדר סיסמה חדשה'}
          </p>
        </motion.div>

        {/* Form Container */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-8 shadow-lg">
          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <p className="text-sm text-green-700 font-medium">
                {successMessage}
              </p>
            </motion.div>
          )}

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

          {step === 'email' && !successMessage && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <FormInput
                label="אימייל"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: '' }))
                  }
                }}
                error={errors.email}
                placeholder="your@email.com"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                }
                helpText="אנחנו נשלח לך קישור לאתחול הסיסמה"
              />

              <AuthButton
                type="submit"
                isLoading={isLoading}
                disabled={isLoading}
              >
                שלח קישור אתחול
              </AuthButton>
            </form>
          )}

          {step === 'reset' && resetToken && (
            <form onSubmit={handleResetSubmit} className="space-y-5">
              <PasswordInput
                value={newPassword}
                onChange={(value) => {
                  setNewPassword(value)
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: '' }))
                  }
                }}
                error={errors.password}
                label="סיסמה חדשה"
              />

              <PasswordInput
                value={confirmPassword}
                onChange={(value) => {
                  setConfirmPassword(value)
                  if (errors.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: '' }))
                  }
                }}
                error={errors.confirmPassword}
                label="אישור סיסמה"
              />

              <AuthButton
                type="submit"
                isLoading={isLoading}
                disabled={isLoading}
              >
                עדכן סיסמה
              </AuthButton>
            </form>
          )}

          {/* Link back to login */}
          <motion.div
            variants={itemVariants}
            className="mt-6 pt-6 border-t border-[#E5E5E5] text-center"
          >
            <Link
              href="/auth/login"
              className="text-[#5E5AA8] hover:text-[#4C4A92] font-medium transition-colors inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              חזור לכניסה
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F7FD]" />}>
      <ForgotPasswordContent />
    </Suspense>
  )
}
