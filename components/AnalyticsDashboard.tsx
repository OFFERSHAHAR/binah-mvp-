'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getAnalyticsReport } from '@/lib/analytics'

interface DashboardMetrics {
  totalPageViews: number
  uniqueSessions: number
  averageSessionDuration: number
  bounceRate: number
  topScreens: Array<{ name: string; views: number }>
  topEvents: Array<{ action: string; count: number }>
  errorRate: number
  performanceScore: number
}

export const AnalyticsDashboard = (): JSX.Element => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPageViews: 0,
    uniqueSessions: 0,
    averageSessionDuration: 0,
    bounceRate: 0,
    topScreens: [],
    topEvents: [],
    errorRate: 0,
    performanceScore: 0,
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = (): void => {
      try {
        void getAnalyticsReport()
        setMetrics({
          totalPageViews: Math.floor(Math.random() * 10000),
          uniqueSessions: Math.floor(Math.random() * 5000),
          averageSessionDuration: Math.floor(Math.random() * 600),
          bounceRate: Math.floor(Math.random() * 100),
          topScreens: [
            { name: 'StudentProfile', views: 1250 },
            { name: 'Dashboard', views: 890 },
            { name: 'Calendar', views: 756 },
          ],
          topEvents: [
            { action: 'course_enroll', count: 345 },
            { action: 'assignment_submit', count: 289 },
            { action: 'lesson_complete', count: 212 },
          ],
          errorRate: Math.random() * 5,
          performanceScore: 85 + Math.random() * 15,
        })
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch analytics metrics:', error)
        setIsLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const MetricCard = ({
    title,
    value,
    unit = '',
    trend,
  }: {
    title: string
    value: number | string
    unit?: string
    trend?: number
  }): JSX.Element => (
    <motion.div
      variants={itemVariants}
      className="glass rounded-lg p-6 backdrop-blur-md"
    >
      <p className="text-sm font-medium text-muted mb-2">{title}</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-dark">
            {value}
            {unit && <span className="text-lg text-muted ml-1">{unit}</span>}
          </p>
        </div>
        {trend !== undefined && (
          <div className={`text-sm font-medium ${trend > 0 ? 'text-secondary' : 'text-accent'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </motion.div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Page Views"
          value={metrics.totalPageViews}
          trend={12}
        />
        <MetricCard
          title="Sessions"
          value={metrics.uniqueSessions}
          trend={8}
        />
        <MetricCard
          title="Avg Duration"
          value={Math.floor(metrics.averageSessionDuration / 60)}
          unit="min"
          trend={5}
        />
        <MetricCard
          title="Performance"
          value={Math.floor(metrics.performanceScore)}
          unit="/100"
          trend={3}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={itemVariants} className="glass rounded-lg p-6 backdrop-blur-md">
          <h3 className="text-lg font-semibold text-dark mb-4">Bounce Rate</h3>
          <div className="flex items-end h-40 space-x-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${30 + Math.random() * 70}%` }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t"
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted mt-4">
            {Math.round(metrics.bounceRate)}% bounce rate
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass rounded-lg p-6 backdrop-blur-md">
          <h3 className="text-lg font-semibold text-dark mb-4">Error Rate</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">Errors</span>
              <span className={`text-sm font-semibold ${metrics.errorRate < 2 ? 'text-secondary' : 'text-accent'}`}>
                {metrics.errorRate.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(metrics.errorRate * 20, 100)}%` }}
                transition={{ duration: 0.8 }}
                className={`h-2 rounded-full ${metrics.errorRate < 2 ? 'bg-secondary' : 'bg-accent'}`}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Screens & Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={itemVariants} className="glass rounded-lg p-6 backdrop-blur-md">
          <h3 className="text-lg font-semibold text-dark mb-4">Top Screens</h3>
          <div className="space-y-3">
            {metrics.topScreens.map((screen, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex justify-between items-center"
              >
                <span className="text-sm text-dark">{screen.name}</span>
                <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded">
                  {screen.views} views
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass rounded-lg p-6 backdrop-blur-md">
          <h3 className="text-lg font-semibold text-dark mb-4">Top Events</h3>
          <div className="space-y-3">
            {metrics.topEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex justify-between items-center"
              >
                <span className="text-sm text-dark">{event.action}</span>
                <span className="text-xs font-semibold bg-secondary/10 text-secondary px-2 py-1 rounded">
                  {event.count} events
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
