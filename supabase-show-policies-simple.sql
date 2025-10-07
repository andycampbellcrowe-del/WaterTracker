-- Show all policies on households table
-- Run this in Supabase SQL Editor

SELECT
  policyname,
  cmd,
  roles::text as roles_array
FROM pg_policies
WHERE tablename = 'households'
ORDER BY cmd, policyname;
