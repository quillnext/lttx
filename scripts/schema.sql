-- Supabase Unified Database Schema
-- Run this in the Supabase SQL editor to create all required tables, triggers, and wallets.

-- Create profiles table referencing auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  phone text unique,
  full_name text not null,
  username text unique,
  role text not null default 'user' check (role in ('user', 'expert', 'agency', 'admin')),
  status text not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
  photo_url text,
  bio text,
  tagline text,
  location text,
  languages jsonb not null default '[]'::jsonb,
  pricing numeric not null default 0.00,
  expertise jsonb not null default '[]'::jsonb,
  experience jsonb not null default '[]'::jsonb,
  certifications jsonb not null default '[]'::jsonb,
  why_consult jsonb not null default '[]'::jsonb,
  experience_dna jsonb,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Create wallets table
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  balance numeric not null default 0.00 check (balance >= 0.00),
  currency text not null default 'INR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on wallets
alter table public.wallets enable row level security;

-- Create wallet transactions table
create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  amount numeric not null,
  transaction_type text not null check (transaction_type in ('credit', 'debit')),
  status text not null default 'success' check (status in ('pending', 'success', 'failed')),
  description text not null,
  reference_id text,
  created_at timestamptz not null default now()
);

-- Enable RLS on wallet_transactions
alter table public.wallet_transactions enable row level security;

-- Create service requests table
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  expert_id uuid not null references public.profiles(id) on delete cascade,
  service_type text not null,
  price numeric not null default 0.00 check (price >= 0.00),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  question text,
  answer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on service_requests
alter table public.service_requests enable row level security;

-- Automatic wallet creation trigger
create or replace function public.handle_new_profile_wallet()
returns trigger as $$
begin
  insert into public.wallets (user_id, balance)
  values (new.id, 0.00)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql;

create or replace trigger on_profile_created
  after insert on public.profiles
  for each row execute function public.handle_new_profile_wallet();

-- Create contact_queries table
create table if not exists public.contact_queries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on contact_queries
alter table public.contact_queries enable row level security;

-- Add meeting_link to service_requests
alter table public.service_requests add column if not exists meeting_link text;

-- Create otps table
create table if not exists public.otps (
  email text primary key,
  otp text not null,
  expiry bigint not null,
  created_at timestamptz not null default now()
);

-- Enable RLS on otps
alter table public.otps enable row level security;

-- Create profile-assets storage bucket
insert into storage.buckets (id, name, public)
values ('profile-assets', 'profile-assets', true)
on conflict (id) do nothing;

-- RLS policies for profile-assets storage bucket
drop policy if exists "Allow public uploads to profile-assets" on storage.objects;
create policy "Allow public uploads to profile-assets"
on storage.objects for insert
with check (bucket_id = 'profile-assets');

drop policy if exists "Allow public read access to profile-assets" on storage.objects;
create policy "Allow public read access to profile-assets"
on storage.objects for select
using (bucket_id = 'profile-assets');

drop policy if exists "Allow public update to profile-assets" on storage.objects;
create policy "Allow public update to profile-assets"
on storage.objects for update
using (bucket_id = 'profile-assets');

drop policy if exists "Allow public delete from profile-assets" on storage.objects;
create policy "Allow public delete from profile-assets"
on storage.objects for delete
using (bucket_id = 'profile-assets');



