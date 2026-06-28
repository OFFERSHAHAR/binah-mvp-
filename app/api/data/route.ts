import { NextRequest, NextResponse } from 'next/server'
import { sbSelect } from '@/lib/supabase-server'

// Global catalog (same for every user) is safe to cache at the CDN edge.
// Per-user types (grades/messages/assignments) are not cached.
const CATALOG_CACHE = 'public, s-maxage=300, stale-while-revalidate=600'

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const type = sp.get('type')
  const courseId = sp.get('courseId')

  try {
    if (type === 'courses') {
      const rows = await sbSelect(
        'courses?select=id,title,description,lessons,hours,progress,gradient,icon&order=sort_order'
      )
      return NextResponse.json(rows, { headers: { 'Cache-Control': CATALOG_CACHE } })
    }

    if (type === 'lessons' && courseId) {
      const rows = await sbSelect<any>(
        `lessons?course_id=eq.${encodeURIComponent(courseId)}&select=*&order=number`
      )
      const out = rows.map((l) => ({
        id: l.id, number: l.number, title: l.title, description: l.description,
        duration: l.duration, videoTime: l.video_time, completed: l.completed,
      }))
      return NextResponse.json(out, { headers: { 'Cache-Control': CATALOG_CACHE } })
    }

    if (type === 'assignments') {
      const rows = await sbSelect<any>('assignments?select=*')
      const out = rows.map((a) => ({
        id: a.id, title: a.title, description: a.description, course: a.course,
        dueDate: a.due_date, priority: a.priority, status: a.status,
        progress: a.progress, gradient: a.gradient,
      }))
      return NextResponse.json(out)
    }

    if (type === 'grades') {
      return NextResponse.json(await sbSelect('grades?select=subject,grade,status'))
    }

    if (type === 'messages') {
      const rows = await sbSelect<any>('messages?select=*&order=id')
      return NextResponse.json(rows.map((m) => ({ from: m.sender, text: m.body, time: m.time_label })))
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err) {
    console.error('data route error:', err)
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 })
  }
}
