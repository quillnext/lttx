-- Run this in the Supabase SQL editor before using /user-login in production.

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  phone text not null,
  email_verified boolean not null default false,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

alter table public.leads
add column if not exists user_phone text;
