-- Update schema to support production-ready expert profiles, approval flow, ratings, and AI suggestions.

-- 1. Ensure profile columns for reviews, ratings, and approval details exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS rating numeric(3,2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS approval_notes text,
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes to optimize search and sorting queries on experts
CREATE INDEX IF NOT EXISTS idx_profiles_role_status_public ON public.profiles(role, status, is_public);
CREATE INDEX IF NOT EXISTS idx_profiles_pricing ON public.profiles(pricing);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON public.profiles(rating DESC);

-- 2. Ensure questions table has columns for AI suggestions and Admin to Expert prompts
ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS suggested_answer text,
-- Distinguishes user queries from direct admin inquiries/prompts
ADD COLUMN IF NOT EXISTS is_admin_prompt boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_notes text;

-- Create index on is_admin_prompt for filtering
CREATE INDEX IF NOT EXISTS idx_questions_is_admin_prompt ON public.questions(is_admin_prompt);
