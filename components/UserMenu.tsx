'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'

export const UserMenu = () => {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  if (!user) return null

  return (
    <div className="relative">
      {/* User Avatar Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F8F7FD] transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9FB4F5] to-[#C3A8EE] flex items-center justify-center text-sm font-semibold text-white">
          {user.name.charAt(0)}
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-56 glass rounded-lg shadow-lg py-2 z-50"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-[#E5E5E5]">
              <p className="font-semibold text-[#2E2E48]">{user.name}</p>
              <p className="text-xs text-[#7A7A92]">{user.email}</p>
              <p className="text-xs text-[#5E5AA8] mt-1 capitalize">
                {user.role === 'student'
                  ? 'תלמיד'
                  : user.role === 'teacher'
                    ? 'מורה'
                    : 'מנהל'}
              </p>
            </div>

            {/* Menu Items */}
            <button
              onClick={() => {
                router.push('/student-profile')
                setIsOpen(false)
              }}
              className="w-full text-right px-4 py-2 text-[#2E2E48] hover:bg-[#F8F7FD] transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              פרופיל
            </button>

            <button
              onClick={() => {
                router.push('/settings')
                setIsOpen(false)
              }}
              className="w-full text-right px-4 py-2 text-[#2E2E48] hover:bg-[#F8F7FD] transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L9 5.414V18a1 1 0 102 0V5.414l6.293 6.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              הגדרות
            </button>

            {/* Divider */}
            <div className="border-b border-[#E5E5E5] my-2" />

            {/* Logout Button */}
            <motion.button
              onClick={handleLogout}
              className="w-full text-right px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              whileHover={{ x: -2 }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              יציאה
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close on outside click */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
