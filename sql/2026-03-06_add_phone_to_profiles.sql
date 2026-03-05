-- Add phone column to profiles table for finance settings
-- This migration adds phone number field to allow users to manage their contact info

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text;

-- Create index for phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- Add unique constraint for phone (optional - only if you want phones to be unique)
-- ALTER TABLE public.profiles
-- ADD CONSTRAINT unique_phone UNIQUE(phone);
