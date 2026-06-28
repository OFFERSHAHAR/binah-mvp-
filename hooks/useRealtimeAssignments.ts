'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWebSocket } from './useWebSocket'

export type AssignmentStatus = 'pending' | 'submitted' | 'graded' | 'overdue'

export interface Assignment {
  id: string
  title: string
  dueDate: string
  status: AssignmentStatus
  submittedDate?: string
  grade?: number
  isNew?: boolean
  timestamp: number
}

interface RealtimeAssignmentsConfig {
  userId: string | null
  wsUrl: string
}

export const useRealtimeAssignments = (config: RealtimeAssignmentsConfig) => {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(!!config.userId)
  const [error, setError] = useState<string | null>(null)
  const [updatesCount, setUpdatesCount] = useState(0)

  const ws = useWebSocket({
    url: config.wsUrl,
    reconnectAttempts: 5,
    reconnectDelay: 3000,
  })

  useEffect(() => {
    if (!config.userId) return

    const fetchAssignments = async () => {
      try {
        const response = await fetch(`/api/assignments?userId=${config.userId}`)
        const data = await response.json()
        setAssignments(data || [])
        setLoading(false)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch assignments'
        setError(errorMsg)
        setLoading(false)
      }
    }

    fetchAssignments()

    const unsubscribe = ws.subscribe('assignment', (data: any) => {
      const updatedAssignment: Assignment = {
        id: data.id,
        title: data.title,
        dueDate: data.dueDate,
        status: data.status as AssignmentStatus,
        submittedDate: data.submittedDate,
        grade: data.grade,
        isNew: true,
        timestamp: Date.now(),
      }

      setAssignments((prev) => {
        const existingIndex = prev.findIndex((a) => a.id === data.id)
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = updatedAssignment
          return updated
        }
        return [updatedAssignment, ...prev]
      })

      setUpdatesCount((prev) => prev + 1)
    })

    return unsubscribe
  }, [config.userId, ws])

  const getStatusCounts = useCallback(() => {
    return {
      pending: assignments.filter((a) => a.status === 'pending').length,
      submitted: assignments.filter((a) => a.status === 'submitted').length,
      graded: assignments.filter((a) => a.status === 'graded').length,
      overdue: assignments.filter((a) => a.status === 'overdue').length,
    }
  }, [assignments])

  const clearUpdatesIndicator = useCallback(() => {
    setUpdatesCount(0)
    setAssignments((prev) =>
      prev.map((a) => ({
        ...a,
        isNew: false,
      }))
    )
  }, [])

  const submitAssignment = useCallback(
    async (assignmentId: string, content: string) => {
      if (!config.userId) return

      try {
        const response = await fetch('/api/assignments/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assignmentId,
            userId: config.userId,
            content,
          }),
        })

        if (!response.ok) throw new Error('Failed to submit assignment')

        ws.send({
          type: 'assignment',
          data: {
            id: assignmentId,
            status: 'submitted',
          },
          timestamp: Date.now(),
        })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Submission failed'
        setError(errorMsg)
        throw err
      }
    },
    [config.userId, ws]
  )

  return {
    assignments,
    loading,
    error,
    updatesCount,
    getStatusCounts,
    clearUpdatesIndicator,
    submitAssignment,
    isConnected: ws.isConnected,
  }
}
