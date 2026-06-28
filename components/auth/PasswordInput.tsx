'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { FormInput } from './FormInput'

interface PasswordInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  error?: string
  helpText?: string
  showStrength?: boolean
}

const getPasswordStrength = (
  password: string
): { level: 'weak' | 'fair' | 'good' | 'strong'; score: number } => {
  let score = 0

  if (password.length >= 6) score += 1
  if (password.length >= 10) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  if (score <= 1) return { level: 'weak', score: 1 }
  if (score <= 2) return { level: 'fair', score: 2 }
  if (score <= 3) return { level: 'good', score: 3 }
  return { level: 'strong', score: 4 }
}

const strengthColors = {
  weak: '#EF4444',
  fair: '#F59E0B',
  good: '#3B82F6',
  strong: '#10B981',
}

const strengthLabels = {
  weak: 'חלשה',
  fair: 'בינונית',
  good: 'חזקה',
  strong: 'חזקה מאוד',
}

export const PasswordInput = ({
  label = 'סיסמה',
  value,
  onChange,
  error,
  helpText,
  showStrength = false,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const strength = showStrength ? getPasswordStrength(value) : null

  return (
    <div className="w-full">
      <FormInput
        label={label}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        helpText={helpText}
        icon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-[#7A7A92] hover:text-[#5E5AA8] transition-colors"
            aria-label={showPassword ? 'הסתר סיסמה' : 'הראה סיסמה'}
          >
            {showPassword ? (
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                  clipRule="evenodd"
                />
                <path d="M15.171 13.576l1.414 1.414A1 1 0 0018 12.414v-2a4 4 0 00-4-4h-3.586l2.757 2.757z" />
              </svg>
            )}
          </button>
        }
      />

      {showStrength && strength && value.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#7A7A92]">
              חוזק סיסמה:
            </span>
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-1 w-2 rounded-full transition-colors"
                  style={{
                    backgroundColor:
                      i < strength.score
                        ? strengthColors[strength.level]
                        : '#E5E5E5',
                  }}
                />
              ))}
            </div>
            <span
              className="text-xs font-medium"
              style={{ color: strengthColors[strength.level] }}
            >
              {strengthLabels[strength.level]}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
