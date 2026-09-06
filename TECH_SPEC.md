# Tech Spec — Careers Page Builder

## 1. Overview

Careers Page Builder is a full-stack web application for creating and publishing company careers websites.

The product supports two primary audiences:

1. **Job seekers**
   - Visit the shared homepage.
   - Search and filter open jobs.
   - Browse published companies.
   - Visit public company careers pages.

2. **Recruiters**
   - Sign up and log in.
   - Create a company.
   - Build and edit a careers page.
   - Add sections and jobs.
   - Preview and publish the company careers page.

### Core URL model

```text
/                         → Shared homepage
/login                    → Recruiter authentication
/dashboard                → Recruiter dashboard
/<slug>/edit              → Company editor
/<slug>/preview           → Recruiter preview
/<slug>/careers           → Public careers page
```

The homepage is intentionally shared by both audiences rather than creating separate recruiter and job-seeker homepages.

---

# 2. Goals

## Primary goals

- Provide a simple company careers-page builder.
- Allow recruiters to manage company content and open positions.
- Make published careers pages publicly accessible.
- Allow job seekers to discover open roles without logging in.
- Keep recruiter data isolated using Supabase Row Level Security.
- Use server-side Supabase access for protected operations.
- Keep the public careers experience lightweight and shareable.

## Non-goals for the current version

The current implementation does not attempt to provide:

- Full applicant tracking.
- Candidate accounts.
- Resume processing.
- Job applications.
- Candidate ranking.
- AI hiring decisions.
- Payments/subscriptions.
- Custom domains.
- Advanced analytics.

These can be added in later phases.

---

# 3. Assumptions

## Product assumptions

- A recruiter owns one or more companies.
- A company can contain multiple sections.
- A company can contain multiple jobs.
- Only published companies should be publicly visible.
- Only open jobs should appear in public job discovery.
- Job seekers do not need an account to browse jobs.
- Recruiter authentication is handled by Supabase Auth.

## Data assumptions

A company is identified publicly by a unique `slug`.

Example:

```text
northwind-labs
```

Public URL:

```text
/northwind-labs/careers
```

A job belongs to exactly one company.

A section belongs to exactly one company.

Deleting a company should delete its associated sections and jobs through the database foreign-key cascade.

## Security assumptions

- The browser uses the Supabase anonymous/publishable key, not a service-role key.
- RLS remains enabled.
- Recruiters can only modify companies they own.
- Public visitors can only read published company data.
- Public visitors cannot insert, update, or delete company content.

---

# 4. Architecture

## High-level architecture

```text
                    Browser
                       |
                       v
                Next.js Application
                       |
          ┌────────────┼─────────────┐
          |            |             |
          v            v             v
      Public UI    Recruiter UI   Auth UI
          |            |             |
          └────────────┼─────────────┘
                       |
                       v
                Supabase SSR
                       |
              ┌────────┴────────┐
              |                 |
              v                 v
        Supabase Auth      PostgreSQL
                                |
                    ┌───────────┼───────────┐
                    v           v           v
                companies    sections      jobs
```

---

# 5. Frontend architecture

The application uses:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Server Components where database access is required
- Client Components for interactive browser-only functionality

## Main homepage

```text
src/app/page.tsx
```

Responsibilities:

- Load published companies.
- Load open jobs.
- Display the shared homepage.
- Display job discovery.
- Display company discovery.
- Provide recruiter entry points.

The homepage uses:

```text
src/components/HomeJobBrowser.tsx
```

for interactive search and filtering.

---

# 6. Supabase architecture

The application uses Supabase for:

### Authentication

```text
auth.users
```

### Database

```text
public.companies
public.sections
public.jobs
```

### Authorization

PostgreSQL Row Level Security policies.

### Server-side access

```text
src/lib/supabase/server.ts
```

### Browser-side access

```text
src/lib/supabase/client.ts
```

### Session refresh

```text
src/lib/supabase/middleware.ts
src/proxy.ts
```

---

# 7. Authentication architecture

Supabase Auth manages user accounts.

The expected flow is:

```text
/signup
   |
   v
Supabase Auth
   |
   v
Authenticated session
   |
   v
/dashboard
```

For protected pages:

```text
Request
   |
   v
Next.js proxy
   |
   v
Supabase session check
   |
   +---- no user ----> /login
   |
   +---- user -------> requested page
```

The application uses cookies for SSR session handling.

---

# 8. Authentication assumptions

The following environment variables must be configured:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

The Supabase service-role key must **not** be placed in client-side code.

Password requirements currently include:

```text
Minimum password length: 8 characters
```

---

# 9. Database schema

## 9.1 Companies

```sql
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
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
```

### Important fields

| Field | Purpose |
|---|---|
| `id` | Company primary key |
| `owner_id` | Supabase user who owns the company |
| `slug` | Public URL identifier |
| `name` | Company name |
| `tagline` | Short company description |
| `logo_url` | Company logo |
| `banner_url` | Careers page banner |
| `culture_video_url` | Culture video |
| `primary_color` | Brand color |
| `accent_color` | Accent color |
| `is_published` | Controls public visibility |

---

# 10. Sections schema

```sql
create table public.sections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  title text not null,
  body text not null default '',
  image_url text default '',
  position integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Sections represent content such as:

```text
About us
Our mission
Life at the company
Culture
Benefits
Why join us
```

`position` controls ordering.

`is_visible` controls public visibility.

---

# 11. Jobs schema

```sql
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
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

A job is publicly discoverable when:

```text
company.is_published = true
AND
job.is_open = true
```

---

# 12. Database relationships

```text
auth.users
     |
     | 1:N
     v
companies
     |
     ├───────────────┐
     |               |
     | 1:N           | 1:N
     v               v
sections           jobs
```

Foreign keys:

```text
companies.owner_id → auth.users.id

sections.company_id → companies.id

jobs.company_id → companies.id
```

Both `sections` and `jobs` use:

```text
ON DELETE CASCADE
```

Therefore deleting a company removes its associated sections and jobs.

---

# 13. RLS design

RLS is enabled on:

```text
companies
sections
jobs
```

## Public access

Anonymous visitors can read published company content.

Conceptually:

```sql
company.is_published = true
```

Sections are readable when their company is published.

Jobs are readable when their company is published.

---

# 14. Recruiter authorization

A recruiter should only access data associated with their own company.

Company ownership:

```sql
auth.uid() = owner_id
```

For sections and jobs:

```text
section.company_id
    ↓
company.owner_id
    ↓
auth.uid()
```

This prevents one recruiter from editing another recruiter's data.

---

# 15. Database permissions

The application requires table grants in addition to RLS policies.

Recommended:

```sql
grant select, insert, update, delete
on public.companies
to authenticated;

grant select, insert, update, delete
on public.sections
to authenticated;

grant select, insert, update, delete
on public.jobs
to authenticated;

grant select
on public.companies
to anon;

grant select
on public.sections
to anon;

grant select
on public.jobs
to anon;
```

These grants do not replace RLS.

The effective access is:

```text
GRANT
  +
RLS policy
  =
actual database access
```

---

# 16. Public careers page data flow

Request:

```text
/northwind-labs/careers
```

Flow:

```text
Next.js page
     |
     v
Supabase
     |
     v
Find company where:
slug = northwind-labs
AND
is_published = true
     |
     v
Load visible sections
     |
     v
Load open jobs
     |
     v
Render public page
```

If no published company exists:

```text
notFound()
```

---

# 17. Homepage job discovery data flow

Request:

```text
/
```

Flow:

```text
Homepage Server Component
        |
        +---- published companies
        |
        +---- open jobs
        |
        v
Map jobs to companies
        |
        v
HomeJobBrowser
        |
        v
Search/filter in browser
```

The homepage only displays jobs belonging to published companies.

---

# 18. Homepage filtering

Current client-side filters:

### Keyword

Searches:

```text
job.title
company.name
job.department
```

### Location

Filters:

```text
job.location
```

### Job type

Filters:

```text
job.job_type
```

### Work policy

Filters:

```text
job.work_policy
```

This is appropriate for the current/demo dataset.

For large datasets, filtering should move to the database.

---

# 19. Recruiter company creation flow

```text
/dashboard
     |
     v
NewCompanyForm
     |
     v
createCompany()
     |
     v
Check authentication
     |
     v
Generate slug
     |
     v
Check duplicate slug
     |
     v
Insert company
     |
     v
/<slug>/edit
```

The server action verifies:

```text
user exists
```

before inserting the company.

The company receives:

```text
owner_id = authenticated user's ID
```

---

# 20. Logout flow

Current intended behavior:

```text
Dashboard
    |
    | Logout
    v
supabase.auth.signOut()
    |
    v
/
```

The main homepage is shared by recruiters and job seekers.

The public company page remains accessible independently through:

```text
/<company-slug>/careers
```

---

# 21. Seed data

The project contains:

```text
supabase/seed_jobs.sql
supabase/seed_sections.sql
```

These are development/demo data scripts.

Expected demo companies include:

```text
northwind-labs
atlas-robotics
brightpath-health
```

The companies must exist before dependent seed rows are inserted.

For a clean setup:

```text
schema.sql
   ↓
permissions
   ↓
create demo companies
   ↓
seed_sections.sql
   ↓
seed_jobs.sql
```

---

# 22. Development environment

Recommended:

```text
Node.js 18.18+
npm
Supabase project
```

Install:

```bash
npm install
```

Run:

```bash
npm run dev
```

Application:

```text
http://localhost:3000
```

Production build:

```bash
npm run build
```

Production start:

```bash
npm start
```

---

# 23. Test strategy

Testing should cover four layers:

```text
Unit
  ↓
Integration
  ↓
Authentication/RLS
  ↓
End-to-end
```

---

# 24. Unit tests

Test utility/business logic such as:

### Slug generation

Inputs:

```text
"Northwind Labs"
```

Expected:

```text
northwind-labs
```

### Empty company name

Expected validation error.

### Short password

Input:

```text
1234567
```

Expected:

```text
Password must be at least 8 characters.
```

### Homepage filtering

Given:

```text
React Developer
Backend Developer
Product Designer
```

Search:

```text
React
```

Expected:

```text
React Developer
```

---

# 25. Authentication tests

## Signup

```text
Open /login?mode=signup
Enter valid email
Enter password >= 8 characters
Submit
```

Expected:

```text
Account created/authenticated
```

## Invalid signup

Expected:

```text
Readable error message
```

## Login

Valid credentials should authenticate.

Expected:

```text
/dashboard
```

## Invalid login

Expected:

```text
Authentication error
```

## Logout

Expected:

```text
Supabase session removed
redirect /
```

---

# 26. Authorization tests

## Unauthenticated dashboard access

Open:

```text
/dashboard
```

without authentication.

Expected:

```text
/login?redirectTo=/dashboard
```

## Unauthenticated editor access

Open:

```text
/<slug>/edit
```

without authentication.

Expected:

```text
/login?redirectTo=/<slug>/edit
```

## Authenticated owner

Owner can:

```text
Edit company
Add section
Update section
Delete section
Add job
Update job
Delete job
Publish company
```

---

# 27. RLS isolation tests

Create:

```text
User A
User B
```

User A owns:

```text
Company A
```

User B owns:

```text
Company B
```

Test that User A cannot:

```text
Update Company B
Delete Company B
Update Company B jobs
Delete Company B jobs
```

Expected:

```text
Denied by RLS
```

This is one of the most important security tests.

---

# 28. Public access tests

Without logging in:

```text
/<published-slug>/careers
```

Expected:

```text
200 / rendered page
```

For an unpublished company:

```text
/<unpublished-slug>/careers
```

Expected:

```text
404
```

For a closed job:

```text
is_open = false
```

Expected:

```text
Job does not appear publicly
```

For a hidden section:

```text
is_visible = false
```

Expected:

```text
Section does not appear publicly
```

---

# 29. Homepage tests

Without login:

```text
/
```

Expected:

- Homepage loads.
- Recruiter CTA is visible.
- Job seeker search is visible.
- Published companies appear.
- Open jobs appear.

Search test:

```text
Search = React
```

Expected only matching jobs.

Filter test:

```text
Work policy = Remote
```

Expected only remote jobs.

Clear filters:

Expected all available jobs to return.

---

# 30. End-to-end test scenario

Complete user journey:

```text
1. Open /
2. Browse jobs as visitor
3. Open a company careers page
4. Return to /
5. Choose recruiter signup
6. Create account
7. Create company
8. Edit company
9. Add section
10. Add job
11. Publish
12. Open public careers URL
13. Log out
14. Reopen public careers URL
15. Verify it still works without login
```

This confirms both sides of the product.

---

# 32. Performance assumptions

The current homepage loads published companies and open jobs on the server and performs filtering in the browser.

This is acceptable for:

```text
small/demo dataset
```

It should be changed for a large production dataset.

For example:

```text
1,000 jobs       → consider pagination
10,000 jobs      → database filtering/pagination
100,000+ jobs    → indexed search/search service
```

---

# 33. Future architecture improvements

## Job detail route

Add:

```text
/<company-slug>/careers/<job-slug>
```

This makes each job independently shareable.

## Database pagination

Use:

```text
limit
offset/range
cursor pagination
```

rather than loading all jobs.

## Full-text search

Move keyword search into PostgreSQL.

Potential searchable fields:

```text
title
department
description
location
company name
```

## Job seeker accounts

Add:

```text
job_seeker_profiles
saved_jobs
applications
```

---

# 34. Future database schema

Potential future tables:

```text
job_seeker_profiles
saved_jobs
applications
application_status_history
company_members
job_skills
candidate_skills
notifications
analytics_events
```

Possible relationship:

```text
auth.users
   |
   +--------------------+
   |                    |
   v                    v
recruiter/company   job_seeker_profile
   |                    |
   v                    v
jobs              saved_jobs
                        |
                        v
                      jobs
                        |
                        v
                  applications
```

---

# 35. Scalability plan

For the first version:

```text
Next.js
+
Supabase
+
PostgreSQL
```

is sufficient.

As usage grows:

### Database

- Add indexes.
- Use pagination.
- Optimize queries.
- Use database functions where useful.

### Search

Move from client-side filtering to PostgreSQL full-text search or a dedicated search service.

### Media

Move large media assets to object storage/CDN.

### Analytics

Track:

```text
page views
job views
job clicks
applications
searches
```

### Caching

Cache public company pages and job discovery data where appropriate.

---

# 36. Security improvement plan

Future production hardening should include:

- Strict input validation.
- URL validation for external media.
- Content sanitization if rich HTML is introduced.
- Rate limiting for authentication and public endpoints.
- Audit logging for recruiter actions.
- Stronger role/member model for teams.
- Protection against abusive job creation.
- Security headers.
- Dependency auditing.
- Automated RLS tests.

---


# 39. Key design decision

The most important product architecture decision is:

> **The homepage is shared between job seekers and recruiters.**

It is not a recruiter-only dashboard.

The responsibilities are separated by route:

```text
/                         Shared discovery + entry point

/dashboard                Recruiter workspace

/<slug>/careers           Public company/job experience

/<slug>/edit              Recruiter editing

/<slug>/preview           Recruiter preview

/login                    Authentication
```

This keeps the application simple while allowing the product to evolve into a full recruiting/job-discovery platform.