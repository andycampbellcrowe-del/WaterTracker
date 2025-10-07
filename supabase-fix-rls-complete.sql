-- Complete fix for RLS policy issue when creating new household
-- This script properly handles the function dependencies
--
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ndwuhouerkynnpuyxufo/sql

-- Drop the function with CASCADE to remove dependent policies
DROP FUNCTION IF EXISTS get_user_household_id() CASCADE;

-- Drop any remaining policies that CASCADE might have missed
DROP POLICY IF EXISTS "Users can view their household" ON households;
DROP POLICY IF EXISTS "Users can update their household" ON households;
DROP POLICY IF EXISTS "Users can insert their household" ON households;

DROP POLICY IF EXISTS "Users can view household users in their household" ON household_users;
DROP POLICY IF EXISTS "Users can insert themselves as household user" ON household_users;
DROP POLICY IF EXISTS "Users can update their own household user" ON household_users;
DROP POLICY IF EXISTS "Users can update household users in their household" ON household_users;
DROP POLICY IF EXISTS "Owners can delete household users" ON household_users;

DROP POLICY IF EXISTS "Users can view invitations for their household" ON household_invitations;
DROP POLICY IF EXISTS "Users can create invitations for their household" ON household_invitations;
DROP POLICY IF EXISTS "Anyone can view invitation by code" ON household_invitations;
DROP POLICY IF EXISTS "Users can update invitations they accepted" ON household_invitations;

DROP POLICY IF EXISTS "Users can view their household settings" ON settings;
DROP POLICY IF EXISTS "Users can insert their household settings" ON settings;
DROP POLICY IF EXISTS "Users can update their household settings" ON settings;

DROP POLICY IF EXISTS "Users can view their household intake entries" ON intake_entries;
DROP POLICY IF EXISTS "Users can insert their household intake entries" ON intake_entries;
DROP POLICY IF EXISTS "Users can update their household intake entries" ON intake_entries;
DROP POLICY IF EXISTS "Users can delete their household intake entries" ON intake_entries;

DROP POLICY IF EXISTS "Users can view their household celebrated dates" ON celebrated_dates;
DROP POLICY IF EXISTS "Users can insert their household celebrated dates" ON celebrated_dates;

-- Recreate the helper function with VOLATILE instead of STABLE
CREATE OR REPLACE FUNCTION get_user_household_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
VOLATILE  -- Changed from STABLE to prevent caching during transactions
AS $$
  SELECT household_id FROM household_users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- ============================================================
-- RECREATE ALL RLS POLICIES
-- ============================================================

-- HOUSEHOLDS POLICIES
CREATE POLICY "Users can view their household"
  ON households FOR SELECT
  USING (id = get_user_household_id());

CREATE POLICY "Users can update their household"
  ON households FOR UPDATE
  USING (
    id = get_user_household_id()
    AND EXISTS (SELECT 1 FROM household_users WHERE auth_user_id = auth.uid() AND is_owner = true AND household_id = get_user_household_id())
  );

CREATE POLICY "Users can insert their household"
  ON households FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- HOUSEHOLD USERS POLICIES
CREATE POLICY "Users can view household users in their household"
  ON household_users FOR SELECT
  USING (household_id = get_user_household_id());

CREATE POLICY "Users can insert themselves as household user"
  ON household_users FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can update their own household user"
  ON household_users FOR UPDATE
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update household users in their household"
  ON household_users FOR UPDATE
  USING (
    household_id = get_user_household_id()
    AND EXISTS (SELECT 1 FROM household_users WHERE auth_user_id = auth.uid() AND is_owner = true AND household_id = get_user_household_id())
  );

CREATE POLICY "Owners can delete household users"
  ON household_users FOR DELETE
  USING (
    household_id = get_user_household_id()
    AND EXISTS (SELECT 1 FROM household_users WHERE auth_user_id = auth.uid() AND is_owner = true AND household_id = get_user_household_id())
  );

-- HOUSEHOLD INVITATIONS POLICIES
CREATE POLICY "Users can view invitations for their household"
  ON household_invitations FOR SELECT
  USING (household_id = get_user_household_id());

CREATE POLICY "Users can create invitations for their household"
  ON household_invitations FOR INSERT
  WITH CHECK (household_id = get_user_household_id());

CREATE POLICY "Anyone can view invitation by code"
  ON household_invitations FOR SELECT
  USING (status = 'pending' AND expires_at > NOW());

CREATE POLICY "Users can update invitations they accepted"
  ON household_invitations FOR UPDATE
  USING (accepted_by_user_id IN (SELECT id FROM household_users WHERE auth_user_id = auth.uid()));

-- SETTINGS POLICIES
CREATE POLICY "Users can view their household settings"
  ON settings FOR SELECT
  USING (household_id = get_user_household_id());

-- FIXED: This policy now directly checks household_users instead of using the helper
CREATE POLICY "Users can insert their household settings"
  ON settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_users
      WHERE auth_user_id = auth.uid()
      AND household_id = settings.household_id
    )
  );

CREATE POLICY "Users can update their household settings"
  ON settings FOR UPDATE
  USING (household_id = get_user_household_id());

-- INTAKE ENTRIES POLICIES
CREATE POLICY "Users can view their household intake entries"
  ON intake_entries FOR SELECT
  USING (household_id = get_user_household_id());

CREATE POLICY "Users can insert their household intake entries"
  ON intake_entries FOR INSERT
  WITH CHECK (household_id = get_user_household_id());

CREATE POLICY "Users can update their household intake entries"
  ON intake_entries FOR UPDATE
  USING (household_id = get_user_household_id());

CREATE POLICY "Users can delete their household intake entries"
  ON intake_entries FOR DELETE
  USING (household_id = get_user_household_id());

-- CELEBRATED DATES POLICIES
CREATE POLICY "Users can view their household celebrated dates"
  ON celebrated_dates FOR SELECT
  USING (household_id = get_user_household_id());

CREATE POLICY "Users can insert their household celebrated dates"
  ON celebrated_dates FOR INSERT
  WITH CHECK (household_id = get_user_household_id());
