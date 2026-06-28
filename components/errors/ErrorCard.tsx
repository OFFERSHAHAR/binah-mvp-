'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Info, AlertTriangle, WifiOff } from 'lucide-react'
import type { ReactNode } from 'react'

export type ErrorType = 'error' | 'warning' | 'info' | 'network'

interface ErrorCardProps {
  title: string
  message: string
  type?: ErrorType
  onRetry?: () => void
  onDismiss?: () => void
  details?: string
  icon?: ReactNode
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }>
}

const errorConfig = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    header: 'bg-red-100',
    title: 'text-red-900',
    icon: 'text-red-600',
    badge: 'bg-red-100 text-red-700',
    button: 'from-red-600 to-red-700',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    header: 'bg-yellow-100',
    title: 'text-yellow-900',
    icon: 'text-yellow-600',
    badge: 'bg-yellow-100 text-yellow-700',
    button: 'from-yellow-600 to-yellow-700',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    header: 'bg-blue-100',
    title: 'text-blue-900',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    button: 'from-blue-600 to-blue-700',
  },
  network: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    header: 'bg-orange-100',
    title: 'text-orange-900',
    icon: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-700',
    button: 'from-orange-600 to-orange-700',
  },
}

export function ErrorCard({
  title,
  message,
  type = 'error',
  onRetry,
  onDismiss,
  details,
  icon,
  actions = [],
}: ErrorCardProps): JSX.Element {
  const config = errorConfig[type]

  const defaultIcon = {
    error: <AlertCircle className={`w-6 h-6 ${config.icon}`} />,
    warning: <AlertTriangle className={`w-6 h-6 ${config.icon}`} />,
    info: <Info className={`w-6 h-6 ${config.icon}`} />,
    network: <WifiOff className={`w-6 h-6 ${config.icon}`} />,
  }[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`${config.bg} rounded-lg border ${config.border} overflow-hidden`}
    >
      {/* Header */}
      <div className={`${config.header} px-4 py-3 flex items-center gap-3`}>
        <div className="flex-shrink-0">{icon || defaultIcon}</div>
        <h3 className={`${config.title} font-semibold text-sm`}>{title}</h3>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        <p className={`text-sm text-gray-700`}>{message}</p>

        {details && (
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-500 hover:text-gray-700 font-medium">
              More details
            </summary>
            <pre className="mt-2 p-2 bg-white rounded border border-gray-200 text-gray-600 text-xs overflow-auto max-h-40">
              {details}
            </pre>
          </details>
        )}
      </div>

      {/* Footer with Actions */}
      <div className="px-4 py-3 bg-white bg-opacity-50 flex gap-2 flex-wrap">
        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry}
            className={`px-3 py-1 bg-gradient-to-r ${config.button} text-white text-sm font-medium rounded transition-shadow hover:shadow-md`}
          >
            Retry
          </motion.button>
        )}

        {actions.map((action, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.onClick}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              action.variant === 'secondary'
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : `bg-gradient-to-r ${config.button} text-white hover:shadow-md`
            }`}
          >
            {action.label}
          </motion.button>
        ))}

        {onDismiss && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDismiss}
            className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded hover:bg-gray-200 transition-colors ms-auto"
          >
            Dismiss
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
