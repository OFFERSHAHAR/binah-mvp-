import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt'
import { findUserById } from '@/lib/db'
import { sendWhatsApp } from '@/lib/whatsapp'

// POST /api/notify/whatsapp — admin-only. Body: { phone, text }.
// Sends a transactional WhatsApp message via the OpenWA gateway.
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

  const { phone, text } = await request.json()
  if (!phone || !text) {
    return NextResponse.json({ error: 'phone and text are required' }, { status: 400 })
  }

  const result = await sendWhatsApp(String(phone), String(text))
  if (result.skipped) {
    return NextResponse.json({ error: 'WhatsApp gateway not configured' }, { status: 503 })
  }
  if (!result.sent) {
    return NextResponse.json({ error: result.error || 'send failed' }, { status: 502 })
  }
  return NextResponse.json({ sent: true })
}
