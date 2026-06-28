import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENV || 'development',
  integrations: [],
  tracesSampleRate: process.env.NEXT_PUBLIC_ENV === 'production' ? 0.1 : 1.0,
  beforeSend(event) {
    if (process.env.NEXT_PUBLIC_ENV === 'development') {
      console.log('[Sentry Server] Event:', event)
    }
    return event
  },
})
