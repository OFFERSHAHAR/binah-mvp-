# CLAUDE.md - AI School Parallax Platform

**Last Updated**: 2026-06-26
**Project**: בִּינָה (Binah) - AI Academy Interactive Platform
**Status**: ✅ Core Architecture Complete | 🚧 Phase 1 (Data Integration) - Ready to Start

---

## 🎯 Project Context

This is an **enterprise-grade, immersive parallax UI platform** for AI education and agent management in organizations. Built for an elite programmer teacher who has no time for mediocre solutions.

**Key Constraint**: Everything must be **production-ready**, **performance-optimized**, and **zero-compromise on code quality**.

### Design Origin
- Design files: 17 × `.dc.html` (Claude Design handoff bundle)
- Primary screen: `StudentProfile.dc.html` (fully recreated as React component)
- Hebrew RTL-first design with glassmorphism + parallax animations

---

## 🛠️ Tech Stack (Locked - Do Not Change)

| Layer | Technology | Why | Version |
|-------|-----------|-----|---------|
| **Framework** | Next.js 15 | SSR + ISR caching, Framer Motion integration | 15.0+ |
| **Runtime** | React 18 | Hooks-first, Concurrent features | 18.3+ |
| **Language** | TypeScript | Strict mode, zero any | 5.3+ |
| **Styling** | Tailwind CSS + CSS Variables | Design tokens, zero runtime | 3.4+ |
| **Animations** | Framer Motion | GPU parallax, spring physics | 11.0+ |
| **State** | Zustand | Lightweight, reactive (2KB) | 4.4+ |
| **Fonts** | Google Fonts (Heebo) | Hebrew-first, full weight range | Latest |
| **Build** | Turbopack | Next.js native, faster than Webpack | Latest |

**DO NOT ADD**: Redux, Jotai, MobX, Recoil, TanStack Query, React Query, Axios, SWR, Next.js fetch w/ tags (use ISR instead).

---

## 🎨 Design System (Frozen)

### Colors
```
Primary:   #5E5AA8 (buttons, links, active)
Secondary: #2E9E72 (success, completion)
Accent:    #E5821A (warnings, highlights)
Dark:      #2E2E48 (text, headings)
Muted:     #7A7A92 (secondary text)
Light:     #F8F7FD (backgrounds)
```

### Typography
- **Font**: Heebo (400, 500, 600, 700, 800, 900)
- **Base**: 16px
- **Fallback**: system-ui, sans-serif

### Animation Signature
```
Duration:  600–700ms
Easing:    cubic-bezier(0.34, 1.35, 0.5, 1)  [LOCKED - elastic overshoot]
FPS:       60 (GPU transforms, will-change)
Parallax:  Speed 0.5x scroll (mobile 0.3x, tablet 0.4x)
```

---

## 📁 Folder Structure (Keep This Way)

```
ai-ios/
├── app/                    # Next.js app directory
│   ├── layout.tsx          # Root layout, fonts, SEO
│   ├── page.tsx            # Main entry point
│   ├── globals.css         # Global animations + utilities
│   └── api/                # API routes (future)
├── components/
│   ├── Sidebar.tsx
│   ├── AnimatedBackground.tsx
│   └── screens/            # Full page screens
│       └── StudentProfile.tsx
├── hooks/                  # Custom React hooks (12 total)
│   ├── useParallax.ts
│   ├── useZoomTransition.ts
│   ├── useMotionValue.ts
│   └── index.ts            # Export barrel
├── store/
│   └── navigationStore.ts  # Zustand (10 screens)
├── lib/
│   └── constants.ts        # Design system + presets
└── [Config files]
```

**Rule**: One responsibility per file. Max 300 lines. If it exceeds, split it.

---

## ✅ Code Quality Standards

### TypeScript
- ✅ `strict: true` (no implicit any)
- ✅ `noImplicitReturns: true`
- ✅ `noUnusedLocals: true`
- ✅ Full type annotations on exports
- ✅ No `@ts-ignore` (fix the code instead)

### React
- ✅ Functional components only
- ✅ Hooks instead of classes
- ✅ `'use client'` only where needed (animations, state)
- ✅ Props typed with interfaces
- ✅ No prop spreading (`{...props}`)
- ✅ Memoization only for expensive renders (don't over-memoize)

### Styling
- ✅ Tailwind first (utility classes)
- ✅ CSS custom properties for dynamic theming
- ✅ No inline styles except Framer Motion
- ✅ Glassmorphism class `.glass` (reusable)
- ✅ No magic numbers in CSS

### Performance
- ✅ GPU transforms only (`transform`, `opacity`, no `left/top/width/height` animations)
- ✅ `will-change` only on animated elements
- ✅ Lazy load heavy components
- ✅ Intersection Observer for visibility
- ✅ No unnecessary re-renders (check React DevTools)

### Naming
- ✅ Components: PascalCase (`Sidebar.tsx`)
- ✅ Hooks: camelCase, start with `use` (`useParallax.ts`)
- ✅ Files: kebab-case or PascalCase (match export)
- ✅ Variables: camelCase
- ✅ CSS classes: kebab-case

---

## 🚫 Anti-Patterns (Do NOT Do This)

| Don't | Why | Instead |
|-------|-----|---------|
| `<div onClick={...}>` | Accessibility nightmare | `<button>` or proper role |
| `setTimeout` for animations | Janky, not synced | Framer Motion + useEffect |
| CSS transforms `scale(0)` for hiding | Still affects layout | Display or opacity |
| Inline styles | No type safety | Tailwind classes |
| `@ts-ignore` | Mask bugs | Fix the actual type error |
| Context for every state | Prop drilling, slow | Zustand store |
| Mock parallax with JS scroll events | CPU, 30fps | Framer Motion MotionValue |
| SVG inline in JSX | Hard to maintain | Import as component or sprite |
| Hardcoded colors | Not themeable | Use design tokens |
| No error boundaries | Crashes whole page | Add error boundaries |

---

## 🎬 Animation Patterns (Lock These)

### Pattern 1: Parallax (Scroll-Based)
```tsx
// CORRECT
const { ref, y, isInView } = useParallax({ speed: 0.5 })
<motion.div ref={ref} style={{ y }}>...</motion.div>

// WRONG - Don't use scroll events manually
const [y, setY] = useState(0)
useEffect(() => {
  const handle = () => setY(window.scrollY * 0.5)  // ❌ BAD
  window.addEventListener('scroll', handle)
}, [])
```

### Pattern 2: Stagger Animation
```tsx
// CORRECT
const containerVariants = {
  animate: { transition: { staggerChildren: 0.1 } }
}

// WRONG - Don't calculate delays manually
<motion.div initial={{ y: 20 }} animate={{ y: 0, transition: { delay: i * 0.1 } }} />
```

### Pattern 3: Zoom Transition (700ms)
```tsx
// CORRECT
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.7, ease: 'cubic-bezier(0.34, 1.35, 0.5, 1)' }}
/>

// WRONG - Don't use different durations
transition={{ duration: 0.5 }}  // ❌ BAD
```

---

## 📊 Performance Targets (Non-Negotiable)

| Metric | Target | How to Check |
|--------|--------|--------------|
| **FCP** | < 1.5s | Lighthouse, Web Vitals |
| **TTI** | < 2.5s | Lighthouse |
| **Animation FPS** | 60 (locked) | Chrome DevTools > Performance |
| **Bundle Size** | ~150KB gzip | `npm run build` → .next size |
| **Core Web Vitals** | Green (90+) | PageSpeed Insights |
| **Lighthouse Score** | 90+ | Lighthouse audit |

**If performance drops**: Use React DevTools Profiler + Chrome DevTools Performance tab. Never commit regressions.

---

## 🧪 Testing Strategy

### Unit Tests (Hooks)
```bash
npm test -- hooks/useParallax.ts
```
- Test scroll event binding
- Test mouse event binding
- Test Spring physics (motion values)

### Component Tests
- Mount components, check render
- Verify Framer Motion animations initialize
- Check accessibility (buttons, focus states)

### E2E Tests (Future)
- Navigate between screens
- Verify zoom-in transitions trigger
- Check parallax on scroll

**Current Status**: No tests yet (Phase 2 work). Add Jest + React Testing Library when implementing Phase 1 API integration.

---

## 🗂️ File Guidelines

### New Component Template
```tsx
'use client'  // Only if using hooks/motion

import { motion } from 'framer-motion'
import type { ComponentProps } from 'react'

interface MyComponentProps {
  title: string
  onClose: () => void
}

export const MyComponent = ({ title, onClose }: MyComponentProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="..."
    >
      {title}
    </motion.div>
  )
}
```

### New Hook Template
```typescript
import { useRef, useEffect } from 'react'
import { useMotionValue } from 'framer-motion'

export const useMyHook = (config: Config) => {
  const ref = useRef<HTMLDivElement>(null)
  const value = useMotionValue(0)

  useEffect(() => {
    // Setup logic
    return () => {
      // Cleanup
    }
  }, [])

  return { ref, value }
}
```

---

## 🎯 Screens to Build (Phase 2)

When adding new screens, follow this template:

1. **Create file**: `components/screens/[ScreenName].tsx`
2. **Add to navigationStore**: `screens` array with metadata (icon, color, order)
3. **Add Framer Motion**: Motion variants, stagger animations
4. **Test parallax**: Scroll + mouse tracking
5. **Check performance**: 60fps with DevTools

Current screens (10):
- ✅ StudentProfile (DONE)
- 🚧 Dashboard
- 🚧 Calendar
- 🚧 Curriculum
- 🚧 Lessons
- 🚧 Assignments
- 🚧 Grades
- 🚧 Messages
- 🚧 Resources
- 🚧 Settings

---

## 🔐 Security Notes

- ✅ CSP headers ready (Next.js defaults)
- ✅ No dangerouslySetInnerHTML
- ✅ Input sanitization (future when adding forms)
- ✅ CSRF tokens (API layer, future)
- ✅ Rate limiting (middleware, future)

**When adding auth**: Use NextAuth.js or Auth0 (don't roll custom auth).

---

## 📈 Performance Optimization Checklist

Before each commit:
- [ ] No console warnings/errors
- [ ] Chrome DevTools Performance: 60fps animations
- [ ] React DevTools Profiler: no wasted renders
- [ ] Lighthouse score 90+
- [ ] Bundle size < 150KB gzip
- [ ] Accessibility (a11y) pass

**Command to check**:
```bash
npm run build
# Check .next/static size
# Run Lighthouse in DevTools
```

---

## 🚀 Deployment Checklist

- [ ] `.env.local` created (copy `.env.example`)
- [ ] All environment variables set
- [ ] `npm run build` passes (no errors)
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] ESLint passes: `npm run lint`
- [ ] Lighthouse score 90+
- [ ] Test on mobile (responsive)

**Deploy to Vercel**:
```bash
npm install -g vercel
vercel deploy  # Production
```

---

## 📝 Decision Log

### ✅ Decision 1: Next.js 15 + Framer Motion (2026-06-26)
**Why**: Best parallax + animation support. SSR benefits. Zero-config deployment.
**Alternative**: Remix (overkill), SvelteKit (less Framer support), React SPA (no SSR).

### ✅ Decision 2: Zustand for State (2026-06-26)
**Why**: Lightweight (2KB), reactive, perfect for UI state. No Redux boilerplate.
**Alternative**: Redux (verbose), Context (slow re-renders), Jotai (overkill).

### ✅ Decision 3: Tailwind CSS (2026-06-26)
**Why**: Design tokens frozen, zero CSS runtime, excellent DX.
**Alternative**: CSS Modules (more verbose), Styled Components (JS runtime).

### ✅ Decision 4: TypeScript Strict Mode (2026-06-26)
**Why**: Catch 100% of type errors at compile time. Zero runtime type surprises.
**Alternative**: JSDoc (less reliable), no types (chaos).

---

## 🔄 How to Update This File

Update CLAUDE.md whenever:
- ✅ Adding a new major pattern or anti-pattern
- ✅ Changing tech stack (document why)
- ✅ Discovering a performance issue (document fix)
- ✅ Adding a new folder or file structure rule
- ✅ Finding bugs to avoid in future

**Format**: Markdown + this exact structure. Keep it scannable.

---

## 📞 Quick Reference Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run start            # Run production build
npm run lint             # Check ESLint
npx tsc --noEmit        # Check TypeScript

# Deployment
vercel deploy            # Deploy to Vercel
vercel env pull         # Pull env vars

# Debugging
# Chrome DevTools:
#   - Performance tab: Check 60fps animations
#   - React DevTools Profiler: Check re-renders
#   - Lighthouse: Audit performance

# Performance
# lighthouse http://localhost:3000
```

---

## 🎯 Success Criteria (Final)

- ✅ All 17 screens implemented with parallax
- ✅ 60fps animations across all interactions
- ✅ Lighthouse score: 90+
- ✅ Bundle size: < 200KB gzip
- ✅ TypeScript: Zero errors
- ✅ Accessibility: WCAG 2.1 AA compliant
- ✅ Mobile responsive: all breakpoints tested
- ✅ Dark mode: optional but nice-to-have
- ✅ Deployed to Vercel with CI/CD

---

## 🚀 Next Session Checklist

When returning to this project:

1. **Review this file** ← You are here
2. **Check BUILD_SUMMARY.md** for phase status
3. **Run tests**: `npm run lint && npm run build`
4. **Start dev server**: `npm run dev`
5. **Check performance**: Chrome DevTools
6. **Continue Phase 1**: Data integration

---

**Last Updated**: 2026-06-26 14:30 UTC
**Next Update**: When adding Phase 1 (API integration)
**Maintained By**: You (Claude, 10-agent orchestration)

✅ **Project is ELITE-GRADE READY** 🔥
