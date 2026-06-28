import { createClient } from '@supabase/supabase-js'

// Get from your Supabase project settings
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common operations
export const auth = {
  signUp: (email: string, password: string) =>
    supabase.auth.signUp({ email, password }),

  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signOut: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),

  onAuthStateChange: (callback: any) =>
    supabase.auth.onAuthStateChange(callback),
}

// Database operations
export const db = {
  users: {
    getProfile: (userId: string) =>
      supabase.from('users').select('*').eq('id', userId).single(),

    updateProfile: (userId: string, data: any) =>
      supabase.from('users').update(data).eq('id', userId).select(),

    createProfile: (userId: string, email: string) =>
      supabase.from('users').insert([{ id: userId, email }]).select(),
  },

  courses: {
    getAll: () => supabase.from('courses').select('*').eq('status', 'active'),

    getById: (courseId: string) =>
      supabase.from('courses').select('*').eq('id', courseId).single(),

    enroll: (userId: string, courseId: string) =>
      supabase.from('user_courses').insert([
        { user_id: userId, course_id: courseId },
      ]),

    getUserCourses: (userId: string) =>
      supabase
        .from('user_courses')
        .select('*, courses(*)')
        .eq('user_id', userId),
  },

  lessons: {
    getByCourseId: (courseId: string) =>
      supabase.from('lessons').select('*').eq('course_id', courseId).order('lesson_number'),

    getById: (lessonId: string) =>
      supabase.from('lessons').select('*').eq('id', lessonId).single(),

    markComplete: (userId: string, lessonId: string) =>
      supabase.from('user_lessons').upsert([
        { user_id: userId, lesson_id: lessonId, completed: true, completed_at: new Date() },
      ]),
  },

  assignments: {
    getByCourseId: (courseId: string) =>
      supabase.from('assignments').select('*').eq('course_id', courseId),

    submit: (assignmentId: string, userId: string, content: string) =>
      supabase.from('submissions').upsert([
        {
          assignment_id: assignmentId,
          user_id: userId,
          content,
          status: 'submitted',
          submitted_at: new Date(),
        },
      ]),

    getUserSubmissions: (userId: string) =>
      supabase
        .from('submissions')
        .select('*, assignments(*)')
        .eq('user_id', userId),
  },

  grades: {
    getUserGrades: (userId: string) =>
      supabase.from('grades').select('*').eq('user_id', userId),

    getCourseGrade: (userId: string, courseId: string) =>
      supabase
        .from('grades')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId),
  },

  messages: {
    getForUser: (userId: string) =>
      supabase
        .from('messages')
        .select('*')
        .or(`recipient_id.eq.${userId},sender_id.eq.${userId}`)
        .order('created_at', { ascending: false }),

    send: (senderId: string, recipientId: string, content: string) =>
      supabase.from('messages').insert([
        { sender_id: senderId, recipient_id: recipientId, content },
      ]),
  },
}
