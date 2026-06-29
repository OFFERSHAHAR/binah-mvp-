'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAppData } from '@/hooks'
import { useAuthStore } from '@/store/authStore'
import { getAuthHeaders } from '@/lib/auth-client'

interface AdminUser {
  id: string
  email: string
  name: string
  role: 'student' | 'teacher' | 'admin'
  email_verified: boolean
  created_at: string
}

const roleLabel: Record<string, string> = { student: 'תלמיד', teacher: 'מורה', admin: 'מנהל' }

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
  const [users, setUsers] = useState<AdminUser[]>([])
  const [usersState, setUsersState] = useState<'loading' | 'ok' | 'error'>('loading')
  const [broadcast, setBroadcast] = useState('')
  const [castState, setCastState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [castResult, setCastResult] = useState('')

  const sendBroadcast = async () => {
    if (!broadcast.trim()) return
    setCastState('sending')
    try {
      const r = await fetch('/api/notify/whatsapp/broadcast', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: broadcast }),
      })
      const data = await r.json()
      if (!r.ok) {
        setCastState('error')
        setCastResult(r.status === 503 ? 'שער ה-WhatsApp לא מוגדר (מקומי/לא מחובר)' : data.error || 'שגיאה')
      } else {
        setCastState('done')
        setCastResult(`נשלח ל-${data.sent}/${data.recipients} תלמידים`)
        setBroadcast('')
      }
    } catch {
      setCastState('error')
      setCastResult('שגיאת רשת')
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  useEffect(() => {
    fetch('/api/admin/users', { headers: getAuthHeaders() })
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status))
        const data = await r.json()
        setUsers(data.users || [])
        setUsersState('ok')
      })
      .catch(() => setUsersState('error'))
  }, [])

  const totalLessons = courses.reduce((acc, c) => acc + (c.lessons || 0), 0)

  const stats = [
    { label: 'קורסים פעילים', value: courses.length || '—', grad: 'linear-gradient(135deg,#9FB4F5,#C3A8EE)' },
    { label: 'שיעורים במאגר', value: totalLessons || '—', grad: 'linear-gradient(135deg,#7FD3C0,#9AD9F0)' },
    { label: 'משתמשים רשומים', value: usersState === 'ok' ? users.length : '…', grad: 'linear-gradient(135deg,#FFD08A,#FFB0A0)' },
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

      {/* WhatsApp broadcast to students */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-2xl glass p-5 sm:p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2E9E72" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          <div className="text-base font-extrabold text-dark">שליחת תזכורת ב-WhatsApp לכל התלמידים</div>
        </div>
        <textarea
          value={broadcast} onChange={(e) => setBroadcast(e.target.value)} aria-label="הודעת שידור"
          placeholder="לדוגמה: תזכורת — שיעור היום ב-18:00. נתראה! 🎓"
          className="w-full h-24 rounded-xl bg-white/60 border border-white/70 p-3 text-sm outline-none resize-none text-right"
        />
        <div className="flex items-center justify-between gap-3 mt-2">
          <span className={`text-xs ${castState === 'error' ? 'text-red-500' : 'text-muted'}`}>{castResult}</span>
          <button onClick={sendBroadcast} disabled={!broadcast.trim() || castState === 'sending'}
            className="h-10 px-5 rounded-xl text-white text-sm font-bold bg-gradient-to-br from-[#2E9E72] to-[#7FD3C0] disabled:opacity-50 active:scale-95 transition-transform shrink-0">
            {castState === 'sending' ? 'שולח…' : 'שלח לכולם'}
          </button>
        </div>
      </motion.div>

      {/* User management — live from Supabase */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl glass p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-base font-extrabold text-dark">ניהול משתמשים</div>
          {usersState === 'ok' && <span className="text-xs text-muted">{users.length} משתמשים · Postgres</span>}
        </div>

        {usersState === 'loading' && <div className="text-sm text-muted py-6 text-center">טוען משתמשים…</div>}
        {usersState === 'error' && (
          <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">לא ניתן לטעון משתמשים — ודא שאתה מחובר כמנהל.</div>
        )}

        {usersState === 'ok' && (
          <div className="flex flex-col gap-2">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-white/80">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#9FB4F5] to-[#C3A8EE] flex items-center justify-center text-white font-bold shrink-0">
                  {u.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-dark truncate">{u.name}</div>
                  <div className="text-xs text-muted truncate" dir="ltr">{u.email}</div>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                  u.role === 'admin' ? 'bg-red-100 text-red-600' : u.role === 'teacher' ? 'bg-[#7FD3C0]/20 text-[#2E7E5E]' : 'bg-[#9FB4F5]/15 text-[#5E5AA8]'
                }`}>{roleLabel[u.role] || u.role}</span>
                {!u.email_verified && <span className="text-[10px] text-amber-600 shrink-0" title="לא אומת">●</span>}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </main>
  )
}
