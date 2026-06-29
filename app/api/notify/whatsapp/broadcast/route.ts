import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt'
import { findUserById } from '@/lib/db'
import { sendWhatsApp } from '@/lib/whatsapp'
import { sbSelect } from '@/lib/supabase-server'

export const maxDuration = 60

// POST /api/notify/whatsapp/broadcast — admin-only. Body: { text }.
// Sends a WhatsApp message to every user who provided a phone (opted in at signup).
export async function POST(request: NextRequest) {
  const token = extractTokenFromHeader(request.headers.get('Authorization') || undefined)
  const payload = token ? verifyToken(token) : null
  if (!payload || payload.type !== 'access') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const requester = await findUserById(payload.sub)
  if (!requester || requester.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
  }

  const { text } = await request.json()
  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }

  const recipients = await sbSelect<{ phone: string; name: string }>(
    'app_users?select=phone,name&phone=not.is.null'
  )
  if (!recipients.length) {
    return NextResponse.json({ error: 'no users with a phone number' }, { status: 404 })
  }

  let sent = 0
  let failed = 0
  for (const r of recipients) {
    const result = await sendWhatsApp(r.phone, text)
    if (result.skipped) {
      return NextResponse.json({ error: 'WhatsApp gateway not configured' }, { status: 503 })
    }
    result.sent ? sent++ : failed++
  }

  return NextResponse.json({ recipients: recipients.length, sent, failed })
}
