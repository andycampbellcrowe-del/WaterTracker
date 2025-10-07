-- Check ALL policies across ALL tables
-- Run this in Supabase SQL Editor

-- Show all policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,  -- PERMISSIVE or RESTRICTIVE
  roles,
  cmd,
  qual::text as using_expression,
  with_check::text as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;
