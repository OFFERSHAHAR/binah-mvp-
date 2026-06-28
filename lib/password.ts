import crypto from 'crypto'

// Simple bcrypt-like hashing (for production, use bcryptjs package)
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(32).toString('hex')
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err)
      resolve(`${salt}:${derivedKey.toString('hex')}`)
    })
  })
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const parts = hash.split(':')
    if (parts.length !== 2) {
      reject(new Error('Invalid hash format'))
      return
    }

    const [salt, key] = parts
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err)
      resolve(derivedKey.toString('hex') === key)
    })
  })
}
