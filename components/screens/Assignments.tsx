'use client'

import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useAppData, type Assignment as APIAssignment } from '@/hooks'
import { SkeletonGrid } from '../Skeleton'

interface Assignment extends APIAssignment {
  icon?: string
}

interface AssignmentDisplay extends Assignment {
  status: 'in_progress' | 'submitted' | 'graded'
}

interface AssignmentsData {
  title: string
  description: string
  assignments: Assignment[]
}

const DEFAULT_DATA: AssignmentsData = {
  title: 'מטלות',
  description: 'עקוב אחר כל המטלות שלך ותאריכי ההגשה',
  assignments: [
    {
      id: '1',
      title: 'בנה סוכן חיפוש',
      description: 'יצור סוכן שמחפש מידע מהאינטרנט',
      course: 'סוכני AI בארגון',
      dueDate: 'היום',
      priority: 'high',
      status: 'in_progress',
      progress: 75,
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      gradient: 'linear-gradient(135deg, #9FB4F5, #C3A8EE)',
    },
    {
      id: '2',
      title: 'פרויקט קבוצתי - RAG',
      description: 'בנו מערכת RAG מלאה עם וקטורים',
      course: 'LLMs ו-RAG',
      dueDate: 'ב-3 ימים',
      priority: 'high',
      status: 'in_progress',
      progress: 50,
      icon: 'M12 2l9 5v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V7z',
      gradient: 'linear-gradient(135deg, #FFD08A, #FFB0A0)',
    },
    {
      id: '3',
      title: 'חידון Python',
      description: 'עונה על 20 שאלות בנושא Python',
      course: 'יסודות Python',
      dueDate: 'בשבוע הבא',
      priority: 'medium',
      status: 'submitted',
      progress: 100,
      icon: 'M9 11a3 3 0 1 1 6 0 3 3 0 0 1-6 0z',
      gradient: 'linear-gradient(135deg, #7FD3C0, #9AD9F0)',
    },
    {
      id: '4',
      title: 'מאמר - חיזוי עם סוכנים',
      description: 'כתוב מאמר על שימוש בסוכנים לחיזוי',
      course: 'סוכני AI בארגון',
      dueDate: 'בשבועיים',
      priority: 'low',
      status: 'in_progress',
      progress: 0,
      icon: 'M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      gradient: 'linear-gradient(135deg, #C3A8EE, #E0A8E8)',
    },
  ],
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-gray-100 text-muted'
    case 'in_progress':
      return 'bg-blue-100 text-blue-600'
    case 'submitted':
      return 'bg-green-100 text-green-600'
    case 'graded':
      return 'bg-purple-100 text-purple-600'
    default:
      return 'bg-gray-100 text-muted'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'בהמתנה'
    case 'in_progress':
      return 'בעבודה'
    case 'submitted':
      return 'הוגש'
    case 'graded':
      return 'מעוניין'
    default:
      return status
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'text-red-600'
    case 'medium':
      return 'text-orange-600'
    case 'low':
      return 'text-green-600'
    default:
      return 'text-gray-600'
  }
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

export const Assignments = ({ data = DEFAULT_DATA }: { data?: AssignmentsData }) => {
  const { assignments, loadingAssignments, errorAssignments, fetchAssignments } = useAppData()

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  // Map API assignments to display format
  const displayAssignments: AssignmentDisplay[] = assignments.length > 0
    ? assignments.map((a) => ({
        ...a,
        icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      }))
    : (DEFAULT_DATA.assignments as AssignmentDisplay[])

  if (loadingAssignments) {
    return (
      <main className="relative flex-1 h-screen overflow-y-auto pb-12 z-10 px-10 py-8">
        <SkeletonGrid count={4} />
      </main>
    )
  }

  if (errorAssignments) {
    return (
      <main className="relative flex-1 h-screen overflow-y-auto pb-12 z-10 px-10 py-8">
        <div className="p-6 rounded-2xl glass border border-red-200">
          <div className="text-red-600 font-semibold">שגיאה בטעינת המטלות</div>
          <div className="text-sm text-red-500 mt-2">{errorAssignments.message || 'Unknown error'}</div>
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
        <div className="text-3xl font-black text-dark mb-2">{data.title}</div>
        <div className="text-sm text-muted">{data.description}</div>
      </motion.div>

      {/* Assignments List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4 px-10"
      >
        {displayAssignments.map((assignment) => (
          <motion.div
            key={assignment.id}
            variants={itemVariants}
            whileHover={{ y: -3 }}
            className="rounded-2xl glass p-6 cursor-pointer transition-all"
          >
            <div className="flex items-start gap-4 mb-4">
              {/* Icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{ background: assignment.gradient }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d={assignment.icon} />
                </svg>
              </div>

              {/* Title & Status */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-dark text-lg leading-tight mb-1">{assignment.title}</h3>
                <p className="text-sm text-muted mb-2">{assignment.description}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted">{assignment.course}</span>
                  <span className={`px-2.5 py-1 rounded-full font-semibold ${getStatusColor(assignment.status)}`}>
                    {getStatusText(assignment.status)}
                  </span>
                </div>
              </div>

              {/* Due Date & Priority */}
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-semibold text-muted mb-1">עד {assignment.dueDate}</div>
                <div className={`text-sm font-bold ${getPriorityColor(assignment.priority)}`}>
                  {assignment.priority === 'high' ? '🔴' : assignment.priority === 'medium' ? '🟠' : '🟢'} דחוף
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {assignment.progress > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted">התקדמות</span>
                  <span className="text-sm font-bold text-dark">{assignment.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${assignment.progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: assignment.gradient }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </main>
  )
}
