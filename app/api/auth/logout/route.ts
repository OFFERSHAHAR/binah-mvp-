import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader || undefined)

    if (!token) {
      return NextResponse.json(
        { error: 'No access token provided' },
        { status: 400 }
      )
    }

    // Verify token is valid (user is authenticated)
    const payload = verifyToken(token)
    if (!payload || payload.type !== 'access') {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      )
    }

    // In a production system, you would:
    // 1. Add the token to a blacklist (Redis)
    // 2. Add refresh token to blacklist
    // 3. Log the logout event

    const response = NextResponse.json(
      { success: true, message: 'התנתק בהצלחה' },
      { status: 200 }
    )

    // Clear refresh token cookie
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/api/auth',
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
}
