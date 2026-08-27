-- Access codes: one-time security codes gating the assessment.
-- Run in the Supabase SQL editor (same workflow as the education_level change).
create table if not exists access_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  label text,
  status text not null default 'active' check (status in ('active', 'used', 'revoked')),
  created_at timestamptz not null default now(),
  used_at timestamptz,
  used_by_student_id uuid references students(id)
);

-- RLS on, NO policies: the anon key gets zero access.
-- Only the server-side service-role client reads/writes this table.
alter table access_codes enable row level security;

-- ---------------------------------------------------------------------
-- Operator note: registration now goes through the server (service-role
-- client) only, not the browser directly. If an old anon-key INSERT
-- policy is still open on the `students` table, anyone holding the
-- public anon key can create student rows directly, bypassing the
-- access-code check entirely. Check Supabase → Authentication → Policies
-- for the `students` table, confirm the actual policy name, then run
-- (uncommented, by hand) something like:
--
-- drop policy if exists "<your anon insert policy name>" on students;
-- ---------------------------------------------------------------------
