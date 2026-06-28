'use client'

import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useAppData } from '@/hooks'
import { useAuthStore } from '@/store/authStore'
import { SkeletonCard, SkeletonGrid } from '../Skeleton'

interface DashboardData {
  greeting: string
  remaining: number
  overall: number
  lessonsDone: number
  lessonsTotal: number
  avgScore: number
  streak: number
  heroCourse: string
  heroLesson: string
  heroProgress: number
  heroModule: number
  courses: Array<{
    id: string
    title: string
    icon: string
    gradient: string
    progress: number
    lessons: number
    exams: number
    hours: number
    tag: string
    tagColor: string
    tagBg: string
  }>
  resources: Array<{
    id: string
    title: string
    icon: string
    gradient: string
    type: string
  }>
}

const DEFAULT_DATA: DashboardData = {
  greeting: 'בוקר טוב, דנה',
  remaining: 3,
  overall: 67,
  lessonsDone: 8,
  lessonsTotal: 12,
  avgScore: 88,
  streak: 5,
  heroCourse: 'סוכני AI בארגון',
  heroLesson: 'בניית סוכן מוניטורינג Drift',
  heroProgress: 60,
  heroModule: 3,
  courses: [
    {
      id: 'ai-agents',
      title: 'סוכני AI בארגון',
      icon: 'M12 2l2.2 5.6L20 9l-5.8 1.4L12 16l-2.2-5.6L4 9z',
      gradient: 'linear-gradient(135deg, #9FB4F5, #C3A8EE)',
      progress: 60,
      lessons: 12,
      exams: 3,
      hours: 18,
      tag: 'בעבודה',
      tagColor: '#E5821A',
      tagBg: 'rgba(255,191,140,0.2)',
    },
    {
      id: 'python-basics',
      title: 'Python מתחילים',
      icon: 'M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
      gradient: 'linear-gradient(135deg, #7FD3C0, #9AD9F0)',
      progress: 100,
      lessons: 8,
      exams: 2,
      hours: 12,
      tag: 'הושלם',
      tagColor: '#2E7E5E',
      tagBg: 'rgba(111,214,168,0.16)',
    },
  ],
  resources: [
    {
      id: 'resource-1',
      title: 'מצגת: Prompt Engineering',
      icon: 'M12 2l9 5v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V7z',
      gradient: 'linear-gradient(135deg, #9FB4F5, #C3A8EE)',
      type: 'מצגת',
    },
    {
      id: 'resource-2',
      title: 'קוד: API Integration',
      icon: 'M10 20v-6h4v6M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z',
      gradient: 'linear-gradient(135deg, #7FD3C0, #9AD9F0)',
      type: 'קוד',
    },
    {
      id: 'resource-3',
      title: 'וידאו: LLM Fundamentals',
      icon: 'M23 7l-7 5 7 5V7z',
      gradient: 'linear-gradient(135deg, #FFD08A, #FFB0A0)',
      type: 'וידאו',
    },
    {
      id: 'resource-4',
      title: 'מאמר: Agent Architecture',
      icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
      gradient: 'linear-gradient(135deg, #C3A8EE, #E0A8E8)',
      type: 'מאמר',
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

export const Dashboard = ({ data = DEFAULT_DATA }: { data?: DashboardData }) => {
  const { courses, loadingCourses, errorCourses, fetchCourses } = useAppData()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  // Build display data from API or fallback
  const displayData: DashboardData = {
    ...DEFAULT_DATA,
    ...(courses.length > 0 && {
      heroCourse: courses[0]?.title || DEFAULT_DATA.heroCourse,
      heroProgress: courses[0]?.progress || DEFAULT_DATA.heroProgress,
      overall: Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length),
      courses: courses.slice(0, 2).map((course) => ({
        id: course.id,
        title: course.title,
        icon: course.icon,
        gradient: course.gradient,
        progress: course.progress,
        lessons: course.lessons,
        exams: course.exams || 3,
        hours: course.hours,
        tag: course.progress === 100 ? 'הושלם' : 'בעבודה',
        tagColor: course.progress === 100 ? '#2E7E5E' : '#E5821A',
        tagBg: course.progress === 100 ? 'rgba(111,214,168,0.16)' : 'rgba(255,191,140,0.2)',
      })),
    }),
  }

  // Use provided data if available
  const finalData = courses.length > 0 ? displayData : data || DEFAULT_DATA

  if (loadingCourses) {
    return (
      <main className="relative flex-1 h-screen overflow-y-auto pb-12 z-10 px-10 py-8">
        <div className="space-y-8">
          <SkeletonCard />
          <SkeletonGrid count={2} />
          <SkeletonCard />
        </div>
      </main>
    )
  }

  if (errorCourses) {
    return (
      <main className="relative flex-1 h-screen overflow-y-auto pb-12 z-10 px-10 py-8">
        <div className="p-6 rounded-2xl glass border border-red-200">
          <div className="text-red-600 font-semibold">שגיאה בטעינת הקורסים</div>
          <div className="text-sm text-red-500 mt-2">{errorCourses?.message || 'Unknown error'}</div>
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
        className="flex items-center justify-between mb-7 px-10 pt-8"
      >
        <div>
          <div className="text-3xl font-black text-dark">
            {user?.name ? `שלום, ${user.name.split(' ')[0]}` : finalData.greeting} 👋
          </div>
          <div className="text-sm text-muted mt-1">
            המשך מהמקום שעצרת — נשארו לך עוד {finalData.remaining} שיעורים השבוע.
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="חיפוש שיעור או נושא…"
            className="h-11 px-4 rounded-[15px] bg-white/65 border border-white/85 placeholder-gray-400 text-sm"
          />
          <div className="h-11 px-3 rounded-[15px] bg-white/65 border border-white/85 flex items-center gap-2 text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            מתחיל
          </div>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-end gap-6 px-10 pb-8 mb-8"
      >
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 h-8 px-3 rounded-4xl bg-white/55 border border-white/70 text-xs font-semibold text-gray-600 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            ממשיכים ללמוד
          </div>
          <div className="text-xs text-gray-600 mb-1">{finalData.heroCourse}</div>
          <div className="text-3xl font-black text-dark leading-tight mb-5">
            {finalData.heroLesson}
          </div>
          <motion.button
            whileHover={{ y: -3, scale: 1.03 }}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-4xl bg-white text-blue-700 font-bold text-base shadow-lg"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            המשך שיעור
          </motion.button>
          <div className="text-sm text-gray-600 mt-3">
            מודול {finalData.heroModule} · {finalData.heroProgress}% הושלם
          </div>
        </div>

        {/* Progress Circle */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg
            width="150"
            height="150"
            viewBox="0 0 150 150"
            className="transform -rotate-90"
          >
            <circle
              cx="75"
              cy="75"
              r="64"
              fill="none"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="13"
            />
            <circle
              cx="75"
              cy="75"
              r="64"
              fill="none"
              stroke="#46C99A"
              strokeWidth="13"
              strokeLinecap="round"
              strokeDasharray={`${(finalData.heroProgress / 100) * 402} 402`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-dark">
            <div className="text-4xl font-black">{finalData.heroProgress}%</div>
            <div className="text-xs text-gray-600">בקורס</div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-4 gap-4 px-10 mb-8"
      >
        {[
          { label: 'התקדמות כוללת', value: `${finalData.overall}%`, color: '#9FB4F5' },
          { label: 'שיעורים שהושלמו', value: `${finalData.lessonsDone} / ${finalData.lessonsTotal}`, color: '#3DAE80' },
          { label: 'ממוצע מבחנים', value: `${finalData.avgScore}%`, color: '#A88AE0' },
          { label: 'רצף למידה', value: `${finalData.streak} ימים`, color: '#F2942E' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="p-5 rounded-[22px] glass"
          >
            <div className="text-xs text-muted font-semibold mb-2">{stat.label}</div>
            <div className="text-2xl font-black text-dark">{stat.value}</div>
            <div
              className="h-1.5 rounded-full mt-3 bg-gray-200"
              style={{ background: `linear-gradient(90deg, ${stat.color}, #C3A8EE)` }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Courses Section */}
      <motion.div variants={itemVariants} className="px-10 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-dark">הקורסים שלי</h2>
          <a href="#" className="text-sm font-semibold text-blue-700 hover:text-blue-600">
            הצג הכל
          </a>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-5"
        >
          {finalData.courses.map((course) => (
            <motion.div
              key={course.id}
              variants={itemVariants}
              whileHover={{ y: -7 }}
              className="p-5 rounded-2xl glass"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-14 h-14 rounded-4xl flex items-center justify-center flex-shrink-0 shadow-lg"
                  style={{ background: course.gradient }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d={course.icon} />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-black text-dark">{course.title}</div>
                  <div className="text-xs text-gray-400 mt-1">{course.lessons} שיעורים</div>
                </div>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ color: course.tagColor, background: course.tagBg }}
                >
                  {course.tag}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-muted mb-2">
                <span>התקדמות</span>
                <span className="font-bold text-dark">{course.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 mb-4 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${course.progress}%`,
                    background: course.gradient,
                  }}
                />
              </div>

              <div className="flex items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4" />
                  </svg>
                  {course.exams} מבחנים
                </span>
                <span className="flex items-center gap-1">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  {course.hours} שעות
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Resources Section */}
      <motion.div variants={itemVariants} className="px-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-dark">מצגות ומשאבים</h2>
          <a href="#" className="text-sm font-semibold text-blue-700 hover:text-blue-600">
            הצג הכל
          </a>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-4 gap-4"
        >
          {finalData.resources.map((resource) => (
            <motion.a
              key={resource.id}
              href="#"
              variants={itemVariants}
              whileHover={{ y: -7, scale: 1.015 }}
              className="rounded-2xl glass overflow-hidden"
            >
              <div
                className="h-24 flex items-center justify-center"
                style={{ background: resource.gradient }}
              />
              <div className="p-4">
                <div className="text-xs text-gray-500 mb-1">{resource.type}</div>
                <div className="text-sm font-bold text-dark line-clamp-2">{resource.title}</div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </motion.div>
    </main>
  )
}
