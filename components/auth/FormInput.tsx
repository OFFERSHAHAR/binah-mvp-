'use client'

import { motion } from 'framer-motion'
import type { InputHTMLAttributes } from 'react'
import { useState } from 'react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: React.ReactNode
  helpText?: string
}

export const FormInput = ({
  label,
  error,
  icon,
  helpText,
  value,
  onChange,
  ...props
}: FormInputProps) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <label className="block mb-2 text-sm font-medium text-[#2E2E48]">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7A92] pointer-events-none">
            {icon}
          </div>
        )}

        <input
          {...props}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-3 rounded-lg font-sans text-base
            border-2 transition-all duration-300
            bg-white bg-opacity-60 backdrop-blur-sm
            ${icon ? 'pr-10' : ''}
            ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                : isFocused
                  ? 'border-[#5E5AA8] focus:ring-4 focus:ring-[#5E5AA8] focus:ring-opacity-20'
                  : 'border-[#E5E5E5] focus:border-[#5E5AA8]'
            }
            focus:outline-none
            placeholder:text-[#B0B0B0]
          `}
        />
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-medium text-red-500 mt-1.5"
        >
          {error}
        </motion.p>
      )}

      {helpText && !error && (
        <p className="text-xs text-[#7A7A92] mt-1.5">{helpText}</p>
      )}
    </motion.div>
  )
}
