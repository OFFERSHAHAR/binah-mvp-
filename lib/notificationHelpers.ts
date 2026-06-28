import { useNotificationStore } from '@/store/notificationStore'
import type { NotificationType } from '@/store/notificationStore'

export const notificationHelpers = {
  success: (title: string, message: string, duration = 4000) => {
    useNotificationStore.getState().addNotification({
      type: 'success',
      title,
      message,
      duration,
      sound: true,
    })
  },

  error: (title: string, message: string) => {
    useNotificationStore.getState().addNotification({
      type: 'error',
      title,
      message,
      sound: true,
    })
  },

  warning: (title: string, message: string, duration = 5000) => {
    useNotificationStore.getState().addNotification({
      type: 'warning',
      title,
      message,
      duration,
      sound: false,
    })
  },

  info: (title: string, message: string, duration = 3000) => {
    useNotificationStore.getState().addNotification({
      type: 'info',
      title,
      message,
      duration,
      sound: false,
    })
  },

  message: (title: string, message: string) => {
    useNotificationStore.getState().addNotification({
      type: 'message',
      title,
      message,
      duration: 5000,
      sound: true,
    })
  },

  grade: (assignmentName: string, score: number, maxScore = 100) => {
    const percentage = (score / maxScore) * 100
    useNotificationStore.getState().addNotification({
      type: 'grade',
      title: `ציון חדש: ${assignmentName}`,
      message: `קיבלת ${score}/${maxScore} (${Math.round(percentage)}%)`,
      duration: 6000,
      sound: true,
    })
  },

  custom: (type: NotificationType, title: string, message: string, options?: any) => {
    useNotificationStore.getState().addNotification({
      type,
      title,
      message,
      duration: options?.duration || 4000,
      sound: options?.sound ?? false,
    })
  },
}

// Exported for use in components
export function notify(
  type: NotificationType,
  title: string,
  message: string,
  options?: { duration?: number; sound?: boolean }
) {
  useNotificationStore.getState().addNotification({
    type,
    title,
    message,
    duration: options?.duration,
    sound: options?.sound,
  })
}
