'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-light">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-dark mb-4">Something went wrong</h1>
        <p className="text-muted mb-6">{error.message}</p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
