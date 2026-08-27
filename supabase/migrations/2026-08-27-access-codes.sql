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
