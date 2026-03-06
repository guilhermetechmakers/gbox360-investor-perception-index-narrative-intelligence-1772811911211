-- Add locale and timezone to profiles for User Profile & Account Management
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS locale TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT;
