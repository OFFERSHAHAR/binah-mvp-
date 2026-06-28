'use client'

import { motion } from 'framer-motion'

interface SkeletonProps {
  width?: string
  height?: string
  circle?: boolean
  className?: string
}

export const Skeleton = ({
  width = 'w-full',
  height = 'h-4',
  circle = false,
  className = '',
}: SkeletonProps) => {
  return (
    <motion.div
      className={`
        bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200
        ${circle ? 'rounded-full' : 'rounded-lg'}
        ${width} ${height} ${className}
        overflow-hidden
      `}
      animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        backgroundSize: '200% 100%',
      }}
    />
  )
}

export const SkeletonCard = () => {
  return (
    <div className="p-5 rounded-2xl glass space-y-3">
      <Skeleton height="h-12" />
      <Skeleton height="h-4" width="w-2/3" />
      <Skeleton height="h-2" width="w-full" />
    </div>
  )
}

export const SkeletonGrid = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export const SkeletonList = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 items-center">
          <Skeleton width="w-12" height="h-12" circle />
          <div className="flex-1 space-y-2">
            <Skeleton height="h-4" width="w-3/4" />
            <Skeleton height="h-3" width="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
