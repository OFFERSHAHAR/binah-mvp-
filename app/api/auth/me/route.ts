import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt'
import { findUserById, getUserPublicData } from '@/lib/db'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader || undefined)

    if (!token) {
      return NextResponse.json(
        { error: 'No access token provided' },
        { status: 401 }
      )
    }

    // Verify access token
    const payload = verifyToken(token)
    if (!payload || payload.type !== 'access') {
      return NextResponse.json(
        { error: 'Invalid or expired access token' },
        { status: 401 }
      )
    }

    // Find user
    const user = await findUserById(payload.sub)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        user: getUserPublicData(user),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { error: 'Failed to get user info' },
      { status: 500 }
    )
  }
}
