import { hashPassword } from './password'
import { sbSelect, sbInsert, sbUpdate } from './supabase-server'

// Users persisted in Supabase Postgres (app_users table). Custom JWT auth —
// not Supabase Auth. Server-only (uses service_role via supabase-server).
interface StoredUser {
  id: string
  email: string
  passwordHash: string
  name: string
  role: 'student' | 'teacher' | 'admin'
  emailVerified: boolean
  phone?: string
  createdAt: string
  updatedAt: string
}

interface UserRow {
  id: string
  email: string
  password_hash: string
  name: string
  role: 'student' | 'teacher' | 'admin'
  email_verified: boolean
  phone: string | null
  created_at: string
  updated_at: string
}

const fromRow = (r: UserRow): StoredUser => ({
  id: r.id,
  email: r.email,
  passwordHash: r.password_hash,
  name: r.name,
  role: r.role,
  emailVerified: r.email_verified,
  phone: r.phone || undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

const enc = (s: string) => encodeURIComponent(s)

let seeded = false

// Seed demo + admin once per instance (insert-if-absent; unique email makes it safe).
async function ensureSeed(): Promise<void> {
  if (seeded) return
  seeded = true
  // Production: only the admin is seeded. Students register themselves.
  const seeds = [
    { id: 'admin-user-001', email: 'admin@binah.com', pw: process.env.ADMIN_PASSWORD || 'Admin@123', name: 'מנהל המערכת', role: 'admin' as const },
  ]
  for (const s of seeds) {
    try {
      const existing = await sbSelect<UserRow>(`app_users?email=eq.${enc(s.email)}&select=id`)
      if (existing.length) continue
      await sbInsert('app_users', {
        id: s.id,
        email: s.email,
        password_hash: await hashPassword(s.pw),
        name: s.name,
        role: s.role,
        email_verified: true,
      })
    } catch (e) {
      // 409/race on the unique email is fine — another instance seeded it.
      console.warn('seed user skipped:', (e as Error).message)
    }
  }
}

export interface CreateUserInput {
  email: string
  passwordHash: string
  name: string
  role?: 'student' | 'teacher' | 'admin'
  phone?: string
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  await ensureSeed()
  const rows = await sbSelect<UserRow>(`app_users?email=eq.${enc(email.toLowerCase())}&select=*&limit=1`)
  return rows[0] ? fromRow(rows[0]) : null
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  await ensureSeed()
  const rows = await sbSelect<UserRow>(`app_users?id=eq.${enc(id)}&select=*&limit=1`)
  return rows[0] ? fromRow(rows[0]) : null
}

export async function createUser(input: CreateUserInput): Promise<StoredUser> {
  await ensureSeed()
  try {
    const row = await sbInsert<UserRow>('app_users', {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: input.email.toLowerCase(),
      password_hash: input.passwordHash,
      name: input.name,
      role: input.role || 'student',
      email_verified: false,
      phone: input.phone || null,
    })
    return fromRow(row)
  } catch (e) {
    if ((e as { status?: number }).status === 409) throw new Error('User already exists')
    throw e
  }
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  await sbUpdate('app_users', `id=eq.${enc(userId)}`, { updated_at: new Date().toISOString() })
}

export async function markEmailVerified(email: string): Promise<boolean> {
  await ensureSeed()
  await sbUpdate('app_users', `email=eq.${enc(email.toLowerCase())}`, {
    email_verified: true,
    updated_at: new Date().toISOString(),
  })
  return true
}

export function getUserPublicData(user: StoredUser) {
  const { passwordHash, ...publicData } = user
  return publicData
}
