-- Verify INSERT policies actually exist
-- Run this in Supabase SQL Editor

-- Show ALL policies on households (not just INSERT)
SELECT
  policyname,
  permissive,
  roles::text as roles,
  cmd,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies
WHERE tablename = 'households'
ORDER BY cmd, policyname;

-- Specifically check for our anon INSERT policy
SELECT EXISTS (
  SELECT 1 FROM pg_policies
  WHERE tablename = 'households'
    AND cmd = 'INSERT'
    AND 'anon' = ANY(roles)
) as anon_insert_policy_exists;

-- Check if maybe there's a schema issue
SELECT
  schemaname,
  tablename
FROM pg_tables
WHERE tablename = 'households';
