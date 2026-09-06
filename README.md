# Careers Page Builder

A full-stack careers page builder built with **Next.js, React, TypeScript, Tailwind CSS, and Supabase**.

- **Job seekers** browse published companies and open jobs from the shared homepage, and visit each company's public careers page — no account needed.
- **Recruiters** sign up, create a company, customize its careers page (branding, sections, jobs), preview it, and publish it.

**Live app:** https://career-page-cfp8.onrender.com/
**Repo:** https://github.com/Soumika649/career-page

> The app is on Render's free tier — if it's been idle, the first load can take 30–60 seconds while it wakes up.

---

## What's built

**Job seekers:** search by job title/company/department, filter by location/job type/work policy, browse published companies, open a company's public careers page — all without an account.

**Recruiters:** sign up/log in, create a company, edit its careers page (branding, sections, jobs), preview, publish, and reach the public page at `/<company-slug>/careers` (e.g. `/northwind-labs/careers`).

## Tech stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack React framework |
| React + TypeScript | UI, type safety |
| Tailwind CSS | Styling |
| Supabase | Auth + Postgres database |
| Supabase SSR | Server-side session handling |
| Next.js Server Actions | Form/database writes |

## Project structure

```text
src/
├── app/
│   ├── page.tsx                # Shared homepage
│   ├── login/                  # Login/signup
│   ├── dashboard/               # Recruiter dashboard, company creation
│   └── [slug]/
│       ├── careers/            # Public careers page
│       ├── edit/                # Recruiter editor
│       └── preview/             # Recruiter preview
├── components/
│   └── HomeJobBrowser.tsx      # Homepage search/filter UI
└── lib/supabase/                # client / server / middleware helpers

supabase/
├── schema.sql                   # Tables + RLS policies
├── seed_jobs.sql                # Sample jobs
└── seed_sections.sql            # Sample sections
```

---

## Running it locally

**Requirements:** Node.js 18.18+, npm, a Supabase project.

```bash
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
(Supabase Dashboard → Project Settings → API)

**Set up the database** — in Supabase's SQL Editor, run `supabase/schema.sql`, then grant table access:
```sql
grant select, insert, update, delete on public.companies to authenticated;
grant select, insert, update, delete on public.sections to authenticated;
grant select, insert, update, delete on public.jobs to authenticated;
grant select on public.companies to anon;
grant select on public.sections to anon;
grant select on public.jobs to anon;
```
Don't disable RLS — public read access depends on it.

**Run it:**
```bash
npm run dev
```
Open http://localhost:3000

---

## Using it

1. Go to `/login?mode=signup` and create a recruiter account
2. You'll land on `/dashboard` — create a company (e.g. "Northwind Labs" → `northwind-labs`)
3. Go to `/<slug>/edit` — add branding, sections, and jobs (mark `is_open = true` on jobs you want public)
4. Check `/<slug>/preview`, then publish (`is_published = true`)
5. Visit `/<slug>/careers` in an incognito window to confirm it works without login
6. Check `/` to confirm the company/jobs show up in search and filters

To skip manual setup, `supabase/seed_jobs.sql` / `supabase/seed_sections.sql` add sample data for `northwind-labs`, `atlas-robotics`, and `brightpath-health` — create those companies (with valid `owner_id`s) first so the seed rows can attach.

## Security model

Enforced via Supabase Row Level Security:
- Public visitors can only read published companies, their visible sections, and open jobs.
- Recruiters can only manage records tied to companies they own (`auth.users.id → companies.owner_id → sections / jobs`).
- No service-role key is exposed to the frontend.

## Testing checklist

- **Auth:** signup, login, invalid-password error, logout → `/`
- **Recruiter:** create/edit company and sections/jobs, publish
- **Job seeker:** homepage loads logged out, search + all three filters work, public careers page loads without login
- **Security:** two recruiter accounts — confirm recruiter A cannot edit recruiter B's company or jobs (this is the most important test)

## Common issues

| Problem | Check |
|---|---|
| `supabaseUrl is required` | `.env.local` values are set, dev server restarted |
| `permission denied for table companies` | Grant statements above were run; RLS still enabled |
| Careers page 404s | `companies.is_published = true`, slug is correct |
| Jobs missing from homepage | `jobs.is_open = true` **and** parent company is published |
| Login keeps redirecting | Check `src/proxy.ts` and `src/lib/supabase/{middleware,server}.ts` |

## Improvement plan

| Feature | Status |
|---|---|
| Shared homepage, search, filters | Done |
| Recruiter auth, dashboard, editor, preview, publish | Done |
| Public careers pages | Done |
| Pagination on homepage job list | Done |
| Job detail pages (`/<slug>/careers/<job-slug>`) | Planned |
| Candidate accounts, saved jobs, applications | Planned |
| Job recommendations / AI matching | Planned |
| Analytics, custom domains | Planned |

If this went live, the first priorities would be job detail pages (shareable job URLs) and homepage pagination before testing against hundreds of companies — see `TECH_SPEC.md` for the scaling discussion.

**Project goal:** recruiters can build structured, branded careers pages, while candidates discover those companies and roles from one shared job-discovery homepage.
