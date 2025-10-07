-- Forcefully recreate policies with explicit roles
-- Run this in Supabase SQL Editor

-- Drop ALL policies on households
DROP POLICY IF EXISTS "public_insert_household" ON households;
DROP POLICY IF EXISTS "public_select_household" ON households;
DROP POLICY IF EXISTS "public_update_household" ON households;
DROP POLICY IF EXISTS "authenticated_insert_household" ON households;
DROP POLICY IF EXISTS "anon_insert_household" ON households;

-- Verify they're all gone
SELECT COUNT(*) as remaining_policies FROM pg_policies WHERE tablename = 'households';

-- Create INSERT policy for anon
CREATE POLICY "anon_can_insert_household"
  ON households
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create INSERT policy for authenticated
CREATE POLICY "authenticated_can_insert_household"
  ON households
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create SELECT policies
CREATE POLICY "anon_can_select_household"
  ON households
  FOR SELECT
  TO anon
  USING (id = user_household_id());

CREATE POLICY "authenticated_can_select_household"
  ON households
  FOR SELECT
  TO authenticated
  USING (id = user_household_id());

-- Create UPDATE policies for owners
CREATE POLICY "anon_can_update_household"
  ON households
  FOR UPDATE
  TO anon
  USING (
    id = user_household_id()
    AND EXISTS (
      SELECT 1 FROM household_users
      WHERE auth_user_id = auth.uid()
      AND household_id = households.id
      AND is_owner = true
    )
  );

CREATE POLICY "authenticated_can_update_household"
  ON households
  FOR UPDATE
  TO authenticated
  USING (
    id = user_household_id()
    AND EXISTS (
      SELECT 1 FROM household_users
      WHERE auth_user_id = auth.uid()
      AND household_id = households.id
      AND is_owner = true
    )
  );

-- Verify new policies exist
SELECT policyname, cmd, roles::text
FROM pg_policies
WHERE tablename = 'households'
ORDER BY cmd, policyname;

-- Test INSERT as anon
SET ROLE anon;
INSERT INTO households (name, invite_code) VALUES ('Test', 'TEST01') RETURNING *;
RESET ROLE;

-- Cleanup
DELETE FROM households WHERE invite_code = 'TEST01';
