# בִּינָה (Binah) — System Handoff

Operator guide for deploying and running the platform. Read top to bottom once.

---

## 1. What this is

A Next.js 15 (App Router) platform for an AI academy — Hebrew, RTL, glassmorphism UI.
12 screens (dashboard, profile, calendar, curriculum, lessons, assignments, grades,
messages, resources, **broadcast/recording room**, **lesson builder**, settings),
JWT auth with onboarding, and a shared Redis-backed session/rate-limit/CSRF layer.

## 2. Stack — all free tier

| Concern | Service | Cost | Notes |
|--------|---------|------|-------|
| Hosting | **Vercel** (Hobby) | Free | Next.js native, CDN, auto HTTPS |
| Shared state | **Upstash Redis** | Free | sessions / rate-limit / CSRF |
| Data (future) | **Supabase** | Free | currently mock `/api/data` |
| TTS (optional) | **ElevenLabs** | Free tier | lesson narration |

## 3. Architecture (where things live)

- `app/[screen]/page.tsx` — dynamic screen router (auth-guarded). Maps URL → screen component.
- `components/screens/*` — one component per screen.
- `app/api/**` — API routes. Auth is JWT (`app/api/auth/login|register|me|refresh`, `lib/jwt.ts`) — **stateless, scales horizontally by design**.
- `lib/store/kv.ts` — shared KV (Upstash when env set, else in-memory). Backs:
  - `lib/security/session.ts` · `rate-limiting.ts` · `csrf.ts`
- `store/*.ts` — Zustand client state (auth, navigation, notifications).
- Data today is **mock** in `app/api/data/route.ts` (catalog reads are CDN-cached; per-user data is not).

## 4. Environment variables

The full contract is in **`.env.example`**. Required: `JWT_SECRET`, `UPSTASH_REDIS_REST_URL`,
`UPSTASH_REDIS_REST_TOKEN`. Everything else is optional and degrades gracefully.

- Local: copy to `.env.local` (gitignored — never commit).
- Production: set the same keys in **Vercel → Settings → Environment Variables**.

## 5. Local development

```bash
npm install
cp .env.example .env.local   # fill in JWT_SECRET + Upstash
npm run dev                  # http://localhost:3000
```

Demo login (student): `demo@binah.com` / `Demo@123`.
Admin login: `admin@binah.com` / `Admin@123` → "ניהול" appears in the sidebar; `/admin` is role-gated.
Change the admin password via the `ADMIN_PASSWORD` env var (see `.env.example`).

Useful checks:
```bash
npx tsc --noEmit             # type check (do NOT run `npm run build` while dev is running)
npm run build                # production build (stops/uses .next — run with dev server OFF)
```
> Note: running `npm run build` while `npm run dev` is live corrupts `.next`. If the dev
> server then errors with a missing chunk, stop it, `rm -rf .next`, restart.

## 6. Deploy to production (free) — step by step

The app needs a Git repo + a Vercel account (both free). The repo is already initialized
and committed locally (secrets excluded by `.gitignore`).

1. **Push to GitHub** (create an empty repo first):
   ```bash
   git remote add origin https://github.com/<you>/binah.git
   git push -u origin main
   ```
2. **Import to Vercel**: vercel.com → Add New → Project → import the GitHub repo.
   Framework auto-detected as Next.js. Build/output defaults are correct.
3. **Set env vars** in the Vercel project (Production + Preview): `JWT_SECRET`,
   `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (+ any optional ones).
4. **Deploy.** Every push to `main` auto-deploys; PRs get preview URLs.

CLI alternative: `npm i -g vercel && vercel` (interactive login), then `vercel --prod`.

## 7. Managing the services

- **Upstash**: dashboard shows keys/usage. Keys are namespaced `sess:` / `rl:` / `csrf:`.
  TTLs auto-expire entries — no cleanup job needed.
- **Rotate secrets**: regenerate the Upstash REST token (or `JWT_SECRET`) → update the
  Vercel env var → redeploy. Rotating `JWT_SECRET` logs everyone out (tokens invalidate).
- **Enable TTS**: set `ELEVENLABS_API_KEY` (and optional `ELEVENLABS_VOICE_ID`) → redeploy.
- **Smoke test after deploy**: `GET /api/security/test?test=all` should return `all_tests_passed`.

## 8. Known limitations / next steps (honest TODO)

1. **Data is mock.** `app/api/data/route.ts` serves static content. Wire Supabase for
   real per-user data + persistence. Schema draft: `supabase-schema.sql`.
2. **Realtime/WebSocket** (`lib/websocketServer.ts`) cannot run on Vercel serverless.
   Live messaging is inert until a WS server is hosted separately and `NEXT_PUBLIC_WS_URL` is set.
3. **Lesson builder AI is heuristic.** Transcript→scenes is client-side splitting
   (`segmentTranscript` in `components/screens/LessonBuilder.tsx`). Swap that one function
   for an LLM planner (add `ANTHROPIC_API_KEY` + a `/api/lesson/plan` route) for smart scenes.
   Auto-transcription of uploaded video needs an STT key (Whisper / ElevenLabs Scribe).
4. **Admin session/rate-limit stats** are best-effort (no cross-instance scan) — see
   `// ponytail:` comments in `lib/security/*`.

## 9. Quality gates before any deploy

- `npx tsc --noEmit` → 0 errors
- `npm run build` → succeeds
- `/api/security/test?test=all` → `all_tests_passed`
