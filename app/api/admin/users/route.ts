import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt'
import { findUserById } from '@/lib/db'
import { sbSelect } from '@/lib/supabase-server'

// GET /api/admin/users — admin-only list of users from Supabase.
// Server-side role check (defense in depth, not just the client guard).
export async function GET(request: NextRequest) {
  const token = extractTokenFromHeader(request.headers.get('Authorization') || undefined)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = verifyToken(token)
  if (!payload || payload.type !== 'access') {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const requester = await findUserById(payload.sub)
  if (!requester || requester.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
  }

  // password_hash deliberately excluded from the SELECT.
  const users = await sbSelect(
    'app_users?select=id,email,name,role,email_verified,created_at&order=created_at.desc'
  )

  const byRole = users.reduce<Record<string, number>>((acc, u: any) => {
    acc[u.role] = (acc[u.role] || 0) + 1
    return acc
  }, {})

  return NextResponse.json({ total: users.length, byRole, users })
}
