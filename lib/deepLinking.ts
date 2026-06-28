import { ScreenKey } from '@/store/navigationStore'

/**
 * Deep linking utility module
 *
 * Handles URL-based deep linking with state serialization/deserialization
 * Supports:
 * - Screen navigation via URL params
 * - State persistence in URL
 * - Query string parsing and building
 */

const BASE_PARAM = 'screen'
const STATE_PARAM = 'state'

/**
 * DeepLink structure for type-safe URL handling
 */
export interface DeepLink {
  screen: ScreenKey
  state?: Record<string, string | number | boolean>
  query?: Record<string, string | number | boolean>
}

/**
 * Build a deep link URL from parameters
 *
 * @example
 * const url = buildDeepLink({
 *   screen: 'student-profile',
 *   state: { id: '123', tab: 'overview' }
 * })
 * // Returns: /?screen=student-profile&state=...
 */
export const buildDeepLink = (deepLink: DeepLink): string => {
  const params = new URLSearchParams()

  // Add screen
  params.set(BASE_PARAM, deepLink.screen)

  // Add state if present
  if (deepLink.state && Object.keys(deepLink.state).length > 0) {
    try {
      const stateStr = JSON.stringify(deepLink.state)
      const encoded = Buffer.from(stateStr).toString('base64')
      params.set(STATE_PARAM, encoded)
    } catch (error) {
      console.error('Failed to encode state:', error)
    }
  }

  // Add query params
  if (deepLink.query) {
    Object.entries(deepLink.query).forEach(([key, value]) => {
      params.set(key, String(value))
    })
  }

  return `/?${params.toString()}`
}

/**
 * Parse a deep link from URL search params
 *
 * @example
 * const link = parseDeepLink(new URLSearchParams(window.location.search))
 * // Returns: { screen: 'student-profile', state: { id: '123' } }
 */
export const parseDeepLink = (params: URLSearchParams): DeepLink | null => {
  const screen = params.get(BASE_PARAM) as ScreenKey | null

  if (!screen) {
    return null
  }

  const deepLink: DeepLink = { screen }

  // Parse state if present
  const stateParam = params.get(STATE_PARAM)
  if (stateParam) {
    try {
      const decoded = Buffer.from(stateParam, 'base64').toString('utf-8')
      deepLink.state = JSON.parse(decoded)
    } catch (error) {
      console.error('Failed to decode state:', error)
    }
  }

  // Parse other query params as query
  const query: Record<string, string | number | boolean> = {}
  const excludedParams = new Set([BASE_PARAM, STATE_PARAM])
  params.forEach((value, key) => {
    if (!excludedParams.has(key)) {
      // Try to parse as number or boolean
      if (value === 'true') query[key] = true
      else if (value === 'false') query[key] = false
      else if (!Number.isNaN(Number(value))) query[key] = Number(value)
      else query[key] = value
    }
  })

  if (Object.keys(query).length > 0) {
    deepLink.query = query
  }

  return deepLink
}

/**
 * Navigate to a deep link
 *
 * @example
 * navigateToDeepLink({
 *   screen: 'assignments',
 *   state: { filter: 'pending' }
 * })
 */
export const navigateToDeepLink = (deepLink: DeepLink) => {
  if (typeof window === 'undefined') {
    return
  }

  const url = buildDeepLink(deepLink)
  window.history.pushState({ deepLink }, '', url)

  // Dispatch custom event for listeners
  window.dispatchEvent(
    new CustomEvent('deeplink-change', {
      detail: deepLink,
    })
  )
}

/**
 * Replace the current URL with a deep link (no history entry)
 *
 * @example
 * replaceDeepLink({
 *   screen: 'dashboard'
 * })
 */
export const replaceDeepLink = (deepLink: DeepLink) => {
  if (typeof window === 'undefined') {
    return
  }

  const url = buildDeepLink(deepLink)
  window.history.replaceState({ deepLink }, '', url)
}

/**
 * Get the current deep link from window.location
 */
export const getCurrentDeepLink = (): DeepLink | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const params = new URLSearchParams(window.location.search)
  return parseDeepLink(params)
}

/**
 * Create a shareable link for the current state
 *
 * @example
 * const shareUrl = getShareableLink('https://ai-school.com', {
 *   screen: 'student-profile',
 *   state: { userId: '123' }
 * })
 * // Returns: https://ai-school.com/?screen=student-profile&state=...
 */
export const getShareableLink = (baseUrl: string, deepLink: DeepLink): string => {
  const url = new URL(baseUrl)
  const path = buildDeepLink(deepLink)
  return url.toString() + path
}

/**
 * Listen for deep link changes
 *
 * @example
 * const unsubscribe = onDeepLinkChange((link) => {
 *   console.log('Navigated to:', link.screen)
 * })
 */
export const onDeepLinkChange = (callback: (link: DeepLink) => void): (() => void) => {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<DeepLink>
    callback(customEvent.detail)
  }

  window.addEventListener('deeplink-change', handler)

  return () => {
    window.removeEventListener('deeplink-change', handler)
  }
}

/**
 * Convert state object to query string for URL
 */
export const stateToQueryString = (state: Record<string, string | number | boolean>): string => {
  const params = new URLSearchParams()
  Object.entries(state).forEach(([key, value]) => {
    params.set(key, String(value))
  })
  return params.toString()
}

/**
 * Convert query string to state object
 */
export const queryStringToState = (queryString: string): Record<string, string | number | boolean> => {
  const params = new URLSearchParams(queryString)
  const state: Record<string, string | number | boolean> = {}

  params.forEach((value, key) => {
    if (value === 'true') state[key] = true
    else if (value === 'false') state[key] = false
    else if (!Number.isNaN(Number(value))) state[key] = Number(value)
    else state[key] = value
  })

  return state
}
