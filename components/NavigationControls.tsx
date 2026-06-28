'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useBrowserNavigation } from '@/hooks/useBrowserNavigation'

/**
 * NavigationControls
 *
 * Browser back/forward navigation buttons with keyboard support
 * - Visually disabled when unavailable
 * - Supports Alt+Left/Right (Windows/Linux) and Cmd+[/] (Mac)
 * - Animated transitions
 *
 * @example
 * <NavigationControls />
 */
export const NavigationControls = () => {
  const { canGoBack, canGoForward, goBack, goForward } = useBrowserNavigation()

  return (
    <div className="flex gap-1.5 items-center">
      {/* Back Button */}
      <motion.button
        onClick={goBack}
        disabled={!canGoBack}
        whileHover={canGoBack ? { scale: 1.05 } : undefined}
        whileTap={canGoBack ? { scale: 0.95 } : undefined}
        className={`p-2.5 rounded-lg transition-all duration-200 ${
          canGoBack
            ? 'bg-white/10 hover:bg-white/20 cursor-pointer text-gray-900 dark:text-white'
            : 'bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed'
        }`}
        aria-label="Go back"
        title="Go back (Alt+Left)"
      >
        <ChevronLeft className="w-5 h-5" />
      </motion.button>

      {/* Forward Button */}
      <motion.button
        onClick={goForward}
        disabled={!canGoForward}
        whileHover={canGoForward ? { scale: 1.05 } : undefined}
        whileTap={canGoForward ? { scale: 0.95 } : undefined}
        className={`p-2.5 rounded-lg transition-all duration-200 ${
          canGoForward
            ? 'bg-white/10 hover:bg-white/20 cursor-pointer text-gray-900 dark:text-white'
            : 'bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed'
        }`}
        aria-label="Go forward"
        title="Go forward (Alt+Right)"
      >
        <ChevronRight className="w-5 h-5" />
      </motion.button>
    </div>
  )
}

export default NavigationControls
