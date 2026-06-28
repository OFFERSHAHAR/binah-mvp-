# בִּינָה Troubleshooting Guide

**Solutions for common issues and debugging tips.**

---

## Table of Contents

1. [Setup Issues](#setup-issues)
2. [Development Issues](#development-issues)
3. [Animation Issues](#animation-issues)
4. [Performance Issues](#performance-issues)
5. [Build Issues](#build-issues)
6. [Deployment Issues](#deployment-issues)
7. [TypeScript Issues](#typescript-issues)
8. [Browser Issues](#browser-issues)
9. [Data & API Issues](#data--api-issues)
10. [Getting Help](#getting-help)

---

## Setup Issues

### Issue: "npm install" fails

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Cause:** Node.js version too old or conflicting dependencies

**Solutions:**

```bash
# 1. Check Node version (need 18+)
node --version

# 2. Update Node.js
# Visit https://nodejs.org/ and download LTS version
# Or use nvm (Node Version Manager)

# 3. Clear npm cache
npm cache clean --force

# 4. Use legacy dependency resolution (temporary)
npm install --legacy-peer-deps

# 5. Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port 3000 already in use"

**Symptoms:**
```
Error: listen EADDRINUSE :::3000
```

**Cause:** Another process using port 3000

**Solutions:**

```bash
# 1. Find process using port 3000
lsof -i :3000              # macOS/Linux
netstat -ano | grep 3000   # Windows

# 2. Kill process
kill -9 <PID>              # macOS/Linux
taskkill /PID <PID> /F     # Windows

# 3. Use different port
npm run dev -- -p 3001

# 4. Restart dev server
Ctrl+C
npm run dev
```

### Issue: Module not found / Import error

**Symptoms:**
```
Module not found: Can't resolve '@/components/Sidebar'
```

**Cause:** Wrong import path or file doesn't exist

**Solutions:**

```bash
# 1. Check file exists
# If importing from '@/components/Sidebar.tsx'
# Verify file exists at: components/Sidebar.tsx

# 2. Remove '@' alias temporarily
// Instead of:
import { Sidebar } from '@/components/Sidebar'

// Try:
import { Sidebar } from '../components/Sidebar'

# 3. Check tsconfig.json paths
# Should have:
"paths": {
  "@/*": ["./*"]
}

# 4. Check file extension
// Include .tsx
import { Sidebar } from '@/components/Sidebar'  // ✅
// Not:
import { Sidebar } from '@/components/Sidebar.tsx'  // ❌
```

---

## Development Issues

### Issue: Hot reload not working

**Symptoms:**
- Edit file, browser doesn't refresh
- Console shows old code

**Causes:** 
- File not saved properly
- Wrong file location
- Dev server not running

**Solutions:**

```bash
# 1. Verify dev server running
npm run dev

# 2. Check file is in correct location
# For components, should be in components/ directory
ls components/MyComponent.tsx

# 3. Verify file was saved by editor

# 4. Restart dev server
Ctrl+C
npm run dev

# 5. Check if file matches import
// If importing:
import { Button } from '@/components/Button'

// File should be:
components/Button.tsx  // ✅
// Not:
components/button.tsx  // ❌ (case-sensitive on Linux)
```

### Issue: Animations not playing

**Symptoms:**
- Parallax scroll not working
- Zoom transitions instant
- No blob animations

**Causes:**
- Framer Motion not installed
- useClient directive missing
- Animation code has bugs

**Solutions:**

```bash
# 1. Check Framer Motion installed
npm list framer-motion
# Should show: framer-motion@11.0.3+

# 2. Reinstall if missing
npm install framer-motion

# 3. Add 'use client' directive
'use client'  // Must be at top of file

import { motion } from 'framer-motion'

# 4. Check browser console for errors
# F12 → Console tab → Look for red errors

# 5. Test simple animation
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 1 }}
>
  Test animation
</motion.div>

# 6. Check Chrome DevTools Performance
# Record → 60fps should be smooth
# If janky, check for layout thrashing (left, top, width changes)
```

### Issue: State not updating

**Symptoms:**
- Zustand store not reflecting changes
- UI doesn't update when state changes
- Stale data displayed

**Solutions:**

```bash
# 1. Verify useNavigationStore import
import { useNavigationStore } from '@/store/navigationStore'

# 2. Check store implementation
// Correct:
const store = useNavigationStore()
store.setCurrentScreen('dashboard')

// Wrong:
const store = useNavigationStore
store.setCurrentScreen('dashboard')  // ❌ Missing parentheses

# 3. Verify component is client component
'use client'  // Must have this

# 4. Check for async issues
// If updating from API, use useEffect:
useEffect(() => {
  setCurrentScreen('dashboard')
}, [dependencies])

# 5. Clear Zustand cache
// In browser console:
localStorage.clear()
location.reload()

# 6. Enable Zustand DevTools
import { devtools } from 'zustand/middleware'
// Then check browser DevTools for state changes
```

---

## Animation Issues

### Issue: Parallax effect not visible

**Symptoms:**
- Content moves at same speed as scroll
- No parallax offset
- Elements not responding to scroll

**Solutions:**

```bash
# 1. Check useParallax hook imported
import { useParallax } from '@/hooks'

# 2. Verify hook usage
// Correct:
const { ref, y, isInView } = useParallax({ speed: 0.5 })
<motion.div ref={ref} style={{ y }}>Content</motion.div>

// Wrong:
const { ref, y } = useParallax()
<motion.div style={{ y }}>  // ❌ Missing ref

# 3. Check speed value
// Normal: 0.3 (mobile), 0.4 (tablet), 0.5 (desktop)
// Too slow: 0.1
// Too fast: 1.0

# 4. Verify element in viewport
// Parallax only works on visible elements
// Scroll down, then scroll back up

# 5. Check for CSS conflicts
// Make sure transform not overridden
// Framer Motion uses: transform: translateY(y)

# 6. Enable React DevTools
// Check if y motion value changing
```

### Issue: Zoom transition instant / not visible

**Symptoms:**
- Screen change has no animation
- Transition too fast
- Only opacity changes, no scale

**Solutions:**

```bash
# 1. Check transition duration
// Should be 700ms for standard transitions
transition={{
  duration: 0.7,  // 700ms
  ease: easing.spring
}}

# 2. Verify animation variants
// Should have scale 0.8 → 1
initial: { scale: 0.8, opacity: 0 }
animate: { scale: 1, opacity: 1 }

# 3. Check zoomOrigin from store
const { zoomOrigin } = useNavigationStore()
// Should have x, y coordinates from click

# 4. Verify transform-origin set
// For zoom to work from click point:
style={{
  transformOrigin: `${zoomOrigin.x}px ${zoomOrigin.y}px`
}}

# 5. Test in DevTools Performance tab
// Record animation → check if GPU accelerated
// Should show green "Composite" frames (60fps)
```

### Issue: Animations janky / frame drops

**Symptoms:**
- Parallax stutters
- Animations drop frames
- Not smooth 60fps

**Causes:**
- Layout thrashing (animating left, top, width, height)
- Too many re-renders
- Heavy JavaScript on main thread

**Solutions:**

```bash
# 1. Check Performance tab (Chrome DevTools)
F12 → Performance → Record → Scroll → Stop
// Look for:
// - Yellow/red = layout thrashing (bad)
// - Blue = rendering (bad)
// - Green = composite (good, 60fps)

# 2. Only animate GPU properties
// ✅ Good (GPU):
transform: translateY()
opacity
scale
rotate

// ❌ Bad (CPU):
left, top
width, height
background-color

# 3. Remove unnecessary animations
// Don't animate:
className (use Tailwind for static styles)
font-size
padding

# 4. Check for re-renders
// F12 → React DevTools → Profiler
// Record → Interaction → See why components re-render
// Memoize expensive components if needed

# 5. Check for heavy scripts
// Look for long "Script" blocks in Performance timeline
// Move to useEffect or defer loading

# 6. Verify will-change usage
// Framer Motion adds automatically
// Don't manually add (causes issues with many elements)

# 7. Profile in Firefox
// F12 → Profiler (often easier than Chrome)
```

---

## Performance Issues

### Issue: Slow initial load

**Symptoms:**
- Page takes > 3 seconds to load
- FCP (First Contentful Paint) > 1.5s
- TTI (Time to Interactive) > 2.5s

**Solutions:**

```bash
# 1. Run Lighthouse audit
npm run build
npm run start
# F12 → Lighthouse → Generate report

# 2. Check bundle size
npm run build
du -sh .next/static
# Should be < 150KB gzipped

# 3. Lazy load components
// Before:
import { HeavyComponent } from '@/components/Heavy'

// After:
import dynamic from 'next/dynamic'
const HeavyComponent = dynamic(() => import('@/components/Heavy'))

# 4. Optimize images
// Use next/image with proper sizing
// Avoid large PNG/JPG files

# 5. Check for render-blocking scripts
// Google Fonts should be optimized
// In layout.tsx: fonts loaded early

# 6. Enable ISR caching
// In API routes:
export const revalidate = 3600  // 1 hour

# 7. Defer non-critical JS
// Move analytics/tracking to useEffect
```

### Issue: Lighthouse score below 90

**Symptoms:**
- Lighthouse audit shows < 90
- Performance warnings in report

**Solutions:**

```bash
# 1. Run full audit
lighthouse https://localhost:3000 --view

# 2. Address performance issues
// - FCP: Optimize above-fold content
// - LCP: Preload critical images
// - CLS: Add height/width to images, avoid layout shift
// - TTI: Code split, lazy load

# 3. Fix accessibility issues
// - Add alt text to images
// - Use semantic HTML
// - Ensure color contrast

# 4. Fix best practices issues
// - HTTPS enabled
// - No console errors
// - No deprecated APIs

# 5. Fix SEO issues
// - meta descriptions
// - viewport tag
// - structured data

# 6. Rerun audit after fixes
lighthouse https://localhost:3000 --view
```

---

## Build Issues

### Issue: "npm run build" fails with errors

**Symptoms:**
```
error - ESLint: Unexpected var
error - TypeError: Cannot read property of undefined
error - Unknown configuration option "fakeOption"
```

**Solutions:**

```bash
# 1. Check TypeScript errors
npx tsc --noEmit

# 2. Check ESLint errors
npm run lint

# 3. Fix all errors
# Follow error messages in console

# 4. Check for missing files
# Build errors usually point to exact line

# 5. Clean and rebuild
rm -rf .next
npm run build

# 6. Check Next.js config
# next.config.ts should be valid
```

### Issue: Build succeeds but app doesn't start

**Symptoms:**
```
Error: Cannot find module '.next/standalone/package.json'
```

**Solutions:**

```bash
# 1. Verify build output exists
ls -la .next/standalone

# 2. Check .next folder
ls -la .next/
# Should have: standalone/, static/, etc.

# 3. Ensure Next.js config correct
// next.config.ts should have:
// (no issues by default)

# 4. Try different build command
npm run build
npm run start

# 5. Check available disk space
df -h
# Should have > 1GB free
```

---

## TypeScript Issues

### Issue: "Type 'unknown' is not assignable to type..."

**Symptoms:**
```
error TS2322: Type 'unknown' is not assignable to type 'string'
```

**Cause:** TypeScript strict mode enabled, type inference failed

**Solutions:**

```typescript
// 1. Add explicit type annotation
// Before:
const data = fetchData()  // ❌ Type is unknown

// After:
const data: ProfileData = await fetchData()  // ✅

// 2. Type API responses
interface ApiResponse {
  success: boolean
  data: UserData
}

const response = await fetch('/api/data') as ApiResponse

// 3. Use type guards
if (typeof data === 'string') {
  // data is string here
}

// 4. Don't use 'any'
// Instead use specific types or generics
function process<T>(data: T): T {
  return data
}
```

### Issue: "Cannot find name..."

**Symptoms:**
```
error TS2304: Cannot find name 'document'
```

**Cause:** Missing type definitions or wrong runtime

**Solutions:**

```bash
# 1. Check if file has 'use client'
'use client'  // Browser environment

// Without this, think you're in Node.js (no 'document')

# 2. Install @types for browser APIs
npm install --save-dev @types/node

# 3. Update tsconfig.json
{
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "jsxImportSource": "react"
  }
}

# 4. For Node.js APIs, add type file
// at top of file:
/// <reference types="node" />
```

---

## Browser Issues

### Issue: Parallax not working on mobile

**Symptoms:**
- Desktop: parallax smooth
- Mobile: parallax janky or absent

**Causes:**
- Mobile browser may disable requestAnimationFrame
- Touch events different from mouse
- Lower frame rate on mobile

**Solutions:**

```typescript
// 1. Check if mobile-specific speed set
const { ref, y } = useParallax({
  speed: 0.3  // Mobile slower than desktop
})

// 2. Test on actual mobile device
// Chrome DevTools device mode not perfect

// 3. Consider disabling parallax on mobile
import { useMediaQuery } from '@/hooks'

const isMobile = useMediaQuery('(max-width: 640px)')
const parallelSpeed = isMobile ? 0 : 0.5  // Disable on mobile

// 4. Check for scroll event conflicts
// Other code might be stopping scroll events
```

### Issue: Hebrew text not rendering (RTL)

**Symptoms:**
- Text displays left-to-right instead of right-to-left
- Cursor wrong direction
- Numbers in wrong position

**Solutions:**

```bash
# 1. Check HTML direction
// In app/layout.tsx:
<html dir="rtl" lang="he">

# 2. Verify Heebo font loaded
// In globals.css:
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800;900&display=swap');

# 3. Check Tailwind RTL
// tailwind.config.ts:
export default {
  experimental: {
    optimizePackageImports: ['@/components'],
  },
}

# 4. Reverse flex direction
// Tailwind handles with flex-row-reverse
className="flex flex-row-reverse"

# 5. Clear browser cache
Cmd/Ctrl + Shift + Delete
# Clear cached images/files
```

### Issue: Sidebar not sticky on scroll

**Symptoms:**
- Sidebar scrolls with page content
- Should stay fixed on left

**Causes:**
- CSS position: sticky not working
- z-index conflict
- Parent has overflow hidden

**Solutions:**

```typescript
// 1. Check sticky CSS
className="sticky top-0 h-screen"  // ✅

// 2. Verify z-index
className="sticky top-0 h-screen z-20"

// 3. Check parent container
// Parent shouldn't have overflow: hidden
// Root should allow sidebars to overflow

// 4. Test in different browsers
// Safari has different sticky support
```

---

## Data & API Issues

### Issue: API calls failing / 404 errors

**Symptoms:**
```
GET /api/profile → 404 Not Found
```

**Causes:**
- API endpoint not created yet
- Wrong URL in NEXT_PUBLIC_API_URL
- Typo in path

**Solutions:**

```bash
# 1. Check endpoint exists
# Is file at: app/api/profile/route.ts?

# 2. Verify URL correct
// .env.local should have:
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# 3. Check fetch call
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`)

# 4. Test endpoint directly
curl http://localhost:3000/api/profile

# 5. Check for typos
// Path must match exactly (case-sensitive on Linux)
// /api/profile
// /api/Profile  ❌ Different on Linux

# 6. Create placeholder endpoint
// app/api/profile/route.ts:
export async function GET() {
  return Response.json({ success: true, data: {} })
}
```

### Issue: CORS errors

**Symptoms:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Cause:** API doesn't allow cross-origin requests

**Solutions:**

```typescript
// 1. Add CORS headers to API routes
// app/api/profile/route.ts:
export async function GET() {
  return Response.json(
    { success: true, data: {} },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    }
  )
}

// 2. Or use middleware
// middleware.ts:
export function middleware(request: Request) {
  const response = new Response()
  
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  
  return response
}
```

### Issue: Authentication token not sent

**Symptoms:**
- API returns 401 Unauthorized
- Token lost between requests

**Causes:**
- Token not stored
- Not sent in Authorization header
- Token expired

**Solutions:**

```typescript
// 1. Store token after login
localStorage.setItem('auth_token', token)

// 2. Send in every API request
const token = localStorage.getItem('auth_token')
const res = await fetch('/api/data', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})

// 3. Check token validity
// Decode to check expiration
const decoded = jwt_decode(token)
if (new Date() > new Date(decoded.exp * 1000)) {
  // Token expired, refresh
}

// 4. Use React hook for token
import { useAuth } from '@/hooks/useAuth'
const { token } = useAuth()
```

---

## Getting Help

### Debug Steps

1. **Check browser console** (`F12` → Console)
   - Look for red error messages
   - Check warnings

2. **Check Next.js terminal output**
   - Look for error stack traces
   - Note line numbers

3. **Search error message**
   - Google: "[error message] next.js"
   - Check Stack Overflow

4. **Check documentation**
   - Next.js: https://nextjs.org/docs
   - Framer Motion: https://www.framer.com/motion
   - Tailwind: https://tailwindcss.com/docs
   - React: https://react.dev

5. **Enable debug logging**
   ```bash
   # Set debug environment
   DEBUG=* npm run dev
   ```

6. **Check recent changes**
   - What was last edited?
   - Try reverting that change
   - Run build again

### Resources

- **Framework Docs**: https://nextjs.org/docs/getting-started
- **React Docs**: https://react.dev
- **Framer Motion Docs**: https://www.framer.com/motion
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs
- **GitHub Issues**: Search project issues
- **Stack Overflow**: Tag with `next.js`, `react`, `framer-motion`

### Reporting Bugs

When reporting issues:

1. **Describe the problem**
   - What's happening vs. what should happen
   - Step-by-step to reproduce

2. **Provide environment**
   - Node.js version: `node --version`
   - npm version: `npm --version`
   - OS: macOS / Windows / Linux

3. **Share relevant code**
   - Component code
   - Error message
   - Console output

4. **Check similar issues**
   - Search GitHub issues
   - Check documentation

---

## Summary

Most issues fall into these categories:

| Issue | Check | Fix |
|-------|-------|-----|
| **Setup** | npm install | Clear cache, reinstall |
| **Dev** | npm run dev | Restart, check port |
| **Animations** | F12 DevTools | Add 'use client', verify hook |
| **Performance** | Lighthouse audit | Code split, optimize images |
| **Build** | npm run build | Fix TypeScript errors |
| **Data** | Browser Network tab | Check API endpoint |

**Still stuck?** Check the documentation files in project root, or refer to the official framework docs above.

