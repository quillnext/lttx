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
create index if not exists profile_requests_profile_type_idx on public.profile_requests (profile_type);

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

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  service_type text not null,
  source text,
  expert_id text not null,
  expert_name text,
  user_name text,
  user_email text,
  destination text,
  trip_dates text,
  status text not null default 'pending',
  form_data jsonb not null default '{}'::jsonb,
  reply text,
  replied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_status_check check (
    status in (
      'pending',
      'accepted',
      'clarification_requested',
      'answered',
      'admin_prompt',
      'escalated'
    )
  )
);

alter table public.leads enable row level security;

alter table public.leads
add column if not exists service_type text,
add column if not exists source text,
add column if not exists expert_id text,
add column if not exists expert_name text,
add column if not exists user_name text,
add column if not exists user_email text,
add column if not exists destination text,
add column if not exists trip_dates text,
add column if not exists status text not null default 'pending',
add column if not exists form_data jsonb not null default '{}'::jsonb,
add column if not exists reply text,
add column if not exists replied_at timestamptz,
add column if not exists created_at timestamptz not null default now(),
add column if not exists updated_at timestamptz not null default now();

create index if not exists leads_expert_id_idx on public.leads (expert_id);
create index if not exists leads_user_email_idx on public.leads (user_email);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_service_type_idx on public.leads (service_type);
