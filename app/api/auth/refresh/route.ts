import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, generateAccessToken, generateRefreshToken } from '@/lib/jwt'
import { findUserById, getUserPublicData } from '@/lib/db'

interface RefreshRequest {
  refreshToken: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: RefreshRequest = await request.json()
    let refreshToken = body.refreshToken

    // If not in body, try to get from cookies
    if (!refreshToken) {
      refreshToken = request.cookies.get('refreshToken')?.value || ''
    }

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      )
    }

    // Verify refresh token
    const payload = verifyToken(refreshToken)
    if (!payload || payload.type !== 'refresh') {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      )
    }

    // Find user
    const user = await findUserById(payload.sub)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user.id, user.email)
    const newRefreshToken = generateRefreshToken(user.id, user.email)

    const response = NextResponse.json(
      {
        success: true,
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        user: getUserPublicData(user),
      },
      { status: 200 }
    )

    // Update refresh token cookie
    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/api/auth',
    })

    return response
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    )
  }
}
