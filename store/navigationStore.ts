'use client'

import { create } from 'zustand'

export type ScreenKey =
  | 'dashboard'
  | 'student-profile'
  | 'calendar'
  | 'curriculum'
  | 'lessons'
  | 'assignments'
  | 'grades'
  | 'messages'
  | 'resources'
  | 'record'
  | 'lesson-builder'
  | 'settings'
  | 'admin'
  | 'analytics'

export interface Screen {
  id: ScreenKey
  title: string
  description: string
  icon: string
  component: string
  color: string
  order: number
  adminOnly?: boolean
}

export interface NavigationState {
  currentScreen: ScreenKey
  previousScreen: ScreenKey | null
  screens: Screen[]
  isTransitioning: boolean
  zoomOrigin: { x: number; y: number } | null

  // Actions
  setCurrentScreen: (screen: ScreenKey, origin?: { x: number; y: number }) => void
  setPreviousScreen: (screen: ScreenKey | null) => void
  setTransitioning: (value: boolean) => void
  setZoomOrigin: (origin: { x: number; y: number } | null) => void
  goBack: () => void
  getScreenByKey: (key: ScreenKey) => Screen | undefined
}

const DEFAULT_SCREENS: Screen[] = [
  {
    id: 'dashboard',
    title: 'דף הבית',
    description: 'סקירת ביצועים ויעדים',
    icon: 'M3 11l9-8 9 8M5 10v10h14V10',
    component: 'Dashboard',
    color: '#5E5AA8',
    order: 1,
  },
  {
    id: 'student-profile',
    title: 'הפרופיל שלי',
    description: 'פרטים אישיים והישגים',
    icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 5a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM9 16a6 6 0 0 1 6 0',
    component: 'StudentProfile',
    color: '#7FD3C0',
    order: 2,
  },
  {
    id: 'calendar',
    title: 'לוח השנה',
    description: 'שיעורים ומטלות',
    icon: 'M4 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 4h16M4 12h16M4 17h16',
    component: 'Calendar',
    color: '#FFB0A0',
    order: 3,
  },
  {
    id: 'curriculum',
    title: 'תוכנית הלימוד',
    description: 'קורסים ושיעורים',
    icon: 'M22 10 12 5 2 10l10 5 10-5zM6 12v5c0 1 2.7 2 6 2s6-1 6-2v-5',
    component: 'Curriculum',
    color: '#9AD9F0',
    order: 4,
  },
  {
    id: 'lessons',
    title: 'שיעורים',
    description: 'תוכן השיעור הנוכחי',
    icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 5h16v10H4z',
    component: 'Lessons',
    color: '#7FD3C0',
    order: 5,
  },
  {
    id: 'assignments',
    title: 'מטלות',
    description: 'המטלות שלי',
    icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z',
    component: 'Assignments',
    color: '#FFD08A',
    order: 6,
  },
  {
    id: 'grades',
    title: 'ציוני',
    description: 'הציונים שלי',
    icon: 'M3 3h18v18H3zM9 9h6v6H9zM3 9h6v6H3z',
    component: 'Grades',
    color: '#2E9E72',
    order: 7,
  },
  {
    id: 'messages',
    title: 'הודעות',
    description: 'דיונים וחדר כיתה',
    icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    component: 'Messages',
    color: '#C3A8EE',
    order: 8,
  },
  {
    id: 'resources',
    title: 'משאבים',
    description: 'ספרייה ודוקומנטציה',
    icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
    component: 'Resources',
    color: '#9FB4F5',
    order: 9,
  },
  {
    id: 'record',
    title: 'חדר שידור',
    description: 'הקלטה ושידור חי',
    icon: 'M12 14a4 4 0 0 0 4-4V6a4 4 0 0 0-8 0v4a4 4 0 0 0 4 4zM19 10a7 7 0 0 1-14 0M12 17v4M8 21h8',
    component: 'Record',
    color: '#E5483C',
    order: 10,
  },
  {
    id: 'lesson-builder',
    title: 'בניית שיעור',
    description: 'יצירת שיעור אוטומטית מווידאו',
    icon: 'M4 4h16v16H4zM8 9h8M8 13h5',
    component: 'LessonBuilder',
    color: '#A06FD0',
    order: 11,
  },
  {
    id: 'settings',
    title: 'הגדרות',
    description: 'העדפות וחשבון',
    icon: 'M12 2a10 10 0 0 0-1 19.97v.02h2.01v-.02A10 10 0 0 0 12 2m0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16z',
    component: 'Settings',
    color: '#7A7A92',
    order: 12,
  },
  {
    id: 'admin',
    title: 'ניהול',
    description: 'ממשק ניהול מערכת',
    icon: 'M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6zM9 12l2 2 4-4',
    component: 'Admin',
    color: '#E5483C',
    order: 13,
    adminOnly: true,
  },
]

export const useNavigationStore = create<NavigationState>((set, get) => ({
  currentScreen: 'dashboard',
  previousScreen: null,
  screens: DEFAULT_SCREENS,
  isTransitioning: false,
  zoomOrigin: null,

  setCurrentScreen: (screen, origin) => {
    const state = get()
    set({
      previousScreen: state.currentScreen,
      currentScreen: screen,
      zoomOrigin: origin || null,
      isTransitioning: true,
    })
    setTimeout(() => set({ isTransitioning: false }), 700)
  },

  setPreviousScreen: (screen) => set({ previousScreen: screen }),

  setTransitioning: (value) => set({ isTransitioning: value }),

  setZoomOrigin: (origin) => set({ zoomOrigin: origin }),

  goBack: () => {
    const state = get()
    if (state.previousScreen) {
      set({ currentScreen: state.previousScreen })
    }
  },

  getScreenByKey: (key) => {
    const state = get()
    return state.screens.find((s) => s.id === key)
  },
}))
