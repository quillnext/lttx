-- Unified SQL script for production-grade Wallet System

-- 1. Create coupons table
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric not null check (discount_value > 0),
  min_purchase numeric not null default 0.00 check (min_purchase >= 0),
  max_discount numeric,
  active boolean not null default true,
  expiry_date timestamptz,
  created_at timestamptz not null default now()
);

-- 2. Create expert_bank_details table
create table if not exists public.expert_bank_details (
  id uuid primary key default gen_random_uuid(),
  expert_id uuid not null unique references public.profiles(id) on delete cascade,
  bank_name text not null,
  account_holder_name text not null,
  account_number text not null,
  ifsc_code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Create withdrawal_requests table
create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  expert_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric not null check (amount >= 5000.00),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  bank_details_snapshot jsonb not null,
  admin_feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Add payout columns to leads table to track 70% share
alter table public.leads add column if not exists payout_amount numeric default 0.00;
alter table public.leads add column if not exists payout_status text default 'pending' check (payout_status in ('pending', 'paid', 'not_applicable'));

-- 5. Insert test coupons for verification
insert into public.coupons (code, discount_type, discount_value, min_purchase, active)
values 
  ('WELCOME10', 'percentage', 10, 0, true),
  ('FLAT500', 'fixed', 500, 1000, true)
on conflict (code) do nothing;
