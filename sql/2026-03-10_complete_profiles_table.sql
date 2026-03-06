-- Ensure profiles table has all necessary fields for Finance Settings
-- This migration ensures the profiles table is properly configured with all columns

-- Step 1: Add missing columns if they don't exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text;

-- Step 2: Create index for phone lookups if not exists
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- Step 3: Ensure updated_at column exists and is set to default
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Step 4: Verify the table structure (all expected columns should now exist)
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'profiles'
-- ORDER BY ordinal_position;
