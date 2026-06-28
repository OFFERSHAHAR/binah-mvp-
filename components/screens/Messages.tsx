'use client'

import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useAppData } from '@/hooks'
import { SkeletonList } from '../Skeleton'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const DEFAULT_MESSAGES = [
  { from: 'המורה: אלעד גבע', text: 'שלום! איך הלימוד הולך?', time: 'היום 14:23' },
  { from: 'כיתה: סוכני AI', text: 'מי עוזר לי עם הפרויקט?', time: 'אתמול 18:10' },
  { from: 'סקי: רוניה אלדר', text: 'צירוף קובץ לבדיקה...', time: 'שני 10:45' },
]

export const Messages = () => {
  const { messages, loadingMessages, errorMessages, fetchMessages } = useAppData()

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const displayMessages = messages.length > 0 ? messages : DEFAULT_MESSAGES

  if (loadingMessages) {
    return (
      <main className="relative flex-1 h-screen overflow-y-auto pb-12 z-10 px-10 py-8">
        <SkeletonList count={5} />
      </main>
    )
  }

  if (errorMessages) {
    return (
      <main className="relative flex-1 h-screen overflow-y-auto pb-12 z-10 px-10 py-8">
        <div className="p-6 rounded-2xl glass border border-red-200">
          <div className="text-red-600 font-semibold">שגיאה בטעינת ההודעות</div>
          <div className="text-sm text-red-500 mt-2">{errorMessages.message || 'Unknown error'}</div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative flex-1 h-screen overflow-y-auto pb-12 z-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 px-10 pt-8"
      >
        <div className="text-3xl font-black text-dark mb-2">הודעות</div>
        <div className="text-sm text-muted">דיונים וחדר כיתה</div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-3 px-10"
      >
        {displayMessages.map((m, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="rounded-2xl glass p-4 cursor-pointer hover:bg-white/40"
          >
            <div className="flex items-start justify-between mb-1">
              <div className="font-bold text-dark text-sm">{m.from}</div>
              <div className="text-xs text-muted">{m.time}</div>
            </div>
            <div className="text-sm text-muted">{m.text}</div>
          </motion.div>
        ))}
      </motion.div>
    </main>
  )
}
