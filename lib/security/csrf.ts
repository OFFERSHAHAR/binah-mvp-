import crypto from 'crypto'
import { kvGet, kvSet, kvDel } from '@/lib/store/kv'

interface CSRFToken {
  secret: string
  expiresAt: number
}

interface CSRFConfig {
  tokenLength: number
  secretLength: number
  maxAge: number // milliseconds
}

const DEFAULT_CONFIG: CSRFConfig = {
  tokenLength: 32,
  secretLength: 64,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}

const KEY = (token: string) => `csrf:${token}`

function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Create a CSRF token pair (token + secret), stored in the shared KV with TTL.
 */
export async function createCSRFToken(
  config: Partial<CSRFConfig> = {}
): Promise<{ token: string; secret: string }> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const secret = generateRandomString(finalConfig.secretLength)
  const token = generateRandomString(finalConfig.tokenLength)

  await kvSet(
    KEY(token),
    { secret, expiresAt: Date.now() + finalConfig.maxAge } satisfies CSRFToken,
    Math.ceil(finalConfig.maxAge / 1000)
  )

  return { token, secret }
}

/**
 * Verify CSRF token and secret. Single-use: a valid token is deleted (anti-replay).
 */
export async function verifyCSRFToken(token: string, secret: string): Promise<boolean> {
  if (!token || !secret) return false

  const stored = await kvGet<CSRFToken>(KEY(token))
  if (!stored) return false

  if (stored.expiresAt < Date.now()) {
    await kvDel(KEY(token))
    return false
  }

  const isValid = constantTimeCompare(stored.secret, secret)
  if (isValid) await kvDel(KEY(token)) // consume on success
  return isValid
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// ponytail: token counting needs a cross-instance scan we deliberately don't do.
// Returns 0 — it was only ever used for an admin/monitor display.
export function getStoredTokenCount(): number {
  return 0
}

// ponytail: no-op under Redis (TTL handles expiry); kept for the test endpoint's import.
export function clearAllTokens(): void {}
