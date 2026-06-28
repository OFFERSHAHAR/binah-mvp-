import { useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useNavigationStore, type ScreenKey } from '@/store/navigationStore'

const STORAGE_KEY = 'binah_navigation_history'
const SCREEN_PARAM = 'screen'
const STATE_VERSION = 1

interface NavigationHistoryEntry {
  screen: ScreenKey
  timestamp: number
  zoomOrigin?: { x: number; y: number }
}

interface PersistenceState {
  history: NavigationHistoryEntry[]
  currentIndex: number
  version: number
}

/**
 * useNavigationPersistence
 *
 * Synchronizes navigation state with URL params and localStorage
 * - Persists screen to URL for deep linking
 * - Maintains history in localStorage for page reloads
 * - Supports browser back/forward navigation
 * - Recovers state from URL on mount
 *
 * @example
 * function App() {
 *   useNavigationPersistence()
 *   return <MainContent />
 * }
 */
export const useNavigationPersistence = () => {
  const searchParams = useSearchParams()
  const { currentScreen, setCurrentScreen } = useNavigationStore()
  const isInitializedRef = useRef(false)
  const isNavigatingRef = useRef(false)

  // Initialize from URL on mount
  useEffect(() => {
    if (isInitializedRef.current) return

    isInitializedRef.current = true
    const screenFromUrl = searchParams?.get(SCREEN_PARAM) as ScreenKey | null

    if (screenFromUrl) {
      // Set screen from URL without updating URL (already has it)
      setCurrentScreen(screenFromUrl)
      // Initialize history in localStorage
      initializeHistoryFromUrl(screenFromUrl)
    } else {
      // Try to restore from localStorage
      const stored = restoreFromStorage()
      if (stored) {
        setCurrentScreen(stored.screen)
        // Update URL to match restored state
        updateUrl(stored.screen)
      } else {
        // First time visit - update URL with default screen
        updateUrl(currentScreen)
      }
    }
  }, [])

  // Sync store changes to URL and storage
  useEffect(() => {
    if (!isInitializedRef.current) return
    if (isNavigatingRef.current) return

    // Update URL when screen changes
    updateUrl(currentScreen)

    // Update history in localStorage
    addToHistory(currentScreen)
  }, [currentScreen])

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      isNavigatingRef.current = true
      const screenFromUrl = new URLSearchParams(window.location.search).get(
        SCREEN_PARAM
      ) as ScreenKey | null

      if (screenFromUrl) {
        setCurrentScreen(screenFromUrl)
      }
      setTimeout(() => {
        isNavigatingRef.current = false
      }, 0)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [setCurrentScreen])

  // Utility functions
  const updateUrl = useCallback((screen: ScreenKey) => {
    const url = new URL(window.location.href)
    url.searchParams.set(SCREEN_PARAM, screen)
    window.history.replaceState({ screen }, '', url.toString())
  }, [])

  const addToHistory = useCallback((screen: ScreenKey) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      let state: PersistenceState = {
        history: [],
        currentIndex: 0,
        version: STATE_VERSION,
      }

      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.version === STATE_VERSION) {
          state = parsed
        }
      }

      // Add new entry if it's different from the last one
      const lastEntry = state.history[state.currentIndex]
      if (!lastEntry || lastEntry.screen !== screen) {
        // Remove any forward history when navigating to a new screen
        state.history = state.history.slice(0, state.currentIndex + 1)
        state.history.push({
          screen,
          timestamp: Date.now(),
          zoomOrigin: undefined,
        })
        state.currentIndex = state.history.length - 1
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error('Failed to save navigation history:', error)
    }
  }, [])

  const goBack = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return

      const state: PersistenceState = JSON.parse(stored)
      if (state.currentIndex > 0) {
        state.currentIndex -= 1
        const entry = state.history[state.currentIndex]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

        isNavigatingRef.current = true
        setCurrentScreen(entry.screen)
        updateUrl(entry.screen)

        setTimeout(() => {
          isNavigatingRef.current = false
        }, 0)
      }
    } catch (error) {
      console.error('Failed to navigate back:', error)
    }
  }, [setCurrentScreen, updateUrl])

  const goForward = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return

      const state: PersistenceState = JSON.parse(stored)
      if (state.currentIndex < state.history.length - 1) {
        state.currentIndex += 1
        const entry = state.history[state.currentIndex]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

        isNavigatingRef.current = true
        setCurrentScreen(entry.screen)
        updateUrl(entry.screen)

        setTimeout(() => {
          isNavigatingRef.current = false
        }, 0)
      }
    } catch (error) {
      console.error('Failed to navigate forward:', error)
    }
  }, [setCurrentScreen, updateUrl])

  const canGoBack = useCallback((): boolean => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return false
      const state: PersistenceState = JSON.parse(stored)
      return state.currentIndex > 0
    } catch {
      return false
    }
  }, [])

  const canGoForward = useCallback((): boolean => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return false
      const state: PersistenceState = JSON.parse(stored)
      return state.currentIndex < state.history.length - 1
    } catch {
      return false
    }
  }, [])

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      isInitializedRef.current = false
    } catch (error) {
      console.error('Failed to clear navigation history:', error)
    }
  }, [])

  return {
    goBack,
    goForward,
    canGoBack,
    canGoForward,
    clearHistory,
  }
}

// Helper functions
function initializeHistoryFromUrl(screen: ScreenKey) {
  try {
    const state: PersistenceState = {
      history: [
        {
          screen,
          timestamp: Date.now(),
        },
      ],
      currentIndex: 0,
      version: STATE_VERSION,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to initialize history:', error)
  }
}

function restoreFromStorage(): NavigationHistoryEntry | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const state: PersistenceState = JSON.parse(stored)
    if (state.version !== STATE_VERSION) return null

    const entry = state.history[state.currentIndex]
    return entry || null
  } catch (error) {
    console.error('Failed to restore from storage:', error)
    return null
  }
}

/**
 * Gets the full navigation history from storage
 */
export const getNavigationHistory = (): PersistenceState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  } catch (error) {
    console.error('Failed to get navigation history:', error)
    return null
  }
}

/**
 * Clears all navigation history
 */
export const clearNavigationHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear navigation history:', error)
  }
}
