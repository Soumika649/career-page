# Tech Spec — Careers Page Builder

A multi-tenant careers-page builder. Recruiters create and publish a branded careers page per company; candidates browse open roles across all published companies with no login required.

**Routes**
| Route | Who | Purpose |
|---|---|---|
| `/` | Everyone | Shared homepage — job search + company discovery |
| `/login` | Recruiter | Sign up / log in |
| `/dashboard` | Recruiter | Create/manage companies |
| `/<slug>/edit` | Recruiter (owner) | Edit company page, sections, jobs |
| `/<slug>/preview` | Recruiter (owner) | Preview before publishing |
| `/<slug>/careers` | Everyone | Public careers page |

---

## 1. Assumptions

- One recruiter owns one or more companies; a company can have many sections and many jobs.
- Only **published** companies are publicly visible; only **open** jobs are publicly listed.
- Candidates never need an account to browse.
- Auth is handled entirely by Supabase Auth; passwords require 8+ characters.
- Deleting a company cascades to delete its sections and jobs.
- Not in scope for this version: job applications, candidate accounts, payments, custom domains, analytics.

---

## 2. Architecture

```
Browser
  │
  ▼
Next.js (App Router)
  ├── Public pages (/,  /<slug>/careers)      → read-only Supabase queries
  └── Recruiter pages (/login, /dashboard,     → Supabase Auth (SSR cookies)
      /<slug>/edit, /<slug>/preview)             + Server Actions for writes
  │
  ▼
Supabase (Postgres + Auth)
  ├── companies
  ├── sections
  └── jobs
  (Row Level Security enforces ownership + public visibility)
```

**Key files**
- `src/app/page.tsx` — homepage: loads published companies + open jobs, passes them to `HomeJobBrowser`
- `src/components/HomeJobBrowser.tsx` — client-side search/filter UI
- `src/lib/supabase/{server,client,middleware}.ts` — Supabase access + session handling

**Why this stack:** Next.js + Supabase gives multi-tenant CRUD with auth and DB-enforced data isolation without a separate backend, and Server Actions keep writes colocated with the routes that trigger them.

---

## 3. Schema

```sql
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  name text not null,
  tagline text default '',
  logo_url text default '',
  banner_url text default '',
  culture_video_url text default '',
  primary_color text not null default '#14213D',
  accent_color text not null default '#E3B23C',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  body text not null default '',
  image_url text default '',
  position integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  job_slug text not null,
  department text default '',
  location text default '',
  work_policy text default 'Onsite',
  employment_type text default 'Full time',
  experience_level text default 'Mid-level',
  job_type text default 'Permanent',
  salary_range text default '',
  description text default '',
  is_open boolean not null default true,
  posted_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, job_slug)
);
```

**Relationships:** `auth.users` 1:N `companies` (via `owner_id`) → 1:N `sections` and 1:N `jobs` (via `company_id`), both `on delete cascade`.

**RLS policies (summary):**
- Public `select`: `companies` where `is_published = true`; `sections`/`jobs` where the parent company is published (`jobs` also requires `is_open = true`).
- Owner `insert/update/delete`: only where `companies.owner_id = auth.uid()` (and, for `sections`/`jobs`, where the parent company's `owner_id = auth.uid()`).
- Table grants (`select/insert/update/delete` to `authenticated`, `select` to `anon`) are required alongside RLS — grants and policies together determine actual access.

A job is publicly visible only when its parent company is published **and** `is_open = true`. Do not disable RLS or expose the Supabase service-role key client-side.

---

## 4. Test plan

**Unit**
- Slug generation ("Northwind Labs" → `northwind-labs`)
- Password validation (rejects < 8 characters)
- Homepage search/filter logic (e.g. searching "React" returns only matching jobs)

**Auth & authorization**
- Signup / login / logout work; invalid credentials show a readable error
- `/dashboard` and `/<slug>/edit` redirect unauthenticated users to `/login`
- Owner can create/edit/delete their own company, sections, and jobs

**RLS isolation (critical)**
- Create two recruiter accounts, each owning a company
- Confirm recruiter A cannot read/write recruiter B's company, sections, or jobs — via direct Supabase calls, not just the UI

**Public access**
- Published company's `/<slug>/careers` returns 200; unpublished returns 404
- Closed jobs (`is_open = false`) and hidden sections (`is_visible = false`) don't appear publicly

**Homepage**
- Loads and shows jobs/companies without login
- Search and each filter (location, job type, work policy) narrow results correctly; "clear filters" restores the full list

**End-to-end walkthrough:** browse as a visitor → sign up as a recruiter → create a company → add a section and a job → publish → confirm the public page works logged out → log out and confirm it still works.

**Known gap:** no automated E2E coverage (Playwright/Cypress) yet — flagged as a next step.

---

## 5. Scaling & next steps

- **Search/filtering** is client-side, fine for a demo dataset; move to database-side filtering/full-text search once job counts grow (roughly: >1k jobs → pagination, >10k → DB-side filtering, >100k → dedicated search index).
- **Job detail pages** (`/<slug>/careers/<job-slug>`) would make individual jobs shareable — not built yet.
- **Media** (logos/banners) should move to CDN-backed storage as companies scale.
- **Production hardening:** rate limiting on auth endpoints, stricter input/URL validation, audit logging for recruiter actions, automated RLS tests.
- The core design decision — one shared homepage for both candidates and recruiters rather than separate apps — keeps the current build simple while leaving room to grow into a full job-discovery platform (saved jobs, applications, job-seeker accounts) later.
