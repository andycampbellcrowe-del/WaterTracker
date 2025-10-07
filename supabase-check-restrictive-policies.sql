-- Check for RESTRICTIVE policies that might be blocking
-- Run this in Supabase SQL Editor

-- Check for any RESTRICTIVE policies (these use AND logic, not OR)
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,  -- Should be PERMISSIVE, not RESTRICTIVE
  roles,
  cmd,
  with_check::text
FROM pg_policies
WHERE tablename = 'households'
ORDER BY permissive DESC, cmd;

-- Check table ownership and permissions
SELECT
  tablename,
  tableowner,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'households';

-- Check what privileges the anon role has
SELECT
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'households'
  AND grantee IN ('anon', 'authenticated', 'public');

-- Try to see if there's something else blocking
-- Check if anon can even SELECT from households
SET ROLE anon;
SELECT COUNT(*) FROM households;
RESET ROLE;
