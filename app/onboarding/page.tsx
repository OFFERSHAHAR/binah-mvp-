'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { AuthButton } from '@/components/auth/AuthButton'
import { useAuthStore } from '@/store/authStore'

const onboardingSteps = [
  {
    id: 1,
    title: 'ברוכים הבאים בִּינָה',
    description:
      'פלטפורמה אינטראקטיבית לעמידה ודיון בתחום AI וביצירת סוכני זכיר עבור ארגונים',
    icon: '🧠',
    color: 'from-[#9FB4F5] to-[#C3A8EE]',
  },
  {
    id: 2,
    title: 'סקור את הצגות שלך',
    description:
      'צפה בפרטי הפרופיל שלך, הישגים, ציונים ועוד במרחב מותאם אישית',
    icon: '📊',
    color: 'from-[#7FD3C0] to-[#9AD9F0]',
  },
  {
    id: 3,
    title: 'הצטרפות לשיעורים',
    description:
      'צפה בשיעורים חיים, השתתפות בדיונים, ולמידה עם סוכני AI שנוצרו בעיצוב',
    icon: '🎓',
    color: 'from-[#FFB0A0] to-[#FFD08A]',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, setOnboardingComplete } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      setOnboardingComplete(true)
      router.push('/')
    } catch {
      setIsCompleting(false)
    }
  }

  const step = onboardingSteps[currentStep]

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
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
        className="w-full max-w-2xl z-10"
      >
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {onboardingSteps.map((_, index) => (
              <motion.div
                key={index}
                className={`h-2 flex-1 mx-1 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-[#5E5AA8]'
                    : index < currentStep
                      ? 'bg-[#2E9E72]'
                      : 'bg-[#E5E5E5]'
                }`}
                animate={{
                  flex: index === currentStep ? 1.2 : 1,
                }}
              />
            ))}
          </div>
          <p className="text-sm text-[#7A7A92] text-center">
            שלב {currentStep + 1} מתוך {onboardingSteps.length}
          </p>
        </div>

        {/* Step content */}
        <motion.div
          key={currentStep}
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="glass rounded-2xl p-12 shadow-lg text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div
              className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br ${step.color} rounded-full`}
            >
              <span className="text-5xl">{step.icon}</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl font-bold text-[#2E2E48] mb-4"
          >
            {step.title}
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg text-[#7A7A92] mb-12 max-w-md mx-auto leading-relaxed"
          >
            {step.description}
          </motion.p>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-3 mb-12 text-left bg-[#F8F7FD] rounded-lg p-6"
          >
            {step.id === 1 && (
              <>
                <div className="flex items-start gap-3">
                  <span className="text-[#5E5AA8] mt-1">✓</span>
                  <p className="text-[#2E2E48]">ממשק יפה עם אנימציות חלקות</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#5E5AA8] mt-1">✓</span>
                  <p className="text-[#2E2E48]">גישה קלה לכל הכלים שלך</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#5E5AA8] mt-1">✓</span>
                  <p className="text-[#2E2E48]">ניהול סוכני AI חזקים</p>
                </div>
              </>
            )}
            {step.id === 2 && (
              <>
                <div className="flex items-start gap-3">
                  <span className="text-[#5E5AA8] mt-1">✓</span>
                  <p className="text-[#2E2E48]">סקירת ביצועים בזמן אמת</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#5E5AA8] mt-1">✓</span>
                  <p className="text-[#2E2E48]">מעקב אחרון ציונים והישגים</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#5E5AA8] mt-1">✓</span>
                  <p className="text-[#2E2E48]">פרופיל מוגן ובטוח</p>
                </div>
              </>
            )}
            {step.id === 3 && (
              <>
                <div className="flex items-start gap-3">
                  <span className="text-[#5E5AA8] mt-1">✓</span>
                  <p className="text-[#2E2E48]">שיעורים אינטראקטיביים חיים</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#5E5AA8] mt-1">✓</span>
                  <p className="text-[#2E2E48]">עבודה עם סוכני AI בזמן אמת</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#5E5AA8] mt-1">✓</span>
                  <p className="text-[#2E2E48]">משאבים ודוקומנטציה עשירה</p>
                </div>
              </>
            )}
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex gap-4 flex-col sm:flex-row"
          >
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-6 py-3 rounded-lg font-semibold border-2 border-[#E5E5E5] text-[#2E2E48] hover:border-[#5E5AA8] hover:text-[#5E5AA8] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              הקודם
            </button>

            {currentStep === onboardingSteps.length - 1 ? (
              <AuthButton
                onClick={handleComplete}
                isLoading={isCompleting}
                disabled={isCompleting}
                fullWidth
              >
                התחל עכשיו
              </AuthButton>
            ) : (
              <AuthButton onClick={handleNext} fullWidth>
                הבא
              </AuthButton>
            )}
          </motion.div>
        </motion.div>

        {/* Skip button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-6"
        >
          <button
            onClick={handleComplete}
            className="text-[#7A7A92] hover:text-[#5E5AA8] font-medium transition-colors"
          >
            דלג על ההדרכה
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
