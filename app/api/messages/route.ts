/**
 * Messages API Route
 * Handles fetching and sending messages with real-time integration
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getWebSocketServer } from '@/lib/websocketServer'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Fetch messages for user
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`recipient_id.eq.${userId},sender_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Failed to fetch messages:', err)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { from, to, text } = await request.json()

    if (!from || !to || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Save message to database
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: from,
        recipient_id: to,
        content: text,
        created_at: new Date().toISOString(),
        read: false,
      })
      .select()

    if (error) throw error

    // Broadcast to WebSocket clients
    try {
      const wsServer = getWebSocketServer()
      wsServer.sendToUser(to, {
        type: 'message',
        data: {
          id: data?.[0]?.id,
          from,
          text,
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
      })
    } catch (wsErr) {
      console.warn('WebSocket broadcast failed:', wsErr)
      // Don't fail the API request if WebSocket fails
    }

    return NextResponse.json(data?.[0], { status: 201 })
  } catch (err) {
    console.error('Failed to send message:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
