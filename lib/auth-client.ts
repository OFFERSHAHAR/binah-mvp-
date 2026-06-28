'use client'

interface AuthResponse {
  success: boolean
  user?: {
    id: string
    email: string
    name: string
    role: string
  }
  tokens?: {
    accessToken: string
    refreshToken: string
  }
  error?: string
  retryAfter?: number
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
}

// Store tokens in memory (for this session)
const authState: AuthState = {
  accessToken: null,
  refreshToken: null,
}

export function setAuthTokens(accessToken: string, refreshToken: string): void {
  authState.accessToken = accessToken
  authState.refreshToken = refreshToken
}

export function getAccessToken(): string | null {
  return authState.accessToken
}

export function getAuthHeaders(): Record<string, string> {
  if (!authState.accessToken) {
    return {}
  }
  return {
    Authorization: `Bearer ${authState.accessToken}`,
  }
}

export async function register(
  email: string,
  password: string,
  confirmPassword: string,
  name: string
): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        confirmPassword,
        name,
      }),
    })

    const data: AuthResponse = await res.json()

    if (!res.ok) {
      return data
    }

    if (data.tokens) {
      setAuthTokens(data.tokens.accessToken, data.tokens.refreshToken)
    }

    return data
  } catch (error) {
    return {
      success: false,
      error: 'Network error. Please try again.',
    }
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data: AuthResponse = await res.json()

    if (!res.ok) {
      return data
    }

    if (data.tokens) {
      setAuthTokens(data.tokens.accessToken, data.tokens.refreshToken)
    }

    return data
  } catch (error) {
    return {
      success: false,
      error: 'Network error. Please try again.',
    }
  }
}

export async function logout(): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders(),
    })

    authState.accessToken = null
    authState.refreshToken = null

    const data: AuthResponse = await res.json()
    return data
  } catch (error) {
    authState.accessToken = null
    authState.refreshToken = null

    return {
      success: true,
      error: 'Network error during logout',
    }
  }
}

export async function refreshAccessToken(): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshToken: authState.refreshToken,
      }),
    })

    const data: AuthResponse = await res.json()

    if (!res.ok) {
      return data
    }

    if (data.tokens) {
      setAuthTokens(data.tokens.accessToken, data.tokens.refreshToken)
    }

    return data
  } catch (error) {
    return {
      success: false,
      error: 'Failed to refresh token',
    }
  }
}

export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data: AuthResponse = await res.json()

    if (res.status === 401) {
      // Try to refresh token
      const refreshResponse = await refreshAccessToken()
      if (refreshResponse.success) {
        return getCurrentUser()
      }
    }

    return data
  } catch (error) {
    return {
      success: false,
      error: 'Failed to get user info',
    }
  }
}
