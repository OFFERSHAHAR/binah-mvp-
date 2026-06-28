'use client'

import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useAppData } from '@/hooks'
import { SkeletonGrid } from '../Skeleton'

interface CurriculumData {
  title: string
  description: string
  progress: number
  tracks: Array<{
    id: string
    title: string
    description: string
    progress: number
    icon: string
    gradient: string
    lessons: number
    duration?: string
    level?: string
    hours?: number
  }>
}

const DEFAULT_DATA: CurriculumData = {
  title: 'תכנית הלימודים',
  description: 'עקוב אחר התקדמותך בתכנית הלימודים המלאה',
  progress: 42,
  tracks: [
    {
      id: 'track-1',
      title: 'יסודות Python',
      description: 'בנה בסיס חזק בשפת Python',
      progress: 100,
      icon: 'M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
      gradient: 'linear-gradient(135deg, #7FD3C0, #9AD9F0)',
      lessons: 8,
      duration: '12 שעות',
      level: 'מתחילים',
    },
    {
      id: 'track-2',
      title: 'סוכני AI בארגון',
      description: 'בנה סוכנים אינטליגנטים לעסק שלך',
      progress: 60,
      icon: 'M12 2l2.2 5.6L20 9l-5.8 1.4L12 16l-2.2-5.6L4 9z',
      gradient: 'linear-gradient(135deg, #9FB4F5, #C3A8EE)',
      lessons: 12,
      duration: '18 שעות',
      level: 'מתקדמים',
    },
    {
      id: 'track-3',
      title: 'LLMs ו-RAG',
      description: 'עבד עם מודלים גדולים של שפה',
      progress: 25,
      icon: 'M12 2l9 5v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V7z',
      gradient: 'linear-gradient(135deg, #FFD08A, #FFB0A0)',
      lessons: 10,
      duration: '15 שעות',
      level: 'מתקדמים',
    },
    {
      id: 'track-4',
      title: 'DevOps וסגל',
      description: 'פרסם וטפל בסוכנים בייצור',
      progress: 0,
      icon: 'M10 20v-6h4v6M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z',
      gradient: 'linear-gradient(135deg, #C3A8EE, #E0A8E8)',
      lessons: 8,
      duration: '12 שעות',
      level: 'מומחה',
    },
  ],
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
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

export const Curriculum = ({ data = DEFAULT_DATA }: { data?: CurriculumData }) => {
  const { courses, loadingCourses, errorCourses, fetchCourses } = useAppData()

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  // Build curriculum data from courses
  const displayData: CurriculumData = courses.length > 0
    ? {
        title: 'תכנית הלימודים',
        description: 'עקוב אחר התקדמותך בתכנית הלימודים המלאה',
        progress: Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length),
        tracks: courses.map((course) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          progress: course.progress,
          icon: course.icon,
          gradient: course.gradient,
          lessons: course.lessons,
          duration: `${course.hours} שעות`,
          level: course.progress === 100 ? 'הושלם' : 'בתהליך',
        })),
      }
    : data || DEFAULT_DATA

  if (loadingCourses) {
    return (
      <main className="relative flex-1 h-screen overflow-y-auto pb-12 z-10 px-10 py-8">
        <SkeletonGrid count={4} />
      </main>
    )
  }

  if (errorCourses) {
    return (
      <main className="relative flex-1 h-screen overflow-y-auto pb-12 z-10 px-10 py-8">
        <div className="p-6 rounded-2xl glass border border-red-200">
          <div className="text-red-600 font-semibold">שגיאה בטעינת תוכנית הלימודים</div>
          <div className="text-sm text-red-500 mt-2">{errorCourses.message || 'Unknown error'}</div>
        </div>
      </main>
    )
  }
  return (
    <main className="relative flex-1 h-screen overflow-y-auto pb-12 z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 px-10 pt-8"
      >
        <div className="text-3xl font-black text-dark mb-2">{displayData.title}</div>
        <div className="text-sm text-muted mb-6">{displayData.description}</div>

        {/* Overall Progress */}
        <div className="rounded-2xl glass p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-muted">התקדמות כוללת</span>
            <span className="text-2xl font-black text-dark">{displayData.progress}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${displayData.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-[#9FB4F5] to-[#C3A8EE]"
            />
          </div>
        </div>
      </motion.div>

      {/* Tracks Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-6 px-10"
      >
        {displayData.tracks.map((track) => (
          <motion.div
            key={track.id}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="rounded-2xl glass p-6 cursor-pointer transition-all"
          >
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{ background: track.gradient }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d={track.icon} />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-black text-dark text-lg leading-tight mb-1">{track.title}</h3>
                <p className="text-xs text-muted">{track.description}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted">התקדמות</span>
                <span className="text-sm font-bold text-dark">{track.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${track.progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                  className="h-full rounded-full"
                  style={{ background: track.gradient }}
                />
              </div>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/50">
              <div className="text-center">
                <div className="text-xs text-muted mb-1">שיעורים</div>
                <div className="font-bold text-dark">{track.lessons}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted mb-1">משך</div>
                <div className="font-bold text-dark text-sm">{track.duration}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted mb-1">רמה</div>
                <div className="font-bold text-dark text-sm">{track.level}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </main>
  )
}
