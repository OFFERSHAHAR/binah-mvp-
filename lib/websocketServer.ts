/**
 * WebSocket Server Implementation for בִּינָה (Binah) Real-time Platform
 *
 * This is a reference implementation showing how to set up the WebSocket server
 * for real-time updates. Deploy separately from the Next.js app.
 *
 * Usage:
 * ```bash
 * npx ts-node lib/websocketServer.ts
 * # Or compile and run: npm run build:ws && npm run start:ws
 * ```
 */

import WebSocket from 'ws'
import http from 'http'

interface ClientConnection {
  ws: WebSocket
  userId: string
  isAlive: boolean
}

interface RealtimeMessage {
  type: 'message' | 'grade' | 'assignment' | 'notification' | 'ping'
  data: any
  timestamp: number
  userId?: string
}

class BinohWebSocketServer {
  private server: http.Server
  private wss: WebSocket.Server
  private clients: Map<string, ClientConnection[]> = new Map()
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor(port: number = 3001) {
    this.server = http.createServer()
    this.wss = new WebSocket.Server({ server: this.server })

    this.setupWebSocketHandlers()
    this.setupHeartbeat()

    this.server.listen(port, () => {
      console.log(`WebSocket server running on ws://localhost:${port}`)
    })
  }

  private setupWebSocketHandlers() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New client connected')
      let userId: string | null = null

      ws.on('message', (data: string) => {
        try {
          const message: RealtimeMessage = JSON.parse(data)

          // Initial authentication - expect userId in first message
          if (!userId && message.data?.userId) {
            userId = message.data.userId as string
            this.registerClient(userId, { ws, userId, isAlive: true })
            console.log(`Client authenticated: ${userId}`)
            return
          }

          if (!userId) {
            ws.send(JSON.stringify({ type: 'error', data: 'Not authenticated' }))
            return
          }

          // Handle heartbeat
          if (message.type === 'ping') {
            ws.send(
              JSON.stringify({
                type: 'pong',
                timestamp: Date.now(),
              })
            )
            return
          }

          // Handle incoming messages
          this.handleMessage(message, userId)
        } catch (err) {
          console.error('Error parsing message:', err)
        }
      })

      ws.on('error', (err) => {
        console.error('WebSocket error:', err)
      })

      ws.on('close', () => {
        if (userId) {
          this.unregisterClient(userId, ws)
          console.log(`Client disconnected: ${userId}`)
        }
      })

      ws.on('pong', () => {
        // Update heartbeat response
        const clientConnections = this.clients.get(userId || '')
        if (clientConnections) {
          const client = clientConnections.find((c) => c.ws === ws)
          if (client) {
            client.isAlive = true
          }
        }
      })
    })
  }

  private setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((connections) => {
        connections.forEach((client) => {
          if (!client.isAlive) {
            client.ws.terminate()
            return
          }

          client.isAlive = false
          client.ws.ping()
        })
      })
    }, 30000) // 30 seconds
  }

  private registerClient(userId: string, client: ClientConnection) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, [])
    }
    this.clients.get(userId)!.push(client)
  }

  private unregisterClient(userId: string, ws: WebSocket) {
    const connections = this.clients.get(userId)
    if (connections) {
      const index = connections.findIndex((c) => c.ws === ws)
      if (index > -1) {
        connections.splice(index, 1)
      }
      if (connections.length === 0) {
        this.clients.delete(userId)
      }
    }
  }

  private handleMessage(message: RealtimeMessage, userId: string) {
    switch (message.type) {
      case 'message':
        this.broadcastMessageUpdate(message)
        break
      case 'grade':
        this.broadcastGradeUpdate(userId, message)
        break
      case 'assignment':
        this.broadcastAssignmentUpdate(userId, message)
        break
      case 'notification':
        this.broadcastNotification(message)
        break
    }
  }

  private broadcastMessageUpdate(message: RealtimeMessage) {
    const payload = JSON.stringify({
      type: 'message',
      data: message.data,
      timestamp: Date.now(),
    })

    // Broadcast to all connected clients (in production, filter by relevant recipients)
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload)
      }
    })
  }

  private broadcastGradeUpdate(userId: string, message: RealtimeMessage) {
    const payload = JSON.stringify({
      type: 'grade',
      data: message.data,
      timestamp: Date.now(),
    })

    // Send to the specific user
    const connections = this.clients.get(userId)
    if (connections) {
      connections.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(payload)
        }
      })
    }
  }

  private broadcastAssignmentUpdate(userId: string, message: RealtimeMessage) {
    const payload = JSON.stringify({
      type: 'assignment',
      data: message.data,
      timestamp: Date.now(),
    })

    // Send to the specific user
    const connections = this.clients.get(userId)
    if (connections) {
      connections.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(payload)
        }
      })
    }
  }

  private broadcastNotification(message: RealtimeMessage) {
    const payload = JSON.stringify({
      type: 'notification',
      data: message.data,
      timestamp: Date.now(),
    })

    // Broadcast to all (admin notifications)
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload)
      }
    })
  }

  public broadcast(message: RealtimeMessage) {
    const payload = JSON.stringify(message)
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload)
      }
    })
  }

  public sendToUser(userId: string, message: RealtimeMessage) {
    const connections = this.clients.get(userId)
    if (connections) {
      const payload = JSON.stringify(message)
      connections.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(payload)
        }
      })
    }
  }

  public getStats() {
    const totalConnections = Array.from(this.clients.values()).reduce((sum, conns) => sum + conns.length, 0)
    return {
      connectedUsers: this.clients.size,
      totalConnections,
      timestamp: Date.now(),
    }
  }

  public shutdown() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval)
    this.wss.close()
    this.server.close()
    console.log('WebSocket server shut down')
  }
}

// Export singleton instance
let wsServer: BinohWebSocketServer

export const getWebSocketServer = (): BinohWebSocketServer => {
  if (!wsServer) {
    wsServer = new BinohWebSocketServer(parseInt(process.env.WS_PORT || '3001', 10))
  }
  return wsServer
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new BinohWebSocketServer()
  console.log('WebSocket server started')

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down...')
    server.shutdown()
    process.exit(0)
  })
}

export default BinohWebSocketServer
