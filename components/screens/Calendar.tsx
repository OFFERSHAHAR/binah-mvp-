'use client'

import { motion } from 'framer-motion'

interface CalendarData {
  month: string
  year: number
  description: string
  nextLesson: string
  nextLessonSubtitle: string
  sessions: Array<{
    id: string
    dayNumber: number
    dayName: string
    backgroundColor: string
    events: Array<{
      id: string
      time: string
      title: string
      isLive: boolean
    }>
  }>
}

const DEFAULT_DATA: CalendarData = {
  month: 'יוני',
  year: 2026,
  description: 'תזמן שיעורים, העלה חומר וצרף קישור זום מוגן.',
  nextLesson: 'AIOps · תקלה שקטה',
  nextLessonSubtitle: 'היום · 18:00 · זום חי',
  sessions: [
    {
      id: 'sun',
      dayNumber: 1,
      dayName: 'ראשון',
      backgroundColor: 'rgba(159,180,245,0.08)',
      events: [
        { id: '1', time: '16:00', title: 'מתקדמים Python', isLive: false },
        { id: '2', time: '18:00', title: 'AIOps מוניטורינג', isLive: true },
      ],
    },
    {
      id: 'mon',
      dayNumber: 2,
      dayName: 'שני',
      backgroundColor: 'rgba(195,168,238,0.08)',
      events: [
        { id: '3', time: '17:00', title: 'סוכנים בארגון', isLive: false },
      ],
    },
    {
      id: 'tue',
      dayNumber: 3,
      dayName: 'שלישי',
      backgroundColor: 'rgba(127,211,192,0.08)',
      events: [
        { id: '4', time: '15:30', title: 'עיצוב וממשק', isLive: false },
      ],
    },
    {
      id: 'wed',
      dayNumber: 4,
      dayName: 'רביעי',
      backgroundColor: 'rgba(255,208,138,0.08)',
      events: [],
    },
    {
      id: 'thu',
      dayNumber: 5,
      dayName: 'חמישי',
      backgroundColor: 'rgba(192,180,255,0.08)',
      events: [
        { id: '5', time: '14:00', title: 'פרויקט קפסטון', isLive: false },
      ],
    },
    {
      id: 'fri',
      dayNumber: 6,
      dayName: 'שישי',
      backgroundColor: 'rgba(159,180,245,0.08)',
      events: [],
    },
    {
      id: 'sat',
      dayNumber: 7,
      dayName: 'שבת',
      backgroundColor: 'rgba(127,211,192,0.08)',
      events: [
        { id: '6', time: '10:00', title: 'הגשת מטלה קבוצתית', isLive: false },
      ],
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

export const Calendar = ({ data = DEFAULT_DATA }: { data?: CalendarData }) => {
  return (
    <main className="relative flex-1 h-screen overflow-y-auto pb-12 z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8 px-10 pt-8"
      >
        <div>
          <div className="text-3xl font-black text-dark">{data.month} {data.year}</div>
          <div className="text-sm text-muted mt-1">{data.description}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-1 rounded-lg bg-gray-100">
            <button className="px-4 py-2 rounded-lg bg-white text-dark font-bold text-sm shadow-sm">
              שבוע
            </button>
            <button className="px-4 py-2 rounded-lg text-muted font-semibold text-sm">
              חודש
            </button>
          </div>
          <motion.button
            whileHover={{ y: -3, scale: 1.03 }}
            className="flex items-center gap-2 h-12 px-6 rounded-4xl bg-gradient-to-br from-[#9FB4F5] to-[#C3A8EE] text-white font-bold text-sm shadow-lg"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            שיעור חדש
          </motion.button>
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-7 gap-3 px-10 mb-8"
      >
        {data.sessions.map((session) => (
          <motion.div
            key={session.id}
            variants={itemVariants}
            className="rounded-2xl glass p-4"
            style={{ backgroundColor: session.backgroundColor }}
          >
            <div className="text-center mb-4">
              <div className="text-xs text-muted font-semibold mb-2">{session.dayName}</div>
              <div className="inline-block w-8 h-8 rounded-lg bg-white text-dark font-black text-sm flex items-center justify-center">
                {session.dayNumber}
              </div>
            </div>

            <div className="flex flex-col gap-2 min-h-[250px]">
              {session.events.map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ y: -2 }}
                  className="p-2.5 rounded-xl bg-white cursor-pointer transition-all"
                >
                  <div className="text-xs text-primary font-bold mb-1">{event.time}</div>
                  <div className="text-sm font-bold text-dark leading-tight mb-1.5">{event.title}</div>
                  {event.isLive && (
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                      <span className="text-xs font-bold text-red-500">זום חי</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Next Lesson Card */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="px-10"
      >
        <div className="rounded-2xl glass p-6 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="text-xs font-bold text-purple-600 mb-2">השיעור הבא</div>
          <div className="text-2xl font-black text-dark mb-1">{data.nextLesson}</div>
          <div className="text-sm text-muted">{data.nextLessonSubtitle}</div>
        </div>
      </motion.div>
    </main>
  )
}
