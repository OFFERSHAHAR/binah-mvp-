# בִּינָה - Supabase Backend Setup Guide

## ⚡ Quick Setup (15 minutes)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click **"New project"**
3. Project name: `binah-ai-academy`
4. Create a strong database password
5. Region: Choose closest to you
6. Click **"Create new project"** (wait ~2-3 minutes)

### Step 2: Run Database Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy all contents from `supabase-schema.sql`
4. Paste into the editor
5. Click **"Run"**
6. Confirm all tables are created

### Step 3: Enable Authentication
1. Go to **Authentication** → **Providers**
2. Enable **Email** (already enabled)
3. Optional: Enable **GitHub OAuth** or **Google OAuth**
   - For GitHub: Add your OAuth app credentials
   - For Google: Add your Google OAuth app credentials
4. Save settings

### Step 4: Get API Keys
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### Step 5: Configure Next.js Environment
1. Create `.env.local` in project root
2. Add these variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-key...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 6: Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### Step 7: Test Connection
Run dev server and check console for connection success:
```bash
npm run dev
```

---

## 📊 Database Schema Overview

### Core Tables
- **users** - User profiles with roles
- **courses** - Course catalog
- **lessons** - Course content
- **assignments** - Tasks for students
- **submissions** - Student assignment submissions
- **grades** - Student grades and scores
- **messages** - Notifications and messaging

### User Flows

**Student Enrollment:**
```
1. Sign up → Create user profile
2. Browse courses → Enroll in course
3. View lessons → Mark complete
4. Submit assignments → Get grades
```

**Real-time Features:**
- Messages via real-time subscriptions
- Live grade updates
- Assignment notifications

---

## 🔐 Security Features

✅ Row Level Security (RLS) on all tables
✅ Role-based access control (student/instructor/admin)
✅ JWT authentication via auth.users
✅ Data isolation per user
✅ Secure API keys in environment variables

---

## 🚀 Next Steps

### 1. Add Authentication UI
Use the provided hooks in `hooks/useSupabase.ts`:
- `useAuth()` - Handle login/signup
- `useUserProfile()` - Manage user data

### 2. Connect Dashboard
Update `components/screens/Dashboard.tsx`:
```typescript
import { useAuth } from '@/hooks/useSupabase'
import { useUserCourses } from '@/hooks/useSupabase'

export const Dashboard = () => {
  const { user } = useAuth()
  const { courses } = useUserCourses(user?.id)
  // Now use real data!
}
```

### 3. Add Real-time Notifications
Use `useMessages()` hook for live updates:
```typescript
const { messages, sendMessage } = useMessages(user?.id)
```

### 4. Implement Data Persistence
Replace mock data with database queries in all screens

---

## 🐛 Troubleshooting

### "Unauthorized" Error
→ Check `.env.local` has correct keys
→ Verify keys are not wrapped in quotes

### "NEXT_PUBLIC_SUPABASE_URL is required"
→ Add `NEXT_PUBLIC_` prefix to URL
→ Restart dev server after adding env vars

### RLS Policy Errors
→ Check you're logged in (authenticated user)
→ Verify RLS policies in SQL tab
→ Run: `SELECT * FROM pg_policies;`

### Tables not showing in API
→ Go to Settings → API → Disable "Expose as REST"
→ Then enable it again to refresh

---

## 📖 Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Authentication](https://supabase.com/docs/guides/auth/overview)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime/overview)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)

---

## ✅ Completion Checklist

- [ ] Supabase project created
- [ ] Database schema imported
- [ ] API keys in `.env.local`
- [ ] `@supabase/supabase-js` installed
- [ ] Dev server runs without errors
- [ ] Can create user account
- [ ] Can log in
- [ ] Dashboard shows real data

Once all checked, your backend is ready! 🎉
