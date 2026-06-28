import crypto from 'crypto'

interface JwtPayload {
  sub: string // user id
  email: string
  iat: number // issued at
  exp: number // expiration
  type: 'access' | 'refresh'
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'
const ACCESS_TOKEN_EXPIRY = 15 * 60 // 15 minutes in seconds
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 // 7 days in seconds

function base64UrlEncode(data: string): string {
  return Buffer.from(data)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function base64UrlDecode(str: string): string {
  const padding = 4 - (str.length % 4)
  const padded = str + '='.repeat(padding)
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
}

function sign(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export function generateAccessToken(userId: string, email: string): string {
  const now = Math.floor(Date.now() / 1000)
  const payload: JwtPayload = {
    sub: userId,
    email,
    iat: now,
    exp: now + ACCESS_TOKEN_EXPIRY,
    type: 'access',
  }

  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload))
  const signature = sign(`${header}.${payloadEncoded}`, JWT_SECRET)

  return `${header}.${payloadEncoded}.${signature}`
}

export function generateRefreshToken(userId: string, email: string): string {
  const now = Math.floor(Date.now() / 1000)
  const payload: JwtPayload = {
    sub: userId,
    email,
    iat: now,
    exp: now + REFRESH_TOKEN_EXPIRY,
    type: 'refresh',
  }

  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload))
  const signature = sign(`${header}.${payloadEncoded}`, JWT_SECRET)

  return `${header}.${payloadEncoded}.${signature}`
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [header, payload, signature] = parts
    const expectedSignature = sign(`${header}.${payload}`, JWT_SECRET)

    if (signature !== expectedSignature) return null

    const decodedPayload = JSON.parse(base64UrlDecode(payload)) as JwtPayload
    const now = Math.floor(Date.now() / 1000)

    if (decodedPayload.exp < now) return null

    return decodedPayload
  } catch {
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  return authHeader.substring(7)
}
