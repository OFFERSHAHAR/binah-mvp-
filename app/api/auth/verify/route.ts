import { NextRequest, NextResponse } from 'next/server'
import { kvGet, kvDel } from '@/lib/store/kv'
import { markEmailVerified } from '@/lib/db'

// GET /api/auth/verify?token=... — confirms a signup email, then redirects to login.
export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.nextUrl.searchParams.get('token')
  const origin = request.nextUrl.origin

  if (!token) {
    return NextResponse.redirect(`${origin}/auth/login?verified=0`)
  }

  const email = await kvGet<string>(`verify:${token}`)
  if (!email) {
    return NextResponse.redirect(`${origin}/auth/login?verified=0`)
  }

  await markEmailVerified(email)
  await kvDel(`verify:${token}`)

  return NextResponse.redirect(`${origin}/auth/login?verified=1`)
}
