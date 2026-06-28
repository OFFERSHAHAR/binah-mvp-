import { hashPassword } from './password'

// Mock database - in production, replace with Supabase/PostgreSQL
interface StoredUser {
  id: string
  email: string
  passwordHash: string
  name: string
  role: 'student' | 'teacher' | 'admin'
  createdAt: string
  updatedAt: string
}

const userDatabase: Map<string, StoredUser> = new Map()

// Initialize with seeded data (NOT in production)
async function initializeDatabase() {
  if (userDatabase.size === 0) {
    // Seed demo user only for testing - will be removed before production
    const demoHash = await hashPassword('Demo@123')
    userDatabase.set('demo@binah.com', {
      id: 'demo-user-001',
      email: 'demo@binah.com',
      passwordHash: demoHash,
      name: 'דנה כהן',
      role: 'student',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // Seeded admin account. ponytail: seeded (not registered) so it survives
    // serverless cold starts even with the in-memory store. Move to Supabase +
    // env-based credentials before real production.
    const adminHash = await hashPassword(process.env.ADMIN_PASSWORD || 'Admin@123')
    userDatabase.set('admin@binah.com', {
      id: 'admin-user-001',
      email: 'admin@binah.com',
      passwordHash: adminHash,
      name: 'מנהל המערכת',
      role: 'admin',
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
  return userDatabase.get(email.toLowerCase()) || null
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  await initializeDatabase()
  for (const user of userDatabase.values()) {
    if (user.id === id) return user
  }
  return null
}

export async function createUser(input: CreateUserInput): Promise<StoredUser> {
  await initializeDatabase()

  if (userDatabase.has(input.email.toLowerCase())) {
    throw new Error('User already exists')
  }

  const user: StoredUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash,
    name: input.name,
    role: input.role || 'student',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  userDatabase.set(input.email.toLowerCase(), user)
  return user
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  await initializeDatabase()
  for (const user of userDatabase.values()) {
    if (user.id === userId) {
      user.updatedAt = new Date().toISOString()
      break
    }
  }
}

export function getUserPublicData(user: StoredUser) {
  const { passwordHash, ...publicData } = user
  return publicData
}
