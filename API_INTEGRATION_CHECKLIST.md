# API Integration Implementation Checklist

**Status**: In Progress
**Last Updated**: 2026-06-26
**Integration Framework**: useAppData Hook + Skeleton Loading States

---

## Overview

This document tracks the integration of real API data into all בִּינָה screens with proper loading states, error handling, and type safety.

---

## Implementation Status

### Phase 1: Core Infrastructure ✅

- [x] Enhanced `useAppData` hook with typed data fetching
- [x] Error handling with AppError interface
- [x] Individual loading states per data type
- [x] Timeout support (10s per request)
- [x] Created Skeleton loading components
  - [x] `Skeleton.tsx` - Basic animation
  - [x] `SkeletonCard.tsx` - Card pattern
  - [x] `SkeletonGrid.tsx` - Grid pattern
  - [x] `SkeletonList.tsx` - List pattern

### Phase 2: Screen Integration

#### 1. Dashboard.tsx - 🟢 DONE
**Status**: API integration complete with real data

**What's Integrated**:
- ✅ `fetchCourses()` called on mount
- ✅ Real courses data from API
- ✅ Loading skeleton while fetching
- ✅ Error display when fetch fails
- ✅ Automatic dashboard data generation from courses
- ✅ Fallback to DEFAULT_DATA when no API data

**API Endpoints Used**:
- GET `/api/data?type=courses`

**How to Test**:
```tsx
// Courses will auto-load on Dashboard mount
// Watch the loading states transition:
// 1. Loading → Shows SkeletonGrid
// 2. Success → Shows real course cards
// 3. Error → Shows error message
```

---

#### 2. StudentProfile.tsx - 🟡 IN PROGRESS
**Status**: Awaiting profile API endpoint

**What Needs to Happen**:
- [ ] Add `fetchStudentProfile()` call on mount
- [ ] Use real profile data from API (or mock)
- [ ] Add loading skeleton for profile section
- [ ] Display real stats, badges, projects

**Code Template**:
```tsx
'use client'
import { useAppData } from '@/hooks'
import { SkeletonCard } from '../Skeleton'

export const StudentProfile = () => {
  const { studentProfile, loadingProfile, errorProfile, fetchStudentProfile } = useAppData()

  useEffect(() => {
    fetchStudentProfile()
  }, [fetchStudentProfile])

  if (loadingProfile) return <SkeletonCard />
  if (errorProfile) return <ErrorDisplay error={errorProfile} />

  return (
    <main>
      {/* Use studentProfile data */}
    </main>
  )
}
```

**API Endpoint Needed**:
- GET `/api/data?type=profile` ← NOT YET IMPLEMENTED

---

#### 3. Lessons.tsx - 🟡 IN PROGRESS
**Status**: Ready for implementation

**What Needs to Happen**:
- [ ] Add course selection state (which course to show lessons for)
- [ ] Call `loadLessonsForCourse(courseId)` when course changes
- [ ] Show loading skeleton while fetching
- [ ] Map API lesson data to component

**Code Template**:
```tsx
'use client'
import { useAppData } from '@/hooks'
import { SkeletonList } from '../Skeleton'

export const Lessons = () => {
  const [selectedCourseId, setSelectedCourseId] = useState('course-1')
  const { lessons, loadingLessons, errorLessons, loadLessonsForCourse } = useAppData()

  useEffect(() => {
    if (selectedCourseId) {
      loadLessonsForCourse(selectedCourseId)
    }
  }, [selectedCourseId, loadLessonsForCourse])

  if (loadingLessons) return <SkeletonList />
  if (errorLessons) return <ErrorDisplay error={errorLessons} />

  return (
    <main>
      {lessons.map(lesson => (
        <LessonCard key={lesson.id} lesson={lesson} />
      ))}
    </main>
  )
}
```

**API Endpoints Used**:
- GET `/api/data?type=lessons&courseId={courseId}` ← Already working

---

#### 4. Assignments.tsx - 🟡 IN PROGRESS
**Status**: Ready for implementation

**What Needs to Happen**:
- [ ] Call `fetchAssignments()` on mount
- [ ] Display loading skeleton while fetching
- [ ] Map API assignment data to cards
- [ ] Filter/sort assignments by status

**Code Template**:
```tsx
'use client'
import { useAppData } from '@/hooks'
import { SkeletonGrid } from '../Skeleton'

export const Assignments = () => {
  const { assignments, loadingAssignments, errorAssignments, fetchAssignments } = useAppData()

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  if (loadingAssignments) return <SkeletonGrid count={4} />
  if (errorAssignments) return <ErrorDisplay error={errorAssignments} />

  return (
    <main>
      {assignments.map(assignment => (
        <AssignmentCard key={assignment.id} assignment={assignment} />
      ))}
    </main>
  )
}
```

**API Endpoints Used**:
- GET `/api/data?type=assignments` ← Already working

---

#### 5. Grades.tsx - 🟡 IN PROGRESS
**Status**: Ready for implementation

**What Needs to Happen**:
- [ ] Call `fetchGrades()` on mount
- [ ] Display loading skeleton while fetching
- [ ] Map API grade data to display table/cards
- [ ] Show progress and status indicators

**Code Template**:
```tsx
'use client'
import { useAppData } from '@/hooks'
import { SkeletonCard } from '../Skeleton'

export const Grades = () => {
  const { grades, loadingGrades, errorGrades, fetchGrades } = useAppData()

  useEffect(() => {
    fetchGrades()
  }, [fetchGrades])

  if (loadingGrades) return <SkeletonCard />
  if (errorGrades) return <ErrorDisplay error={errorGrades} />

  return (
    <main>
      {grades.map(grade => (
        <GradeRow key={grade.subject} grade={grade} />
      ))}
    </main>
  )
}
```

**API Endpoints Used**:
- GET `/api/data?type=grades` ← Already working

---

#### 6. Messages.tsx - 🟡 IN PROGRESS
**Status**: Ready for implementation

**What Needs to Happen**:
- [ ] Call `fetchMessages()` on mount
- [ ] Display loading skeleton while fetching
- [ ] Map API message data to message list
- [ ] Show message count and timestamps

**Code Template**:
```tsx
'use client'
import { useAppData } from '@/hooks'
import { SkeletonList } from '../Skeleton'

export const Messages = () => {
  const { messages, loadingMessages, errorMessages, fetchMessages } = useAppData()

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  if (loadingMessages) return <SkeletonList count={5} />
  if (errorMessages) return <ErrorDisplay error={errorMessages} />

  return (
    <main>
      {messages.map(message => (
        <MessageCard key={message.id} message={message} />
      ))}
    </main>
  )
}
```

**API Endpoints Used**:
- GET `/api/data?type=messages` ← Already working

---

#### 7. Calendar.tsx - 🟡 IN PROGRESS
**Status**: Ready for implementation

**What Needs to Happen**:
- [ ] Fetch courses/lessons data for schedule display
- [ ] Map lesson dates to calendar view
- [ ] Show course schedule information
- [ ] Display loading state while fetching

**API Endpoint Needed**:
- GET `/api/data?type=schedule` ← NOT YET IMPLEMENTED

---

#### 8. Curriculum.tsx - 🟡 IN PROGRESS
**Status**: Ready for implementation

**What Needs to Happen**:
- [ ] Call `fetchCourses()` to get all courses
- [ ] Display all courses in curriculum view
- [ ] Show course prerequisites/structure
- [ ] Loading skeleton while fetching

**API Endpoints Used**:
- GET `/api/data?type=courses` ← Already working

---

#### 9. Resources.tsx - 🔴 NOT STARTED
**Status**: Awaiting resources API endpoint

**API Endpoint Needed**:
- GET `/api/data?type=resources` ← NOT YET IMPLEMENTED

---

#### 10. Settings.tsx - 🔴 NOT STARTED
**Status**: Low priority, user preferences

---

---

## API Endpoints Status

### Implemented ✅
- `GET /api/data?type=courses` - Returns: `Course[]`
- `GET /api/data?type=lessons&courseId={id}` - Returns: `Lesson[]`
- `GET /api/data?type=assignments` - Returns: `Assignment[]`
- `GET /api/data?type=grades` - Returns: `Grade[]`
- `GET /api/data?type=messages` - Returns: `Message[]`

### Missing 🔴
- `GET /api/data?type=profile` - Should return: Student profile with stats
- `GET /api/data?type=schedule` - Should return: Course schedule/calendar data
- `GET /api/data?type=resources` - Should return: Learning resources list
- `GET /api/data?type=calendar` - Should return: Calendar events

---

## Type Definitions

All types are exported from `hooks/useAppData.ts`:

```typescript
// Available Types
export interface Course { ... }
export interface Lesson { ... }
export interface Assignment { ... }
export interface Grade { ... }
export interface Message { ... }
export interface User { ... }
```

---

## Error Handling Pattern

All screens should follow this error handling pattern:

```tsx
const { data, loading, error, fetchData } = useAppData()

if (loading) return <SkeletonCard />
if (error?.retryable) return <ErrorWithRetry error={error} onRetry={fetchData} />
if (error) return <ErrorDisplay error={error} />

return <DataDisplay data={data} />
```

---

## Loading State Skeleton Components

Use these based on your layout:

```tsx
import { Skeleton, SkeletonCard, SkeletonGrid, SkeletonList } from '@/components'

// Single skeleton line
<Skeleton width="w-1/2" height="h-4" />

// Card loading
<SkeletonCard />

// Grid of cards (default 4)
<SkeletonGrid count={2} />

// List of items (default 3)
<SkeletonList count={5} />
```

---

## Next Steps

1. **Complete Dashboard Integration** ✅ DONE
2. **Add Profile API Endpoint** - Create `/api/data?type=profile`
3. **Integrate Lessons Screen** - Add course selector + fetch
4. **Integrate Assignments Screen** - Add fetch + loading states
5. **Integrate Grades Screen** - Add fetch + loading states
6. **Integrate Messages Screen** - Add fetch + loading states
7. **Add Calendar/Schedule Endpoint** - Create schedule API
8. **Integrate Calendar Screen** - Map lessons to calendar
9. **Add Resources Endpoint** - Create resources API
10. **Integrate Resources Screen** - Display resources

---

## Testing Checklist

For each screen, verify:
- [ ] Loading skeleton appears while fetching
- [ ] Data loads correctly from API
- [ ] Error state displays when API fails
- [ ] Retry mechanism works
- [ ] No console errors/warnings
- [ ] 60fps animations maintained
- [ ] Data updates when dependencies change
- [ ] Types are properly validated

---

## Performance Metrics

Target metrics (from CLAUDE.md):
- **FCP**: < 1.5s ← Check with Lighthouse
- **TTI**: < 2.5s ← Check with Lighthouse
- **Animation FPS**: 60 (locked)
- **Request Timeout**: 10s per request
- **Bundle Size**: < 150KB gzip

---

## Notes

- All API requests have 10s timeout
- Errors are logged to console (see errorLogger utility)
- Loading states use GPU animations (Framer Motion)
- Data is cached in component state
- Consider adding ISR (Incremental Static Regeneration) in future

---

**Last Updated**: 2026-06-26 by Claude Code
**Next Review**: When all 10 screens are integrated
