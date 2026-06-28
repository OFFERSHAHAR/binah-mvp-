# Handoff: בִּינָה — AI Academy ("The House" hub + screens)

## Overview
**בִּינָה (Binah) · AI Academy** is an RTL (Hebrew) e-learning platform for an AI school
(implementation, development & problem-solving). It teaches AI in organizations through
interactive lessons, presentations, infographic videos, per-student personalized courses,
progress bars, and per-lesson quizzes/exams.

This bundle covers the screens designed so far and specifies **"The House"** — a unified,
immersive **zoom-in hub** that ties the whole product together and is the next thing to build.

## About the Design Files
The files in this bundle are **design references created in HTML** (Design Components — a
streaming, inline-styled HTML format). They are prototypes showing intended look and behavior,
**not production code to copy directly**. The task is to **recreate these designs in the target
codebase's environment** (React/Next, Vue, SwiftUI, etc.) using its established patterns,
component library, router, and state management. If no environment exists yet, choose the most
appropriate stack (recommended: **React + Vite + TypeScript**, RTL-first, Framer Motion for
the zoom transitions) and implement there.

The `.dc.html` files use a small custom runtime (`support.js`) for templating (`{{ }}` holes,
`<sc-for>`, `<sc-if>`) — **ignore that runtime**; reimplement the markup as normal components.
All styling is inline and directly translatable to CSS/Tailwind.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, radii, shadows and interactions
are specified below and present in the HTML. Recreate the UI pixel-perfectly using the
codebase's libraries. The one exception is **"The House" hub**, which is specified in prose
(section below) and should be built fresh from this spec.

---

## The visual system (apply to everything)

### Brand
- **Name:** בִּינָה  ·  tagline **AI ACADEMY** (letter-spacing .14em, uppercase Latin).
- **Logo mark:** 40×40 rounded square (radius 13px), gradient `135deg #9FB4F5 → #C3A8EE`,
  white "asterisk/spark" glyph (SVG: `M12 3v18M3 12h18` stroke #fff, width 2.4, round caps).
- **Aesthetic:** Apple **iOS 26 "Liquid Glass"**, **light/pastel**. Soft frosted-glass
  surfaces over a pale gradient field, blurred floating color orbs, subtle but alive hover.
  RTL throughout. Avoid heavy saturated indigo — keep pastels soft.

### Design tokens

**Page background (app field):**
`linear-gradient(170deg, #F8F7FD 0%, #F2F1FA 50%, #F2F9F6 100%)`

**Floating orbs (decoration, blurred, slow float):**
- Lavender `radial rgba(214,199,255,0.5)` · Mint `rgba(182,239,212,0.45)` · Peach `rgba(255,217,194,0.4)`
- `filter: blur(40–44px)`, animated 22–26s ease-in-out (translate + slight scale).

**Glass surfaces:**
- Card: `background: rgba(255,255,255,0.66–0.70)`, `border: 1px solid rgba(255,255,255,0.85)`,
  `backdrop-filter: blur(30px) saturate(160%)`, `box-shadow: 0 10–12px 26–30px rgba(80,70,140,0.06)`.
- Sidebar: `rgba(255,255,255,0.58)`, `backdrop-filter: blur(30px) saturate(160%)`,
  `border-left: 1px solid rgba(255,255,255,0.75)` (left because RTL).

**Primary gradient (buttons, active, accents):** `135deg #9FB4F5 → #C3A8EE` (periwinkle→lavender).

**Accent gradients (avatars / category tiles):**
- Periwinkle `#9FB4F5→#C3A8EE` · Peach-pink `#FFC8A8→#FFAFC8` · Mint `#7FD3C0→#9AD9F0`
- Rose `#F5B8C8→#E0A8E8` · Amber `#FFD08A→#FFB0A0` · Sky `#A7BCF5→#9AD9F0`

**Text colors:**
- Primary `#2E2E48` · Secondary `#7A7A92` · Muted/placeholder `#A6AABE`
- On-glass heading dark `#2A2A44` · Link/brand-purple `#8A7FD8` / `#6A5FC0` / `#5E5AA8`

**Semantic (status):**
- Success/active green `#2E9E72` text on `rgba(111,214,168,0.18)` bg; dot `#34C759`
- Warning/renew amber `#E5821A`/`#F2942E` on `rgba(255,191,140,0.22)`
- Danger/cancel red `#E5483C` on `rgba(255,107,107,0.16)`; dot `#FF453A`
- Notification badge pink `#FF6B8A`
- Progress-ring "done" mint `#46C99A`

**Typography:** Google Font **Heebo** (weights 300–900). Scale used:
- Page title 26px/800 · Section title 17–19px/800 · Card title 14.5–16.5px/800
- Body 13–15px/400–600 · Meta/caption 11–12.5px · KPI number 30px/800 · Hero number 34px/800
- Letter-spacing −.01em on large headings.

**Radii:** pill 99px · chips 11–13px · inputs 14–16px (pills 30px) · cards 22–24px ·
modal 26px · logo/icon tiles 11–20px.

**Spacing:** outer page padding 30px 36–40px · card padding 20–22px · grid gaps 16–18px.

**Shadows:** card `0 10–12px 26–30px rgba(80,70,140,0.06)` ·
hover lift `0 20–26px 40–50px rgba(80,70,140,0.14–0.18)` ·
button `0 8–14px 20–32px rgba(150,140,220,0.32–0.45)`.

### Reactive hover system ("subtle but alive")
Every interactive element animates on hover with iOS-style spring easing
`cubic-bezier(.34, 1.35, .5, 1)` (≈ .22–.32s):
- **Cards:** `translateY(-5 to -7px)` (+ optional `scale(1.015)`), shadow deepens, border → opaque white.
- **Nav items / list rows:** `translateX(-4px)` (RTL → moves left) + pastel tint
  `rgba(159,180,245,0.10–0.14)`, color → `#5E5AA8`.
- **Buttons:** `translateY(-2 to -3px)` + `scale(1.03)`, stronger glow.
- **"Show all" links:** color darken + `translateX(-3px)`.
- **Cancel button:** background → `rgba(255,69,58,0.12)`, text → `#E5483C`.

---

## Screens / Views

### 1. Login (secure) — 3 variations  → `Login.dc.html`
Canvas with 3 side-by-side frames, each 1180×820, radius 36px. RTL.
Chosen direction: **02 · Split**. All share: email+password, 2FA, Google/Apple SSO,
payment-status pill, admin-controlled translation.

- **01 · Aurora:** centered 432px-wide glass card over aurora-orb gradient field
  (`#EEF3FF→#F6F0FF→#ECFBF6`). Logo tile, "ברוך שובך" heading, email + password
  fields (54px, radius 16px, inset highlight), "מאובטח באימות דו-שלבי (2FA)" shield row,
  primary CTA "התחברות מאובטחת" (56px, radius 18px), divider "או המשך עם", Google + Apple
  buttons (50px, radius 15px), "הרשמה" link. Top-right pill "המנוי פעיל" (green dot);
  top-left pill "תרגום · מנהל" (globe).
- **02 · Split (CHOSEN):** two columns in a 1180×820 rounded shell.
  - **Right (form, 460px, white glass):** tab pills התחברות/הרשמה, heading "היכנס לחשבון שלך",
    email field, **2FA code field = 6 boxes** (48×56, radius 13px; first box focused:
    border `#5B7CFF` + ring `rgba(91,124,255,0.12)`), CTA "אימות והתחברות", Google/Apple,
    footer "חיבור מוצפן · 256-bit" with lock icon.
  - **Left (immersive panel):** gradient `150deg #5B7CFF→#7B6BFF→#9B6BFF` with white blurred
    orbs + twinkling dots. Pill "קורס מותאם אישית · פעיל", big headline "לְמַד AI. בְּנֵה. פְּתֹר.",
    paragraph, and two glass stat cards: a **70% progress ring** (mint stroke) and
    "שיעור נוכחי: Prompt Engineering" + "מבחן הבא 8/10 ✓" mini progress.
    *(Note: this immersive panel still uses the original blue-purple; when unifying, you may
    keep it as the one bold accent moment, or shift to the pastel field — see Open Questions.)*
- **03 · Minimal:** single 404px centered column, airy. Pill tabs, **pill-shaped inputs**
  (60px, radius 30px), "זכור אותי" toggle, primary "המשך" (radius 30px), step indicator
  "שלב 1 מתוך 2 · אימות 2FA בשלב הבא", Google/Apple pills, bottom "מאובטח · 2FA · הצפנה מקצה לקצה".

**2FA toggle behavior:** Login is step 1; entering credentials advances to a 6-digit code step
before dashboard. Translation is **admin-only** (a manager enables per-student; see Instructor).

### 2. Student Dashboard  → `Dashboard.dc.html`
RTL app shell: **sticky right sidebar (272px)** + scrolling main.

- **Sidebar:** logo + "AI ACADEMY"; nav (דף הבית active, הקורסים שלי, מצגות ומשאבים, מבחנים,
  הישגים); bottom block: **translation toggle** ("תרגום השיעור · הופעל ע״י המנהל", only shown
  when admin-enabled), **payment-status card** (active/renew/cancel — colored dot, label, sub,
  CTA + "ביטול"), user chip (avatar, name, "תלמיד · מסלול אישי").
- **Topbar:** greeting "בוקר טוב, <name> 👋" + sub; search field; status chip; avatar tile.
- **Hero "ממשיכים ללמוד":** pastel gradient `135deg #C7D4FF→#DACBFB→#C6ECF1`, "ממשיכים ללמוד"
  pill, current course + lesson, white "המשך שיעור" button (links to the course HTML),
  module + % text, and a **150×150 progress ring** (mint, shows 50%).
- **4 KPI cards:** התקדמות כוללת (% + bar), שיעורים שהושלמו (3/11), ממוצע מבחנים (88%),
  רצף למידה (5 ימים 🔥). Each: 34px icon tile in a pastel-tinted square + 30px number.
- **"הקורסים שלי":** 2-col cards — icon tile (gradient), title, meta, status tag, progress
  row + bar, footer chips (exam · time). Each links to the real course file.
- **"מצגות ומשאבים אינטראקטיביים":** 4-col media cards — 96px gradient header w/ tag pill +
  glyph, title + sub. Link to the resource HTML files.
- **Bottom split:** lesson list (status: הושלם/בתהליך/נעול pills) + "המבחן הקרוב" card +
  "התעודה שלך" card (unlock at 100%).
- **"צ׳אט עם המרצה" panel** (full-width, below the split): student↔instructor chat with the
  instructor's availability/office-hours shown. The **composer supports file & screenshot
  attachments** — paperclip + image buttons, an attachment chip row (thumbnail, filename, size,
  remove ✕) before sending, and sent messages can carry an image/file card
  (thumbnail + filename + size + "צילום מסך"). Wire to real upload + chat backend in production.

**Tweaks/props:** `studentName` (text), `paymentStatus` (enum active|renew|cancel),
`translationEnabled` (boolean, admin gate).

### 3. Instructor Console  → `Instructor.dc.html`
The lecturer's management interface (NOT the student's). RTL: sidebar (264px) + main +
348px right column.

- **Sidebar:** "קונסולת מרצה" tagline; nav with **badges** (מבחנים וציונים ·3, צ׳אט והודעות ·2);
  "הרשאות מרצה" card (only the instructor controls translation, personal course building, exam
  release) + "הוסף תלמיד"; instructor chip with link back to Dashboard.
- **Topbar:** "ניהול תלמידים" + counts; search; **🔔 notifications bell** with numeric badge →
  click opens a **340px glass dropdown** of live notifications (exam submitted, subscription
  cancelled, new chat message, course completed; unread pink dots; slideIn .22s animation);
  "תלמיד חדש" CTA.
- **4 KPI cards:** סך תלמידים, התקדמות ממוצעת, ממתינים לתשלום, מבחנים לבדיקה.
- **Students table** (main): columns תלמיד / קורס+progress / תשלום / **תרגום toggle** / chevron.
  Row click selects student (row highlights `rgba(159,180,245,0.10)`) and updates the side panel.
  The **translation toggle is per-student, instructor-only**; toggling flips the knob
  (slides left when on) and is independent per row.
- **Right column:**
  1. **Student profile card** — gradient header band, 64px avatar tile, name/email,
     3 stat tiles (progress / avg / lessons), a **translation row** (toggle + "מופעל — התלמיד
     יכול לתרגם כל שפה" / "כבוי — לחץ להפעלה"), and actions:
     **"בנה קורס מותאם אישית"** (primary), **"מבחן מתוזמן"** (amber) + **"הודעה"** (mint).
  - **Progression mode (per-student, instructor-only):** a "מצב התקדמות בקורס" control with two
    segmented options — **פתוח / Free** (all chapters accessible immediately) vs
    **מדורג / Gated** (next chapter unlocks only after the student finishes the current chapter
    with a score **≥ X**). When Gated, a threshold selector (60/70/80/90/100%) sets X; helper
    text: "החניך חייב לסיים כל פרק בציון X% ומעלה כדי שייפתח הפרק הבא." This drives the
    student-side lesson lock state (the "נעול" pills in the Dashboard lesson list).
  2. **Chat panel** — header with availability indicator ("זמין עכשיו" green, pulsing dot /
     "מחוץ לשעות" grey), **office-hours row** the instructor defines ("שעות קבלה: א׳–ה׳ ·
     18:00–21:00" + "ערוך"), message bubbles (in = grey right-aligned, out = gradient
     left-aligned), and a composer (input + send button).
- **Timed-exam modal** (opens from "מבחן מתוזמן"): exam picker, **time limit 15/30/45 min**
  segmented control, deadline, "נעילה אוטומטית בתום הזמן" toggle, ביטול / "שלח מבחן לתלמיד".
  Backdrop `rgba(46,46,72,0.32)` + blur(6px); modal 440px, radius 26px.

**Tweaks/props:** `instructorName` (text).

---

## Additional instructor screens (built — design references in this bundle)

### 4. Instructor — שבי assistant + progression + deadline (in `Instructor.dc.html`)
The instructor is named **שבי**. Additions on top of the console described above:
- **שבי — smart assistant:** a floating launcher (bottom-left, RTL) opening a glass chat panel.
  שבי is **connected to the data** and answers instructor queries in Hebrew over the live
  student/lesson dataset: who is lagging (progress<30), who hasn't paid, class average, exams to
  review, and per-student status by name. Quick-action chips + free-text input. In production wire
  to a real LLM with tool access to the DB (read-only over students/lessons/progress).
- **Progression mode (per-student):** פתוח (all open) vs מדורג (next chapter unlocks only at
  score ≥ X), with a 60/70/80/90/100% threshold selector.
- **Course deadline (per-student):** מועד הגשה with **הארכה / extend** (+1 week) and **ללא הגשה /
  no-deadline** (self-paced) — instructor-only.
- **Notification** fires when a student finishes a chapter above the threshold; bell badge is the
  live unread count.

### 5. Studio AI — media generation pipeline  → `Studio.dc.html`
Infrastructure for turning lesson text into infographic videos with narration. A 4-stage visual
**pipeline (תסריט → LLM → TTS → Text-to-Video)** with per-stage live status; a 16:9 preview
player with play/pause and a **live narration waveform**; the lesson script with a "rewrite with
LLM" action; generation settings (**LLM model, TTS voice [נועה/איתי/מאיה], video style, target
length**); and a **jobs queue** with spinners + progress. "צור סרטון" runs an animated generating
state. Production: wire stages to real LLM + TTS + text-to-video providers; queue = job backend.

### 6. Security & Authorization  → `Security.dc.html`
Admin console, **fully controlled by the instructor (שבי)**. Sections: **infrastructure** status
(PostgreSQL DB, AES-256 encrypted storage, API server, auto-backup — all live); **authentication**
toggles (2FA enforced, email+password, Google/Apple SSO, biometric, IP allowlist) + password
policy; **roles & permissions** (Instructor=full control, Student=limited, Guest/registrant=
pre-payment) each with a ✓/✕ permission list; **audit log**; **active sessions** with remote kick;
and a שבי security-monitoring note.

### 7. Teams & shared tasks  → `Teams.dc.html`
Dedicated collaborative environment where the instructor **combines students into teams** for a
shared task. **Team builder** modal (pick students; שבי suggests role split by strengths); team
switcher in the sidebar; per-team **shared workspace**: a collaborative board (sticky notes +
live presence cursors), a **shared checklist** with subtasks assigned per member + progress bar,
a **roster** with real-time presence, a **group chat** (שבי can auto-split tasks), and **shared
files**. Production: real-time sync (CRDT/WebSocket), presence, file storage.

### 8. Lesson Builder  → `LessonBuilder.dc.html`
The instructor builds a focused lesson by pulling pieces from the central **material repository**.
Three-column layout: **(right) מאגר החומרים** — all learning material in one place, grouped
(interactive presentations / videos & infographics / source PDFs / exercises) with type filters
and a "+" to add each item; **(center) Storyboard** — ordered lesson blocks of types **סרטון הסבר
(explainer video) · מצגת ויזואלית (visual demo) · זמן תרגול (practice) · מבחן (quiz)**, each
removable/reorderable, plus quick-add tiles; **(left)** a **שבי auto-build** card (assembles a
focused draft from the repo), lesson settings (course, difficulty, attach-quiz), and **publish**:
**save draft** or **import directly into the lessons database**. Also links out to Studio to
render the full video lesson. This is both an in-app builder AND a way to produce ready-made
lessons for direct import into the DB.

### 9. College Manager (Admin) dashboard  → `Admin.dc.html`
Top of the hierarchy — the college owner/manager with **full control over the whole system**.
Sections: KPI row (revenue, active subscriptions, instructors, overdue); **instructors management**
(list + **add-instructor modal with username + temporary password**, forced password change + 2FA on
first login); **subscriptions & suspensions** (auto-suspend when payment fails/cancels — access
blocked until resolved; manual suspend/reactivate); **accounting — invoices & receipts** (Israeli
חשבונית מס/קבלה, generate docs); **billing infrastructure** — connect to a licensed Israeli
payment processor (e.g. **Tranzila**), PCI-DSS; **we do NOT build a payment UI**, only integrate a
paid service; **payment demands / dunning**; **engagement contracts** (contract builder + statuses,
incl. a default terms/IP template); and an **administrative chat** answering students' admin
questions. Clear hierarchy: Manager → Instructors → Students.

### 10. Lesson calendar  → `Calendar.dc.html`
Week/month schedule of lessons. **Schedule-lesson modal** with title/date/time, auto-generate a
**protected Zoom link**, and attach material from the repo. A live-lesson day shows a **“zoom חי”**
badge; the detail card carries the **personal protected Zoom link (non-shareable)** + uploaded
lesson material. Includes an **Open-Source export toggle**: only material explicitly marked
open-source can be shared freely; everything else stays protected as IP.

### 11. Live broadcast control room  → `Record.dc.html`
Semi-automatic control room that helps an instructor run an **engaging, lively live stream** of
original content. Program monitor (camera) with a live **lower-third / graphic overlay**, LIVE +
viewer count + go-live/stop; an **interactive lesson timeline** auto-built from the recognized
material (scenes: intro / theory / live demo / practice / Q&A, click to switch, ON-AIR marker); a
**per-lesson graphics kit tailored to the subject** (lower-thirds, infographic diagrams, concept
callouts, live poll, practice timer — tap to fire to air; the broadcaster can prepare a preset kit);
broadcast controls (camera/mic/screen/overlay toggles); a **שבי broadcast assistant** giving
semi-automatic suggestions (“now show the 4-layer diagram”); and live viewer questions. Production:
WebRTC/RTMP streaming, real-time graphics compositor, recording → hand off to Studio for editing.

### Student scoping (in `Dashboard.dc.html`)
The student interface exposes **only the calendar + material of the course they enrolled in** — a
יומן ושיעורים חיים nav item, a **live-lesson card** with a personal protected Zoom link
(“רק לקורס שלך”). Entitlement must be enforced server-side per enrolled course.

---

## ⭐ NEXT TO BUILD — "The House" (immersive zoom-in hub)

A single landing **hub** that visually represents בִּינָה as a **house/academy building**, where
each room/zone is a destination. Navigation is an **immersive zoom-in**: clicking a zone scales
+ translates the camera into that zone, which then cross-fades into the corresponding screen
(Login if logged-out, else Dashboard or Instructor).

### Intent & feel
- Default low-motion is fine (the rest of the product is calm), but the House is the one
  **"immersive / parallax"** moment: gentle pointer-parallax on the layered scene, soft depth,
  the floating pastel orbs from the design system drifting behind glass.
- Same pastel iOS 26 Liquid-Glass system — **do not** introduce new colors; reuse the tokens above.

### Layout (suggested)
- Full-viewport stage, RTL. A central **glass "house"** composition (rooms as rounded-glass
  panels arranged in a façade/grid). Recommended zones:
  - **כניסה / Login** (door) — to `Login`.
  - **הקורסים שלי / Student** (lit window) — to `Dashboard`.
  - **קונסולת מרצה / Instructor** (top room w/ badge) — to `Instructor`.
  - **מצגות ומשאבים** (shelf room) — to resources grid.
  - **מבחנים** (clock room) — to exams.
- Each zone: gradient icon tile + Hebrew label + 1-line sub, on a glass panel with the standard
  hover lift. A header lockup (logo + "AI ACADEMY") and a small auth/status chip top-corner.

### Zoom-in interaction (the core)
- On zone click: animate a **camera transform** — `transform: scale()` + `translate()` on the
  stage so the clicked panel fills the viewport (origin = panel center), ~600–700ms,
  easing `cubic-bezier(.34,1.35,.5,1)` for arrival, with the rest of the scene blurring/fading.
- At the end of the zoom, **route** to the destination screen (cross-fade). Reverse on back:
  zoom-out to the house. Use **Framer Motion** `layout`/`AnimatePresence` or a shared-element
  transition; keep a `reduce-motion` fallback (instant fade).
- **Pointer parallax:** layered orbs + house panels translate a few px opposite the cursor
  (`transform: translate(calc(var(--mx)*-8px), calc(var(--my)*-6px))`) — subtle.
- Optional: very light particle drift behind the glass (low count, low opacity) — the user asked
  for "particles / parallax immersive"; keep it tasteful, respect reduce-motion.

### Routing logic
- Logged-out → House → click any zone → **Login** (Split variation).
- Logged-in **student** → House → zones route to Dashboard / resources / exams.
- Logged-in **instructor/admin** → House shows the **Instructor** zone enabled.

---

## Interactions & Behavior (global)
- **Navigation:** sidebar/links route between screens; `<a href>` in the prototypes maps to the
  app router. Course/resource cards open the corresponding lesson/presentation.
- **Translation gate:** student-side translation UI only appears when an instructor enabled it
  for that student. Instructor toggles are per-student and persist (server-side in production).
- **Notifications:** bell badge count (dynamic = number of unread); dropdown lists items with
  unread dots; "סמן הכל כנקרא". **Includes a notification when a student completes a chapter with
  a score above the threshold X** (e.g. "אורי בר סיים מודול 3 בציון 91% — מעל הסף, נפתח הפרק הבא").
- **Timed exams:** instructor assigns exam + time limit + deadline + auto-lock; student sees a
  countdown; on expiry the exam auto-submits/locks. (Student-side timer screen = TODO.)
- **Chat office hours:** instructor defines availability windows; status indicator reflects
  whether "now" is inside a window; messages are bubbles; composer sends.
- **Animations:** hover springs `.22–.32s cubic-bezier(.34,1.35,.5,1)`; modal/dropdown
  `slideIn .2–.22s`; orbs float 22–26s; notification dot `pulseDot 2s`.
- **Progress rings:** SVG circle, `r=64` (hero) / `r=36` (mini), `stroke-dasharray=2πr`,
  `stroke-dashoffset = circ*(1 − pct/100)`, rotated −90°, mint stroke `#46C99A`.

## State Management
- `auth`: { loggedIn, role: 'student'|'instructor', twoFAVerified }.
- `student`: { name, paymentStatus: active|renew|cancel, translationEnabled, progress, avgScore,
  streak, lessonsDone/Total, currentCourse, currentLesson }.
- `instructor`: { name, students[] }, each student: { name, email, course, progress, avg,
  lessons, payment, translationOn }.
- UI: `selectedStudentId`, `notifOpen`, `examModalOpen`, per-row `translationOn` map,
  `houseZoomTarget` (for the hub transition).
- Data fetching: courses, lessons, quiz results, messages, notifications, office-hours config.

## Design Tokens
(See "Design tokens" above — colors, gradients, type scale, radii, spacing, shadows are all
enumerated there.)

## Assets
- **Font:** Heebo (Google Fonts), weights 300–900.
- **Icons:** inline stroke SVGs (Lucide-style, stroke-width 2, round caps). Replace with the
  codebase's icon set (Lucide recommended) — paths are in the HTML if you need exact glyphs.
- **No raster images** — all decoration is CSS gradients/orbs. The course/presentation content
  lives in the uploaded HTML/PDF/PPTX source files (see project `uploads/`).
- **Logo:** the gradient asterisk mark described under Brand (recreate as a component/SVG).

## Paid access & anti-sharing strategy (CRITICAL — must implement)
The course is paid; access must bind to the **identity that paid**, never to a URL. Layers:
1. **Account-based access, not links.** Every gated page/asset requires a signed session token
   (JWT) issued only after authenticated login. Sharing a URL is useless — it redirects to Login.
2. **Per-user entitlement check** on every request: does this user have an `active` subscription
   to this course? `renew`/`cancel` → blocked. (Already modeled as per-student payment status.)
3. **Concurrent device/session limit:** a subscription allows up to 1–2 active devices; a new
   login bumps the oldest or requires approval. The "active sessions" panel in `Security.dc.html`
   with remote "kick" is the surface for this.
4. **Anomaly detection:** flag simultaneous logins from distant IPs, rapid device switching,
   non-human access hours. \u05e9\u05d1\u05d9 already surfaces "unusual access attempts" — feed this in.
5. **2FA binds login to the payer's phone**, making credential sharing hard at scale.
6. **Content protection (light DRM):** serve videos as authenticated streams via short-lived
   **signed URLs** (expire in minutes), not downloadable files; add a **dynamic watermark** with
   the student's name/email burned into the video to deter screen-recording and redistribution.
7. **One-time activation voucher:** payment issues an activation code bound to a single account;
   once redeemed it is non-transferable.
Most of this rides on infrastructure already shown (2FA, payment status, sessions, \u05e9\u05d1\u05d9 monitoring);
the build team should make device-limit + signed-URL streaming + watermark explicit in the backend.

## Files (in this bundle)
- `Login.dc.html` — 3 login variations (canvas).
- `Dashboard.dc.html` — student dashboard (+ instructor chat with file/screenshot attach).
- `Instructor.dc.html` — instructor console: table, notifications, chat, timed-exam modal,
  progression mode, course deadline, and the **שבי** assistant.
- `Studio.dc.html` — AI media pipeline (Script→LLM→TTS→Text-to-Video).
- `Security.dc.html` — security, authentication, roles & permissions, infrastructure.
- `Teams.dc.html` — teams & shared-task collaborative environment.
- `LessonBuilder.dc.html` — lesson builder over the central material repository.
- `Admin.dc.html` — College Manager dashboard (instructors, accounting, billing, contracts).
- `Calendar.dc.html` — lesson calendar with protected live-Zoom links + material.
- `Record.dc.html` — semi-automatic live broadcast control room.
- `Approvals.dc.html` — lesson-approval flow (queue, שבי quality review, request-changes thread).
- `GraphicsAgent.dc.html` — auto-format-detecting graphics-package agent (Parallax / Hype-type /
  Captions / interactive presentations), files-into-folders output.
- `Curriculum.dc.html` — head-of-domain curriculum builder (the binding course structure standard).
- `StudentProfile.dc.html` — student profile (shareable info, contact, final projects + live IDE,
  alumni network), achievement badges.
- `Media.dc.html` — media & social dashboard: content agent generating 5 variants per post
  (Reels / TikTok / Post / Video) with expert LLMs, scheduled to publish.
- `LiveAssist.dc.html` — discreet in-lesson difficulty signals + silent reinforcement.
- `SystemHealth.dc.html` — self-healing monitor, instant alerts, fallback mode, own mailer.
- `FocusSound.dc.html` — focus-frequency tool (real binaural audio + terms gate + sources).
- `support.js` — the prototype runtime (reference only; **do not port**).

**Accessibility:** `Dashboard.dc.html` has a global **"מצב הפרעת קשב"** toggle that switches all
content the student touches into an accessible mode (larger/clearer text, wider spacing, fewer
distractions) — for students with ADHD or learning differences. Implement as a global a11y theme.

## Data storage, IP protection & observability (architecture — must implement)

**Where all learning material lives.** A single governed **content repository** is the source of
truth: structured metadata in the primary DB (PostgreSQL), and binary assets (videos, slide
exports, graphics kits, PDFs) in **encrypted object storage (AES-256 at rest)**. Nothing is
served as a public file — every asset is fetched through an authenticated gateway that checks the
caller's entitlement first.

**Full IP protection (the course content is proprietary).**
- **Video:** DRM (Widevine/FairPlay/PlayReady) + **short-lived signed URLs** (expire in minutes) +
  **dynamic forensic watermark** (student name/email/ID + timestamp burned per-session) so any
  leak is traceable. Screen-recording cannot be 100%-blocked on web — see the recording answer:
  DRM black-frames + watermark + native-app FLAG_SECURE/`isCaptured` for sensitive lessons.
- **Zoom links & live material:** personal, signed, non-shareable; access bound to enrolled-course
  entitlement.
- **Open-source export:** only material explicitly flagged `open_source` may be shared freely;
  everything else stays protected. The flag is per-asset and enforced at the gateway.

**Brand watermark on ALL instructor-made materials.** Every output produced by an instructor
(documents, videos, workbooks, graphics) must carry the college branding as a watermark, and must
**speak one design language** — the בִּינָה pastel iOS-26 system (tokens above). The Graphics
Agent and Lesson Builder apply the brand watermark + design tokens automatically; the approval
flow (`Approvals.dc.html`) rejects anything off-brand. Maintain a single brand kit (logo,
watermark asset, color/type tokens) the generators read from.

**Logging & observability (separate analytics DB).** Every action is written as an immutable event
to a **separate logging/analytics datastore** (not the operational DB) for later analysis and
product improvement: auth events, content access, payments, lesson edits/approvals, live-lesson
signals, agent generations. Use it for dashboards and to improve the product.

**Errors, fallbacks & incident handling.**
- Every chatbot/agent has a **pre-defined fallback** (graceful canned response + handoff) when it
  can't answer or a tool fails — never a dead end.
- On any error or fallback, fire an **immediate alert to the platform admin**, auto-dispatch the
  appropriate **diagnostic agent** to investigate, and escalate to an **incident-handling agent**.
- All of the above is logged to the analytics DB for root-cause analysis.

## Open questions for the team
1. **Immersive panel color:** keep the Login Split's bold blue-purple panel, or recolor to the
   pastel field for full consistency? (Recommend: pastel, with one slightly deeper accent.)
2. **Tech stack** if greenfield (recommend React+Vite+TS, Framer Motion, RTL via `dir="rtl"`
   and logical CSS properties).
3. **Translation engine** (which provider) and which languages to expose to students.
4. **Backend** for auth/2FA, payments (active/renew/cancel), progress, quizzes, chat, office hours.
