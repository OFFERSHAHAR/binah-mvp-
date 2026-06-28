# בִּינָה Architecture Guide

**Deep dive into the system design, patterns, and data flow.**

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Layer Breakdown](#layer-breakdown)
3. [Animation System](#animation-system)
4. [State Management](#state-management)
5. [Performance Strategy](#performance-strategy)
6. [Design System](#design-system)
7. [Data Flow](#data-flow)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Browser / Client                         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │              React 18 Components                   │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  StudentProfile / Dashboard / Screens       │  │  │
│  │  │  (Interactive UI, parallax effects)         │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │                    │                               │  │
│  │                    ▼                               │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Custom Hooks (useParallax, useZoom, etc)   │  │  │
│  │  │  (Animation, scroll, mouse tracking)        │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │                    │                               │  │
│  │                    ▼                               │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Framer Motion (GPU animation layer)        │  │  │
│  │  │  (Parallax, zoom, transitions)              │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│                    │                                     │
│                    ▼                                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │       Zustand State Store (Client State)          │  │
│  │  - Current screen, navigation history             │  │
│  │  - Zoom origin, transition lock                   │  │
│  │  - UI state (sidebar open, modal state, etc)      │  │
│  └───────────────────────────────────────────────────┘  │
│                    │                                     │
│                    ▼                                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Tailwind CSS + Design Tokens (lib/constants.ts)  │  │
│  │  - Colors, easing, durations, typography          │  │
│  │  - Responsive breakpoints, z-index layers         │  │
│  └───────────────────────────────────────────────────┘  │
│                    │                                     │
│                    ▼                                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │      Next.js 15 (SSR + ISR Cache)                 │  │
│  │  - Server-side rendering for SEO                  │  │
│  │  - ISR caching (3600s revalidate)                 │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌──────────────────────────┐
              │    Backend API            │
              │  (Future Phase 1)         │
              │  /api/profile             │
              │  /api/grades              │
              │  /api/assignments         │
              └──────────────────────────┘
```

---

## Layer Breakdown

### 1. **Presentation Layer** (`components/`)

The React component tree.

#### Components

```
components/
├── Sidebar.tsx
│   ├── Navigation menu (sticky)
│   ├── Screen list (10 screens)
│   ├── Glassmorphism styling
│   └── Motion effects (fade, scale)
│
├── AnimatedBackground.tsx
│   ├── Floating blob animations
│   ├── Two blobs: 22s + 26s cycles
│   ├── Backdrop blur effects
│   └── No user interaction
│
└── screens/
    ├── StudentProfile.tsx (CURRENT)
    │   ├── Header: Avatar + Name
    │   ├── Stats section
    │   ├── Projects grid
    │   ├── Badges/achievements
    │   ├── Info cards
    │   └── Full parallax + zoom
    │
    ├── Dashboard.tsx (FUTURE)
    ├── Calendar.tsx (FUTURE)
    ├── Curriculum.tsx (FUTURE)
    ├── Lessons.tsx (FUTURE)
    ├── Assignments.tsx (FUTURE)
    ├── Grades.tsx (FUTURE)
    ├── Messages.tsx (FUTURE)
    ├── Resources.tsx (FUTURE)
    └── Settings.tsx (FUTURE)
```

### 2. **Animation Layer** (`hooks/`)

Custom React hooks for motion and interaction.

#### Hooks

| Hook | Purpose | Example |
|------|---------|---------|
| `useParallax` | Scroll-based parallax + mouse tracking | `const { ref, y, isInView } = useParallax({ speed: 0.5 })` |
| `usePointerParallax` | Mouse cursor tracking | `const { x, y } = usePointerParallax(strength: 1)` |
| `useZoomTransition` | Zoom-in/out animations (700ms) | `const { scale, opacity } = useZoomTransition({ trigger: isOpen })` |
| `useScrollReveal` | IntersectionObserver reveal effects | `const { ref, isInView } = useScrollReveal()` |
| `useMotionValueWithConstraints` | Clamped motion values | `const x = useMotionValueWithConstraints(-100, 100)` |
| `useScrollMotion` | Scroll position tracking | `const scrollY = useScrollMotion()` |
| `useMousePosition` | Normalized cursor coordinates | `const { x, y } = useMousePosition()` |
| `useInViewport` | Viewport visibility detection | `const isVisible = useInViewport(ref, 0.5)` |

### 3. **State Management** (`store/`)

Zustand-based reactive state.

```typescript
// navigationStore.ts
{
  // Current view state
  currentScreen: 'student-profile',      // ScreenKey
  previousScreen: null,                   // For goBack()
  isTransitioning: false,                 // Lock during animations
  zoomOrigin: { x: 0, y: 0 },           // Click point for zoom-in

  // Available screens (10 total)
  screens: [
    {
      id: 'student-profile',
      label: 'Profile',
      icon: 'user',
      color: '#5E5AA8'
    },
    // ... 9 more screens
  ],

  // Actions
  setCurrentScreen(screenKey, zoomOrigin),
  goBack(),
  setTransitioning(bool),
  getScreenByKey(key)
}
```

### 4. **Styling Layer** (`lib/constants.ts`)

Design system as TypeScript constants (zero CSS at runtime).

```typescript
export const colors = {
  primary: '#5E5AA8',           // Purple (buttons, links)
  secondary: '#2E9E72',         // Green (success)
  accent: '#E5821A',            // Orange (warnings)
  dark: '#2E2E48',              // Dark (text)
  light: '#F8F7FD',             // Light (background)
  muted: '#7A7A92',             // Gray (secondary text)
  white: '#FFFFFF',
  gradients: { /* ... */ },
  glass: { /* rgba variants */ }
}

export const easing = {
  spring: 'cubic-bezier(0.34, 1.35, 0.5, 1)',   // Elastic overshoot (SIGNATURE)
  smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Smooth ease
  sharp: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)'  // Sharp bounce
}

export const durations = {
  instant: 150,
  fast: 300,
  standard: 600,          // STANDARD DURATION
  standardLong: 700,      // ZOOM TRANSITION DURATION
  slow: 1000,
  slowLong: 1200
}

export const motionPresets = {
  fadeInUp: { /* preset animation vars */ },
  scaleIn: { /* preset animation vars */ },
  // ... more presets
}
```

### 5. **Framework Layer** (`app/`)

Next.js app directory (SSR).

```
app/
├── layout.tsx
│   ├── Root <html> wrapper
│   ├── Heebo font import (Google Fonts)
│   ├── SEO head tags
│   ├── CSS reset
│   └── Provider wrappers (future: auth, themes)
│
├── page.tsx
│   ├── Server component (top-level)
│   ├── Renders StudentProfile screen
│   └── Streams to client
│
└── globals.css
    ├── @import Google Fonts
    ├── Tailwind directives
    ├── Global animations (parallax, glass)
    ├── RTL support (direction: rtl)
    └── CSS custom properties (--primary, etc)
```

---

## Animation System

### Animation Hierarchy

```
┌─ Global Level ─────────────────────────┐
│  Background blob animations (infinite)  │
│  Duration: 22s + 26s cycles            │
└─────────────────────────────────────────┘
         │
         ▼
┌─ Component Level ──────────────────────┐
│  Enter animations (on mount)            │
│  Stagger: 0.1s between children         │
│  Duration: 600ms (signature)            │
└─────────────────────────────────────────┘
         │
         ▼
┌─ Interaction Level ────────────────────┐
│  Parallax: Scroll-based (speed 0.5x)   │
│  Mouse tracking: Pointer strength 1x    │
│  Zoom transitions: 700ms (elastic)      │
└─────────────────────────────────────────┘
```

### Framer Motion Motion Values (GPU Accelerated)

```typescript
// CORRECT: GPU transforms (will-change optimized)
<motion.div
  style={{
    y: useMotionValue(0),        // ✅ Transform translateY
    x: useMotionValue(0),        // ✅ Transform translateX
    opacity: useMotionValue(1),  // ✅ Opacity change
    scale: useMotionValue(1),    // ✅ Transform scale
  }}
/>

// WRONG: Layout thrashing (60fps drop)
<motion.div
  animate={{
    left: 100,     // ❌ Layout shift
    top: 50,       // ❌ Layout shift
    width: 200,    // ❌ Layout shift
  }}
/>
```

### Parallax Implementation

```typescript
// Scroll-based parallax
const { ref, y, isInView } = useParallax({ speed: 0.5, trigger: 'scroll' })

<motion.div
  ref={ref}
  style={{ y }}  // Moves at half scroll speed
>
  Content here
</motion.div>

// Mouse-tracking parallax
const { x, y } = usePointerParallax({ strength: 1 })

<motion.div
  style={{
    x: useTransform(x, (latest) => latest * 0.1),  // Responsive to cursor
    y: useTransform(y, (latest) => latest * 0.1)
  }}
>
  Follows cursor
</motion.div>
```

### Zoom Transition (Screen Navigation)

```typescript
// When clicking sidebar screen:
const { scale, opacity } = useZoomTransition({
  trigger: isOpen,           // Animation trigger
  origin: zoomOrigin,        // Click point
  duration: 700              // 700ms duration
})

<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 1.1, opacity: 0 }}
  transition={{
    duration: 0.7,
    ease: 'cubic-bezier(0.34, 1.35, 0.5, 1)'  // Elastic
  }}
>
  New screen content
</motion.div>
```

---

## State Management

### Zustand Store Pattern

```typescript
import { create } from 'zustand'

interface NavigationStore {
  currentScreen: ScreenKey
  previousScreen: ScreenKey | null
  isTransitioning: boolean
  zoomOrigin: { x: number; y: number }
  screens: Screen[]

  // Actions
  setCurrentScreen: (key: ScreenKey, origin?: DOMRect) => void
  goBack: () => void
  setTransitioning: (value: boolean) => void
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  // Initial state
  currentScreen: 'student-profile',
  previousScreen: null,
  isTransitioning: false,
  zoomOrigin: { x: 0, y: 0 },
  screens: [/* ... */],

  // Actions
  setCurrentScreen: (key, origin) => {
    set((state) => ({
      previousScreen: state.currentScreen,
      currentScreen: key,
      zoomOrigin: origin ? { x: origin.left, y: origin.top } : { x: 0, y: 0 },
      isTransitioning: true,
    }))

    // Lock for 700ms (transition duration)
    setTimeout(() => set({ isTransitioning: false }), 700)
  },

  goBack: () => {
    set((state) => ({
      currentScreen: state.previousScreen || state.currentScreen,
      previousScreen: null,
      isTransitioning: true,
    }))
    setTimeout(() => set({ isTransitioning: false }), 700)
  },

  setTransitioning: (value) => set({ isTransitioning: value }),
}))
```

### Usage in Components

```typescript
// In any component
const { currentScreen, setCurrentScreen, screens, isTransitioning } = useNavigationStore()

// Switch screens with zoom origin
const handleScreenClick = (e: React.MouseEvent, screenKey: ScreenKey) => {
  const rect = e.currentTarget.getBoundingClientRect()
  setCurrentScreen(screenKey, rect)
}

// Prevent interactions during transition
<button onClick={handleScreenClick} disabled={isTransitioning}>
  Go to screen
</button>
```

---

## Performance Strategy

### 1. GPU Acceleration

- Use `transform` and `opacity` only (no `left`, `top`, `width`, `height`)
- Framer Motion handles `will-change` hints automatically
- 60fps locked via GPU compositing

### 2. Code Splitting

```typescript
// Dynamic imports for screens (future)
const Dashboard = dynamic(() => import('@/components/screens/Dashboard'))
const Calendar = dynamic(() => import('@/components/screens/Calendar'))

// Loaded on-demand when screen switches
```

### 3. ISR Caching (Next.js)

```typescript
// In API routes (future)
export const revalidate = 3600  // Revalidate every 1 hour

// Student data cached for 1h, auto-revalidate on demand
export async function GET() {
  const data = await fetch(`https://api.example.com/student`)
  return Response.json(data)
}
```

### 4. Image Optimization

```typescript
// Use next/image (auto-optimization)
import Image from 'next/image'

<Image
  src="/avatar.png"
  alt="Student"
  width={100}
  height={100}
  priority  // Critical image: load first
  sizes="(max-width: 640px) 80px, 100px"
/>
```

### 5. Bundle Analysis

```bash
# Check bundle size
npm run build

# Check .next/static/chunks/* files
# Target: < 150KB gzipped
```

---

## Design System

### Color Tokens

| Token | Value | CSS Variable | Usage |
|-------|-------|-------------|-------|
| Primary | `#5E5AA8` | `--color-primary` | Buttons, active links, CTAs |
| Secondary | `#2E9E72` | `--color-secondary` | Success states, checkmarks |
| Accent | `#E5821A` | `--color-accent` | Warnings, alerts, highlights |
| Dark | `#2E2E48` | `--color-dark` | Text, headings, dark surfaces |
| Muted | `#7A7A92` | `--color-muted` | Secondary text, placeholders |
| Light | `#F8F7FD` | `--color-light` | Light backgrounds, cards |

### Typography Scale

| Size | px | rem | Usage |
|------|----|----|-------|
| `xs` | 12 | 0.75 | Captions, small labels |
| `sm` | 14 | 0.875 | Secondary text |
| `base` | 16 | 1 | Body text, normal |
| `lg` | 18 | 1.125 | Slightly larger body |
| `xl` | 20 | 1.25 | Section subheadings |
| `2xl` | 24 | 1.5 | Section headings |
| `3xl` | 30 | 1.875 | Page subheadings |
| `4xl` | 36 | 2.25 | Page titles |

### Font Family

```
Primary: 'Heebo', system-ui, sans-serif
Mono: 'ui-monospace', 'Menlo', monospace
```

Heebo weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold), 900 (black)

### Spacing Scale (Tailwind)

```
Multiples of 4px (Tailwind default)
4px  (1)   → p-1
8px  (2)   → p-2
12px (3)   → p-3
16px (4)   → p-4
24px (6)   → p-6
32px (8)   → p-8
```

### Z-Index Layers

| Layer | Value | Usage |
|-------|-------|-------|
| `background` | 0 | Base layer |
| `content` | 1 | Normal content |
| `sidebar` | 20 | Fixed sidebar |
| `modal` | 50 | Modal dialogs |
| `tooltip` | 100 | Tooltips, popovers |
| `notification` | 200 | Toast notifications, alerts |

---

## Data Flow

### User Interaction → Screen Update

```
1. User clicks sidebar item
   │
   ▼
2. onClick handler captures event.currentTarget.getBoundingClientRect()
   │
   ▼
3. Calls useNavigationStore.setCurrentScreen(screenKey, origin)
   │
   ▼
4. Zustand updates state:
   - previousScreen = old screen
   - currentScreen = new screen
   - zoomOrigin = click coordinates
   - isTransitioning = true
   │
   ▼
5. React re-renders with new currentScreen
   │
   ▼
6. New screen component mounts with zoom animation
   - Uses zoomOrigin for transform-origin
   - Animates scale: 0.8 → 1, opacity: 0 → 1
   - Duration: 700ms with cubic-bezier(0.34, 1.35, 0.5, 1)
   │
   ▼
7. After 700ms, setTransitioning(false)
   │
   ▼
8. User can interact again
```

### Scroll → Parallax Update

```
1. User scrolls page
   │
   ▼
2. Browser fires scroll event
   │
   ▼
3. useParallax hook detects scroll via MotionValue listener
   │
   ▼
4. Updates y = scrollY * 0.5 (parallax speed multiplier)
   │
   ▼
5. Framer Motion syncs motion value to DOM
   │
   ▼
6. GPU applies transform: translateY(y)
   │
   ▼
7. No JavaScript re-renders (GPU-only)
   │
   ▼
8. 60fps smooth parallax achieved
```

### Mouse Move → Pointer Parallax Update

```
1. User moves cursor over parallax element
   │
   ▼
2. Browser fires mousemove event
   │
   ▼
3. usePointerParallax hook captures clientX, clientY
   │
   ▼
4. Normalizes to range [-1, 1]
   │
   ▼
5. Updates x and y motion values
   │
   ▼
6. Framer Motion applies transforms
   │
   ▼
7. Element follows cursor with slight lag (spring physics)
   │
   ▼
8. Creates depth parallax effect
```

---

## Future API Integration (Phase 1)

### Server → Client Data Flow

```
Next.js Server (SSR)
    │
    ├─► GET /api/profile → { name, avatar, stats, projects }
    ├─► GET /api/grades → { courses, scores }
    └─► GET /api/assignments → { tasks, deadlines }
    │
    ▼
React Component Props
    │
    ├─► <StudentProfile data={studentData} />
    └─► Maps data to UI elements
    │
    ▼
ISR Cache (3600s revalidate)
    │
    └─► Reduces API calls, fast page loads
```

---

## Extension Points (For Future Development)

### Adding a New Screen

1. Create `components/screens/NewScreen.tsx`
2. Add to `navigationStore.ts` screens array
3. Implement zoom transition animation
4. Connect to API (Phase 1)

### Custom Animation

1. Create custom hook in `hooks/`
2. Use Framer Motion `useMotionValue` + `useTransform`
3. Optionally use `useScroll` or `useMotionTemplate`
4. Export from `hooks/index.ts`

### New Color Token

1. Add to `lib/constants.ts` colors
2. Add Tailwind class in `tailwind.config.ts`
3. Use in components: `className="bg-primary"`

---

## Summary

The Binah architecture is built on:

- **React 18** for component composition
- **Framer Motion 11** for GPU-accelerated animations
- **Zustand** for lightweight, reactive state
- **Tailwind CSS** for styling (zero runtime CSS)
- **TypeScript** for type safety
- **Next.js 15** for SSR and ISR caching

Each layer is independent, replaceable, and optimized for performance. The design system ensures consistency and scalability as the platform grows.

