'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useNavigationStore } from '@/store/navigationStore'
import { useAuthStore } from '@/store/authStore'
import { UserMenu } from './UserMenu'

export const Sidebar = () => {
  const { screens } = useNavigationStore()
  const { user } = useAuthStore()
  const pathname = usePathname()

  // Admin-only screens are hidden unless the signed-in user is an admin.
  const visibleScreens = screens.filter((s) => !s.adminOnly || user?.role === 'admin')

  // Extract current screen from pathname
  const currentScreen = pathname.split('/').pop() || 'dashboard'

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-0 w-[236px] h-screen flex-shrink-0 flex flex-col gap-2 p-6 glass-intense z-20 border-r border-white/75 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-2 pb-5 flex-shrink-0">
        <div className="w-10 h-10 rounded-[13px] bg-gradient-to-br from-[#9FB4F5] to-[#C3A8EE] flex items-center justify-center shadow-lg">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
          >
            <path d="M12 3v18M3 12h18" />
          </svg>
        </div>
        <div>
          <div className="text-lg font-black text-dark leading-tight">בִּינָה</div>
          <div className="text-[10.5px] font-semibold text-gray-500 tracking-wider mt-1">
            AI ACADEMY
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <motion.nav
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-1 flex-1 min-h-0 overflow-y-auto"
      >
        {visibleScreens.map((screen) => {
          const isActive = currentScreen === screen.id
          return (
            <Link
              key={screen.id}
              href={`/${screen.id}`}
              prefetch
            >
              <motion.div
                variants={itemVariants}
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex-shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-br from-blue-100 to-purple-100 border border-white/80 text-[#5E5AA8] shadow-sm'
                    : 'text-[#7A7A92] hover:bg-blue-100/40 hover:text-[#5E5AA8]'
                }`}
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d={screen.icon} />
                </svg>
                <span>{screen.title}</span>
              </motion.div>
            </Link>
          )
        })}
      </motion.nav>

      {/* Graduates Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-[18px] bg-gradient-to-br from-[#D7F5E6] to-[#CDEBF5] border border-white/80"
      >
        <div className="text-[12.5px] font-bold text-[#2E7E5E] mb-1">
          🎓 מסלול בוגרים
        </div>
        <div className="text-[11.5px] text-[#4E7E6E] leading-relaxed">
          בסיום הקורס תוכל להצטרף למאגר הבוגרים ולקחת חלק פעיל בבית הספר.
        </div>
      </motion.div>

      {/* User Menu */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 pt-4 border-t border-white/50"
      >
        <UserMenu />
      </motion.div>
    </motion.aside>
  )
}
