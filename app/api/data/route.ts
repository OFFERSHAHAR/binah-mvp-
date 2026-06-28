import { NextRequest, NextResponse } from 'next/server'

// Mock Database
const mockDatabase = {
  courses: [
    {
      id: 'course-1',
      title: 'סוכני AI בארגון',
      description: 'בנה סוכנים אינטליגנטיים לעסק שלך',
      lessons: 12,
      hours: 18,
      progress: 60,
      gradient: 'linear-gradient(135deg, #9FB4F5, #C3A8EE)',
      icon: 'M12 2l2.2 5.6L20 9l-5.8 1.4L12 16l-2.2-5.6L4 9z',
    },
    {
      id: 'course-2',
      title: 'Python מתחילים',
      description: 'בנה בסיס חזק בשפת Python',
      lessons: 8,
      hours: 12,
      progress: 100,
      gradient: 'linear-gradient(135deg, #7FD3C0, #9AD9F0)',
      icon: 'M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
    },
    {
      id: 'course-3',
      title: 'LLMs ו-RAG',
      description: 'עבד עם מודלים גדולים של שפה',
      lessons: 10,
      hours: 15,
      progress: 25,
      gradient: 'linear-gradient(135deg, #FFD08A, #FFB0A0)',
      icon: 'M12 2l9 5v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V7z',
    },
  ],

  lessons: {
    'course-1': [
      {
        id: 'lesson-1',
        number: 1,
        title: 'מבוא לסוכנים',
        description: 'הכירו עם עיקרונות הסוכנים',
        duration: '45 דק׳',
        videoTime: '12:34',
        completed: true,
      },
      {
        id: 'lesson-2',
        number: 2,
        title: 'בנייה בלוק-בלוק',
        description: 'בנה את הסוכן שלך מרכיבים בסיסיים',
        duration: '60 דק׳',
        videoTime: '24:15',
        completed: true,
      },
      {
        id: 'lesson-3',
        number: 3,
        title: 'אינטגרציה עם ממשק',
        description: 'חבר את הסוכן שלך לממשקים חיצוניים',
        duration: '50 דק׳',
        videoTime: '18:42',
        completed: true,
      },
      {
        id: 'lesson-4',
        number: 4,
        title: 'בניית סוכן מוניטורינג',
        description: 'צור סוכן שמעקב וממלא דירוג',
        duration: '55 דק׳',
        videoTime: '19:28',
        completed: false,
      },
    ],
  },

  assignments: [
    {
      id: 'assignment-1',
      title: 'בנה סוכן חיפוש',
      description: 'יצור סוכן שמחפש מידע מהאינטרנט',
      course: 'סוכני AI בארגון',
      dueDate: 'היום',
      priority: 'high',
      status: 'in_progress',
      progress: 75,
      gradient: 'linear-gradient(135deg, #9FB4F5, #C3A8EE)',
    },
    {
      id: 'assignment-2',
      title: 'פרויקט קבוצתי - RAG',
      description: 'בנו מערכת RAG מלאה עם וקטורים',
      course: 'LLMs ו-RAG',
      dueDate: 'ב-3 ימים',
      priority: 'high',
      status: 'in_progress',
      progress: 50,
      gradient: 'linear-gradient(135deg, #FFD08A, #FFB0A0)',
    },
    {
      id: 'assignment-3',
      title: 'חידון Python',
      description: 'עונה על 20 שאלות בנושא Python',
      course: 'Python מתחילים',
      dueDate: 'בשבוע הבא',
      priority: 'medium',
      status: 'submitted',
      progress: 100,
      gradient: 'linear-gradient(135deg, #7FD3C0, #9AD9F0)',
    },
  ],

  grades: [
    { subject: 'סוכני AI בארגון', grade: 92, status: 'מעולה' },
    { subject: 'Python מתחילים', grade: 88, status: 'טוב מאד' },
    { subject: 'LLMs ו-RAG', grade: 85, status: 'טוב' },
  ],

  messages: [
    { from: 'המורה: אלעד גבע', text: 'שלום! איך הלימוד הולך?', time: 'היום 14:23' },
    { from: 'כיתה: סוכני AI', text: 'מי עוזר לי עם הפרויקט?', time: 'אתמול 18:10' },
    { from: 'סקי: רוניה אלדר', text: 'צירוף קובץ לבדיקה...', time: 'שני 10:45' },
  ],
}

// Global catalog content (same for every user) — safe to serve from the CDN.
// Under heavy load this collapses thousands of reads into one origin hit per window.
// ponytail: per-user types (grades/messages/assignments) deliberately omitted — caching
// those on a shared CDN would leak one user's data to another once real data is wired.
const CATALOG_CACHE = 'public, s-maxage=300, stale-while-revalidate=600'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dataType = searchParams.get('type')
  const courseId = searchParams.get('courseId')

  if (dataType === 'courses') {
    return NextResponse.json(mockDatabase.courses, {
      headers: { 'Cache-Control': CATALOG_CACHE },
    })
  }

  if (dataType === 'lessons' && courseId) {
    return NextResponse.json(
      mockDatabase.lessons[courseId as keyof typeof mockDatabase.lessons] || [],
      { headers: { 'Cache-Control': CATALOG_CACHE } }
    )
  }

  if (dataType === 'assignments') {
    return NextResponse.json(mockDatabase.assignments)
  }

  if (dataType === 'grades') {
    return NextResponse.json(mockDatabase.grades)
  }

  if (dataType === 'messages') {
    return NextResponse.json(mockDatabase.messages)
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}
