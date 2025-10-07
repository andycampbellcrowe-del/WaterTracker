-- Debug current state of policies and permissions
-- Run this in Supabase SQL Editor

-- Check if RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('households', 'household_users', 'settings')
ORDER BY tablename;

-- Check all policies on households
SELECT
  policyname,
  cmd as operation,
  permissive,
  roles,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'households'
ORDER BY cmd;

-- Check all policies on household_users
SELECT
  policyname,
  cmd as operation,
  permissive,
  roles,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'household_users'
ORDER BY cmd;

-- Check all policies on settings
SELECT
  policyname,
  cmd as operation,
  permissive,
  roles,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'settings'
ORDER BY cmd;

-- Check if our helper functions exist
SELECT
  proname as function_name,
  provolatile,
  prosecdef as security_definer
FROM pg_proc
WHERE proname IN ('get_user_household_id', 'can_view_household_user');
