
create extension if not exists "pgcrypto";

create table if not exists public.companies (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid not null references auth.users (id) on delete cascade,
  slug               text not null unique,
  name               text not null,
  tagline            text default '',
  logo_url           text default '',
  banner_url         text default '',
  culture_video_url  text default '',
  primary_color      text not null default '#14213D',
  accent_color       text not null default '#E3B23C',
  is_published       boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists companies_owner_id_idx on public.companies (owner_id);

-- ----------------------------------------------------------------------------
-- sections
-- Ordered, freeform content blocks on a company's careers page
-- (About Us, Life at Company, Benefits, custom blocks, ...).
-- ----------------------------------------------------------------------------
create table if not exists public.sections (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references public.companies (id) on delete cascade,
  title        text not null,
  body         text not null default '',
  image_url    text default '',
  position     integer not null default 0,
  is_visible   boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists sections_company_id_idx on public.sections (company_id, position);

-- ----------------------------------------------------------------------------
-- jobs
-- Open roles listed on a company's careers page.
-- ----------------------------------------------------------------------------
create table if not exists public.jobs (
  id                uuid primary key default gen_random_uuid(),
  company_id        uuid not null references public.companies (id) on delete cascade,
  title             text not null,
  job_slug          text not null,
  department        text default '',
  location          text default '',
  work_policy       text default 'Onsite',       -- Remote | Hybrid | Onsite
  employment_type   text default 'Full time',    -- Full time | Part time | Contract
  experience_level  text default 'Mid-level',
  job_type          text default 'Permanent',    -- Permanent | Temporary
  salary_range      text default '',
  description       text default '',
  is_open           boolean not null default true,
  posted_at         date not null default current_date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (company_id, job_slug)
);

create index if not exists jobs_company_id_idx on public.jobs (company_id);
create index if not exists jobs_location_idx on public.jobs (location);
create index if not exists jobs_job_type_idx on public.jobs (job_type);

-- ----------------------------------------------------------------------------
-- updated_at triggers
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at before update on public.companies
  for each row execute function public.set_updated_at();

drop trigger if exists sections_set_updated_at on public.sections;
create trigger sections_set_updated_at before update on public.sections
  for each row execute function public.set_updated_at();

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at before update on public.jobs
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Row Level Security
-- Recruiters can only read/write their own company's data.
-- Candidates (anon/public) can only read published companies and their
-- sections/jobs — this is what powers the public /[slug]/careers route.
-- ============================================================================

alter table public.companies enable row level security;
alter table public.sections enable row level security;
alter table public.jobs enable row level security;

-- companies -------------------------------------------------------------
create policy "companies_public_read_published"
  on public.companies for select
  using (is_published = true);

create policy "companies_owner_read"
  on public.companies for select
  using (auth.uid() = owner_id);

create policy "companies_owner_insert"
  on public.companies for insert
  with check (auth.uid() = owner_id);

create policy "companies_owner_update"
  on public.companies for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "companies_owner_delete"
  on public.companies for delete
  using (auth.uid() = owner_id);

-- sections ----------------------------------------------------------------
create policy "sections_public_read_published"
  on public.sections for select
  using (
    exists (
      select 1 from public.companies c
      where c.id = sections.company_id and c.is_published = true
    )
  );

create policy "sections_owner_read"
  on public.sections for select
  using (
    exists (
      select 1 from public.companies c
      where c.id = sections.company_id and c.owner_id = auth.uid()
    )
  );

create policy "sections_owner_write"
  on public.sections for all
  using (
    exists (
      select 1 from public.companies c
      where c.id = sections.company_id and c.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.companies c
      where c.id = sections.company_id and c.owner_id = auth.uid()
    )
  );

-- jobs ----------------------------------------------------------------------
create policy "jobs_public_read_published"
  on public.jobs for select
  using (
    exists (
      select 1 from public.companies c
      where c.id = jobs.company_id and c.is_published = true
    )
  );

create policy "jobs_owner_read"
  on public.jobs for select
  using (
    exists (
      select 1 from public.companies c
      where c.id = jobs.company_id and c.owner_id = auth.uid()
    )
  );

create policy "jobs_owner_write"
  on public.jobs for all
  using (
    exists (
      select 1 from public.companies c
      where c.id = jobs.company_id and c.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.companies c
      where c.id = jobs.company_id and c.owner_id = auth.uid()
    )
  );
