-- Create questions table in Supabase
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  expert_id text not null,
  expert_name text,
  expert_email text,
  user_name text,
  user_email text,
  user_phone text,
  question text not null,
  suggested_answer text,
  reply text,
  status text not null default 'pending'::text,
  is_public boolean not null default false,
  is_admin_prompt boolean not null default false,
  replied_at timestamptz,
  session_id text,
  session_snapshot jsonb
);

-- Enable RLS
alter table public.questions enable row level security;

-- Policy to allow anonymous read (for public answers)
create policy "Allow public read access to questions"
  on public.questions for select
  using (true);

-- Policy to allow full read-write access
create policy "Allow all access to questions"
  on public.questions for all
  using (true)
  with check (true);

-- Indexes for performance
create index if not exists questions_expert_id_idx on public.questions (expert_id);
create index if not exists questions_status_idx on public.questions (status);
create index if not exists questions_created_at_idx on public.questions (created_at desc);
