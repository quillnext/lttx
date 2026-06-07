-- Run in Supabase SQL editor before using /complete-profile without Firebase.

alter table public.profiles
add column if not exists location text,
add column if not exists languages jsonb not null default '[]'::jsonb,
add column if not exists response_time text,
add column if not exists pricing text,
add column if not exists years_active text,
add column if not exists certifications jsonb not null default '[]'::jsonb,
add column if not exists referred text not null default 'No',
add column if not exists referral_code text,
add column if not exists generated_referral_code text unique,
add column if not exists license_number text,
add column if not exists certificates jsonb not null default '[]'::jsonb,
add column if not exists office_photos jsonb not null default '[]'::jsonb,
add column if not exists registered_address text,
add column if not exists website text,
add column if not exists employee_count text,
add column if not exists lead_id text,
add column if not exists status text,
add column if not exists is_handed_over boolean not null default false,
add column if not exists user_id text,
add column if not exists force_password_change boolean not null default false,
add column if not exists approval_timestamp timestamptz,
add column if not exists bio text,
add column if not exists why_consult jsonb not null default '[]'::jsonb,
add column if not exists experience_dna jsonb;

create table if not exists public.expert_recurring_availability (
  expert_id text primary key,
  schedule jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_requests (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  full_name text not null,
  email text not null,
  phone text not null,
  date_of_birth date,
  years_active text,
  tagline text,
  location text,
  languages jsonb not null default '[]'::jsonb,
  response_time text,
  pricing text,
  about text,
  photo_url text,
  services jsonb not null default '[]'::jsonb,
  regions jsonb not null default '[]'::jsonb,
  expertise jsonb not null default '[]'::jsonb,
  experience jsonb not null default '[]'::jsonb,
  certifications jsonb not null default '[]'::jsonb,
  referred text not null default 'No',
  referral_code text,
  generated_referral_code text unique,
  profile_type text not null default 'expert',
  license_number text,
  certificates jsonb not null default '[]'::jsonb,
  office_photos jsonb not null default '[]'::jsonb,
  registered_address text,
  website text,
  employee_count text,
  lead_id text,
  bio text,
  why_consult jsonb not null default '[]'::jsonb,
  experience_dna jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profile_requests enable row level security;

create index if not exists profile_requests_email_idx on public.profile_requests (email);
create index if not exists profile_requests_referral_code_idx on public.profile_requests (referral_code);

alter table public.profile_requests
add column if not exists status text,
add column if not exists is_handed_over boolean not null default false,
add column if not exists user_id text,
add column if not exists force_password_change boolean not null default false,
add column if not exists approval_timestamp timestamptz,
add column if not exists bio text,
add column if not exists why_consult jsonb not null default '[]'::jsonb,
add column if not exists experience_dna jsonb;

create table if not exists public.recent_searches (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  slug text,
  matches jsonb not null default '[]'::jsonb,
  context jsonb,
  experts jsonb not null default '[]'::jsonb,
  sections jsonb not null default '{}'::jsonb,
  relevant_pointers_count integer not null default 0,
  unlocked_sections_count integer not null default 0,
  is_indexed boolean not null default false,
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recent_searches enable row level security;

create index if not exists recent_searches_query_idx on public.recent_searches (query);
create index if not exists recent_searches_timestamp_idx on public.recent_searches (timestamp desc);
create index if not exists recent_searches_slug_idx on public.recent_searches (slug);
