import { Redis } from '@upstash/redis'

/**
 * Shared KV store with TTL.
 *
 * Backed by Upstash Redis when UPSTASH_REDIS_REST_URL/TOKEN are set (shared across
 * all serverless instances → horizontally scalable). Falls back to an in-memory Map
 * when they aren't — fine for local dev, NOT safe across multiple instances.
 *
 * ponytail: get/set/del only — the three security stores need nothing more.
 * No scan/keys: cross-instance enumeration (admin stats) is intentionally not supported.
 */

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN

const redis = url && token && !url.includes('placeholder') ? new Redis({ url, token }) : null

export const isRedisBacked = redis !== null

interface MemEntry {
  value: unknown
  expireAt: number | null
}
const mem = new Map<string, MemEntry>()

export async function kvGet<T>(key: string): Promise<T | null> {
  if (redis) return (await redis.get<T>(key)) ?? null

  const entry = mem.get(key)
  if (!entry) return null
  if (entry.expireAt !== null && entry.expireAt < Date.now()) {
    mem.delete(key)
    return null
  }
  return entry.value as T
}

export async function kvSet(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  if (redis) {
    if (ttlSeconds) await redis.set(key, value, { ex: ttlSeconds })
    else await redis.set(key, value)
    return
  }
  mem.set(key, { value, expireAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null })
}

export async function kvDel(key: string): Promise<void> {
  if (redis) {
    await redis.del(key)
    return
  }
  mem.delete(key)
}
