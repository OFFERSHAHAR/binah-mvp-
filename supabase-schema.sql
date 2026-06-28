-- Binah AI Academy - Complete Database Schema
-- Copy and paste this into Supabase SQL Editor

-- Create enum types
CREATE TYPE course_status AS ENUM ('active', 'completed', 'in_progress');
CREATE TYPE assignment_status AS ENUM ('pending', 'in_progress', 'submitted', 'graded');
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');

-- Users & Profiles Table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  bio TEXT,
  role user_role DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses Table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES public.users(id),
  icon TEXT,
  gradient TEXT DEFAULT 'linear-gradient(135deg, #9FB4F5, #C3A8EE)',
  color TEXT DEFAULT '#5E5AA8',
  status course_status DEFAULT 'active',
  total_lessons INTEGER DEFAULT 0,
  total_hours DECIMAL(5,2) DEFAULT 0,
  difficulty TEXT DEFAULT 'beginner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons Table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  video_duration TEXT,
  difficulty TEXT DEFAULT 'beginner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, lesson_number)
);

-- User Course Progress
CREATE TABLE public.user_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  status course_status DEFAULT 'in_progress',
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

-- User Lesson Progress
CREATE TABLE public.user_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Assignments Table
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium',
  max_score INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignment Submissions
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT,
  file_url TEXT,
  status assignment_status DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE,
  graded_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assignment_id, user_id)
);

-- Grades Table
CREATE TABLE public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
  score INTEGER NOT NULL,
  max_score INTEGER DEFAULT 100,
  percentage DECIMAL(5,2),
  graded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, assignment_id)
);

-- Messages/Notifications Table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_user_courses_user_id ON public.user_courses(user_id);
CREATE INDEX idx_user_courses_course_id ON public.user_courses(course_id);
CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_assignments_course_id ON public.assignments(course_id);
CREATE INDEX idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX idx_submissions_assignment_id ON public.submissions(assignment_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ==================== RLS POLICIES ====================

-- Users: Anyone can read public profiles, authenticated users can update their own
CREATE POLICY "Users can read their own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Public profiles visible to all"
  ON public.users FOR SELECT
  TO anon
  USING (TRUE);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Courses: Everyone can read active courses
CREATE POLICY "Courses visible to all"
  ON public.courses FOR SELECT
  USING (status = 'active' OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'instructor');

-- Lessons: Everyone can read, instructors can create/edit
CREATE POLICY "Lessons visible to enrolled users"
  ON public.lessons FOR SELECT
  USING (
    course_id IN (
      SELECT course_id FROM public.user_courses
      WHERE user_id = auth.uid()
    )
    OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'instructor'
  );

-- User Courses: Users can read their own enrollments
CREATE POLICY "Users can view their own enrollments"
  ON public.user_courses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- User Lessons: Users can read their own progress
CREATE POLICY "Users can view their lesson progress"
  ON public.user_lessons FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their lesson progress"
  ON public.user_lessons FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Assignments: Students can read, instructors can manage
CREATE POLICY "Assignments visible to enrolled users"
  ON public.assignments FOR SELECT
  USING (
    course_id IN (
      SELECT course_id FROM public.user_courses
      WHERE user_id = auth.uid()
    )
  );

-- Submissions: Users can manage their own
CREATE POLICY "Users can view their submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('instructor', 'admin')
  );

CREATE POLICY "Users can create submissions"
  ON public.submissions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their submissions"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Grades: Students can read their own, instructors can manage
CREATE POLICY "Users can view their grades"
  ON public.grades FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('instructor', 'admin')
  );

-- Messages: Users can read messages sent to them
CREATE POLICY "Users can read their messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    recipient_id = auth.uid()
    OR sender_id = auth.uid()
    OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());
