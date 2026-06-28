import { useEffect, useState } from 'react'
import { useNavigationPersistence } from './useNavigationPersistence'

/**
 * useBrowserNavigation
 *
 * Provides browser navigation state and handlers
 * - Tracks if back/forward buttons are available
 * - Handles keyboard shortcuts (Alt+Left/Right, Cmd+[/])
 * - Updates state reactively
 *
 * @example
 * function NavigationButtons() {
 *   const { canGoBack, canGoForward, goBack, goForward } = useBrowserNavigation()
 *   return (
 *     <>
 *       <button onClick={goBack} disabled={!canGoBack}>Back</button>
 *       <button onClick={goForward} disabled={!canGoForward}>Forward</button>
 *     </>
 *   )
 * }
 */
export const useBrowserNavigation = () => {
  const { goBack, goForward, canGoBack, canGoForward } = useNavigationPersistence()
  const [canNavigateBack, setCanNavigateBack] = useState(false)
  const [canNavigateForward, setCanNavigateForward] = useState(false)

  // Initial state
  useEffect(() => {
    setCanNavigateBack(canGoBack())
    setCanNavigateForward(canGoForward())
  }, [canGoBack, canGoForward])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+Left (or Cmd+[ on Mac)
      if (
        (e.altKey && e.key === 'ArrowLeft') ||
        (e.metaKey && e.key === '[')
      ) {
        e.preventDefault()
        if (canNavigateBack) {
          goBack()
          setCanNavigateBack(canGoBack())
          setCanNavigateForward(true)
        }
      }

      // Alt+Right (or Cmd+] on Mac)
      if (
        (e.altKey && e.key === 'ArrowRight') ||
        (e.metaKey && e.key === ']')
      ) {
        e.preventDefault()
        if (canNavigateForward) {
          goForward()
          setCanNavigateForward(canGoForward())
          setCanNavigateBack(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canNavigateBack, canNavigateForward, goBack, goForward, canGoBack, canGoForward])

  return {
    canGoBack: canNavigateBack,
    canGoForward: canNavigateForward,
    goBack: () => {
      goBack()
      setCanNavigateBack(canGoBack())
      setCanNavigateForward(true)
    },
    goForward: () => {
      goForward()
      setCanNavigateForward(canGoForward())
      setCanNavigateBack(true)
    },
  }
}

/**
 * Browser navigation state and methods
 */
export interface BrowserNavigationState {
  canGoBack: boolean
  canGoForward: boolean
  goBack: () => void
  goForward: () => void
}
