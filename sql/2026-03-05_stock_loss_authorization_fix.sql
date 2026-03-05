-- ============================================================================
-- Stock Loss Authorization Fix
-- ============================================================================
-- This script fixes "Unauthorized" errors when accessing stock loss endpoints.
-- The issue is typically that the user doesn't have a proper role in the profiles table.
-- ============================================================================

-- Step 1: Verify profiles table exists and has the correct structure
-- Run this query to check your profiles table
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'profiles' ORDER BY ordinal_position;

-- Step 2: Check if your user has a profile with a role
-- Replace YOUR_USER_ID with your actual user ID from auth.users
-- SELECT id, user_id, role, created_at FROM public.profiles 
-- WHERE user_id = 'YOUR_USER_ID';

-- Step 3: If the user doesn't have a profile, create one with finance role
-- Replace 'YOUR_USER_ID' with the actual user ID (from auth.users table)
INSERT INTO public.profiles (user_id, role)
VALUES ('YOUR_USER_ID', 'finance')
ON CONFLICT (user_id) DO UPDATE
SET role = 'finance';

-- Step 4: Verify the profiles table has proper RLS policies
-- These queries check if RLS is enabled and policies exist

-- Check if RLS is enabled on profiles table
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE tablename = 'profiles';

-- Step 5: If RLS policies are missing, recreate them

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (optional - for cleanup)
-- DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
-- DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
-- DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;

-- Create or replace RLS policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all profiles" ON public.profiles
  FOR ALL USING (
    -- Allow authenticated users to read their own profile
    auth.uid() = user_id
  )
  WITH CHECK (
    -- Allow authenticated users to update their own profile
    auth.uid() = user_id
  );

-- Step 6: Verify stock_losses table RLS policies

-- Enable RLS on stock_losses table
ALTER TABLE public.stock_losses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for cleanup)
-- DROP POLICY IF EXISTS "Finance users can view stock losses" ON public.stock_losses;
-- DROP POLICY IF EXISTS "Finance users can insert stock losses" ON public.stock_losses;
-- DROP POLICY IF EXISTS "Finance users can update stock losses" ON public.stock_losses;
-- DROP POLICY IF EXISTS "Finance users can delete stock losses" ON public.stock_losses;

-- Create RLS policies for stock_losses (with proper error checking)
CREATE POLICY "Finance users can view stock losses" ON public.stock_losses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('finance', 'admin')
    )
  );

CREATE POLICY "Finance users can insert stock losses" ON public.stock_losses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('finance', 'admin')
    )
  );

CREATE POLICY "Finance users can update stock losses" ON public.stock_losses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('finance', 'admin')
    )
  );

CREATE POLICY "Finance users can delete stock losses" ON public.stock_losses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('finance', 'admin')
    )
  );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check RLS status on profiles table
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE tablename = 'profiles' AND schemaname = 'public';

-- Check RLS status on stock_losses table
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE tablename = 'stock_losses' AND schemaname = 'public';

-- Check all profiles
-- SELECT * FROM public.profiles LIMIT 20;

-- Check profiles by role
-- SELECT user_id, role, created_at FROM public.profiles WHERE role IN ('finance', 'admin');

-- Check stock losses count
-- SELECT COUNT(*) as total_losses FROM public.stock_losses;

-- ============================================================================
-- TROUBLESHOOTING STEPS
-- ============================================================================

-- If you're still getting "Unauthorized" errors after running this script:

-- 1. Verify the user is authenticated
--    - Check browser DevTools > Application > Cookies for auth session
--    - Check that SessionStorage has 'supabase.auth.token'

-- 2. Verify the user has a profile with role = 'finance' or 'admin'
--    - Run: SELECT * FROM public.profiles WHERE user_id = auth.uid();

-- 3. Check Supabase logs for RLS policy violations
--    - Go to Supabase Dashboard > Logs > Postgres

-- 4. Test API authorization directly in browser console
--    - fetch('/api/finance/stock-loss').then(r => r.json()).then(console.log)
--    - Check response status and error message

-- 5. If still failing, check:
--    - Is auth.uid() returning a value? (Use Supabase SQL Editor to test)
--    - Are the profiles in the profiles table for your user ID?
--    - Do the RLS policies reference the correct column names?

-- ============================================================================
