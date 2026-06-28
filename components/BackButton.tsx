'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useBrowserNavigation } from '@/hooks/useBrowserNavigation'

interface BackButtonProps {
  className?: string
  showLabel?: boolean
}

/**
 * BackButton
 *
 * Navigation back button with RTL support (shows right arrow in RTL)
 * - Disabled when no history available
 * - Smooth animations
 * - Accessible with keyboard support
 *
 * @example
 * <BackButton />
 * <BackButton showLabel={true} />
 */
export const BackButton = ({ className = '', showLabel = false }: BackButtonProps) => {
  const { canGoBack, goBack } = useBrowserNavigation()

  return (
    <motion.button
      onClick={goBack}
      disabled={!canGoBack}
      whileHover={canGoBack ? { x: 4 } : undefined}
      whileTap={canGoBack ? { scale: 0.95 } : undefined}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
        ${
          canGoBack
            ? 'bg-white/10 hover:bg-white/20 cursor-pointer text-gray-900 dark:text-white'
            : 'bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed'
        }
        ${className}
      `}
      aria-label="Go back to previous screen"
      title="Go back (Alt+Left or Cmd+[)"
    >
      <ArrowRight className="w-4 h-4" />
      {showLabel && <span className="text-sm font-medium hidden sm:inline">חזור</span>}
    </motion.button>
  )
}

export default BackButton
