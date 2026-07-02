-- Delete duplicates first if any exist
DELETE FROM public.profiles 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM public.profiles 
  GROUP BY LOWER(TRIM(email))
) AND email IS NOT NULL AND email != '';

DELETE FROM public.profiles 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM public.profiles 
  GROUP BY TRIM(phone)
) AND phone IS NOT NULL AND phone != '';

-- Drop existing unique/check constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS unique_profile_email;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS unique_profile_phone;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_profile_role;

-- Add unique constraints
ALTER TABLE public.profiles ADD CONSTRAINT unique_profile_email UNIQUE (email);
ALTER TABLE public.profiles ADD CONSTRAINT unique_profile_phone UNIQUE (phone);

-- Add role check constraint
ALTER TABLE public.profiles ADD CONSTRAINT check_profile_role CHECK (role IN ('user', 'expert', 'agency', 'admin'));

-- Add role column to profile_requests
ALTER TABLE public.profile_requests ADD COLUMN IF NOT EXISTS role text;

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type text,
  form_data jsonb,
  expert_id text,
  expert_name text,
  status text,
  user_name text,
  user_email text,
  user_phone text,
  destination text,
  trip_dates text,
  source text,
  reply text,
  replied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

