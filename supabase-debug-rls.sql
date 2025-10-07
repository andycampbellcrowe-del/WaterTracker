-- Debug script to check RLS policies
-- Run this in Supabase SQL Editor to see current policies

-- Check if tables have RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('households', 'household_users', 'settings', 'intake_entries', 'celebrated_dates', 'household_invitations')
ORDER BY tablename;

-- Check all policies on households table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'households';

-- Check all policies on household_users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'household_users';

-- Check all policies on settings table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'settings';

-- Check if the function exists and its properties
SELECT proname, provolatile, prosecdef
FROM pg_proc
WHERE proname = 'get_user_household_id';
