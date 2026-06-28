/**
 * Dashboard Summary API Route
 * Returns aggregated dashboard data for the 30-second refresh cycle
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Fetch all dashboard summary data in parallel
    const [gradesResult, assignmentsResult, messagesResult, coursesResult] = await Promise.all([
      // Average grade
      supabase
        .from('grades')
        .select('score, max_score')
        .eq('user_id', userId),
      // Pending assignments
      supabase
        .from('assignments')
        .select(`id, title, due_date, submissions(status)`)
        .eq('user_id', userId),
      // Unread messages
      supabase
        .from('messages')
        .select('id')
        .eq('recipient_id', userId)
        .eq('read', false),
      // Enrolled courses
      supabase
        .from('course_enrollments')
        .select('courses(id, title, progress)')
        .eq('user_id', userId),
    ])

    // Calculate statistics
    const grades = gradesResult.data || []
    const averageScore = grades.length
      ? Math.round(grades.reduce((sum, g) => sum + (g.score / (g.max_score || 100)) * 100, 0) / grades.length)
      : 0

    const assignments = assignmentsResult.data || []
    const pending = assignments.filter((a) => {
      const submission = a.submissions?.[0]
      return !submission || submission.status === 'pending'
    }).length

    const overdue = assignments.filter((a) => {
      const dueDate = new Date(a.due_date)
      return dueDate < new Date()
    }).length

    const unreadMessages = messagesResult.data?.length || 0

    const courses = coursesResult.data || []
    const completedCourses = courses.filter((c: any) => c.courses?.progress === 100).length

    return NextResponse.json({
      timestamp: Date.now(),
      user: {
        id: userId,
      },
      stats: {
        averageScore,
        pendingAssignments: pending,
        overdueAssignments: overdue,
        unreadMessages,
        completedCourses,
        totalCourses: courses.length,
      },
      recentGrades: grades.slice(-3).map((g: any) => ({
        score: g.score,
        maxScore: g.max_score || 100,
      })),
      nextDeadline: assignments
        .filter((a) => new Date(a.due_date) > new Date())
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]
        ?.due_date || null,
    })
  } catch (err) {
    console.error('Failed to fetch dashboard summary:', err)
    return NextResponse.json({ error: 'Failed to fetch dashboard summary' }, { status: 500 })
  }
}
