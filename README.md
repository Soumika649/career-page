# Careers Page Builder

A full-stack careers website builder built with **Next.js, React, TypeScript, Tailwind CSS, and Supabase**.

The application has two main audiences:

- **Job seekers** can discover published companies and open jobs from the main homepage and visit public company careers pages.
- **Recruiters** can sign up, create a company, edit its careers page, add sections and jobs, preview it, and publish it.

---

## 1. What was built

### Job seeker experience

The main homepage (`/`) is now a shared entry point for both job seekers and recruiters.

Job seekers can:

- Search open jobs
- Search by job title, company, or department
- Filter by location
- Filter by job type
- Filter by work policy
- Browse published companies
- Open a company's public careers page
- Browse jobs without creating an account

### Recruiter experience

Recruiters can:

- Create an account
- Log in
- Create a company
- Customize the careers page
- Add company sections
- Add and manage jobs
- Preview the careers page
- Publish the careers page
- Access the public careers page

### Public company careers pages

Each published company gets a public URL:

```text
/<company-slug>/careers
```

For example:

```text
/northwind-labs/careers
/atlas-robotics/careers
/brightpath-health/careers
```

These pages are intended to be accessible to visitors without requiring login.

---

# 2. Technology stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack React framework |
| React | UI |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Supabase | Authentication + PostgreSQL database |
| Supabase SSR | Server-side authentication/session handling |
| Next.js Server Actions | Form/database operations |

---

# 3. Project structure

Important folders/files:

```text
src/
├── app/
│   ├── page.tsx                         # Main shared homepage
│   ├── login/
│   │   ├── page.tsx                     # Login/signup page
│   │   ├── LoginForm.tsx                # Auth UI
│   │   └── actions.ts                   # Login/signup actions
│   │
│   ├── dashboard/
│   │   ├── page.tsx                     # Recruiter dashboard
│   │   ├── actions.ts                   # Company/logout actions
│   │   └── NewCompanyForm.tsx           # Create company
│   │
│   └── [slug]/
│       ├── careers/
│       │   └── page.tsx                 # Public careers page
│       ├── edit/
│       │   └── page.tsx                 # Recruiter editor
│       └── preview/
│           └── page.tsx                 # Recruiter preview
│
├── components/
│   └── HomeJobBrowser.tsx               # Homepage job search/filter UI
│
└── lib/
    └── supabase/
        ├── client.ts
        ├── server.ts
        └── middleware.ts

supabase/
├── schema.sql                           # Database schema + RLS
├── seed_jobs.sql                        # Sample jobs
└── seed_sections.sql                    # Sample sections
```

---

# 4. Requirements

Install these before running the project:

- Node.js 18.18+ recommended
- npm
- A Supabase project
- Git (optional)

Check Node/npm:

```bash
node --version
npm --version
```

---

# 5. Install the project

Open a terminal inside the project directory:

```bash
npm install
```

Then start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 6. Environment variables

Create:

```text
.env.local
```

in the project root.

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these in:

```text
Supabase Dashboard
→ Project Settings
→ API
```

After changing `.env.local`, restart the development server:

```bash
Ctrl+C
npm run dev
```

---

# 7. Configure Supabase

## Step 1 — Create/open your Supabase project

Open the Supabase dashboard and create a project.

---

## Step 2 — Run `schema.sql`

Go to:

```text
Supabase
→ SQL Editor
→ New query
```

Open:

```text
supabase/schema.sql
```

Copy everything.

Paste it into the SQL Editor.

Click:

```text
Run
```

This creates:

```text
companies
sections
jobs
```

and their Row Level Security policies.

---

# 8. Database permissions

After running the schema, run:

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

These permissions allow:

- Logged-in recruiters to manage their own data according to RLS.
- Public visitors to read published careers content.

Do **not** disable RLS.

---

# 9. Create your first recruiter account

Run the application:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Click:

```text
For recruiters
```

or go to:

```text
http://localhost:3000/login?mode=signup
```

Create an account.

---

# 10. Create a company

After logging in, you should reach:

```text
/dashboard
```

Create a company.

For example:

```text
Company name:
Northwind Labs
```

The application creates a slug such as:

```text
northwind-labs
```

The recruiter-owned page becomes:

```text
/northwind-labs/edit
```

---

# 11. Build the careers page

From the dashboard:

```text
Dashboard
    ↓
Edit
```

Add/update:

- Company name
- Tagline
- Logo
- Banner
- Company sections
- Culture information
- Jobs
- Brand colors

---

# 12. Add jobs

Create open positions for the company.

Example:

```text
Title:
Frontend Developer

Department:
Engineering

Location:
Pune, India

Work Policy:
Hybrid

Employment Type:
Full time

Experience Level:
Mid-level
```

Make sure:

```text
is_open = true
```

if you want the job to appear publicly.

---

# 13. Publish the company

A public careers page only appears when:

```text
companies.is_published = true
```

After publishing, the public URL is:

```text
http://localhost:3000/<company-slug>/careers
```

Example:

```text
http://localhost:3000/northwind-labs/careers
```

---

# 14. Test the public website

Open the public careers page while logged in:

```text
http://localhost:3000/northwind-labs/careers
```

Then open the same URL in:

- Incognito/private browser
- Another browser
- Another device if available

The public page should work without logging in.

This verifies that the public RLS policies are working.

---

# 15. Using the sample seed data

The project already contains:

```text
supabase/seed_jobs.sql
supabase/seed_sections.sql
```

These provide sample jobs and sections.

The seed data uses companies such as:

```text
northwind-labs
atlas-robotics
brightpath-health
```

The companies must exist before the section/job seed files can correctly attach their records.

If you want to use the sample data, first create the corresponding companies with valid `owner_id` values.

---

# 16. Application routes

## Main homepage

```text
/
```

This is the shared homepage.

It contains:

### Job seeker area

```text
Find your next role
```

with search and filters.

### Company discovery

Published companies are displayed with links to:

```text
/<slug>/careers
```

### Recruiter area

Recruiters can choose:

```text
Build a careers page
```

which takes them to authentication.

---

## Login/signup

```text
/login
```

Signup:

```text
/login?mode=signup
```

---

## Recruiter dashboard

```text
/dashboard
```

Only authenticated users should access this page.

---

## Company editor

```text
/<slug>/edit
```

Only the authenticated owner should be able to edit the company.

---

## Company preview

```text
/<slug>/preview
```

This is for the recruiter.

---

## Public careers page

```text
/<slug>/careers
```

This is the job-seeker/public page.

It should not require login when the company is published.

---

# 17. Authentication flow

The intended authentication flow is:

```text
                 /
                 |
       ┌─────────┴─────────┐
       |                   |
 Job seeker             Recruiter
       |                   |
 Browse jobs          Login / Signup
                           |
                           ↓
                      /dashboard
                           |
                  Create/manage company
                           |
                           ↓
                  /<slug>/careers
```

Logout currently redirects to:

```text
/
```

The homepage is therefore the common entry point for both recruiters and job seekers.

---

# 18. How the homepage gets jobs

The homepage reads published/open data from Supabase.

Conceptually:

```text
companies
   |
   | is_published = true
   ↓
published companies
   |
   +----------------+
                    |
jobs               |
   |                |
   | is_open=true   |
   ↓                |
open jobs ----------+
```

Only jobs belonging to published companies are displayed on the homepage.

---

# 19. Security model

The application uses Supabase Row Level Security.

### Public visitors

Can read:

```text
published companies
visible sections
open jobs belonging to published companies
```

### Recruiters

Can manage records associated with companies they own.

The important ownership relationship is:

```text
auth.users
    |
    | owner_id
    ↓
companies
    |
    ├── sections
    └── jobs
```

Do not expose a Supabase service-role key in the frontend.

---

# 20. Testing checklist

After setup, test the following.

## Authentication

- [ ] Signup works
- [ ] Login works
- [ ] Invalid password shows an error
- [ ] Logout works
- [ ] Logout returns to `/`

## Recruiter

- [ ] Dashboard requires login
- [ ] Company can be created
- [ ] Company can be edited
- [ ] Sections can be created/edited
- [ ] Jobs can be created/edited
- [ ] Company can be published

## Job seeker

- [ ] Homepage opens without login
- [ ] Jobs appear
- [ ] Search works
- [ ] Location filter works
- [ ] Job type filter works
- [ ] Work policy filter works
- [ ] Company cards appear
- [ ] Public careers page opens without login

## Security

Create two recruiter accounts.

Test that:

```text
Recruiter A
    ↓
Company A
```

cannot edit:

```text
Recruiter B
    ↓
Company B
```

This is an important RLS test.

---

# 21. Development commands

Start development:

```bash
npm run dev
```

Build production:

```bash
npm run build
```

Start production:

```bash
npm start
```

Lint:

```bash
npm run lint
```

If dependencies are missing:

```bash
npm install
```

---

# 22. Common problems

## `supabaseUrl is required`

Check `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Then restart:

```bash
npm run dev
```

---

## `permission denied for table companies`

Run the grants from section 8.

Do not disable RLS.

---

## Public careers page shows 404

Check:

```text
companies.is_published = true
```

and verify the URL:

```text
/<company-slug>/careers
```

---

## Jobs don't appear on homepage

Check:

```text
jobs.is_open = true
companies.is_published = true
```

Also verify that the job's:

```text
company_id
```

belongs to the published company.

---

## Login keeps redirecting

Check:

```text
src/proxy.ts
src/lib/supabase/middleware.ts
src/lib/supabase/server.ts
src/app/login/actions.ts
src/app/login/LoginForm.tsx
```

The application uses Supabase SSR cookies for authentication.

---

# 23. Improvement plan

The current version provides the core two-sided experience. The next improvements should be implemented in stages.

## Phase 1 — Better job seeker experience

### 1. Job detail pages

Instead of only linking to:

```text
/<slug>/careers
```

create:

```text
/<slug>/careers/<job-slug>
```

This gives each job its own shareable URL.

### 2. Better search

Add:

- Keyword search
- Location search
- Department
- Experience
- Salary
- Remote/Hybrid/Onsite
- Full-time/Part-time/Contract



# 24. Phase 2 — Job seeker accounts

Add:

```text
/job-seeker/signup
/job-seeker/login
/job-seeker/profile
```

A job seeker could have:

```text
Name
Email
Location
Skills
Experience
Resume
Preferred job type
Preferred work policy
```

---

# 25. Phase 3 — Saved jobs

Allow users to:

```text
♡ Save job
```

Create a table such as:

```text
saved_jobs
```

Relationship:

```text
user
 |
 +── saved_jobs
        |
        +── job
```

Then add:

```text
/dashboard/saved-jobs
```

or a dedicated job-seeker dashboard.

---

# 26. Phase 4 — Applications

Add:

```text
Apply
```

and an applications table:

```text
applications
```

Possible states:

```text
Applied
Under Review
Shortlisted
Interview
Rejected
Offer
```

Recruiters could manage applications from their dashboard.

---

# 27. Phase 5 — Recruiter improvements

Add:

- Applicant management
- Job analytics
- Page analytics
- Candidate pipeline
- Job closing
- Draft/published status
- Custom company domains
- Social sharing
- SEO controls

---

# 28. Phase 6 — Advanced job discovery

Later, add:

### Recommendations

Recommend jobs based on:

```text
Skills
Experience
Location
Previous searches
Saved jobs
```

### Intelligent search

For example:

```text
"Frontend jobs in Pune with React and remote flexibility"
```

could understand multiple search conditions.

### AI job matching

Calculate:

```text
candidate ↔ job match score
```

while clearly explaining that it is a recommendation, not an automatic hiring decision.

---

# 29. Recommended final product structure

The long-term application can become:

```text
                         HOME
                          /
             ┌────────────┴────────────┐
             │                         │
        JOB SEEKER                 RECRUITER
             │                         │
       Search / Browse             Login / Signup
             │                         │
       Job details                 Dashboard
             │                         │
       Apply / Save             Manage companies
             │                         │
             │                  Manage jobs/pages
             │                         │
             └──────────┬──────────────┘
                        │
                 PUBLIC CAREERS
                        │
                 /<slug>/careers
                        │
                    Job details
                        │
                     Apply
```

This gives the product a clear separation between:

**Job discovery → Job application**

and

**Company management → Recruiting**

while keeping the homepage shared by both audiences.

---

# 30. Current implementation vs future

| Feature | Current | Planned |
|---|---:|---:|
| Shared homepage | ✅ | |
| Recruiter signup/login | ✅ | |
| Recruiter dashboard | ✅ | |
| Company builder | ✅ | |
| Company sections | ✅ | |
| Job management | ✅ | |
| Public careers pages | ✅ | |
| Homepage job search | ✅ | |
| Homepage filters | ✅ | |
| Homepage filters | ✅ | |
| pagination for jobs section in homepage | | ✅ |
| Saved jobs | | 🔜 |
| Applications | | 🔜 |
| Job detail URLs | | 🔜 |
| Candidate dashboard | | 🔜 |
| Applicant tracking | | 🔜 |
| Job recommendations | | 🔜 |
| AI matching | | 🔜 |
| Analytics | | 🔜 |
| Custom domains | | 🔜 |

---

# 31. Quick start

For someone using the project for the first time:

```bash
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

Run the database schema in Supabase:

```text
supabase/schema.sql
```

Run the permissions SQL.

Start the application:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Then:

```text
1. Create recruiter account
2. Create company
3. Add company information
4. Add sections
5. Add jobs
6. Publish company
7. Open /<slug>/careers
8. Log out
9. Open the careers URL without login
10. Return to / and search for the jobs
```

---

## 32. Project goal

The goal of Careers Page Builder is to provide a simple platform where:

> **Recruiters can create beautiful, structured company careers pages, while job seekers can discover those companies and their open opportunities from a common job-discovery homepage.**
