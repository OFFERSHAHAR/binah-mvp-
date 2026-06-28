'use client'

import { motion } from 'framer-motion'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'

interface DataFetchErrorStateProps {
  title?: string
  message?: string
  statusCode?: number
  onRetry?: () => void
  onGoHome?: () => void
  showDetails?: boolean
  details?: string
}

export function DataFetchErrorState({
  title = 'Failed to Load Data',
  message = 'We encountered an error while loading the data. Please try again.',
  statusCode,
  onRetry,
  onGoHome,
  showDetails = false,
  details,
}: DataFetchErrorStateProps): JSX.Element {
  const getStatusMessage = (code?: number): string => {
    if (!code) return ''
    if (code === 404) return 'Resource not found'
    if (code === 500) return 'Server error'
    if (code === 503) return 'Service temporarily unavailable'
    if (code === 403) return 'Access denied'
    if (code === 400) return 'Bad request'
    return `Error ${code}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-96 p-6"
    >
      {/* Error Icon */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mb-6 p-4 rounded-full bg-red-100"
      >
        <AlertCircle className="w-12 h-12 text-red-600" />
      </motion.div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">{title}</h2>

      {/* Status Code Badge */}
      {statusCode && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold"
        >
          {getStatusMessage(statusCode)} ({statusCode})
        </motion.div>
      )}

      {/* Message */}
      <p className="text-gray-600 text-center mb-6 max-w-md">{message}</p>

      {/* Details */}
      {showDetails && details && (
        <details className="mb-6 w-full max-w-md">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 font-semibold text-center">
            Technical Details
          </summary>
          <pre className="mt-3 p-3 bg-gray-100 rounded-lg border border-gray-300 text-xs text-gray-700 overflow-auto max-h-32">
            {details}
          </pre>
        </details>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap justify-center w-full max-w-md">
        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </motion.button>
        )}

        {onGoHome && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGoHome}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </motion.button>
        )}
      </div>

      {/* Footer Help Text */}
      <p className="text-xs text-gray-500 mt-6 text-center">
        If this problem persists, please contact support.
      </p>
    </motion.div>
  )
}
