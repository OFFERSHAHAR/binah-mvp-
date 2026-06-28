import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5E5AA8',
        secondary: '#2E9E72',
        accent: '#E5821A',
        dark: '#2E2E48',
        light: '#F8F7FD',
        muted: '#7A7A92',
      },
      fontFamily: {
        sans: ['Heebo', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'Menlo', 'monospace'],
      },
      keyframes: {
        floatA: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(26px, -30px)' },
        },
        floatB: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-28px, 22px)' },
        },
        blink: {
          '0%, 49%, 100%': { opacity: '1' },
          '50%, 99%': { opacity: '0' },
        },
      },
      animation: {
        floatA: 'floatA 22s ease-in-out infinite',
        floatB: 'floatB 26s ease-in-out infinite',
        blink: 'blink 1.1s step-end infinite',
      },
      backdropFilter: {
        'blur-30': 'blur(30px)',
      },
    },
  },
  plugins: [],
}
export default config
