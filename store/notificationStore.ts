'use client'

import { create } from 'zustand'

export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'message' | 'grade'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  timestamp: number
  sound?: boolean
  badge?: number
}

export interface NotificationState {
  notifications: Notification[]
  unreadCount: number

  // Actions
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp'>
  ) => string
  removeNotification: (id: string) => void
  clearNotifications: () => void
  incrementBadge: () => void
  resetBadge: () => void
  getUnreadCount: () => number
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    const id = `notif-${Date.now()}-${Math.random()}`
    const fullNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
    }

    set((state) => ({
      notifications: [fullNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))

    // Play sound if enabled
    if (notification.sound) {
      playNotificationSound()
    }

    // Auto-remove after duration
    if (notification.duration) {
      setTimeout(() => {
        get().removeNotification(id)
      }, notification.duration)
    }

    return id
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },

  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
    })
  },

  incrementBadge: () => {
    set((state) => ({
      unreadCount: state.unreadCount + 1,
    }))
  },

  resetBadge: () => {
    set({
      unreadCount: 0,
    })
  },

  getUnreadCount: () => {
    return get().unreadCount
  },
}))

// Utility function to play notification sound
const playNotificationSound = () => {
  try {
    // Create a simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  } catch (err) {
    console.warn('Could not play notification sound:', err)
  }
}
