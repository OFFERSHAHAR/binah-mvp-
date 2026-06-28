'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface DashboardRefreshConfig {
  interval?: number // milliseconds, default 30000 (30s)
  enabled?: boolean
}

export const useDashboardRefresh = (config: DashboardRefreshConfig = {}) => {
  const { interval = 30000, enabled = true } = config
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now())
  const [error, setError] = useState<string | null>(null)
  const refreshTimeout = useRef<NodeJS.Timeout | null>(null)

  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    setError(null)

    try {
      // Refresh dashboard data by re-fetching key endpoints
      const endpoints = ['/api/dashboard/summary', '/api/grades/latest', '/api/assignments/pending']

      await Promise.all(
        endpoints.map((endpoint) =>
          fetch(endpoint).catch((err) => {
            console.warn(`Failed to refresh ${endpoint}:`, err)
          })
        )
      )

      setLastRefreshTime(Date.now())
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Refresh failed'
      setError(errorMsg)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const scheduleRefresh = useCallback(() => {
    if (refreshTimeout.current) clearTimeout(refreshTimeout.current)

    refreshTimeout.current = setTimeout(() => {
      refresh()
      scheduleRefresh()
    }, interval)
  }, [interval, refresh])

  useEffect(() => {
    if (!enabled) {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current)
      return
    }

    scheduleRefresh()

    return () => {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current)
    }
  }, [enabled, scheduleRefresh])

  const manualRefresh = useCallback(async () => {
    await refresh()
  }, [refresh])

  return {
    isRefreshing,
    lastRefreshTime,
    error,
    refresh: manualRefresh,
  }
}
