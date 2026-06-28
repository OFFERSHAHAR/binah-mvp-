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

export const Resources = () => {
  const resources = [
    { title: 'תיעוד Python', type: 'דוקומנטציה', color: 'from-blue-400 to-blue-600' },
    { title: 'OpenAI API Docs', type: 'ספריה חיצונית', color: 'from-green-400 to-green-600' },
    { title: 'חומרי ההרצאה', type: 'סלايד', color: 'from-purple-400 to-purple-600' },
    { title: 'וידיאו הדרכה', type: 'וידיאו', color: 'from-red-400 to-red-600' },
  ]

  return (
    <main className="relative flex-1 h-screen overflow-y-auto pb-12 z-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 px-10 pt-8"
      >
        <div className="text-3xl font-black text-dark mb-2">משאבים</div>
        <div className="text-sm text-muted">ספרייה ודוקומנטציה</div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-4 gap-4 px-10"
      >
        {resources.map((r, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className={`rounded-2xl glass overflow-hidden cursor-pointer hover:shadow-lg`}
          >
            <div className={`h-20 bg-gradient-to-br ${r.color}`}></div>
            <div className="p-3">
              <div className="text-xs text-muted mb-1">{r.type}</div>
              <div className="text-sm font-bold text-dark">{r.title}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </main>
  )
}
