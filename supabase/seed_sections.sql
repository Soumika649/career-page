-- ============================================================================
-- Demo seed data: content sections for the three demo companies.
-- Run after the companies exist (see seed_jobs.sql).
-- ============================================================================

insert into public.sections (company_id, title, body, position, is_visible)
select id, 'About us',
  'Northwind Labs builds the planning software that keeps warehouses, ports and delivery fleets in sync. Over 400 logistics teams run on our platform to move freight without the spreadsheets.',
  0, true
from public.companies where slug = 'northwind-labs'
on conflict do nothing;

insert into public.sections (company_id, title, body, position, is_visible)
select id, 'Life at Northwind',
  'We ship in small teams, write things down, and default to async so people across time zones can do their best work without midnight meetings. Most teams meet in person twice a year to plan and celebrate.',
  1, true
from public.companies where slug = 'northwind-labs'
on conflict do nothing;

insert into public.sections (company_id, title, body, position, is_visible)
select id, 'About us',
  'Atlas Robotics designs autonomous mobile robots for warehouse picking and inventory. Our fleets run 24/7 across three continents, and our engineers work end to end from motor control to fleet orchestration.',
  0, true
from public.companies where slug = 'atlas-robotics'
on conflict do nothing;

insert into public.sections (company_id, title, body, position, is_visible)
select id, 'Life at Atlas',
  'Half our team started on the warehouse floor testing hardware before writing a line of code. We hire people who like getting their hands dirty and care about the one bug that only shows up at 3am on a Tuesday.',
  1, true
from public.companies where slug = 'atlas-robotics'
on conflict do nothing;

insert into public.sections (company_id, title, body, position, is_visible)
select id, 'About us',
  'BrightPath Health connects patients in underserved areas with primary care providers through community clinics and a lightweight telehealth platform. We now serve over 60 counties.',
  0, true
from public.companies where slug = 'brightpath-health'
on conflict do nothing;

insert into public.sections (company_id, title, body, position, is_visible)
select id, 'Our mission',
  'Nobody should have to drive two hours for a checkup. We build the boring, reliable infrastructure that makes care access a logistics problem we can actually solve.',
  1, true
from public.companies where slug = 'brightpath-health'
on conflict do nothing;
