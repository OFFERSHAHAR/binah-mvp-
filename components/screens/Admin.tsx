'use client'

import { motion } from 'framer-motion'
import { useEffect } from 'react'
import Link from 'next/link'
import { useAppData } from '@/hooks'
import { useAuthStore } from '@/store/authStore'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export const Admin = () => {
  const { user } = useAuthStore()
  const { courses, fetchCourses } = useAppData()

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const totalLessons = courses.reduce((acc, c) => acc + (c.lessons || 0), 0)

  const stats = [
    { label: 'קורסים פעילים', value: courses.length || '—', grad: 'linear-gradient(135deg,#9FB4F5,#C3A8EE)' },
    { label: 'שיעורים במאגר', value: totalLessons || '—', grad: 'linear-gradient(135deg,#7FD3C0,#9AD9F0)' },
    { label: 'משתמשים רשומים', value: 'Supabase', grad: 'linear-gradient(135deg,#FFD08A,#FFB0A0)' },
    { label: 'מצב מערכת', value: 'תקין', grad: 'linear-gradient(135deg,#C3A8EE,#E0A8E8)' },
  ]

  const actions = [
    { label: 'בניית שיעור חדש', desc: 'צור שיעור אוטומטית מווידאו', href: '/lesson-builder', icon: 'M4 4h16v16H4zM8 9h8M8 13h5' },
    { label: 'חדר שידור', desc: 'הקלטה ושידור חי', href: '/record', icon: 'M12 14a4 4 0 0 0 4-4V6a4 4 0 0 0-8 0v4a4 4 0 0 0 4 4zM19 10a7 7 0 0 1-14 0M12 17v4M8 21h8' },
    { label: 'תכנית הלימודים', desc: 'נהל קורסים ומסלולים', href: '/curriculum', icon: 'M22 10 12 5 2 10l10 5 10-5z' },
  ]

  return (
    <main className="relative flex-1 h-screen overflow-y-auto pb-16 z-10 px-6 md:px-8 py-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-dark">ממשק ניהול</h1>
          <span className="text-xs font-bold text-[#5E5AA8] bg-[#9FB4F5]/15 px-3 py-1 rounded-full">
            מנהל · {user?.name || 'admin'}
          </span>
        </div>
        <p className="text-sm text-muted mt-1">סקירת פלטפורמה, ניהול תוכן ומשתמשים.</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {stats.map((s) => (
          <motion.div key={s.label} variants={itemVariants} className="rounded-2xl glass p-5">
            <div className="w-10 h-10 rounded-xl mb-3 shadow" style={{ background: s.grad }} />
            <div className="text-2xl font-black text-dark">{s.value}</div>
            <div className="text-xs text-muted mt-1">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {actions.map((a) => (
          <motion.div key={a.href} variants={itemVariants}>
            <Link href={a.href} className="block rounded-2xl glass p-5 hover:-translate-y-1 transition-transform">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#9FB4F5] to-[#C3A8EE] flex items-center justify-center shadow mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={a.icon} />
                </svg>
              </div>
              <div className="font-bold text-dark">{a.label}</div>
              <div className="text-xs text-muted mt-1">{a.desc}</div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* User management — honest placeholder */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl glass p-6">
        <div className="text-base font-extrabold text-dark mb-2">ניהול משתמשים</div>
        <p className="text-sm text-muted leading-relaxed">
          ניהול משתמשים, תפקידים והרשאות יהיה זמין לאחר חיבור מסד הנתונים (Supabase).
          כרגע המשתמשים נשמרים זמנית בזיכרון ואינם פרסיסטנטיים.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
          ⚠️ דורש חיבור Supabase לניהול מלא
        </div>
      </motion.div>
    </main>
  )
}
