/**
 * Assignments API Route
 * Handles fetching and managing assignments with status tracking
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getWebSocketServer } from '@/lib/websocketServer'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const pending = searchParams.get('pending') === 'true'

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Fetch assignments with submission status
    let query = supabase
      .from('assignments')
      .select(`
        id,
        title,
        due_date,
        course_id,
        submissions(id, status, submitted_at)
      `)
      .eq('course_id', userId)
      .order('due_date', { ascending: true })

    if (pending) {
      query = query.limit(10)
    }

    const { data, error } = await query

    if (error) throw error

    // Transform to match frontend schema
    const transformedData = (data || []).map((assignment: any) => {
      const submission = assignment.submissions?.[0]
      const dueDate = new Date(assignment.due_date)
      const isOverdue = dueDate < new Date()

      return {
        id: assignment.id,
        title: assignment.title,
        dueDate: dueDate.toLocaleDateString('he-IL'),
        status: isOverdue
          ? 'overdue'
          : submission?.status || 'pending',
        submittedDate: submission?.submitted_at ? new Date(submission.submitted_at).toLocaleDateString('he-IL') : undefined,
        timestamp: new Date(assignment.due_date).getTime(),
      }
    })

    return NextResponse.json(transformedData)
  } catch (err) {
    console.error('Failed to fetch assignments:', err)
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { assignmentId, userId, content } = await request.json()

    if (!assignmentId || !userId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get or create submission
    const { data: existingSubmission } = await supabase
      .from('submissions')
      .select('id')
      .eq('assignment_id', assignmentId)
      .eq('user_id', userId)
      .single()

    let submissionData
    let method = 'insert'

    if (existingSubmission) {
      // Update existing submission
      const { data, error } = await supabase
        .from('submissions')
        .update({
          content,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSubmission.id)
        .select()

      if (error) throw error
      submissionData = data?.[0]
      method = 'update'
    } else {
      // Create new submission
      const { data, error } = await supabase
        .from('submissions')
        .insert({
          assignment_id: assignmentId,
          user_id: userId,
          content,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error
      submissionData = data?.[0]
      method = 'insert'
    }

    // Get assignment details for notification
    const { data: assignment } = await supabase
      .from('assignments')
      .select('title')
      .eq('id', assignmentId)
      .single()

    // Broadcast assignment update to WebSocket client
    try {
      const wsServer = getWebSocketServer()
      wsServer.sendToUser(userId, {
        type: 'assignment',
        data: {
          id: assignmentId,
          title: assignment?.title || 'Assignment',
          status: 'submitted',
          submittedDate: new Date().toLocaleDateString('he-IL'),
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
      })
    } catch (wsErr) {
      console.warn('WebSocket broadcast failed:', wsErr)
    }

    return NextResponse.json(submissionData, { status: method === 'insert' ? 201 : 200 })
  } catch (err) {
    console.error('Failed to submit assignment:', err)
    return NextResponse.json({ error: 'Failed to submit assignment' }, { status: 500 })
  }
}
