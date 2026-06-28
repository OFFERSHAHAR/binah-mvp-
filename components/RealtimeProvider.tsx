'use client'

import { ReactNode } from 'react'
import { NotificationToast } from './NotificationToast'

interface RealtimeProviderProps {
  children: ReactNode
  wsUrl?: string
}

export const RealtimeProvider = ({
  children,
}: RealtimeProviderProps) => {
  // Real-time provider for future implementation

  return (
    <>
      {children}
      <NotificationToast />
    </>
  )
}
