import { kvGet, kvSet, kvDel } from '@/lib/store/kv'

/**
 * Exponential backoff rate limiting for brute force protection.
 * Backed by the shared KV store (Redis in prod) so limits hold across instances.
 */

export interface RateLimitConfig {
  windowDuration: number // milliseconds
  maxAttempts: number
  backoffMultiplier: number
  maxBackoffDuration: number // milliseconds
}

export interface RateLimitEntry {
  attempts: number
  lastAttemptAt: number
  lockedUntil: number
  backoffLevel: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowDuration: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5,
  backoffMultiplier: 2,
  maxBackoffDuration: 24 * 60 * 60 * 1000, // 24 hours
}

const KEY = (id: string) => `rl:${id}`

// TTL covers the longer of the window or any active lockout, so the entry survives
// long enough to enforce backoff but Redis still reclaims it automatically.
function ttlSeconds(entry: RateLimitEntry, config: RateLimitConfig): number {
  const horizon = Math.max(entry.lastAttemptAt + config.windowDuration, entry.lockedUntil)
  return Math.max(1, Math.ceil((horizon - Date.now()) / 1000))
}

function calculateBackoffDuration(backoffLevel: number, multiplier: number, maxDuration: number): number {
  const baseDelay = 60 * 1000 // 1 minute
  return Math.min(baseDelay * Math.pow(multiplier, backoffLevel), maxDuration)
}

export async function isRateLimited(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): Promise<boolean> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const entry = await kvGet<RateLimitEntry>(KEY(identifier))
  if (!entry) return false

  if (entry.lockedUntil > Date.now()) return true

  if (entry.lastAttemptAt + finalConfig.windowDuration < Date.now()) {
    await kvDel(KEY(identifier))
    return false
  }

  return entry.attempts >= finalConfig.maxAttempts
}

export async function recordAttempt(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): Promise<{ isAllowed: boolean; attemptsRemaining: number; lockedUntil: number | null }> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  let entry = await kvGet<RateLimitEntry>(KEY(identifier))

  if (!entry || entry.lastAttemptAt + finalConfig.windowDuration < Date.now()) {
    entry = { attempts: 0, lastAttemptAt: Date.now(), lockedUntil: 0, backoffLevel: 0 }
  }

  entry.attempts++
  entry.lastAttemptAt = Date.now()

  if (entry.attempts > finalConfig.maxAttempts) {
    entry.backoffLevel++
    entry.lockedUntil =
      Date.now() +
      calculateBackoffDuration(entry.backoffLevel, finalConfig.backoffMultiplier, finalConfig.maxBackoffDuration)
    await kvSet(KEY(identifier), entry, ttlSeconds(entry, finalConfig))
    return { isAllowed: false, attemptsRemaining: 0, lockedUntil: entry.lockedUntil }
  }

  await kvSet(KEY(identifier), entry, ttlSeconds(entry, finalConfig))
  return { isAllowed: true, attemptsRemaining: finalConfig.maxAttempts - entry.attempts, lockedUntil: null }
}

export async function clearRateLimit(identifier: string): Promise<void> {
  await kvDel(KEY(identifier))
}

export async function getRateLimitStatus(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): Promise<{
  isLimited: boolean
  attempts: number
  attemptsRemaining: number
  lockedUntil: number | null
  backoffLevel: number
}> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const entry = await kvGet<RateLimitEntry>(KEY(identifier))

  if (!entry) {
    return { isLimited: false, attempts: 0, attemptsRemaining: finalConfig.maxAttempts, lockedUntil: null, backoffLevel: 0 }
  }

  return {
    isLimited: await isRateLimited(identifier, config),
    attempts: entry.attempts,
    attemptsRemaining: Math.max(0, finalConfig.maxAttempts - entry.attempts),
    lockedUntil: entry.lockedUntil > Date.now() ? entry.lockedUntil : null,
    backoffLevel: entry.backoffLevel,
  }
}

// ponytail: cross-instance cleanup/stats need a scan we don't do — Redis TTL reclaims
// entries automatically. These remain as no-op/empty stubs for their existing importers.
export function cleanupExpiredRateLimits(): number {
  return 0
}

export function getRateLimitStats() {
  return { totalTrackedIdentifiers: 0, lockedIdentifiers: 0, details: [] as Array<{ identifier: string; attempts: number; lockedUntil: number | null; backoffLevel: number }> }
}

export async function clearAllRateLimits(): Promise<void> {}
