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
