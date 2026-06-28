# API Integration - Quick Start Guide

## What Was Done

### ✅ 5 Screens Now Use Real API Data

1. **Dashboard** - Shows real courses with dynamic stats
2. **Assignments** - Displays all assignments with status tracking
3. **Grades** - Shows grades with percentages and status
4. **Messages** - Displays messages from API
5. **Curriculum** - Shows all courses with progress

### ✅ Core Infrastructure Built

- Enhanced `useAppData` hook with types and error handling
- Skeleton loading components
- Error boundaries for all screens
- 10s timeout per API request
- TypeScript strict mode validation

---

## How to Use

### Import Data Hook in Any Screen

```tsx
'use client'

import { useAppData } from '@/hooks'
import { SkeletonGrid } from '../Skeleton'

export const MyScreen = () => {
  // Get data and loading/error states
  const { assignments, loadingAssignments, errorAssignments, fetchAssignments } = useAppData()

  // Fetch data on mount
  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  // Show loading state
  if (loadingAssignments) {
    return <SkeletonGrid count={4} />
  }

  // Show error state
  if (errorAssignments) {
    return <ErrorDisplay error={errorAssignments} />
  }

  // Render data
  return (
    <main>
      {assignments.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </main>
  )
}
```

---

## Available Data

### From useAppData Hook

```typescript
// Data
const { courses, lessons, assignments, grades, messages } = useAppData()

// Loading states
const { loadingCourses, loadingLessons, loadingAssignments, loadingGrades, loadingMessages } = useAppData()

// Error states
const { errorCourses, errorLessons, errorAssignments, errorGrades, errorMessages } = useAppData()

// Fetch methods
const { fetchCourses, fetchLessons, fetchAssignments, fetchGrades, fetchMessages } = useAppData()
```

### Fetch Specific Data

```tsx
// Fetch lessons for a course
const { loadLessonsForCourse } = useAppData()

useEffect(() => {
  loadLessonsForCourse('course-1')
}, [loadLessonsForCourse])
```

---

## Skeleton Components

### For Loading States

```tsx
import { SkeletonCard, SkeletonGrid, SkeletonList, Skeleton } from '@/components'

// Single line
<Skeleton width="w-1/2" height="h-4" />

// Card
<SkeletonCard />

// Grid of cards (4 by default)
<SkeletonGrid count={2} />

// List (3 by default)
<SkeletonList count={5} />
```

---

## Error Handling

### Error Object Structure

```typescript
{
  message: string        // "Failed to fetch assignments"
  code: string           // "FETCH_ASSIGNMENTS_ERROR"
  statusCode?: number    // 500, 404, etc.
  retryable: boolean     // Can retry if true
  timestamp: Date        // When error occurred
}
```

### Display Error

```tsx
if (errorAssignments) {
  return (
    <div className="p-6 rounded-2xl glass border border-red-200">
      <div className="text-red-600 font-semibold">שגיאה בטעינת המטלות</div>
      <div className="text-sm text-red-500 mt-2">{errorAssignments.message}</div>
    </div>
  )
}
```

---

## API Endpoints

### Working Endpoints

```
GET /api/data?type=courses           → Course[]
GET /api/data?type=lessons&courseId=X → Lesson[]
GET /api/data?type=assignments       → Assignment[]
GET /api/data?type=grades            → Grade[]
GET /api/data?type=messages          → Message[]
```

### To Add

```
GET /api/data?type=profile           → StudentProfile (NOT YET)
GET /api/data?type=schedule          → Event[] (NOT YET)
GET /api/data?type=resources         → Resource[] (NOT YET)
```

---

## Testing

### Test a Screen

1. Open DevTools (F12)
2. Go to Network tab
3. Navigate to the screen
4. Watch API calls in Network tab
5. Verify data displays correctly
6. Check Console for no errors

### Test Loading State

1. In DevTools Network tab
2. Set throttling to "Slow 3G"
3. Navigate to screen
4. Observe skeleton loading animation

### Test Error State

1. Go to `/app/api/data/route.ts`
2. Temporarily break the endpoint
3. Navigate to screen
4. Verify error message displays

---

## Common Patterns

### Pattern 1: Fetch on Mount

```tsx
useEffect(() => {
  fetchAssignments()
}, [fetchAssignments])
```

### Pattern 2: Conditional Fetch

```tsx
useEffect(() => {
  if (courseId) {
    loadLessonsForCourse(courseId)
  }
}, [courseId, loadLessonsForCourse])
```

### Pattern 3: Refetch on Button Click

```tsx
const handleRefresh = () => {
  fetchAssignments()
}

return <button onClick={handleRefresh}>Refresh</button>
```

### Pattern 4: Display Fallback Data

```tsx
const displayAssignments = assignments.length > 0 
  ? assignments 
  : DEFAULT_ASSIGNMENTS

return displayAssignments.map(item => ...)
```

---

## Performance Tips

### ✅ DO

- Use individual loading states (`loadingCourses` not `loading`)
- Memoize components if re-rendering frequently
- Use GPU transforms for animations (already done)
- Call fetch methods in `useEffect` with dependencies
- Keep components under 300 lines

### ❌ DON'T

- Don't call fetch in render loop
- Don't forget to add `[fetchData]` to useEffect deps
- Don't render loading skeleton for entire app
- Don't block UI while loading
- Don't hardcode data - always use API

---

## Troubleshooting

### Data Not Loading?

1. Check Network tab in DevTools
2. Verify API endpoint returns data
3. Check console for errors
4. Ensure `fetchAssignments()` called in useEffect

### Skeleton Not Showing?

1. Verify `loadingAssignments` is true
2. Import SkeletonGrid correctly
3. Check if conditional rendering works
4. Look for console errors

### Error Not Showing?

1. Verify error object exists
2. Check error.message or error.code
3. Make sure error boundary is in place
4. Test with Network tab > Offline

### Types Not Working?

1. Verify import from `hooks/useAppData`
2. Check TypeScript strict mode
3. Run `npm run build` to check
4. Ensure `export interface` used

---

## Files to Reference

- `hooks/useAppData.ts` - Data fetching logic
- `components/Skeleton.tsx` - Loading components
- `components/screens/Dashboard.tsx` - Example integration
- `API_INTEGRATION_CHECKLIST.md` - Detailed checklist
- `INTEGRATION_REPORT.md` - Full report

---

## Quick Links

| Task | File |
|------|------|
| Add data fetching | `hooks/useAppData.ts` |
| Create new endpoint | `app/api/data/route.ts` |
| Import types | `hooks/index.ts` |
| Add error display | See Dashboard.tsx |
| Add loading state | See Skeleton.tsx |

---

## Next Integrations

To integrate remaining screens:

1. **Lessons** - Use `loadLessonsForCourse(courseId)` (20 min)
2. **StudentProfile** - Need profile endpoint (30 min)
3. **Calendar** - Need schedule endpoint (45 min)
4. **Resources** - Need resources endpoint (30 min)
5. **Settings** - Simple form state (20 min)

---

## Production Checklist

Before going live:

- [ ] All 5 screens load real data
- [ ] Loading states work
- [ ] Error states work
- [ ] No console errors
- [ ] TypeScript builds successfully
- [ ] Lighthouse score 90+
- [ ] Tested on mobile
- [ ] Tested on slow network

---

**Ready to build! Pick a screen and integrate it using the patterns above.** 🚀
