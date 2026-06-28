import { hashPassword } from './password'
import { kvGet, kvSet } from './store/kv'

// User store backed by the shared KV (Upstash Redis in prod) so signups persist
// across serverless instances and cold starts. Falls back to in-memory KV locally.
// ponytail: keyed by email + a uid->email index. No "list all users" (needs a scan) —
// that admin feature is the reason to move to Supabase later.
interface StoredUser {
  id: string
  email: string
  passwordHash: string
  name: string
  role: 'student' | 'teacher' | 'admin'
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

const USER_KEY = (email: string) => `user:${email.toLowerCase()}`
const UID_KEY = (id: string) => `uid:${id}`

let seeded = false

async function putUser(user: StoredUser): Promise<void> {
  await kvSet(USER_KEY(user.email), user)
  await kvSet(UID_KEY(user.id), user.email.toLowerCase())
}

// Seed demo + admin once per instance (idempotent writes to the shared store).
async function initializeDatabase(): Promise<void> {
  if (seeded) return
  seeded = true

  if (!(await kvGet<StoredUser>(USER_KEY('demo@binah.com')))) {
    await putUser({
      id: 'demo-user-001',
      email: 'demo@binah.com',
      passwordHash: await hashPassword('Demo@123'),
      name: 'דנה כהן',
      role: 'student',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  if (!(await kvGet<StoredUser>(USER_KEY('admin@binah.com')))) {
    await putUser({
      id: 'admin-user-001',
      email: 'admin@binah.com',
      passwordHash: await hashPassword(process.env.ADMIN_PASSWORD || 'Admin@123'),
      name: 'מנהל המערכת',
      role: 'admin',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }
}

export interface CreateUserInput {
  email: string
  passwordHash: string
  name: string
  role?: 'student' | 'teacher' | 'admin'
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  await initializeDatabase()
  return kvGet<StoredUser>(USER_KEY(email))
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  await initializeDatabase()
  const email = await kvGet<string>(UID_KEY(id))
  return email ? kvGet<StoredUser>(USER_KEY(email)) : null
}

export async function createUser(input: CreateUserInput): Promise<StoredUser> {
  await initializeDatabase()

  if (await kvGet<StoredUser>(USER_KEY(input.email))) {
    throw new Error('User already exists')
  }

  const user: StoredUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash,
    name: input.name,
    role: input.role || 'student',
    emailVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await putUser(user)
  return user
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  const user = await findUserById(userId)
  if (user) {
    user.updatedAt = new Date().toISOString()
    await putUser(user)
  }
}

export async function markEmailVerified(email: string): Promise<boolean> {
  await initializeDatabase()
  const user = await kvGet<StoredUser>(USER_KEY(email))
  if (!user) return false
  user.emailVerified = true
  user.updatedAt = new Date().toISOString()
  await putUser(user)
  return true
}

export function getUserPublicData(user: StoredUser) {
  const { passwordHash, ...publicData } = user
  return publicData
}
