-- Test INSERT as the anon role (simulating what the app does)
-- Run this in Supabase SQL Editor

-- First, let's see what the current policy looks like
SELECT policyname, cmd, roles, with_check::text
FROM pg_policies
WHERE tablename = 'households' AND cmd = 'INSERT';

-- Now test if we can insert (this will fail if RLS blocks it)
-- We need to SET ROLE to anon to test as that role
SET ROLE anon;

-- Try to insert
INSERT INTO households (name, invite_code)
VALUES ('Test Household', 'TEST99')
RETURNING *;

-- Reset role
RESET ROLE;

-- Clean up
DELETE FROM households WHERE invite_code = 'TEST99';
