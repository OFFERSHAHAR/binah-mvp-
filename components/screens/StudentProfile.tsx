'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'

interface StudentData {
  name: string
  avatarInitial: string
  title: string
  description: string
  progress: number
  avgGrade: number
  lessonsCompleted: number
  streak: number
  projects: Array<{
    id: string
    title: string
    tech: string
    status: 'in_progress' | 'completed' | 'pending'
    gradient: string
    icon: string
  }>
  stats: Array<{
    value: string
    label: string
    color: string
  }>
  info: Array<{
    label: string
    value: string
    icon: string
  }>
  badges: Array<{
    label: string
    icon: string
    gradient: string
    opacity: number
  }>
  contacts: Array<{
    icon: string
  }>
}

const DEFAULT_DATA: StudentData = {
  name: 'דנה לוי',
  avatarInitial: 'ד',
  title: 'מהנדסת תוכנה',
  description: 'לומדת לבנות סוכני AI לארגון שלי 🚀',
  progress: 50,
  avgGrade: 88,
  lessonsCompleted: 3,
  streak: 5,
  projects: [
    {
      id: 'drift-monitor',
      title: 'סוכן ניטור Drift',
      tech: 'Python · בליווי שבי',
      status: 'in_progress',
      gradient: 'linear-gradient(135deg,#9FB4F5,#C3A8EE)',
      icon: 'M12 2l2.2 5.6L20 9l-5.8 1.4L12 16l-2.2-5.6L4 9z',
    },
    {
      id: 'customer-bot',
      title: 'בוט שירות לקוחות',
      tech: 'LangChain · הוגש',
      status: 'completed',
      gradient: 'linear-gradient(135deg,#7FD3C0,#9AD9F0)',
      icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    },
  ],
  stats: [
    { value: '50%', label: 'התקדמות', color: '#5E5AA8' },
    { value: '88%', label: 'ממוצע מבחנים', color: '#2E9E72' },
    { value: '3', label: 'שיעורים הושלמו', color: '#E5821A' },
    { value: '5🔥', label: 'רצף ימים', color: '#A06FD0' },
  ],
  info: [
    { label: 'אימייל', value: 'dana@studio.ai', icon: 'M4 4h16v16H4zM22 6l-10 7L2 6' },
    { label: 'טלפון', value: '054-···-··21', icon: 'M22 16.92v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z' },
    { label: 'אזור', value: 'חיפה', icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2c2.5 2.5 2.5 17 0 20' },
    { label: 'מסלול', value: 'סוכני AI', icon: 'M22 10 12 5 2 10l10 5 10-5zM6 12v5c0 1 2.7 2 6 2s6-1 6-2v-5' },
  ],
  badges: [
    { label: 'שיעור ראשון', icon: 'M5 3l14 9-14 9z', gradient: 'linear-gradient(135deg,#9FB4F5,#C3A8EE)', opacity: 1 },
    { label: 'מבחן 90+', icon: 'M9 11l3 3 8-8M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11', gradient: 'linear-gradient(135deg,#7FD3C0,#9AD9F0)', opacity: 1 },
    { label: 'רצף 5 ימים', icon: 'M12 2l2.2 5.6L20 9l-5.8 1.4L12 16l-2.2-5.6L4 9z', gradient: 'linear-gradient(135deg,#FFD08A,#FFB0A0)', opacity: 1 },
    { label: 'בוגר', icon: 'M22 10 12 5 2 10l10 5 10-5zM6 12v5c0 1 2.7 2 6 2s6-1 6-2v-5', gradient: 'linear-gradient(135deg,#C3A8EE,#E0A8E8)', opacity: 0.35 },
  ],
  contacts: [
    { icon: 'M4 4h16v16H4zM22 6l-10 7L2 6' },
    { icon: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z' },
    { icon: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
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

export const StudentProfile = ({ data: incoming = DEFAULT_DATA }: { data?: StudentData }) => {
  const { user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)

  // Overlay the signed-in user's real identity over the (mock) profile data,
  // so a registered user sees themselves — not the "דנה לוי" placeholder.
  const data: StudentData = {
    ...incoming,
    name: user?.name || incoming.name,
    avatarInitial: user?.name?.trim().charAt(0) || incoming.avatarInitial,
    info: incoming.info.map((i) =>
      i.label === 'אימייל' && user?.email ? { ...i, value: user.email } : i
    ),
  }

  const statusConfig = {
    'in_progress': { bg: 'rgba(255,191,140,0.2)', color: '#E5821A', label: 'בעבודה' },
    completed: { bg: 'rgba(111,214,168,0.16)', color: '#2E7E5E', label: 'נבדק' },
    pending: { bg: 'rgba(189,165,255,0.2)', color: '#7E78BE', label: 'ממתין' },
  }

  return (
    <main className="relative flex-1 h-screen overflow-y-auto pb-12 z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-[150px] bg-gradient-to-r from-[#C7D4FF] via-[#DACBFB] to-[#C6ECF1] overflow-hidden"
      >
        <div
          className="absolute w-[200px] h-[200px] rounded-full pointer-events-none"
          style={{
            right: '60px',
            top: '-60px',
            background: 'radial-gradient(circle,rgba(255,255,255,0.5),transparent 60%)',
          }}
        />
        <motion.button
          onClick={() => setIsEditing(!isEditing)}
          whileHover={{ y: -2 }}
          className="absolute bottom-4 right-8 inline-flex items-center gap-2 h-9 px-3.5 rounded-2xl bg-white/80 backdrop-blur-md text-xs font-bold text-[#5E5AA8] cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" />
          </svg>
          {isEditing ? 'שמור פרופיל' : 'ערוך פרופיל'}
        </motion.button>
      </motion.div>

      {/* Content */}
      <div className="px-7">
        {/* Profile Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex items-end gap-5 -mt-12 mb-6"
        >
          {/* Avatar */}
          <motion.div
            variants={itemVariants}
            className="w-28 h-28 rounded-[28px] bg-gradient-to-br from-[#9FB4F5] to-[#C3A8EE] border-4 border-white flex items-center justify-center text-white font-black text-5xl shadow-2xl flex-shrink-0"
          >
            {data.avatarInitial}
          </motion.div>

          {/* Title Section */}
          <motion.div variants={itemVariants} className="flex-1 pb-1">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl font-black text-dark">{data.name}</span>
              <span className="text-xs font-bold text-[#5E5AA8] bg-blue-100/30 px-3 py-1 rounded-full">
                מסלול אישי · סוכני AI
              </span>
            </div>
            <div className="text-sm text-muted mt-1">{data.description}</div>
          </motion.div>

          {/* Contact Icons */}
          <motion.div variants={itemVariants} className="flex gap-2 pb-1">
            {data.contacts.map((contact, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -3 }}
                className="w-11 h-11 rounded-3xl bg-white/70 border border-white/85 flex items-center justify-center cursor-pointer"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#5E5AA8" strokeWidth="2">
                  <path d={contact.icon} />
                </svg>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Main Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5"
        >
          {/* Left Column */}
          <motion.div variants={itemVariants} className="flex flex-col gap-5">
            {/* Stats Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-4 gap-3"
            >
              {data.stats.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="p-4 rounded-[20px] glass"
                >
                  <div style={{ color: stat.color }} className="text-2xl font-black">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted font-semibold mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Projects Section */}
            <motion.div variants={itemVariants} className="rounded-[24px] glass p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#5E5AA8" strokeWidth="2">
                    <path d="M12 2 2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  <span className="text-lg font-black text-dark">עבודות הגמר שלי</span>
                </div>
                <span className="text-xs text-gray-500">מלווה ע״י המרצה וצוות המכללה</span>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-3"
              >
                {data.projects.map((project) => {
                  const status = statusConfig[project.status]
                  return (
                    <motion.div
                      key={project.id}
                      variants={itemVariants}
                      whileHover={{ x: 4 }}
                      className="rounded-[18px] bg-white/60 border border-gray-200/12 overflow-hidden"
                    >
                      <div className="flex items-center gap-3 p-4">
                        <div
                          style={{ background: project.gradient }}
                          className="w-12 h-12 rounded-[13px] flex items-center justify-center flex-shrink-0"
                        >
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d={project.icon} />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-black text-dark text-sm">{project.title}</div>
                          <div className="text-xs text-gray-500">{project.tech}</div>
                        </div>
                        <span
                          style={{ background: status.bg, color: status.color }}
                          className="text-xs font-bold px-3 py-1.5 rounded-full"
                        >
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-4 pb-3">
                        <motion.button
                          whileHover={{ y: -2 }}
                          className="inline-flex items-center gap-2 h-9 px-3.5 rounded-2xl bg-gradient-to-br from-[#9FB4F5] to-[#C3A8EE] text-white text-xs font-bold cursor-pointer"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                            <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
                          </svg>
                          פתח סביבת פיתוח
                        </motion.button>
                        <button className="inline-flex items-center gap-2 h-9 px-3.5 rounded-2xl bg-gray-200/20 text-[#5E5AA8] text-xs font-bold cursor-pointer hover:bg-blue-100/30">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                          </svg>
                          בקש משוב
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Column */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-5">
            {/* Personal Info */}
            <motion.div variants={itemVariants} className="rounded-[24px] glass p-5">
              <div className="text-base font-black text-dark mb-3">פרטים אישיים</div>
              <div className="flex flex-col gap-0.5">
                {data.info.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-200/10">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A6AABE" strokeWidth="2">
                      <path d={item.icon} />
                    </svg>
                    <span className="flex-1 text-xs text-muted">{item.label}</span>
                    <span className="text-xs font-bold text-dark">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-500 leading-relaxed">
                אתה בוחר מה לשתף — רק הפרטים שתסמן יוצגו לחברי המאגר.
              </div>
            </motion.div>

            {/* Badges */}
            <motion.div variants={itemVariants} className="rounded-[24px] glass p-5">
              <div className="text-base font-black text-dark mb-1">תגי הישג</div>
              <div className="text-xs text-gray-500 mb-3">נצברים לאורך הקורס</div>
              <div className="flex flex-wrap gap-2">
                {data.badges.map((badge, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.1 }}
                    className="flex flex-col items-center gap-1.5 w-16"
                  >
                    <div
                      style={{ background: badge.gradient, opacity: badge.opacity }}
                      className="w-12 h-12 rounded-[15px] flex items-center justify-center shadow-lg"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d={badge.icon} />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-gray-600 text-center leading-tight">
                      {badge.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}
