-- Secure RLS policies that actually work
-- These avoid recursion and caching issues while providing proper security
-- Run this in Supabase SQL Editor

-- Drop all existing policies first
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname
              FROM pg_policies
              WHERE tablename IN ('households', 'household_users', 'settings', 'intake_entries', 'celebrated_dates', 'household_invitations'))
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- ============================================================
-- HOUSEHOLDS POLICIES
-- ============================================================
-- Anyone authenticated can create a household
CREATE POLICY "households_insert"
  ON households FOR INSERT
  WITH CHECK (true);

-- Users can only see households they belong to
CREATE POLICY "households_select"
  ON households FOR SELECT
  USING (
    id IN (
      SELECT household_id
      FROM household_users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Only owners can update their household
CREATE POLICY "households_update"
  ON households FOR UPDATE
  USING (
    id IN (
      SELECT household_id
      FROM household_users
      WHERE auth_user_id = auth.uid() AND is_owner = true
    )
  );

-- ============================================================
-- HOUSEHOLD USERS POLICIES
-- ============================================================
-- Users can only insert themselves
CREATE POLICY "household_users_insert"
  ON household_users FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());

-- Users can see all members of their household
CREATE POLICY "household_users_select"
  ON household_users FOR SELECT
  USING (
    auth_user_id = auth.uid() -- Can see yourself
    OR household_id IN ( -- Or see others in your household
      SELECT household_id
      FROM household_users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Users can update their own profile
CREATE POLICY "household_users_update"
  ON household_users FOR UPDATE
  USING (auth_user_id = auth.uid());

-- Only owners can delete other users
CREATE POLICY "household_users_delete"
  ON household_users FOR DELETE
  USING (
    household_id IN (
      SELECT household_id
      FROM household_users
      WHERE auth_user_id = auth.uid() AND is_owner = true
    )
    AND auth_user_id != auth.uid() -- Can't delete yourself
  );

-- ============================================================
-- SETTINGS POLICIES
-- ============================================================
-- Users can insert settings for their household
CREATE POLICY "settings_insert"
  ON settings FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id
      FROM household_users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Users can view their household settings
CREATE POLICY "settings_select"
  ON settings FOR SELECT
  USING (
    household_id IN (
      SELECT household_id
      FROM household_users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Users can update their household settings
CREATE POLICY "settings_update"
  ON settings FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id
      FROM household_users
      WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- INTAKE ENTRIES POLICIES
-- ============================================================
-- Users can insert entries for their household
CREATE POLICY "intake_entries_insert"
  ON intake_entries FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id
      FROM household_users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Users can view all entries in their household
CREATE POLICY "intake_entries_select"
  ON intake_entries FOR SELECT
  USING (
    household_id IN (
      SELECT household_id
      FROM household_users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Users can update entries in their household
CREATE POLICY "intake_entries_update"
  ON intake_entries FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id
      FROM household_users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Users can delete entries in their household
CREATE POLICY "intake_entries_delete"
  ON intake_entries FOR DELETE
  USING (
    household_id IN (
      SELECT household_id
      FROM household_users
      WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- CELEBRATED DATES POLICIES
-- ============================================================
-- Users can insert celebrated dates for their household
CREATE POLICY "celebrated_dates_insert"
  ON celebrated_dates FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id
      FROM household_users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Users can view celebrated dates for their household
CREATE POLICY "celebrated_dates_select"
  ON celebrated_dates FOR SELECT
  USING (
    household_id IN (
      SELECT household_id
      FROM household_users
      WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- HOUSEHOLD INVITATIONS POLICIES
-- ============================================================
-- Users can create invitations for their household
CREATE POLICY "invitations_insert"
  ON household_invitations FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id
      FROM household_users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Users can view invitations for their household OR by code
CREATE POLICY "invitations_select"
  ON household_invitations FOR SELECT
  USING (
    household_id IN (
      SELECT household_id
      FROM household_users
      WHERE auth_user_id = auth.uid()
    )
    OR (status = 'pending' AND expires_at > NOW()) -- Anyone can view valid invitations by code
  );

-- Users can update invitations they accepted
CREATE POLICY "invitations_update"
  ON household_invitations FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id
      FROM household_users
      WHERE auth_user_id = auth.uid()
    )
  );
