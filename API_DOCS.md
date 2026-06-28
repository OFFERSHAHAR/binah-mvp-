# בִּינָה API Documentation

**Complete reference for current and planned API endpoints.**

---

## Status

- **Current Phase**: Frontend-only (no API integration yet)
- **Next Phase**: Phase 1 - Data Integration (Backend API connection)
- **This Document**: Specification for upcoming API endpoints

---

## Table of Contents

1. [API Overview](#api-overview)
2. [Response Format](#response-format)
3. [Authentication](#authentication)
4. [Endpoints](#endpoints)
   - [User Profile](#user-profile)
   - [Grades & Performance](#grades--performance)
   - [Assignments](#assignments)
   - [Courses & Curriculum](#courses--curriculum)
   - [Messages](#messages)
   - [Resources](#resources)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Caching Strategy](#caching-strategy)
8. [Examples](#examples)

---

## API Overview

### Base URL

```
Development:  http://localhost:3000/api
Production:   https://binah.yourdomain.com/api
```

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
API_SECRET_KEY=your-secret-key-here
NEXT_REVALIDATE_TIME=3600  # 1 hour ISR cache
```

### Technology Stack

- **Framework**: Next.js 15 API Routes (`app/api/`)
- **Runtime**: Node.js (edge runtime supported)
- **Database**: (To be determined - PostgreSQL, MongoDB, Firebase, etc.)
- **Caching**: ISR (Incremental Static Regeneration) with 3600s revalidate
- **Authentication**: (JWT tokens or session cookies - TBD)

---

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    // Endpoint-specific data
  },
  "timestamp": "2026-06-26T10:30:00Z",
  "statusCode": 200
}
```

### Error Response (4xx / 5xx)

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "User profile not found",
    "details": {
      "field": "userId",
      "value": "unknown-id"
    }
  },
  "timestamp": "2026-06-26T10:30:00Z",
  "statusCode": 404
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [
    // Array of items
  ],
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "pages": 15
  },
  "timestamp": "2026-06-26T10:30:00Z",
  "statusCode": 200
}
```

---

## Authentication

### JWT Token Flow (Planned)

```
1. User logs in via POST /api/auth/login
   ├─► Receives: { token, expiresIn, user }
   │
2. Client stores JWT in secure HttpOnly cookie
   │
3. Every request includes Authorization header
   ├─► Authorization: Bearer <jwt-token>
   │
4. Server validates token on each request
   │
5. Token expires after 24 hours (configurable)
   │
6. User refreshes via POST /api/auth/refresh
```

### Example: Adding Auth Header

```typescript
// app/api/profile/route.ts
import { verifyToken } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return Response.json(
        { success: false, error: { code: 'NO_TOKEN' } },
        { status: 401 }
      )
    }

    const user = await verifyToken(token)
    // Continue with authorized request
  } catch (error) {
    return Response.json(
      { success: false, error: { code: 'UNAUTHORIZED' } },
      { status: 401 }
    )
  }
}
```

---

## Endpoints

### User Profile

#### GET `/api/profile`

Fetch current user's profile data.

**Request**

```bash
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer <token>"
```

**Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "name": "Sarah Cohen",
    "email": "sarah@school.ai",
    "avatar": "https://cdn.example.com/avatars/sarah.jpg",
    "bio": "AI enthusiast & full-stack developer",
    "joinDate": "2025-09-15",
    "role": "student",
    "department": "Computer Science",
    "stats": {
      "coursesEnrolled": 5,
      "projectsCompleted": 12,
      "totalPoints": 8500,
      "currentStreak": 15
    },
    "badges": [
      {
        "id": "badge-001",
        "name": "Quick Learner",
        "description": "Completed 5 courses",
        "icon": "🚀",
        "earnedDate": "2026-03-20"
      }
    ]
  },
  "timestamp": "2026-06-26T10:30:00Z",
  "statusCode": 200
}
```

#### PUT `/api/profile`

Update user profile.

**Request**

```bash
curl -X PUT http://localhost:3000/api/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Cohen",
    "bio": "Updated bio",
    "avatar": "base64-encoded-image"
  }'
```

**Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "name": "Sarah Cohen",
    "bio": "Updated bio",
    "avatar": "https://cdn.example.com/avatars/sarah-updated.jpg"
  },
  "timestamp": "2026-06-26T10:30:00Z",
  "statusCode": 200
}
```

---

### Grades & Performance

#### GET `/api/grades`

Fetch all course grades and performance metrics.

**Query Parameters**

```
?courseId=course-101    # Filter by course (optional)
?semester=spring-2026   # Filter by semester (optional)
&limit=10               # Pagination limit
&offset=0               # Pagination offset
```

**Response** (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "courseId": "course-101",
      "courseName": "Fundamentals of AI",
      "instructor": "Prof. Rachel Alum",
      "semester": "spring-2026",
      "grade": "A",
      "percentScore": 94,
      "credits": 4,
      "assignments": {
        "completed": 12,
        "total": 12,
        "avgScore": 92
      },
      "quizzes": {
        "completed": 5,
        "total": 5,
        "avgScore": 88
      },
      "finalProject": {
        "status": "submitted",
        "score": 98,
        "submittedDate": "2026-05-10T15:30:00Z"
      },
      "feedback": "Excellent work on ML implementation project!"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 10,
    "offset": 0,
    "pages": 1
  },
  "timestamp": "2026-06-26T10:30:00Z",
  "statusCode": 200
}
```

#### GET `/api/grades/:courseId`

Fetch detailed grade breakdown for a single course.

**Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "courseId": "course-101",
    "courseName": "Fundamentals of AI",
    "breakdown": {
      "assignments": {
        "weight": 30,
        "currentScore": 92,
        "submissions": [
          {
            "id": "assign-001",
            "name": "Neural Networks Basics",
            "dueDate": "2026-03-15",
            "submittedDate": "2026-03-14",
            "score": 95,
            "feedback": "Great implementation!"
          }
        ]
      },
      "quizzes": {
        "weight": 20,
        "currentScore": 88,
        "attempts": 5
      },
      "midterm": {
        "weight": 25,
        "score": 91
      },
      "finalProject": {
        "weight": 25,
        "score": 98
      }
    },
    "currentGrade": "A",
    "currentPercentage": 94
  },
  "timestamp": "2026-06-26T10:30:00Z",
  "statusCode": 200
}
```

---

### Assignments

#### GET `/api/assignments`

Fetch all assignments for current user.

**Query Parameters**

```
?status=pending           # pending, submitted, graded
?courseId=course-101      # Filter by course
&sortBy=dueDate           # dueDate, submittedDate, grade
&order=asc                # asc or desc
&limit=20
&offset=0
```

**Response** (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "assign-015",
      "courseId": "course-101",
      "courseName": "Fundamentals of AI",
      "title": "Implement a Decision Tree Classifier",
      "description": "Build a decision tree from scratch using Python...",
      "dueDate": "2026-07-15T23:59:59Z",
      "submittedDate": null,
      "status": "pending",
      "instructions": "https://cdn.example.com/assign-015-instructions.pdf",
      "starterCode": "https://github.com/binah/assign-015-starter",
      "totalPoints": 100,
      "submittedScore": null,
      "timeRemaining": "19 days"
    },
    {
      "id": "assign-014",
      "courseId": "course-101",
      "courseName": "Fundamentals of AI",
      "title": "Neural Network Optimization",
      "description": "Implement backpropagation and gradient descent...",
      "dueDate": "2026-06-30T23:59:59Z",
      "submittedDate": "2026-06-29T10:30:00Z",
      "status": "submitted",
      "totalPoints": 100,
      "submittedScore": null,
      "feedbackStatus": "pending"
    }
  ],
  "pagination": {
    "total": 23,
    "limit": 20,
    "offset": 0,
    "pages": 2
  },
  "timestamp": "2026-06-26T10:30:00Z",
  "statusCode": 200
}
```

#### POST `/api/assignments/:assignmentId/submit`

Submit an assignment.

**Request**

```bash
curl -X POST http://localhost:3000/api/assignments/assign-015/submit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "submissionUrl": "https://github.com/user/assign-015-solution",
    "notes": "Added additional optimizations"
  }'
```

**Response** (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "submission-042",
    "assignmentId": "assign-015",
    "userId": "user-123",
    "submittedDate": "2026-06-26T10:30:00Z",
    "submissionUrl": "https://github.com/user/assign-015-solution",
    "notes": "Added additional optimizations",
    "status": "submitted",
    "confirmationToken": "token-abc123"
  },
  "timestamp": "2026-06-26T10:30:00Z",
  "statusCode": 201
}
```

#### GET `/api/assignments/:assignmentId/feedback`

Fetch grading feedback for submitted assignment.

**Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "assignmentId": "assign-014",
    "submissionId": "submission-041",
    "gradedDate": "2026-06-25T14:20:00Z",
    "score": 92,
    "totalPoints": 100,
    "percentage": 92,
    "grade": "A",
    "rubric": {
      "correctness": {
        "points": 30,
        "maxPoints": 30,
        "feedback": "Perfect implementation"
      },
      "code_quality": {
        "points": 28,
        "maxPoints": 30,
        "feedback": "Good structure, minor optimization opportunities"
      },
      "documentation": {
        "points": 20,
        "maxPoints": 20,
        "feedback": "Excellent comments and docstrings"
      },
      "efficiency": {
        "points": 14,
        "maxPoints": 20,
        "feedback": "Consider reducing space complexity"
      }
    },
    "generalComments": "Great work! Very close to optimal solution. Consider reviewing space complexity techniques."
  },
  "timestamp": "2026-06-26T10:30:00Z",
  "statusCode": 200
}
```

---

### Courses & Curriculum

#### GET `/api/courses`

Fetch enrolled courses.

**Query Parameters**

```
?status=active          # active, completed, archived
&limit=10
&offset=0
```

**Response** (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "course-101",
      "name": "Fundamentals of AI",
      "code": "CS-101",
      "semester": "spring-2026",
      "instructor": {
        "id": "prof-001",
        "name": "Prof. Rachel Alum",
        "email": "rachel@school.ai",
        "avatar": "https://cdn.example.com/avatars/rachel.jpg"
      },
      "description": "Introduction to artificial intelligence concepts...",
      "status": "active",
      "progress": {
        "completed": 8,
        "total": 12,
        "percentage": 67
      },
      "currentGrade": "A",
      "credits": 4,
      "schedule": {
        "lectures": ["Monday 10:00-12:00", "Wednesday 10:00-12:00"],
        "labs": ["Friday 14:00-16:00"],
        "office_hours": "Tuesday 16:00-18:00"
      },
      "startDate": "2026-01-20",
      "endDate": "2026-05-30"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 10,
    "offset": 0,
    "pages": 1
  },
  "timestamp": "2026-06-26T10:30:00Z",
  "statusCode": 200
}
```

#### GET `/api/courses/:courseId/curriculum`

Fetch course modules and lessons.

**Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "courseId": "course-101",
    "courseName": "Fundamentals of AI",
    "modules": [
      {
        "id": "module-001",
        "title": "Introduction to AI",
        "order": 1,
        "lessons": [
          {
            "id": "lesson-001",
            "title": "What is AI?",
            "type": "video",
            "duration": "15 min",
            "status": "completed",
            "url": "https://cdn.example.com/lessons/lesson-001.mp4"
          },
          {
            "id": "lesson-002",
            "title": "AI Applications",
            "type": "reading",
            "status": "in_progress",
            "url": "https://cdn.example.com/lessons/lesson-002.pdf"
          }
        ]
      }
    ]
  },
  "timestamp": "2026-06-26T10:30:00Z",
  "statusCode": 200
}
```

---

### Messages

#### GET `/api/messages`

Fetch user messages (inbox, sent, etc.).

**Query Parameters**

```
?folder=inbox            # inbox, sent, archived
&unreadOnly=false        # Show unread only
&limit=20
&offset=0
```

**Response** (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "msg-001",
      "from": {
        "id": "prof-001",
        "name": "Prof. Rachel Alum",
        "avatar": "https://cdn.example.com/avatars/rachel.jpg"
      },
      "subject": "Assignment Feedback - Neural Networks",
      "preview": "Great implementation! Your code is clean and efficient...",
      "createdDate": "2026-06-25T14:30:00Z",
      "isRead": false,
      "isStarred": true,
      "hasAttachments": true
    }
  ],
  "pagination": {
    "total": 42,
    "unreadCount": 3,
    "limit": 20,
    "offset": 0,
    "pages": 3
  },
  "timestamp": "2026-06-26T10:30:00Z",
  "statusCode": 200
}
```

#### GET `/api/messages/:messageId`

Fetch full message content.

**Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "msg-001",
    "from": {
      "id": "prof-001",
      "name": "Prof. Rachel Alum",
      "email": "rachel@school.ai"
    },
    "to": ["user-123"],
    "subject": "Assignment Feedback - Neural Networks",
    "body": "Great implementation! Your code is clean and efficient...",
    "createdDate": "2026-06-25T14:30:00Z",
    "isRead": true,
    "attachments": [
      {
        "id": "attach-001",
        "name": "feedback-notes.pdf",
        "size": "250KB",
        "url": "https://cdn.example.com/attachments/feedback-notes.pdf"
      }
    ]
  },
  "timestamp": "2026-06-26T10:30:00Z",
  "statusCode": 200
}
```

#### POST `/api/messages`

Send a new message.

**Request**

```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "to": ["prof-001"],
    "subject": "Question about Assignment",
    "body": "I have a question regarding...",
    "attachmentIds": ["attach-001"]
  }'
```

**Response** (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "msg-042",
    "to": ["prof-001"],
    "subject": "Question about Assignment",
    "createdDate": "2026-06-26T10:30:00Z",
    "status": "sent"
  },
  "timestamp": "2026-06-26T10:30:00Z",
  "statusCode": 201
}
```

---

### Resources

#### GET `/api/resources`

Fetch course resources (books, links, tools, etc.).

**Query Parameters**

```
?courseId=course-101     # Filter by course
&type=book               # book, link, tool, video
&limit=50
&offset=0
```

**Response** (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "res-001",
      "courseId": "course-101",
      "type": "book",
      "title": "Artificial Intelligence: A Modern Approach",
      "authors": ["Stuart Russell", "Peter Norvig"],
      "description": "Essential reference for AI concepts...",
      "isbn": "978-0136042594",
      "link": "https://aima.cs.berkeley.edu/",
      "availability": "library",
      "addedDate": "2026-01-15"
    },
    {
      "id": "res-002",
      "courseId": "course-101",
      "type": "tool",
      "title": "PyTorch",
      "description": "Deep learning framework in Python",
      "link": "https://pytorch.org",
      "documentation": "https://pytorch.org/docs/stable/index.html"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0,
    "pages": 1
  },
  "timestamp": "2026-06-26T10:30:00Z",
  "statusCode": 200
}
```

---

## Error Handling

### Common Error Codes

| Code | HTTP | Meaning | Example |
|------|------|---------|---------|
| `INVALID_REQUEST` | 400 | Missing or invalid parameters | Missing required `courseId` |
| `UNAUTHORIZED` | 401 | Missing or invalid auth token | Token expired or missing |
| `FORBIDDEN` | 403 | User lacks permission | Trying to access another user's data |
| `NOT_FOUND` | 404 | Resource doesn't exist | Course ID doesn't exist |
| `CONFLICT` | 409 | Resource already exists | User already submitted assignment |
| `RATE_LIMITED` | 429 | Too many requests | Exceeded rate limit |
| `INTERNAL_ERROR` | 500 | Server error | Database connection failed |

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Assignment not found",
    "details": {
      "assignmentId": "assign-999"
    }
  },
  "timestamp": "2026-06-26T10:30:00Z",
  "statusCode": 404
}
```

### Client Error Handling

```typescript
// In React component
const [error, setError] = useState<string | null>(null)

const fetchProfile = async () => {
  try {
    const res = await fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!res.ok) {
      const errorData = await res.json()
      setError(errorData.error.message)
      return
    }

    const { data } = await res.json()
    // Use data
  } catch (err) {
    setError('Network error. Please try again.')
  }
}
```

---

## Rate Limiting

### Limits

```
- Authenticated users: 1000 requests per hour
- Unauthenticated: 100 requests per hour
- Per-endpoint limits vary (more restrictive for expensive operations)
```

### Response Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1624699200  (Unix timestamp)
X-RateLimit-RetryAfter: 3600    (seconds)
```

### Handling Rate Limits

```typescript
if (response.status === 429) {
  const retryAfter = parseInt(response.headers.get('X-RateLimit-RetryAfter') || '60')
  console.log(`Rate limited. Retry after ${retryAfter} seconds`)
  
  // Exponential backoff
  setTimeout(() => retryFetch(), retryAfter * 1000)
}
```

---

## Caching Strategy

### ISR (Incremental Static Regeneration)

```typescript
// API routes with caching
export const revalidate = 3600  // Revalidate every hour

export async function GET(req: Request) {
  // First request: generates static response
  // Subsequent requests: serve cached response for 3600s
  // Background: async revalidate after 3600s
  
  const data = await fetchFromDatabase()
  return Response.json({ success: true, data })
}
```

### Client-Side Caching

```typescript
// In React component
const [cachedData, setCachedData] = useState(null)
const [cacheTime, setCacheTime] = useState<number | null>(null)

const CACHE_DURATION = 300000  // 5 minutes

const fetchWithCache = async () => {
  const now = Date.now()
  
  // Return cached if fresh
  if (cachedData && cacheTime && (now - cacheTime) < CACHE_DURATION) {
    return cachedData
  }

  // Fetch fresh data
  const res = await fetch('/api/data')
  const data = await res.json()
  
  setCachedData(data)
  setCacheTime(now)
  
  return data
}
```

---

## Examples

### Complete Example: Fetch and Display Grades

```typescript
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Grade {
  courseId: string
  courseName: string
  grade: string
  percentScore: number
}

export function GradesScreen() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        
        const res = await fetch('/api/grades', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!res.ok) {
          throw new Error('Failed to fetch grades')
        }

        const { data } = await res.json()
        setGrades(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchGrades()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {grades.map((grade, idx) => (
        <motion.div
          key={grade.courseId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1, duration: 0.6 }}
          className="p-4 border rounded-lg"
        >
          <h3>{grade.courseName}</h3>
          <p>Grade: {grade.grade} ({grade.percentScore}%)</p>
        </motion.div>
      ))}
    </div>
  )
}
```

### Example: Submit Assignment

```typescript
async function submitAssignment(assignmentId: string, submissionUrl: string) {
  const token = localStorage.getItem('auth_token')

  try {
    const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        submissionUrl,
        notes: 'Solution with optimization'
      })
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error.message)
    }

    const { data } = await res.json()
    console.log('Submitted:', data.submissionId)
  } catch (err) {
    console.error('Submission failed:', err)
  }
}
```

---

## Future: GraphQL API

When GraphQL is added (optional, Phase 2+):

```graphql
query GetUserProfile {
  user {
    id
    name
    email
    grades {
      courseId
      courseName
      grade
    }
    assignments(status: PENDING) {
      id
      title
      dueDate
    }
  }
}
```

---

## Summary

The בִּינָה API provides comprehensive endpoints for:

- User profile management
- Grade tracking and performance metrics
- Assignment submission and grading
- Course curriculum and resources
- Messaging and communication
- Resource library access

All endpoints use:
- Standard REST conventions
- JSON request/response format
- JWT authentication
- ISR caching (3600s revalidate)
- Rate limiting (1000 req/hr)
- Consistent error handling

See the example implementations above to integrate with React components.

