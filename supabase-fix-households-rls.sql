-- Fix households RLS by creating a policy that explicitly works for all roles
-- Run this in Supabase SQL Editor

-- Clear the data we just created for testing
DELETE FROM settings WHERE household_id IN (SELECT id FROM households WHERE name = 'Andy and Rachel');
DELETE FROM household_users WHERE household_id IN (SELECT id FROM households WHERE name = 'Andy and Rachel');
DELETE FROM households WHERE name = 'Andy and Rachel';

-- Drop all existing policies on households
DROP POLICY IF EXISTS "allow_insert_household" ON households;
DROP POLICY IF EXISTS "allow_select_household" ON households;
DROP POLICY IF EXISTS "allow_update_household" ON households;
DROP POLICY IF EXISTS "households_insert" ON households;
DROP POLICY IF EXISTS "households_select" ON households;
DROP POLICY IF EXISTS "households_update" ON households;
DROP POLICY IF EXISTS "households_delete" ON households;

-- Re-enable RLS
ALTER TABLE households ENABLE ROW LEVEL SECURITY;

-- Create INSERT policy that explicitly applies to PUBLIC (all roles)
CREATE POLICY "public_insert_household"
  ON households
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

-- Create SELECT policy
CREATE POLICY "public_select_household"
  ON households
  FOR SELECT
  TO PUBLIC
  USING (id = user_household_id());

-- Create UPDATE policy for owners
CREATE POLICY "public_update_household"
  ON households
  FOR UPDATE
  TO PUBLIC
  USING (
    id = user_household_id()
    AND EXISTS (
      SELECT 1 FROM household_users
      WHERE auth_user_id = auth.uid()
      AND household_id = households.id
      AND is_owner = true
    )
  );

-- Verify policies exist
SELECT policyname, cmd, roles, with_check::text
FROM pg_policies
WHERE tablename = 'households'
ORDER BY cmd;
