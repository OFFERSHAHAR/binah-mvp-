import type { Metadata, Viewport } from 'next'
import { Heebo } from 'next/font/google'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AuthProvider } from '@/components/auth/AuthProvider'
import './globals.css'

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-heebo',
})

export const metadata: Metadata = {
  title: 'בִּינָה - בית ספר AI',
  description: 'פלטפורמה אינטראקטיבית לבנייה וניהול סוכני AI בארגון',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#5E5AA8',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#5E5AA8" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${heebo.variable} font-sans antialiased`}>
        <AuthProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  )
}
