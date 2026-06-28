'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { ErrorCard } from './errors/ErrorCard'
import { NetworkErrorModal } from './errors/NetworkErrorModal'
import { AuthErrorModal } from './errors/AuthErrorModal'
import { DataFetchErrorState } from './errors/DataFetchErrorState'
import { errorLogger } from '@/lib/errorLogger'

interface ErrorTestPanelProps {
  isOpen?: boolean
  onClose?: () => void
}

/**
 * Test panel for simulating and testing various error scenarios
 * Only visible in development mode
 */
export function ErrorTestPanel({ isOpen: initialOpen = false, onClose }: ErrorTestPanelProps): JSX.Element | null {
  const isDev = process.env.NODE_ENV === 'development'
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [showNetworkError, setShowNetworkError] = useState(false)
  const [showAuthError, setShowAuthError] = useState(false)
  const [showDataError, setShowDataError] = useState(false)
  const [showErrorCard, setShowErrorCard] = useState(false)
  const [errorLogs, setErrorLogs] = useState<string>('')

  if (!isDev) {
    return null
  }

  const handleTestNetworkError = (): void => {
    errorLogger.logNetworkError('Failed to connect to server', 503)
    setShowNetworkError(true)
  }

  const handleTestAuthError = (): void => {
    errorLogger.logAuthError('Your session has expired', { userId: 'test-user' })
    setShowAuthError(true)
  }

  const handleTestDataError = (): void => {
    errorLogger.logDataError('Failed to load user data', '/api/user')
    setShowDataError(true)
  }

  const handleTestErrorCard = (): void => {
    errorLogger.logError('This is a test error', {
      category: 'validation',
      severity: 'medium',
    })
    setShowErrorCard(true)
  }

  const handleThrowError = (): void => {
    throw new Error('This is a test error thrown to trigger the Error Boundary')
  }

  const handleShowLogs = (): void => {
    const logs = errorLogger.getLogs()
    setErrorLogs(JSON.stringify(logs, null, 2))
  }

  const handleClearLogs = (): void => {
    errorLogger.clearLogs()
    setErrorLogs('')
  }

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 left-4 z-40 p-3 bg-yellow-500 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        onClick={() => setIsOpen(!isOpen)}
        title="Error Test Panel (Dev Only)"
      >
        <AlertCircle className="w-5 h-5" />
      </motion.button>

      {/* Test Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false)
                onClose?.()
              }}
              className="fixed inset-0 bg-black bg-opacity-30 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Error Testing Panel</h2>
                <p className="text-sm text-gray-600">Development Only - Test various error scenarios</p>

                {/* Divider */}
                <hr className="border-gray-200" />

                {/* Test Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleTestNetworkError}
                    className="w-full px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition text-sm"
                  >
                    Test Network Error
                  </button>

                  <button
                    onClick={handleTestAuthError}
                    className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition text-sm"
                  >
                    Test Auth Error
                  </button>

                  <button
                    onClick={handleTestDataError}
                    className="w-full px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition text-sm"
                  >
                    Test Data Error
                  </button>

                  <button
                    onClick={handleTestErrorCard}
                    className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition text-sm"
                  >
                    Test Error Card
                  </button>

                  <button
                    onClick={handleThrowError}
                    className="w-full px-4 py-2 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-800 transition text-sm"
                  >
                    Throw Error (Error Boundary)
                  </button>
                </div>

                {/* Divider */}
                <hr className="border-gray-200" />

                {/* Logs Section */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Error Logs</h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleShowLogs}
                      className="w-full px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition text-sm"
                    >
                      Show Logs
                    </button>

                    <button
                      onClick={handleClearLogs}
                      className="w-full px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition text-sm"
                    >
                      Clear Logs
                    </button>
                  </div>

                  {errorLogs && (
                    <pre className="mt-2 p-2 bg-gray-100 rounded border border-gray-300 text-xs text-gray-700 overflow-auto max-h-40">
                      {errorLogs}
                    </pre>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setIsOpen(false)
                    onClose?.()
                  }}
                  className="w-full px-4 py-2 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 transition text-sm"
                >
                  Close Panel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Error Modals */}
      <NetworkErrorModal
        isOpen={showNetworkError}
        onRetry={() => {
          setShowNetworkError(false)
          console.log('Retry network connection')
        }}
      />

      <AuthErrorModal
        isOpen={showAuthError}
        errorCode="SESSION_EXPIRED"
        onRetry={() => {
          setShowAuthError(false)
          console.log('Retry authentication')
        }}
        onGoToLogin={() => {
          setShowAuthError(false)
          console.log('Go to login')
        }}
      />

      {/* Data Error State - Show as card */}
      {showDataError && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <DataFetchErrorState
              title="Failed to Load Data"
              message="Could not retrieve the requested data from the server."
              statusCode={500}
              onRetry={() => setShowDataError(false)}
              onGoHome={() => setShowDataError(false)}
              showDetails
              details="Error fetching /api/data: Server returned 500 Internal Server Error"
            />
          </motion.div>
        </div>
      )}

      {/* Error Card - Show as card */}
      {showErrorCard && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-md w-full"
          >
            <ErrorCard
              title="Validation Error"
              message="The form contains invalid data. Please check and try again."
              type="warning"
              onRetry={() => setShowErrorCard(false)}
              onDismiss={() => setShowErrorCard(false)}
              details="Field 'email' failed validation: Invalid email format"
            />
          </motion.div>
        </div>
      )}
    </>
  )
}
