'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useNotificationStore } from '@/store/notificationStore'

const getIconByType = (type: string) => {
  switch (type) {
    case 'success':
      return '✓'
    case 'error':
      return '✕'
    case 'warning':
      return '!'
    case 'message':
      return '💬'
    case 'grade':
      return '📊'
    default:
      return 'ℹ'
  }
}

const getColorByType = (type: string) => {
  switch (type) {
    case 'success':
      return 'from-green-500/10 to-emerald-500/5 border-green-400/30'
    case 'error':
      return 'from-red-500/10 to-rose-500/5 border-red-400/30'
    case 'warning':
      return 'from-yellow-500/10 to-amber-500/5 border-yellow-400/30'
    case 'message':
      return 'from-blue-500/10 to-cyan-500/5 border-blue-400/30'
    case 'grade':
      return 'from-purple-500/10 to-violet-500/5 border-purple-400/30'
    default:
      return 'from-blue-500/10 to-indigo-500/5 border-blue-400/30'
  }
}

const getIconColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-green-500'
    case 'error':
      return 'text-red-500'
    case 'warning':
      return 'text-yellow-600'
    case 'message':
      return 'text-blue-500'
    case 'grade':
      return 'text-purple-500'
    default:
      return 'text-blue-500'
  }
}

export const NotificationToast = () => {
  const { notifications, removeNotification } = useNotificationStore()

  return (
    <div className="fixed right-6 top-6 z-50 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 400, y: -20 }}
            animate={{ opacity: 1, x: 0, y: index * 90 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{
              duration: 0.4,
              ease: 'cubic-bezier(0.34, 1.35, 0.5, 1)',
            }}
            className="pointer-events-auto mb-3"
          >
            <motion.div
              className={`
                relative flex items-start gap-3 p-4 rounded-xl border
                backdrop-blur-md bg-gradient-to-r ${getColorByType(notification.type)}
                shadow-lg shadow-black/10
                max-w-xs
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Icon */}
              <div className={`text-lg font-bold pt-0.5 flex-shrink-0 ${getIconColor(notification.type)}`}>
                {getIconByType(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-600 text-sm text-dark truncate">{notification.title}</h3>
                <p className="text-xs text-muted mt-1 line-clamp-2">{notification.message}</p>
              </div>

              {/* Close button */}
              <motion.button
                onClick={() => removeNotification(notification.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors"
              >
                <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              {/* Progress bar */}
              {notification.duration && (
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: (notification.duration || 4000) / 1000, ease: 'linear' }}
                  className="absolute bottom-0 right-0 h-1 bg-gradient-to-r from-transparent to-current rounded-b-xl origin-right opacity-50"
                  style={{ width: '100%' }}
                />
              )}
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
