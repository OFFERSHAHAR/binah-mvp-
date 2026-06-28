interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory rate limit store (in production, use Redis)
const rateLimitStore: RateLimitStore = {}

const CLEANUP_INTERVAL = 60 * 1000 // 1 minute

// Cleanup stale entries periodically
setInterval(() => {
  const now = Date.now()
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key]
    }
  })
}, CLEANUP_INTERVAL)

export interface RateLimitConfig {
  maxAttempts: number
  windowMs: number // milliseconds
  lockoutDurationMs: number // milliseconds
}

export const DEFAULT_AUTH_RATE_LIMIT: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutes lockout
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_AUTH_RATE_LIMIT
): { allowed: boolean; remaining: number; resetIn: number; lockoutExpires?: number } {
  const now = Date.now()
  const key = `rate-limit:${identifier}`

  if (!rateLimitStore[key]) {
    rateLimitStore[key] = {
      count: 0,
      resetTime: now + config.windowMs,
    }
  }

  const entry = rateLimitStore[key]

  // Reset if window has passed
  if (now > entry.resetTime) {
    entry.count = 0
    entry.resetTime = now + config.windowMs
  }

  // Check if locked out
  if (entry.count >= config.maxAttempts) {
    const lockoutExpires = entry.resetTime + config.lockoutDurationMs
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((lockoutExpires - now) / 1000),
      lockoutExpires,
    }
  }

  return {
    allowed: true,
    remaining: config.maxAttempts - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  }
}

export function incrementRateLimit(identifier: string): void {
  const key = `rate-limit:${identifier}`
  if (rateLimitStore[key]) {
    rateLimitStore[key].count++
  }
}

export function resetRateLimit(identifier: string): void {
  const key = `rate-limit:${identifier}`
  delete rateLimitStore[key]
}
