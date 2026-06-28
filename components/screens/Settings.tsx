'use client'

import { motion } from 'framer-motion'

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

export const Settings = () => {
  const settings = [
    { label: 'שינוי סיסמה', description: 'עדכן את סיסמתך בכל שאתה רוצה' },
    { label: 'התראות', description: 'השתלט על התראות השיעור' },
    { label: 'עדפות שפה', description: 'בחר את השפה המעדיפה שלך' },
    { label: 'פרטיות', description: 'נהל את הגדרות הפרטיות שלך' },
  ]

  return (
    <main className="relative flex-1 h-screen overflow-y-auto pb-12 z-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 px-10 pt-8"
      >
        <div className="text-3xl font-black text-dark mb-2">הגדרות</div>
        <div className="text-sm text-muted">נהל את חשבונך והעדפותיך</div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-3 px-10 max-w-2xl"
      >
        {settings.map((s, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="rounded-2xl glass p-4 cursor-pointer hover:bg-white/40"
          >
            <div className="font-bold text-dark text-sm mb-1">{s.label}</div>
            <div className="text-sm text-muted">{s.description}</div>
          </motion.div>
        ))}
      </motion.div>
    </main>
  )
}
