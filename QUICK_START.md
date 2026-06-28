# בִּינָה Quick Start Guide (5-Minute Setup)

**Get the Binah platform running locally in under 5 minutes.**

---

## Prerequisites (Check These First)

- **Node.js 18+** (LTS recommended)
  - Check: `node --version` (should be v18.x or higher)
- **npm or yarn**
  - Check: `npm --version`
- **Git** (optional, for cloning)
- **A code editor** (VS Code recommended)

---

## Step 1: Install Dependencies (1 minute)

```bash
# Navigate to project directory
cd ai-ios

# Install all dependencies
npm install
```

That's it! NPM will download all required packages (React, Next.js, Framer Motion, Zustand, Tailwind).

---

## Step 2: Start Development Server (30 seconds)

```bash
npm run dev
```

You should see:
```
▲ Next.js 15.0.0
- Local:        http://localhost:3000
- Environments: .env.local

Ready in 2.5s.
```

---

## Step 3: Open in Browser (30 seconds)

Click the link or open: **http://localhost:3000**

You should see:
- 🎨 **Beautiful Student Profile screen** with glassmorphism UI
- 🌊 **Animated floating background blobs**
- 📱 **Responsive sidebar** on the left
- ✨ **Smooth parallax animations** as you scroll

---

## What's Running?

```
┌─────────────────────────────────────┐
│  bִּינָה Student Profile Screen      │
├─────────────────────────────────────┤
│  - Real-time hot reload (saves file │
│    → auto refresh in browser)        │
│  - Full parallax animations          │
│  - RTL-ready (Hebrew support)        │
│  - 60fps locked animations           │
└─────────────────────────────────────┘
```

---

## Available Commands

### Development
```bash
npm run dev      # Start hot-reload dev server
```

### Production Build
```bash
npm run build    # Compile for production
npm run start    # Run production build locally
```

### Code Quality
```bash
npm run lint     # Check ESLint errors
```

### TypeScript Check
```bash
npx tsc --noEmit # Verify TypeScript (no errors output)
```

---

## First Code Edit (Try This!)

1. Open `components/screens/StudentProfile.tsx`
2. Find the text "Student Profile" (around line 50)
3. Change it to "My Profile" and save
4. Browser automatically reloads - you'll see the change instantly!

---

## Common Issues & Fixes

### ❌ "Port 3000 already in use"
```bash
# Use a different port
npm run dev -- -p 3001
```

### ❌ "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### ❌ "TypeScript errors"
```bash
# Check the error details
npx tsc --noEmit
```

### ❌ No hot reload?
- Make sure you're editing files in the right directory
- Check that file ends with `.tsx` or `.ts`
- Restart the dev server: `Ctrl+C`, then `npm run dev`

---

## Project Structure Quick Tour

```
ai-ios/
├── app/
│   ├── page.tsx              # Main entry point
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
│
├── components/
│   ├── Sidebar.tsx           # Navigation sidebar
│   ├── AnimatedBackground.tsx # Floating blob animations
│   └── screens/
│       └── StudentProfile.tsx # Main screen
│
├── hooks/
│   ├── useParallax.ts        # Parallax engine
│   ├── useZoomTransition.ts  # Zoom animations
│   └── useMotionValue.ts     # Motion tracking
│
├── store/
│   └── navigationStore.ts    # State management (Zustand)
│
├── lib/
│   └── constants.ts          # Design system & colors
│
└── package.json              # Dependencies
```

---

## Next: Environment Setup (Optional)

Create `.env.local` in the root for API configuration (future):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NODE_ENV=development
```

> **Note**: Not required yet. The platform works without it for now.

---

## Performance Check

Open Chrome DevTools (`F12`):

1. **Performance tab**: Click record → scroll page → stop
   - Should see 60fps locked animations
2. **React DevTools**: Check for unnecessary re-renders
3. **Lighthouse**: Run audit (target: 90+ score)

---

## Next Steps

After getting the dev server running:

1. **Read** `ARCHITECTURE.md` to understand the design system
2. **Review** `COMPONENT_GUIDE.md` to learn how to add new screens
3. **Check** `BUILD_SUMMARY.md` for the complete project status
4. **Explore** the CLAUDE.md file for detailed guidelines

---

## Deployment Preview

When ready to ship:

```bash
# Build for production
npm run build

# This creates .next/ folder (ready for Vercel)
# Deploy to Vercel with one command:
npm install -g vercel
vercel deploy
```

See `DEPLOYMENT.md` for full deployment guide.

---

## Getting Help

- 📖 **Framework docs**: https://nextjs.org/docs
- 🎬 **Animation docs**: https://www.framer.com/motion
- 🎨 **Tailwind docs**: https://tailwindcss.com/docs
- 🛠️ **React docs**: https://react.dev

---

## Success Checklist

- ✅ Dev server running (`npm run dev`)
- ✅ Browser at `http://localhost:3000`
- ✅ Parallax animations visible on scroll
- ✅ Hot reload working (edit file → auto refresh)
- ✅ No console errors (F12 → Console tab)

**You're ready to develop! 🚀**
