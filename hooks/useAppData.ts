import { useEffect, useState, useCallback } from 'react'
import { errorLogger } from '@/lib/errorLogger'

// Error interface
export interface AppError {
  message: string
  code: string
  statusCode?: number
  retryable: boolean
  timestamp: Date
}

// Types
export interface Course {
  id: string
  title: string
  description: string
  lessons: number
  hours: number
  progress: number
  gradient: string
  icon: string
  exams?: number
  tag?: string
  tagColor?: string
  tagBg?: string
}

export interface Lesson {
  id: string
  number: number
  title: string
  description: string
  duration: string
  videoTime: string
  completed: boolean
}

export interface Assignment {
  id: string
  title: string
  description: string
  course: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  status: 'in_progress' | 'submitted' | 'graded'
  progress: number
  gradient: string
}

export interface Grade {
  subject: string
  grade: number
  status: string
}

export interface Message {
  from: string
  text: string
  time: string
}

export interface User {
  id?: string
  email?: string
  name?: string
  avatarInitial?: string
  [key: string]: any
}

// Global app data hook
export const useAppData = () => {
  const [user, setUser] = useState<User | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  // Individual loading states
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [loadingAssignments, setLoadingAssignments] = useState(false)
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)

  // Error states
  const [errorCourses, setErrorCourses] = useState<AppError | null>(null)
  const [errorLessons, setErrorLessons] = useState<AppError | null>(null)
  const [errorAssignments, setErrorAssignments] = useState<AppError | null>(null)
  const [errorGrades, setErrorGrades] = useState<AppError | null>(null)
  const [errorMessages, setErrorMessages] = useState<AppError | null>(null)
  const [errorAuth, setErrorAuth] = useState<AppError | null>(null)

  // Helper to create error object
  const createError = (message: string, statusCode?: number, code?: string): AppError => ({
    message,
    code: code || 'UNKNOWN_ERROR',
    statusCode,
    retryable: statusCode ? statusCode >= 500 || statusCode === 408 || statusCode === 429 : true,
    timestamp: new Date(),
  })

  // Load user from localStorage
  useEffect(() => {
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      loadAllData()
    }
  }, [])

  const loadAllData = useCallback(async () => {
    await Promise.all([
      fetchCourses(),
      fetchAssignments(),
      fetchGrades(),
      fetchMessages(),
    ])
  }, [])

  const fetchCourses = useCallback(async () => {
    setLoadingCourses(true)
    setErrorCourses(null)
    try {
      const response = await fetch('/api/data?type=courses', {
        signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch courses`)
      }
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      const errorObj = createError(
        error instanceof Error ? error.message : 'Unknown error',
        error instanceof Error && error.message.includes('HTTP')
          ? parseInt(error.message.match(/\d+/)?.[0] || '500')
          : undefined,
        'FETCH_COURSES_ERROR'
      )
      setErrorCourses(errorObj)
      errorLogger.logDataError(errorObj.message, '/api/data?type=courses', {
        code: errorObj.code,
        statusCode: errorObj.statusCode,
      })
    } finally {
      setLoadingCourses(false)
    }
  }, [])

  const fetchAssignments = useCallback(async () => {
    setLoadingAssignments(true)
    setErrorAssignments(null)
    try {
      const response = await fetch('/api/data?type=assignments', {
        signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch assignments`)
      }
      const data = await response.json()
      setAssignments(data)
    } catch (error) {
      const errorObj = createError(
        error instanceof Error ? error.message : 'Unknown error',
        error instanceof Error && error.message.includes('HTTP')
          ? parseInt(error.message.match(/\d+/)?.[0] || '500')
          : undefined,
        'FETCH_ASSIGNMENTS_ERROR'
      )
      setErrorAssignments(errorObj)
      errorLogger.logDataError(errorObj.message, '/api/data?type=assignments', {
        code: errorObj.code,
        statusCode: errorObj.statusCode,
      })
    } finally {
      setLoadingAssignments(false)
    }
  }, [])

  const fetchGrades = useCallback(async () => {
    setLoadingGrades(true)
    setErrorGrades(null)
    try {
      const response = await fetch('/api/data?type=grades', {
        signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch grades`)
      }
      const data = await response.json()
      setGrades(data)
    } catch (error) {
      const errorObj = createError(
        error instanceof Error ? error.message : 'Unknown error',
        error instanceof Error && error.message.includes('HTTP')
          ? parseInt(error.message.match(/\d+/)?.[0] || '500')
          : undefined,
        'FETCH_GRADES_ERROR'
      )
      setErrorGrades(errorObj)
      errorLogger.logDataError(errorObj.message, '/api/data?type=grades', {
        code: errorObj.code,
        statusCode: errorObj.statusCode,
      })
    } finally {
      setLoadingGrades(false)
    }
  }, [])

  const fetchMessages = useCallback(async () => {
    setLoadingMessages(true)
    setErrorMessages(null)
    try {
      const response = await fetch('/api/data?type=messages', {
        signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch messages`)
      }
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      const errorObj = createError(
        error instanceof Error ? error.message : 'Unknown error',
        error instanceof Error && error.message.includes('HTTP')
          ? parseInt(error.message.match(/\d+/)?.[0] || '500')
          : undefined,
        'FETCH_MESSAGES_ERROR'
      )
      setErrorMessages(errorObj)
      errorLogger.logDataError(errorObj.message, '/api/data?type=messages', {
        code: errorObj.code,
        statusCode: errorObj.statusCode,
      })
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setErrorAuth(null)
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signin', email, password }),
        signal: AbortSignal.timeout(10000),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorObj = createError(
          data.error || 'Login failed',
          response.status,
          'LOGIN_FAILED'
        )
        setErrorAuth(errorObj)
        errorLogger.logAuthError(errorObj.message, {
          email,
          statusCode: response.status,
        })
        throw errorObj
      }

      setUser(data.user)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('session', JSON.stringify(data.session))
      }

      await loadAllData()
      return data
    } catch (error) {
      const errorObj = error instanceof Error ? error : createError('Login failed', undefined, 'LOGIN_ERROR')
      errorLogger.logAuthError(errorObj.message || 'Login failed')
      throw errorObj
    }
  }, [loadAllData])

  const signup = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      setErrorAuth(null)
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', email, password, fullName }),
        signal: AbortSignal.timeout(10000),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorObj = createError(
          data.error || 'Signup failed',
          response.status,
          'SIGNUP_FAILED'
        )
        setErrorAuth(errorObj)
        errorLogger.logAuthError(errorObj.message, {
          email,
          statusCode: response.status,
        })
        throw errorObj
      }

      setUser(data.user)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('session', JSON.stringify(data.session))
      }

      await loadAllData()
      return data
    } catch (error) {
      const errorObj = error instanceof Error ? error : createError('Signup failed', undefined, 'SIGNUP_ERROR')
      errorLogger.logAuthError(errorObj.message || 'Signup failed')
      throw errorObj
    }
  }, [loadAllData])

  const logout = useCallback(() => {
    setUser(null)
    setCourses([])
    setLessons([])
    setAssignments([])
    setGrades([])
    setMessages([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('session')
    }
  }, [])

  const loadLessonsForCourse = useCallback(async (courseId: string) => {
    setLoadingLessons(true)
    setErrorLessons(null)
    try {
      const response = await fetch(`/api/data?type=lessons&courseId=${courseId}`, {
        signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load lessons`)
      }
      const data = await response.json()
      setLessons(data)
      return data
    } catch (error) {
      const errorObj = createError(
        error instanceof Error ? error.message : 'Unknown error',
        error instanceof Error && error.message.includes('HTTP')
          ? parseInt(error.message.match(/\d+/)?.[0] || '500')
          : undefined,
        'FETCH_LESSONS_ERROR'
      )
      setErrorLessons(errorObj)
      errorLogger.logDataError(errorObj.message, `/api/data?type=lessons&courseId=${courseId}`, {
        courseId,
        code: errorObj.code,
        statusCode: errorObj.statusCode,
      })
    } finally {
      setLoadingLessons(false)
    }
  }, [])

  return {
    // Data
    user,
    courses,
    lessons,
    assignments,
    grades,
    messages,

    // Loading states
    loadingCourses,
    loadingLessons,
    loadingAssignments,
    loadingGrades,
    loadingMessages,

    // Error states
    errorCourses,
    errorLessons,
    errorAssignments,
    errorGrades,
    errorMessages,
    errorAuth,

    // Methods
    login,
    signup,
    logout,
    fetchCourses,
    fetchAssignments,
    fetchGrades,
    fetchMessages,
    loadLessonsForCourse,
    loadAllData,
  }
}
