'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Lock, AlertCircle } from 'lucide-react'

interface AuthErrorModalProps {
  isOpen: boolean
  errorCode?: string
  message?: string
  onRetry?: () => void
  onGoToLogin?: () => void
}

const authErrorMessages: Record<string, string> = {
  'UNAUTHORIZED': 'Your session has expired. Please log in again.',
  'FORBIDDEN': 'You do not have permission to access this resource.',
  'INVALID_CREDENTIALS': 'Invalid username or password.',
  'SESSION_EXPIRED': 'Your session has expired. Please log in again.',
  'TOKEN_INVALID': 'Authentication token is invalid. Please log in again.',
  'TOKEN_EXPIRED': 'Your login token has expired. Please log in again.',
  'USER_NOT_FOUND': 'User account not found.',
  'ACCOUNT_DISABLED': 'Your account has been disabled.',
  'ACCOUNT_LOCKED': 'Your account has been locked due to multiple failed login attempts.',
  'PASSWORD_RESET_REQUIRED': 'You are required to reset your password.',
  'MFA_REQUIRED': 'Multi-factor authentication is required.',
}

export function AuthErrorModal({
  isOpen,
  errorCode = 'UNAUTHORIZED',
  message,
  onRetry,
  onGoToLogin,
}: AuthErrorModalProps): JSX.Element {
  const displayMessage = message || authErrorMessages[errorCode] || 'Authentication error occurred.'

  const severity = errorCode === 'ACCOUNT_LOCKED' || errorCode === 'ACCOUNT_DISABLED' ? 'critical' : 'warning'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm mx-auto overflow-hidden">
              {/* Header */}
              <div
                className={`px-6 py-6 text-center border-b ${
                  severity === 'critical'
                    ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
                    : 'bg-gradient-to-r from-yellow-50 to-orange-100 border-yellow-200'
                }`}
              >
                <div className="flex justify-center mb-3">
                  {severity === 'critical' ? (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="p-3 rounded-full bg-red-100"
                    >
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="p-3 rounded-full bg-yellow-100"
                    >
                      <Lock className="w-6 h-6 text-yellow-600" />
                    </motion.div>
                  )}
                </div>
                <h2 className={`text-xl font-bold ${severity === 'critical' ? 'text-red-900' : 'text-yellow-900'}`}>
                  Authentication Required
                </h2>
              </div>

              {/* Body */}
              <div className="px-6 py-4 space-y-4">
                <p className="text-gray-700 text-center">{displayMessage}</p>

                {/* Error Code Badge */}
                <div className="flex justify-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      severity === 'critical'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    Error Code: {errorCode}
                  </span>
                </div>

                {/* Info Box */}
                {severity === 'critical' && (
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <p className="text-xs text-red-700">
                      <span className="font-semibold block mb-1">Important:</span>
                      Please contact support if you continue to experience issues.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 flex gap-3 border-t border-gray-200">
                {onRetry && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onRetry}
                    className={`flex-1 px-4 py-2 font-semibold rounded-lg hover:shadow-lg transition-shadow text-sm ${
                      severity === 'critical'
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                    }`}
                  >
                    Try Again
                  </motion.button>
                )}

                {onGoToLogin && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onGoToLogin}
                    className={`flex-1 px-4 py-2 font-semibold rounded-lg hover:shadow-lg transition-shadow text-sm ${
                      severity === 'critical'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                        : 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                    }`}
                  >
                    Go to Login
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
