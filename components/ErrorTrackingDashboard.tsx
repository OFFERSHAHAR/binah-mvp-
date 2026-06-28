'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface ErrorEvent {
  id: string
  message: string
  stack: string
  timestamp: number
  severity: 'critical' | 'error' | 'warning'
  count: number
  lastOccurrence: number
  affectedUsers: number
}

const MOCK_ERRORS: ErrorEvent[] = [
  {
    id: '1',
    message: 'TypeError: Cannot read property of undefined',
    stack: 'at StudentProfile.tsx:42',
    timestamp: Date.now() - 3600000,
    severity: 'critical',
    count: 12,
    lastOccurrence: Date.now() - 300000,
    affectedUsers: 8,
  },
  {
    id: '2',
    message: 'ReferenceError: useParallax is not defined',
    stack: 'at hooks/useParallax.ts:15',
    timestamp: Date.now() - 7200000,
    severity: 'error',
    count: 5,
    lastOccurrence: Date.now() - 600000,
    affectedUsers: 3,
  },
  {
    id: '3',
    message: 'Network timeout: Failed to fetch analytics data',
    stack: 'at lib/analytics.ts:52',
    timestamp: Date.now() - 10800000,
    severity: 'warning',
    count: 23,
    lastOccurrence: Date.now() - 120000,
    affectedUsers: 15,
  },
]

export const ErrorTrackingDashboard = (): JSX.Element => {
  const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'critical' | 'error' | 'warning'>('all')

  const filteredErrors = MOCK_ERRORS.filter(
    (error) => filter === 'all' || error.severity === filter,
  )

  const totalErrors = MOCK_ERRORS.reduce((sum, e) => sum + e.count, 0)
  const criticalCount = MOCK_ERRORS.filter((e) => e.severity === 'critical').reduce(
    (sum, e) => sum + e.count,
    0,
  )

  const getSeverityColor = (
    severity: 'critical' | 'error' | 'warning',
  ): { bg: string; text: string; icon: string } => {
    switch (severity) {
      case 'critical':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: '🔴' }
      case 'error':
        return { bg: 'bg-orange-100', text: 'text-orange-700', icon: '🟠' }
      case 'warning':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '🟡' }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-dark mb-2">Error Tracking</h2>
        <p className="text-muted">Monitor and track application errors in real-time</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-lg p-6 backdrop-blur-md"
        >
          <p className="text-sm text-muted mb-2">Total Errors</p>
          <p className="text-4xl font-bold text-dark">{totalErrors}</p>
          <p className="text-xs text-muted mt-2">Last 24 hours</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-lg p-6 backdrop-blur-md border-l-4 border-red-500"
        >
          <p className="text-sm text-muted mb-2">Critical Issues</p>
          <p className="text-4xl font-bold text-red-600">{criticalCount}</p>
          <p className="text-xs text-red-500 mt-2">Requires immediate attention</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-lg p-6 backdrop-blur-md"
        >
          <p className="text-sm text-muted mb-2">Affected Users</p>
          <p className="text-4xl font-bold text-dark">
            {new Set(MOCK_ERRORS.map((e) => e.affectedUsers)).size}
          </p>
          <p className="text-xs text-muted mt-2">Unique users impacted</p>
        </motion.div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'critical', 'error', 'warning'] as const).map((sev) => (
          <motion.button
            key={sev}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(sev)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filter === sev
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-dark hover:bg-gray-300'
            }`}
          >
            {sev.charAt(0).toUpperCase() + sev.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Error List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {filteredErrors.map((error) => {
          const severityColor = getSeverityColor(error.severity)
          const isExpanded = expandedErrorId === error.id

          return (
            <motion.div
              key={error.id}
              variants={itemVariants}
              className="glass rounded-lg backdrop-blur-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <motion.button
                onClick={() => setExpandedErrorId(isExpanded ? null : error.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{severityColor.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-dark">{error.message}</p>
                      <div className="flex gap-2 items-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${severityColor.bg} ${severityColor.text}`}>
                          {error.count} occurrences
                        </span>
                        <span className="text-xs text-muted">{error.affectedUsers} users</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted">
                      Last seen:{' '}
                      {new Date(error.lastOccurrence).toLocaleTimeString()}
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-muted mt-1"
                  >
                    ▼
                  </motion.div>
                </div>
              </motion.button>

              {/* Expanded Details */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: isExpanded ? 'auto' : 0,
                  opacity: isExpanded ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-t border-gray-200"
              >
                <div className="p-4 bg-gray-50/50 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-muted mb-1">STACK TRACE</p>
                    <code className="text-xs bg-gray-100 p-2 rounded block font-mono text-muted overflow-x-auto">
                      {error.stack}
                    </code>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-muted mb-1">FIRST OCCURRENCE</p>
                      <p className="text-sm text-dark">
                        {new Date(error.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted mb-1">SEVERITY</p>
                      <p className={`text-sm font-semibold ${severityColor.text}`}>
                        {error.severity.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
                  >
                    View in Sentry
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )
        })}
      </motion.div>

      {filteredErrors.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-lg text-muted">No errors found for this filter</p>
        </motion.div>
      )}
    </div>
  )
}
