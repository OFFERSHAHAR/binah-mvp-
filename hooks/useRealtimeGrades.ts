'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWebSocket } from './useWebSocket'

export interface Grade {
  id: string
  assignmentId: string
  assignmentName: string
  score: number
  maxScore: number
  percentage: number
  feedback: string
  isNew?: boolean
  timestamp: number
}

interface RealtimeGradesConfig {
  userId: string | null
  wsUrl: string
}

export const useRealtimeGrades = (config: RealtimeGradesConfig) => {
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(!!config.userId)
  const [error, setError] = useState<string | null>(null)
  const [newGradesCount, setNewGradesCount] = useState(0)

  const ws = useWebSocket({
    url: config.wsUrl,
    reconnectAttempts: 5,
    reconnectDelay: 3000,
  })

  useEffect(() => {
    if (!config.userId) return

    const fetchGrades = async () => {
      try {
        const response = await fetch(`/api/grades?userId=${config.userId}`)
        const data = await response.json()
        setGrades(data || [])
        setLoading(false)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch grades'
        setError(errorMsg)
        setLoading(false)
      }
    }

    fetchGrades()

    const unsubscribe = ws.subscribe('grade', (data: any) => {
      const newGrade: Grade = {
        id: data.id || `grade-${Date.now()}`,
        assignmentId: data.assignmentId,
        assignmentName: data.assignmentName,
        score: data.score,
        maxScore: data.maxScore || 100,
        percentage: data.percentage || (data.score / (data.maxScore || 100)) * 100,
        feedback: data.feedback || '',
        isNew: true,
        timestamp: Date.now(),
      }

      setGrades((prev) => [newGrade, ...prev])
      setNewGradesCount((prev) => prev + 1)
    })

    return unsubscribe
  }, [config.userId, ws])

  const clearNewIndicators = useCallback(() => {
    setNewGradesCount(0)
    setGrades((prev) =>
      prev.map((grade) => ({
        ...grade,
        isNew: false,
      }))
    )
  }, [])

  const getAverageScore = useCallback(() => {
    if (grades.length === 0) return 0
    const sum = grades.reduce((acc, g) => acc + g.percentage, 0)
    return Math.round(sum / grades.length)
  }, [grades])

  return {
    grades,
    loading,
    error,
    newGradesCount,
    clearNewIndicators,
    getAverageScore,
    isConnected: ws.isConnected,
  }
}
