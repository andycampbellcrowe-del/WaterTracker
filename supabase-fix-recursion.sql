-- Fix infinite recursion in policies
-- The problem: policies that check household_users create circular dependencies
-- Solution: Make INSERT policies simple, SELECT policies can reference the table
-- Run this in Supabase SQL Editor

-- For INSERT operations, we don't need complex checks because:
-- 1. Users can only insert themselves (auth_user_id = auth.uid())
-- 2. Settings can only be inserted if the user just created the household_user record

-- household_users: Simple INSERT check - just verify it's the current user
DROP POLICY IF EXISTS "Users can insert themselves as household user" ON household_users;

CREATE POLICY "Users can insert themselves as household user"
  ON household_users FOR INSERT
  TO public
  WITH CHECK (auth_user_id = auth.uid());  -- Simple check, no recursion

-- household_users: SELECT needs to avoid recursion
-- Use a SECURITY DEFINER function to break the recursion
DROP POLICY IF EXISTS "Users can view household users in their household" ON household_users;

CREATE POLICY "Users can view household users in their household"
  ON household_users FOR SELECT
  TO public
  USING (
    auth_user_id = auth.uid()  -- Can always see yourself
    OR household_id = get_user_household_id()  -- Or can see others in your household
  );

-- Settings: INSERT policy should allow if user has a household_user record
-- But we need to avoid recursion here too
DROP POLICY IF EXISTS "Users can insert their household settings" ON settings;

CREATE POLICY "Users can insert their household settings"
  ON settings FOR INSERT
  TO public
  WITH CHECK (
    -- Allow insert if the household_id matches what get_user_household_id returns
    household_id = get_user_household_id()
  );

-- Settings: SELECT is fine as-is but let's use the helper function
DROP POLICY IF EXISTS "Users can view their household settings" ON settings;

CREATE POLICY "Users can view their household settings"
  ON settings FOR SELECT
  TO public
  USING (household_id = get_user_household_id());

-- Settings: UPDATE is fine
DROP POLICY IF EXISTS "Users can update their household settings" ON settings;

CREATE POLICY "Users can update their household settings"
  ON settings FOR UPDATE
  TO public
  USING (household_id = get_user_household_id());

-- Households: SELECT should use the helper function too
DROP POLICY IF EXISTS "Users can view their household" ON households;

CREATE POLICY "Users can view their household"
  ON households FOR SELECT
  TO public
  USING (id = get_user_household_id());
