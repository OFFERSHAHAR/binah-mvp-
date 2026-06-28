# בִּינָה Component Development Guide

**How to add new screens, components, and hooks to the platform.**

---

## Table of Contents

1. [Component Structure](#component-structure)
2. [Adding a New Screen](#adding-a-new-screen)
3. [Creating Custom Hooks](#creating-custom-hooks)
4. [Component Best Practices](#component-best-practices)
5. [Animation Patterns](#animation-patterns)
6. [Styling Guidelines](#styling-guidelines)
7. [State Management](#state-management)
8. [Testing Components](#testing-components)
9. [Common Patterns](#common-patterns)

---

## Component Structure

### File Organization

```
components/
├── Sidebar.tsx                     # Global navigation
├── AnimatedBackground.tsx          # Background effects
├── screens/                        # Full-page screens
│   ├── StudentProfile.tsx          # Existing screen (reference)
│   ├── Dashboard.tsx               # Example: new screen
│   ├── Calendar.tsx
│   ├── Curriculum.tsx
│   ├── Lessons.tsx
│   ├── Assignments.tsx
│   ├── Grades.tsx
│   ├── Messages.tsx
│   ├── Resources.tsx
│   └── Settings.tsx
│
└── ui/                             # Reusable UI components (future)
    ├── Button.tsx
    ├── Card.tsx
    ├── Modal.tsx
    └── Input.tsx
```

### Component Template

```typescript
'use client'  // Add if using animations, hooks, or state

import { motion } from 'framer-motion'
import type { ComponentProps } from 'react'
import { colors, durations, easing } from '@/lib/constants'

/**
 * Component Description
 * @param prop1 - Description
 * @param prop2 - Description
 */
interface MyComponentProps {
  title: string
  description?: string
  onAction?: () => void
}

export const MyComponent = ({
  title,
  description,
  onAction
}: MyComponentProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: durations.standard / 1000, ease: easing.smooth }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold text-dark">{title}</h2>
      {description && <p className="text-muted mt-2">{description}</p>}
      {onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
        >
          Action
        </button>
      )}
    </motion.div>
  )
}
```

---

## Adding a New Screen

### Step 1: Create Screen Component

Create `components/screens/NewScreen.tsx`:

```typescript
'use client'

import { motion } from 'framer-motion'
import { useParallax, useZoomTransition } from '@/hooks'
import { useNavigationStore } from '@/store/navigationStore'
import { colors, easing, durations, motionPresets } from '@/lib/constants'

interface NewScreenProps {
  data?: any  // API data (future)
}

export const NewScreen = ({ data }: NewScreenProps) => {
  const { ref: containerRef, y } = useParallax({ speed: 0.5 })
  const { zoomOrigin, isTransitioning } = useNavigationStore()

  // Zoom-in animation from sidebar click
  const containerVariants = {
    initial: {
      opacity: 0,
      scale: 0.8,
      transformOrigin: `${zoomOrigin.x}px ${zoomOrigin.y}px`
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: durations.standardLong / 1000,
        ease: easing.spring
      }
    }
  }

  // Stagger children animations
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      ref={containerRef}
      initial="initial"
      animate="animate"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-light via-white to-light pb-12"
      style={{ y }}
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="pt-20 px-6 md:px-12"
      >
        <h1 className="text-4xl md:text-5xl font-black text-dark">
          New Screen
        </h1>
        <p className="text-muted mt-2">Screen description here</p>
      </motion.div>

      {/* Content sections */}
      <motion.div
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.2
            }
          }
        }}
        initial="initial"
        animate="animate"
        className="mt-12 px-6 md:px-12 space-y-8"
      >
        {/* Add content sections here */}
        <motion.section variants={itemVariants} className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-dark">Section Title</h2>
          <p className="text-muted mt-2">Content here</p>
        </motion.section>
      </motion.div>
    </motion.div>
  )
}
```

### Step 2: Register Screen in Navigation Store

Edit `store/navigationStore.ts`:

```typescript
// Add to screens array in the store
screens: [
  // ... existing screens
  {
    id: 'new-screen',
    label: 'New Screen',
    icon: 'icon-name',          // Use Feather icons or similar
    color: colors.primary,
    order: 10
  }
]
```

### Step 3: Add Navigation Menu Item

The Sidebar automatically renders all screens from the store, so no additional changes needed!

### Step 4: Test It

```bash
npm run dev
# Visit http://localhost:3000
# Click new screen in sidebar to see zoom animation
```

---

## Creating Custom Hooks

### Hook Template

```typescript
// hooks/useMyHook.ts
import { useRef, useEffect, useState } from 'react'
import { useMotionValue, useTransform } from 'framer-motion'

interface UseMyHookConfig {
  enabled?: boolean
  callback?: (value: number) => void
}

/**
 * useMyHook - Hook description
 * @param config Configuration options
 * @returns Object with reactive values and state
 */
export const useMyHook = (config: UseMyHookConfig = {}) => {
  const { enabled = true, callback } = config
  const ref = useRef<HTMLDivElement>(null)
  const motionValue = useMotionValue(0)
  const [state, setState] = useState(false)

  useEffect(() => {
    if (!enabled || !ref.current) return

    // Setup logic
    const handleEvent = () => {
      motionValue.set(Math.random())
      setState(true)
      callback?.(motionValue.get())
    }

    window.addEventListener('event', handleEvent)

    return () => {
      // Cleanup
      window.removeEventListener('event', handleEvent)
    }
  }, [enabled, motionValue, callback])

  return {
    ref,
    motionValue,
    state,
    setValue: (value: number) => motionValue.set(value)
  }
}
```

### Export Hook

Add to `hooks/index.ts`:

```typescript
export { useMyHook } from './useMyHook'
export { useParallax, usePointerParallax } from './useParallax'
export { useZoomTransition, useScrollReveal } from './useZoomTransition'
export { useMotionValue, /* ... */ } from './useMotionValue'
```

### Use in Component

```typescript
import { useMyHook } from '@/hooks'

export const MyComponent = () => {
  const { ref, motionValue, state } = useMyHook({ enabled: true })

  return (
    <div ref={ref}>
      {state && <p>Active</p>}
    </div>
  )
}
```

---

## Component Best Practices

### ✅ DO

```typescript
// 1. Use TypeScript interfaces for props
interface ComponentProps {
  title: string
  onClose: () => void
}

// 2. Use 'use client' only when needed (animations, hooks, state)
'use client'

// 3. Export named components
export const MyComponent = ({ title, onClose }: ComponentProps) => {
  return <div>{title}</div>
}

// 4. Use custom hooks from lib/constants
import { colors, easing, durations } from '@/lib/constants'

// 5. Apply Tailwind classes
className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"

// 6. Use Framer Motion for animations
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.6, ease: easing.smooth }}
/>

// 7. Memoize expensive computations
const memoizedValue = useMemo(() => expensiveFunction(), [dependency])

// 8. Keep components under 300 lines (split into sub-components)
```

### ❌ DON'T

```typescript
// 1. Don't use implicit any
const data = { /* ... */ }  // ❌ Missing type

// 2. Don't use prop spreading
<Component {...props} />  // ❌ Unclear props

// 3. Don't use inline styles (except Framer Motion)
style={{ color: 'red' }}  // ❌ Use Tailwind

// 4. Don't use dangerouslySetInnerHTML
dangerouslySetInnerHTML={{ __html: data }}  // ❌ XSS risk

// 5. Don't use setTimeout for animations
setTimeout(() => setOpen(true), 300)  // ❌ Use Framer Motion

// 6. Don't hardcode colors
className="bg-#5E5AA8"  // ❌ Use design tokens

// 7. Don't over-memoize
const Component = memo(({ prop }) => ...)  // ❌ Unnecessary

// 8. Don't make components too large
// Split into smaller, reusable components
```

---

## Animation Patterns

### Pattern 1: Parallax Scroll

```typescript
const { ref, y, isInView } = useParallax({ speed: 0.5 })

<motion.div ref={ref} style={{ y }}>
  Parallax content here
</motion.div>
```

### Pattern 2: Stagger Children

```typescript
const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

<motion.div variants={containerVariants} initial="initial" animate="animate">
  {items.map((item) => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

### Pattern 3: Zoom-In Transition

```typescript
const zoomVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 }
}

<motion.div
  variants={zoomVariants}
  initial="initial"
  animate="animate"
  transition={{
    duration: durations.standardLong / 1000,
    ease: easing.spring
  }}
>
  Content
</motion.div>
```

### Pattern 4: Mouse Tracking

```typescript
const { x, y } = usePointerParallax({ strength: 1 })

<motion.div
  style={{
    x: useTransform(x, (latest) => latest * 0.1),
    y: useTransform(y, (latest) => latest * 0.1)
  }}
>
  Follows cursor
</motion.div>
```

### Pattern 5: Scroll Reveal

```typescript
const { ref, isInView } = useScrollReveal({ threshold: 0.3 })

<motion.div
  ref={ref}
  initial={{ opacity: 0, y: 50 }}
  animate={isInView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.6, ease: easing.smooth }}
>
  Revealed on scroll
</motion.div>
```

---

## Styling Guidelines

### Color Usage

```typescript
// Use design tokens (lib/constants.ts)
className="bg-primary text-white"        // ✅ Primary color
className="bg-secondary"                 // ✅ Secondary (success)
className="bg-accent"                    // ✅ Accent (warning)
className="text-dark"                    // ✅ Dark text
className="text-muted"                   // ✅ Secondary text
className="bg-light"                     // ✅ Light background

// Gradients
className="bg-gradient-to-br from-purple to-teal"  // ✅ Gradient
```

### Glassmorphism

```typescript
// Glass effect class (predefined in globals.css)
className="glass"                        // ✅ Glassmorphism effect

// Manual glass (if needed)
className="bg-white/66 backdrop-blur-[30px] border border-white/85"
```

### Responsive Design

```typescript
className="
  text-base md:text-lg lg:text-xl      // Responsive text
  px-4 md:px-6 lg:px-8                 // Responsive padding
  w-full md:w-1/2 lg:w-1/3             // Responsive width
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  // Responsive grid
"
```

### Spacing

Use Tailwind spacing (multiples of 4px):

```
p-1  = 4px    p-2  = 8px    p-4  = 16px
p-6  = 24px   p-8  = 32px   p-12 = 48px
```

### Z-Index Layers

```typescript
// From lib/constants.ts
zIndex.background = 0           // Behind everything
zIndex.content = 1              // Normal content
zIndex.sidebar = 20             // Fixed navigation
zIndex.modal = 50               // Modal dialogs
zIndex.tooltip = 100            // Tooltips
zIndex.notification = 200       // Toast notifications

className="z-20"  // ✅ Sidebar layer
className="z-50"  // ✅ Modal layer
```

---

## State Management

### Using Zustand Store

```typescript
import { useNavigationStore } from '@/store/navigationStore'

export const MyComponent = () => {
  const {
    currentScreen,
    setCurrentScreen,
    screens,
    isTransitioning
  } = useNavigationStore()

  const handleNavigate = (screenId: string) => {
    if (!isTransitioning) {
      setCurrentScreen(screenId)
    }
  }

  return (
    <div>
      <p>Current: {currentScreen}</p>
      <button
        onClick={() => handleNavigate('dashboard')}
        disabled={isTransitioning}
      >
        Go to Dashboard
      </button>
    </div>
  )
}
```

### Local Component State

```typescript
'use client'

import { useState } from 'react'

export const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && <p>Content visible</p>}
    </div>
  )
}
```

---

## Testing Components

### Component Test Example

```typescript
// components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders with title', () => {
    render(<MyComponent title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('calls onAction when button clicked', () => {
    const handleAction = jest.fn()
    render(<MyComponent title="Test" onAction={handleAction} />)
    
    screen.getByRole('button').click()
    expect(handleAction).toHaveBeenCalled()
  })
})
```

### Run Tests

```bash
npm test -- components/MyComponent.test.tsx
```

---

## Common Patterns

### Pattern: Loading State

```typescript
interface MyComponentProps {
  isLoading?: boolean
}

export const MyComponent = ({ isLoading }: MyComponentProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return <div>Content</div>
}
```

### Pattern: Error State

```typescript
interface MyComponentProps {
  error?: string | null
}

export const MyComponent = ({ error }: MyComponentProps) => {
  if (error) {
    return (
      <div className="bg-accent/10 border border-accent rounded-lg p-4">
        <p className="text-accent font-semibold">Error</p>
        <p className="text-sm text-dark mt-1">{error}</p>
      </div>
    )
  }

  return <div>Content</div>
}
```

### Pattern: Empty State

```typescript
interface MyComponentProps {
  items?: any[]
}

export const MyComponent = ({ items }: MyComponentProps) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">No items found</p>
      </div>
    )
  }

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

### Pattern: Modal Dialog

```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg p-6 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-dark">{title}</h2>
        <div className="mt-4">{children}</div>
      </motion.div>
    </motion.div>
  )
}
```

---

## Summary

To add a new component to Binah:

1. **Create file** in appropriate folder (`components/screens/`, `components/ui/`, etc.)
2. **Use template** from above (includes TypeScript, Framer Motion, design tokens)
3. **Export named component** with full type annotations
4. **Register in store** if it's a screen (add to `navigationStore.ts`)
5. **Test locally** with `npm run dev`
6. **Follow patterns** from `StudentProfile.tsx` for reference
7. **Keep under 300 lines** (split into sub-components if needed)

Reference existing components for implementation details. Happy building!

