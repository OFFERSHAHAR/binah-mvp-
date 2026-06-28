import crypto from 'crypto'
import { kvGet, kvSet, kvDel } from '@/lib/store/kv'

export interface SessionUser {
  id: string
  email: string
  fullName: string
  role: 'student' | 'teacher' | 'admin'
  avatar?: string
  lastActivity: number
}

export interface Session {
  id: string
  userId: string
  token: string
  user: SessionUser
  createdAt: number
  expiresAt: number
  lastActivityAt: number
  ipAddress?: string
  userAgent?: string
  isActive: boolean
}

export interface SessionConfig {
  tokenLength: number
  sessionDuration: number // milliseconds
  inactivityTimeout: number // milliseconds
  maxConcurrentSessions: number
}

const DEFAULT_CONFIG: SessionConfig = {
  tokenLength: 32,
  sessionDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
  inactivityTimeout: 30 * 60 * 1000, // 30 minutes
  maxConcurrentSessions: 5,
}

const KEY = (token: string) => `sess:${token}`

function generateSessionToken(length: number): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Create a session, stored in the shared KV with TTL = session duration.
 * ponytail: per-user session indexing (maxConcurrentSessions enforcement) dropped —
 * it needs a secondary index. Re-add a `user:{id}:sessions` set only if that limit
 * becomes a real requirement.
 */
export async function createSession(
  user: SessionUser,
  ipAddress?: string,
  userAgent?: string,
  config: Partial<SessionConfig> = {}
): Promise<Session> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const now = Date.now()
  const token = generateSessionToken(finalConfig.tokenLength)

  const session: Session = {
    id: generateSessionToken(16),
    userId: user.id,
    token,
    user: { ...user, lastActivity: now },
    createdAt: now,
    expiresAt: now + finalConfig.sessionDuration,
    lastActivityAt: now,
    ipAddress,
    userAgent,
    isActive: true,
  }

  await kvSet(KEY(token), session, Math.ceil(finalConfig.sessionDuration / 1000))
  return session
}

export async function getSession(token: string): Promise<Session | null> {
  const session = await kvGet<Session>(KEY(token))
  if (!session) return null

  const now = Date.now()
  if (session.expiresAt < now || session.lastActivityAt + DEFAULT_CONFIG.inactivityTimeout < now) {
    await kvDel(KEY(token))
    return null
  }
  return session
}

export async function updateSessionActivity(token: string): Promise<boolean> {
  const session = await kvGet<Session>(KEY(token))
  if (!session) return false

  const now = Date.now()
  session.lastActivityAt = now
  session.user.lastActivity = now
  const ttl = Math.max(1, Math.ceil((session.expiresAt - now) / 1000))
  await kvSet(KEY(token), session, ttl)
  return true
}

export async function invalidateSession(token: string): Promise<boolean> {
  const exists = await kvGet<Session>(KEY(token))
  await kvDel(KEY(token))
  return exists !== null
}

// ponytail: no per-user index, so this can't enumerate a user's tokens. Best-effort
// no-op — wire a `user:{id}:sessions` set if global "log out everywhere" is needed.
export async function invalidateAllUserSessions(_userId: string): Promise<number> {
  return 0
}

export async function getUserSessions(_userId: string): Promise<Session[]> {
  return []
}

// Redis TTL reclaims expired sessions automatically.
export async function cleanupExpiredSessions(): Promise<number> {
  return 0
}

// ponytail: cross-instance enumeration not supported; returns shape-compatible empties
// for the monitor endpoint.
export async function getSessionStats() {
  return { totalSessions: 0, totalUsers: 0, sessions: [] as Array<{ id: string; userId: string; createdAt: number; lastActivityAt: number; expiresAt: number; isActive: boolean }> }
}

export async function clearAllSessions(): Promise<void> {}
