-- Create explicit policies for anon and authenticated roles
-- PUBLIC doesn't seem to be working, so we'll be explicit
-- Run this in Supabase SQL Editor

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "public_insert_household" ON households;

-- Create separate policy for authenticated role
CREATE POLICY "authenticated_insert_household"
  ON households
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create separate policy for anon role
CREATE POLICY "anon_insert_household"
  ON households
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Verify both policies exist
SELECT policyname, cmd, roles, with_check::text
FROM pg_policies
WHERE tablename = 'households' AND cmd = 'INSERT'
ORDER BY policyname;

-- Now test again as anon role
SET ROLE anon;
INSERT INTO households (name, invite_code)
VALUES ('Test Household', 'TEST99')
RETURNING *;
RESET ROLE;

-- Clean up
DELETE FROM households WHERE invite_code = 'TEST99';
