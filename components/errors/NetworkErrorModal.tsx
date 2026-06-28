'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

interface NetworkErrorModalProps {
  isOpen: boolean
  onRetry?: () => void
  message?: string
}

export function NetworkErrorModal({
  isOpen,
  onRetry,
  message = 'Unable to connect to the server. Please check your internet connection.',
}: NetworkErrorModalProps): JSX.Element {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    window.addEventListener('online', () => setIsOnline(true))
    window.addEventListener('offline', () => setIsOnline(false))

    return () => {
      window.removeEventListener('online', () => setIsOnline(true))
      window.removeEventListener('offline', () => setIsOnline(false))
    }
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm mx-auto overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-6 text-center border-b border-orange-200">
                <div className="flex justify-center mb-3">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-3 rounded-full bg-orange-100"
                  >
                    <WifiOff className="w-6 h-6 text-orange-600" />
                  </motion.div>
                </div>
                <h2 className="text-xl font-bold text-orange-900">Connection Error</h2>
              </div>

              {/* Body */}
              <div className="px-6 py-4 space-y-4">
                <p className="text-gray-700 text-center">{message}</p>

                {/* Status Indicator */}
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={isOnline ? 'text-green-700' : 'text-red-700'}>
                    {isOnline ? 'Internet connected' : 'Offline'}
                  </span>
                </div>

                {/* Tips */}
                <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-blue-900">Troubleshooting tips:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Check your internet connection</li>
                    <li>• Try refreshing the page</li>
                    <li>• Check if the server is online</li>
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 flex gap-3 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRetry}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow flex items-center justify-center gap-2 text-sm"
                >
                  <Zap className="w-4 h-4" />
                  Retry Connection
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
