import { useEffect, useRef, useState, useCallback } from 'react'

export type WebSocketEventType = 'message' | 'grade' | 'assignment' | 'notification' | 'connection'

export interface WebSocketMessage {
  type: WebSocketEventType
  data: any
  timestamp: number
}

interface WebSocketConfig {
  url: string
  reconnectAttempts?: number
  reconnectDelay?: number
}

export const useWebSocket = (config: WebSocketConfig) => {
  const ws = useRef<WebSocket | null>(null)
  const reconnectAttempts = useRef(0)
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null)
  const messageListeners = useRef<Map<WebSocketEventType, ((data: any) => void)[]>>(new Map())

  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastMessageTime, setLastMessageTime] = useState<number>(Date.now())

  const maxReconnectAttempts = config.reconnectAttempts ?? 5
  const reconnectDelay = config.reconnectDelay ?? 3000

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return

    try {
      ws.current = new WebSocket(config.url)

      ws.current.onopen = () => {
        setIsConnected(true)
        setError(null)
        reconnectAttempts.current = 0
        if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current)
      }

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          setLastMessageTime(Date.now())

          const listeners = messageListeners.current.get(message.type) || []
          listeners.forEach((listener) => listener(message.data))
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }

      ws.current.onerror = (event) => {
        const errorMsg = 'WebSocket connection error'
        setError(errorMsg)
        console.error(errorMsg, event)
      }

      ws.current.onclose = () => {
        setIsConnected(false)

        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1
          const delay = reconnectDelay * Math.pow(1.5, reconnectAttempts.current - 1)
          reconnectTimeout.current = setTimeout(() => connect(), delay)
        } else {
          setError('Max reconnection attempts reached')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
    }
  }, [config.url, maxReconnectAttempts, reconnectDelay])

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current)
    if (ws.current) {
      ws.current.close()
      ws.current = null
    }
    setIsConnected(false)
  }, [])

  const subscribe = useCallback((eventType: WebSocketEventType, listener: (data: any) => void) => {
    if (!messageListeners.current.has(eventType)) {
      messageListeners.current.set(eventType, [])
    }
    messageListeners.current.get(eventType)!.push(listener)

    return () => {
      const listeners = messageListeners.current.get(eventType) || []
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  const send = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected, message not sent')
    }
  }, [])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return {
    isConnected,
    error,
    subscribe,
    send,
    lastMessageTime,
    reconnectAttempts: reconnectAttempts.current,
  }
}
