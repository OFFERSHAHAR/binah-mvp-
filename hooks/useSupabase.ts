import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, auth, db } from '@/lib/supabase'

// Auth hook
export const useAuth = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const { data: authListener } = auth.onAuthStateChange((_event: string, session: any) => {
      setUser(session?.user ?? null)
      setLoading(false)

      if (!session) {
        router.push('/login')
      }
    })

    return () => authListener?.subscription.unsubscribe()
  }, [router])

  const signUp = async (email: string, password: string) => {
    try {
      setError(null)
      const { data, error: err } = await auth.signUp(email, password)
      if (err) throw err
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed'
      setError(message)
      throw err
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const { data, error: err } = await auth.signIn(email, password)
      if (err) throw err
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      setError(message)
      throw err
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      await auth.signOut()
      setUser(null)
      router.push('/login')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed'
      setError(message)
    }
  }

  return { user, loading, error, signUp, signIn, signOut }
}

// User profile hook
export const useUserProfile = (userId: string | null) => {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(!!userId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchProfile = async () => {
      try {
        const { data, error: err } = await db.users.getProfile(userId)
        if (err) throw err
        setProfile(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  const updateProfile = async (updates: any) => {
    if (!userId) return
    try {
      const { data, error: err } = await db.users.updateProfile(userId, updates)
      if (err) throw err
      setProfile(data?.[0])
      return data?.[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
      throw err
    }
  }

  return { profile, loading, error, updateProfile }
}

// User courses hook
export const useUserCourses = (userId: string | null) => {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(!!userId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchCourses = async () => {
      try {
        const { data, error: err } = await db.courses.getUserCourses(userId)
        if (err) throw err
        setCourses(data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch courses')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [userId])

  const enrollCourse = async (courseId: string) => {
    if (!userId) return
    try {
      const { error: err } = await db.courses.enroll(userId, courseId)
      if (err) throw err
      // Refetch courses
      const { data } = await db.courses.getUserCourses(userId)
      setCourses(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enrollment failed')
      throw err
    }
  }

  return { courses, loading, error, enrollCourse }
}

// Lessons hook
export const useLessons = (courseId: string | null) => {
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(!!courseId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!courseId) return

    const fetchLessons = async () => {
      try {
        const { data, error: err } = await db.lessons.getByCourseId(courseId)
        if (err) throw err
        setLessons(data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch lessons')
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [courseId])

  return { lessons, loading, error }
}

// Assignments hook
export const useAssignments = (courseId: string | null) => {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(!!courseId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!courseId) return

    const fetchAssignments = async () => {
      try {
        const { data, error: err } = await db.assignments.getByCourseId(courseId)
        if (err) throw err
        setAssignments(data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch assignments')
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [courseId])

  const submitAssignment = async (assignmentId: string, userId: string, content: string) => {
    try {
      const { error: err } = await db.assignments.submit(assignmentId, userId, content)
      if (err) throw err
      // Refetch assignments
      const { data } = await db.assignments.getByCourseId(courseId!)
      setAssignments(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
      throw err
    }
  }

  return { assignments, loading, error, submitAssignment }
}

// Grades hook
export const useUserGrades = (userId: string | null) => {
  const [grades, setGrades] = useState<any[]>([])
  const [loading, setLoading] = useState(!!userId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchGrades = async () => {
      try {
        const { data, error: err } = await db.grades.getUserGrades(userId)
        if (err) throw err
        setGrades(data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch grades')
      } finally {
        setLoading(false)
      }
    }

    fetchGrades()
  }, [userId])

  return { grades, loading, error }
}

// Messages hook
export const useMessages = (userId: string | null) => {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(!!userId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchMessages = async () => {
      try {
        const { data, error: err } = await db.messages.getForUser(userId)
        if (err) throw err
        setMessages(data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch messages')
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [payload.new, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe().catch((err) => {
        console.warn('Failed to unsubscribe from messages channel:', err)
      })
    }
  }, [userId])

  const sendMessage = async (recipientId: string, content: string) => {
    if (!userId) return
    try {
      const { error: err } = await db.messages.send(userId, recipientId, content)
      if (err) throw err
      // Refetch messages
      const { data } = await db.messages.getForUser(userId)
      setMessages(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Send failed')
      throw err
    }
  }

  return { messages, loading, error, sendMessage }
}
