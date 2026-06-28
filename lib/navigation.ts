/**
 * Navigation utilities for URL-based screen routing
 */

import { type ScreenKey } from '@/store/navigationStore'

/**
 * Valid screen keys for URL-based navigation
 */
export const VALID_SCREENS: ScreenKey[] = [
  'dashboard',
  'student-profile',
  'calendar',
  'curriculum',
  'lessons',
  'assignments',
  'grades',
  'messages',
  'resources',
  'settings',
]

/**
 * Validates a screen parameter from URL
 */
export const isValidScreen = (screen: string | undefined): screen is ScreenKey => {
  if (!screen) return false
  const normalizedScreen = decodeURIComponent(screen).toLowerCase()
  return VALID_SCREENS.includes(normalizedScreen as ScreenKey)
}

/**
 * Normalizes a screen parameter for URL usage
 */
export const normalizeScreenParam = (screen: string | undefined): ScreenKey | null => {
  if (!screen) return null
  const normalizedScreen = decodeURIComponent(screen).toLowerCase()
  if (VALID_SCREENS.includes(normalizedScreen as ScreenKey)) {
    return normalizedScreen as ScreenKey
  }
  return null
}

/**
 * Gets the URL path for a screen
 */
export const getScreenPath = (screen: ScreenKey): string => {
  return `/${screen}`
}

/**
 * Extracts screen ID from pathname
 */
export const getScreenFromPathname = (pathname: string): ScreenKey | null => {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return null
  const screen = parts[0]
  return normalizeScreenParam(screen)
}

/**
 * History management utilities
 */
export const navigateToScreen = (screen: ScreenKey): string => {
  return getScreenPath(screen)
}

export const navigateToDashboard = (): string => {
  return getScreenPath('dashboard')
}
