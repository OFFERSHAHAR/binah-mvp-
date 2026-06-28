'use client'

import { motion } from 'framer-motion'

interface AuthButtonProps {
  children: React.ReactNode
  isLoading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  fullWidth?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export const AuthButton = ({
  children,
  isLoading = false,
  variant = 'primary',
  fullWidth = true,
  disabled = false,
  onClick,
  className,
  type = 'button',
}: AuthButtonProps) => {
  const baseClasses =
    'px-6 py-3 rounded-lg font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 relative'

  const variantClasses = {
    primary:
      'bg-[#5E5AA8] hover:bg-[#4C4A92] text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed',
    secondary:
      'bg-[#F8F7FD] hover:bg-[#E5E2F8] text-[#5E5AA8] border-2 border-[#5E5AA8] disabled:opacity-50 disabled:cursor-not-allowed',
    ghost:
      'text-[#5E5AA8] hover:bg-[#F8F7FD] disabled:opacity-50 disabled:cursor-not-allowed',
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={className || `${baseClasses} ${variantClasses[variant]} ${widthClass}`}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
    >
      {isLoading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
          <span>בטעינה...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}
