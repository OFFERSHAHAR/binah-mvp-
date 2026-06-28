'use client'

import { motion } from 'framer-motion'

interface LessonItem {
  id: string
  number: number
  title: string
  description: string
  duration: string
  videoTime: string
  isCompleted: boolean
  isLocked: boolean
  difficulty: string
}

interface LessonsData {
  courseTitle: string
  courseProgress: number
  lessons: LessonItem[]
}

const DEFAULT_DATA: LessonsData = {
  courseTitle: 'סוכני AI בארגון',
  courseProgress: 60,
  lessons: [
    {
      id: '1',
      number: 1,
      title: 'מבוא לסוכנים',
      description: 'הכירו עם עיקרונות הסוכנים והיכן הם משמשים',
      duration: '45 דק׳',
      videoTime: '12:34',
      isCompleted: true,
      isLocked: false,
      difficulty: 'מתחילים',
    },
    {
      id: '2',
      number: 2,
      title: 'בנייה בלוק-בלוק',
      description: 'בנה את הסוכן שלך מרכיבים בסיסיים',
      duration: '60 דק׳',
      videoTime: '24:15',
      isCompleted: true,
      isLocked: false,
      difficulty: 'מתחילים',
    },
    {
      id: '3',
      number: 3,
      title: 'אינטגרציה עם ממשק',
      description: 'חבר את הסוכן שלך לממשקים חיצוניים',
      duration: '50 דק׳',
      videoTime: '18:42',
      isCompleted: true,
      isLocked: false,
      difficulty: 'מתחילים',
    },
    {
      id: '4',
      number: 4,
      title: 'בניית סוכן מוניטורינג',
      description: 'צור סוכן שמעקב וממלא דירוג',
      duration: '55 דק׳',
      videoTime: '19:28',
      isCompleted: false,
      isLocked: false,
      difficulty: 'מתקדמים',
    },
    {
      id: '5',
      number: 5,
      title: 'טיוב וביטול שגיאות',
      description: 'חפש באגים והתאים את הסוכן שלך',
      duration: '40 דק׳',
      videoTime: '16:10',
      isCompleted: false,
      isLocked: true,
      difficulty: 'מתקדמים',
    },
  ],
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
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

export const Lessons = ({ data = DEFAULT_DATA }: { data?: LessonsData }) => {
  return (
    <main className="relative flex-1 h-screen overflow-y-auto pb-12 z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 px-10 pt-8"
      >
        <div className="text-3xl font-black text-dark mb-2">{data.courseTitle}</div>
        <div className="text-sm text-muted mb-4">השלם שיעורים כדי לתרגל את הכישורים שלך</div>

        {/* Progress Card */}
        <div className="rounded-2xl glass p-4 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-dark">התקדמות קורס</span>
            <span className="text-xl font-black text-dark">{data.courseProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.courseProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-[#9FB4F5] to-[#C3A8EE]"
            />
          </div>
        </div>
      </motion.div>

      {/* Lessons List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4 px-10"
      >
        {data.lessons.map((lesson) => (
          <motion.div
            key={lesson.id}
            variants={itemVariants}
            whileHover={!lesson.isLocked ? { y: -3 } : {}}
            className={`rounded-2xl glass p-5 cursor-pointer transition-all ${
              lesson.isLocked ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Lesson Number / Icon */}
              <div className="flex-shrink-0">
                {lesson.isCompleted ? (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                ) : lesson.isLocked ? (
                  <div className="w-12 h-12 rounded-lg bg-gray-300 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M12 1v6m0 6v6m6-9h-6m-6 0h-6M3 8v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#9FB4F5] to-[#C3A8EE] flex items-center justify-center text-white font-bold">
                    {lesson.number}
                  </div>
                )}
              </div>

              {/* Lesson Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-dark text-lg leading-tight">{lesson.title}</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/70 text-muted flex-shrink-0">
                    {lesson.difficulty}
                  </span>
                </div>
                <p className="text-sm text-muted mb-3">{lesson.description}</p>

                <div className="flex items-center gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                    {lesson.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                    {lesson.videoTime}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </main>
  )
}
