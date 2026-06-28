'use client'

import React, { ReactNode, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:')
    console.error('Error:', error)
    console.error('Error Info:', errorInfo)

    // Log to external error tracking service (e.g., Sentry, LogRocket)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('error-boundary-caught', {
          detail: { error: error.message, stack: error.stack, componentStack: errorInfo.componentStack },
        })
      )
    }
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback?.(this.state.error, this.resetError) || (
          <DefaultErrorFallback error={this.state.error} reset={this.resetError} />
        )
      )
    }

    return this.props.children
  }
}

interface DefaultErrorFallbackProps {
  error: Error
  reset: () => void
}

function DefaultErrorFallback({ error, reset }: DefaultErrorFallbackProps): JSX.Element {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-light via-light to-purple-50 flex items-center justify-center p-4 dir-ltr"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Error Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
          {/* Error Header */}
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 border-b border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-red-900">Something Went Wrong</h2>
            </div>
          </div>

          {/* Error Body */}
          <div className="p-6 space-y-4">
            {/* Error Message */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Error Details:</p>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-sm text-gray-600 font-mono break-words">{error.message || 'Unknown error'}</p>
              </div>
            </div>

            {/* Error Stack (Development only) */}
            {process.env.NODE_ENV === 'development' && error.stack && (
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700 font-semibold">
                  Stack Trace
                </summary>
                <pre className="mt-2 p-2 bg-gray-50 rounded border border-gray-200 text-gray-600 overflow-auto max-h-32">
                  {error.stack}
                </pre>
              </details>
            )}

            {/* Error Type Badge */}
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                {error.name || 'Error'}
              </span>
              <span className="text-gray-500">occurred in component tree</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={reset}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow text-sm"
            >
              Try Again
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/'}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition text-sm"
            >
              Go Home
            </motion.button>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          If this problem persists, please contact support or reload the page.
        </p>
      </motion.div>
    </motion.div>
  )
}
