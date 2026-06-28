-- בִּינָה — schema fitted to the app's custom JWT auth (NOT Supabase Auth).
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- RLS is ON with no anon policies; the app server uses the service_role key
-- (which bypasses RLS), so nothing is exposed to the publishable/client key.

-- ---------- USERS (custom auth) ----------
create table if not exists public.app_users (
  id            text primary key,
  email         text unique not null,
  password_hash text not null,
  name          text not null,
  role          text not null default 'student' check (role in ('student','teacher','admin')),
  email_verified boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- CONTENT ----------
create table if not exists public.courses (
  id          text primary key,
  title       text not null,
  description text,
  lessons     int  default 0,
  hours       int  default 0,
  progress    int  default 0,
  gradient    text,
  icon        text,
  sort_order  int  default 0
);

create table if not exists public.lessons (
  id          text primary key,
  course_id   text references public.courses(id) on delete cascade,
  number      int,
  title       text,
  description text,
  duration    text,
  video_time  text,
  completed   boolean default false
);

create table if not exists public.assignments (
  id          text primary key,
  title       text,
  description text,
  course      text,
  due_date    text,
  priority    text,
  status      text,
  progress    int default 0,
  gradient    text
);

create table if not exists public.grades (
  id      bigint generated always as identity primary key,
  subject text,
  grade   int,
  status  text
);

create table if not exists public.messages (
  id        bigint generated always as identity primary key,
  sender    text,
  body      text,
  time_label text
);

-- ---------- RLS (server uses service_role; deny everyone else) ----------
alter table public.app_users  enable row level security;
alter table public.courses    enable row level security;
alter table public.lessons    enable row level security;
alter table public.assignments enable row level security;
alter table public.grades     enable row level security;
alter table public.messages   enable row level security;

-- ---------- SEED CONTENT (matches current mock /api/data) ----------
insert into public.courses (id,title,description,lessons,hours,progress,gradient,icon,sort_order) values
 ('course-1','סוכני AI בארגון','בנה סוכנים אינטליגנטיים לעסק שלך',12,18,60,'linear-gradient(135deg, #9FB4F5, #C3A8EE)','M12 2l2.2 5.6L20 9l-5.8 1.4L12 16l-2.2-5.6L4 9z',1),
 ('course-2','Python מתחילים','בנה בסיס חזק בשפת Python',8,12,100,'linear-gradient(135deg, #7FD3C0, #9AD9F0)','M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',2),
 ('course-3','LLMs ו-RAG','עבד עם מודלים גדולים של שפה',10,15,25,'linear-gradient(135deg, #FFD08A, #FFB0A0)','M12 2l9 5v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V7z',3)
on conflict (id) do nothing;

insert into public.grades (subject,grade,status) values
 ('סוכני AI בארגון',92,'מעולה'),('Python מתחילים',88,'טוב מאד'),('LLMs ו-RAG',85,'טוב');

insert into public.messages (sender,body,time_label) values
 ('המורה: אלעד גבע','שלום! איך הלימוד הולך?','היום 14:23'),
 ('כיתה: סוכני AI','מי עוזר לי עם הפרויקט?','אתמול 18:10'),
 ('סקי: רוניה אלדר','צירוף קובץ לבדיקה...','שני 10:45');
