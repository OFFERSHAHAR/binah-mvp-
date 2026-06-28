'use client'

import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useAppData } from '@/hooks'
import { SkeletonGrid } from '../Skeleton'

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

const DEFAULT_GRADES = [
  { subject: 'סוכני AI בארגון', grade: 92, status: 'מעולה' },
  { subject: 'Python מתחילים', grade: 88, status: 'טוב מאד' },
  { subject: 'LLMs ו-RAG', grade: 85, status: 'טוב' },
]

export const Grades = () => {
  const { grades, loadingGrades, errorGrades, fetchGrades } = useAppData()

  useEffect(() => {
    fetchGrades()
  }, [fetchGrades])

  const displayGrades = grades.length > 0 ? grades : DEFAULT_GRADES

  if (loadingGrades) {
    return (
      <main className="relative flex-1 h-screen overflow-y-auto pb-12 z-10 px-10 py-8">
        <SkeletonGrid count={3} />
      </main>
    )
  }

  if (errorGrades) {
    return (
      <main className="relative flex-1 h-screen overflow-y-auto pb-12 z-10 px-10 py-8">
        <div className="p-6 rounded-2xl glass border border-red-200">
          <div className="text-red-600 font-semibold">שגיאה בטעינת הציונים</div>
          <div className="text-sm text-red-500 mt-2">{errorGrades.message || 'Unknown error'}</div>
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
        <div className="text-3xl font-black text-dark mb-2">הציונים שלי</div>
        <div className="text-sm text-muted">סקירת הציונים והביצועים שלך בקורסים</div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-6 px-10"
      >
        {displayGrades.map((g, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="rounded-2xl glass p-6"
          >
            <div className="text-sm text-muted mb-2">{g.subject}</div>
            <div className="text-4xl font-black text-dark mb-2">{g.grade}%</div>
            <div className="text-sm font-semibold text-green-600">{g.status}</div>
          </motion.div>
        ))}
      </motion.div>
    </main>
  )
}
