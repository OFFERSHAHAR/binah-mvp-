'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWebSocket } from './useWebSocket'

export interface Message {
  id: string
  from: string
  text: string
  time: string
  timestamp: number
  isNew?: boolean
}

interface RealtimeMessagesConfig {
  userId: string | null
  wsUrl: string
}

export const useRealtimeMessages = (config: RealtimeMessagesConfig) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(!!config.userId)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const ws = useWebSocket({
    url: config.wsUrl,
    reconnectAttempts: 5,
    reconnectDelay: 3000,
  })

  useEffect(() => {
    if (!config.userId) return

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?userId=${config.userId}`)
        const data = await response.json()
        setMessages(data || [])
        setLoading(false)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch messages'
        setError(errorMsg)
        setLoading(false)
      }
    }

    fetchMessages()

    const unsubscribe = ws.subscribe('message', (data: any) => {
      const newMessage: Message = {
        id: data.id || `msg-${Date.now()}`,
        from: data.from,
        text: data.text,
        time: new Date().toLocaleTimeString('he-IL'),
        timestamp: Date.now(),
        isNew: true,
      }
      setMessages((prev) => [newMessage, ...prev])
      setUnreadCount((prev) => prev + 1)
    })

    return unsubscribe
  }, [config.userId, ws])

  const clearUnread = useCallback(() => {
    setUnreadCount(0)
    setMessages((prev) =>
      prev.map((msg) => ({
        ...msg,
        isNew: false,
      }))
    )
  }, [])

  const sendMessage = useCallback(
    async (text: string, recipientId: string) => {
      if (!config.userId) return

      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: config.userId,
            to: recipientId,
            text,
          }),
        })

        if (!response.ok) throw new Error('Failed to send message')

        ws.send({
          type: 'message',
          data: {
            from: config.userId,
            text,
            timestamp: Date.now(),
          },
          timestamp: Date.now(),
        })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Send failed'
        setError(errorMsg)
        throw err
      }
    },
    [config.userId, ws]
  )

  return {
    messages,
    loading,
    error,
    sendMessage,
    unreadCount,
    clearUnread,
    isConnected: ws.isConnected,
  }
}
