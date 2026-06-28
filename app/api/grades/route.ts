/**
 * Grades API Route
 * Handles fetching grades with real-time notifications
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getWebSocketServer } from '@/lib/websocketServer'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const latest = searchParams.get('latest') === 'true'

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    let query = supabase
      .from('grades')
      .select('*, assignments(id, title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (latest) {
      query = query.limit(5)
    }

    const { data, error } = await query

    if (error) throw error

    // Transform data to match frontend schema
    const transformedData = (data || []).map((grade: any) => ({
      id: grade.id,
      assignmentId: grade.assignment_id,
      assignmentName: grade.assignments?.title || 'Unknown',
      score: grade.score,
      maxScore: grade.max_score || 100,
      percentage: (grade.score / (grade.max_score || 100)) * 100,
      feedback: grade.feedback || '',
      timestamp: new Date(grade.created_at).getTime(),
    }))

    return NextResponse.json(transformedData)
  } catch (err) {
    console.error('Failed to fetch grades:', err)
    return NextResponse.json({ error: 'Failed to fetch grades' }, { status: 500 })
  }
}

// POST endpoint to record a new grade (teacher action)
export async function POST(request: NextRequest) {
  try {
    const { userId, assignmentId, score, maxScore, feedback } = await request.json()

    if (!userId || !assignmentId || score === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Save grade to database
    const { data, error } = await supabase
      .from('grades')
      .insert({
        user_id: userId,
        assignment_id: assignmentId,
        score,
        max_score: maxScore || 100,
        feedback: feedback || '',
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) throw error

    // Get assignment name for notification
    const { data: assignment } = await supabase
      .from('assignments')
      .select('title')
      .eq('id', assignmentId)
      .single()

    // Broadcast grade update to WebSocket client
    try {
      const wsServer = getWebSocketServer()
      wsServer.sendToUser(userId, {
        type: 'grade',
        data: {
          id: data?.[0]?.id,
          assignmentId,
          assignmentName: assignment?.title || 'Assignment',
          score,
          maxScore: maxScore || 100,
          percentage: (score / (maxScore || 100)) * 100,
          feedback: feedback || '',
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
      })
    } catch (wsErr) {
      console.warn('WebSocket broadcast failed:', wsErr)
    }

    return NextResponse.json(data?.[0], { status: 201 })
  } catch (err) {
    console.error('Failed to record grade:', err)
    return NextResponse.json({ error: 'Failed to record grade' }, { status: 500 })
  }
}
