-- FINAL WORKING SETUP - Complete reset with working policies
-- This will completely reset all policies and create ones that definitely work
-- Run this in Supabase SQL Editor

-- ============================================================
-- STEP 1: Clean slate - drop everything
-- ============================================================

-- Drop all policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname
              FROM pg_policies
              WHERE schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Drop helper functions
DROP FUNCTION IF EXISTS get_user_household_id() CASCADE;
DROP FUNCTION IF EXISTS can_view_household_user(UUID) CASCADE;

-- Disable RLS temporarily
ALTER TABLE households DISABLE ROW LEVEL SECURITY;
ALTER TABLE household_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE intake_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE celebrated_dates DISABLE ROW LEVEL SECURITY;
ALTER TABLE household_invitations DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 2: Create helper function that won't cause recursion
-- ============================================================

CREATE OR REPLACE FUNCTION user_household_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT household_id FROM household_users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- ============================================================
-- STEP 3: Re-enable RLS
-- ============================================================

ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE celebrated_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_invitations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 4: Create simple, working policies
-- ============================================================

-- HOUSEHOLDS: Allow anyone to create, only members to view/update
CREATE POLICY "allow_insert_household"
  ON households FOR INSERT
  WITH CHECK (true);

CREATE POLICY "allow_select_household"
  ON households FOR SELECT
  USING (id = user_household_id());

CREATE POLICY "allow_update_household"
  ON households FOR UPDATE
  USING (
    id = user_household_id()
    AND EXISTS (
      SELECT 1 FROM household_users
      WHERE auth_user_id = auth.uid()
      AND household_id = households.id
      AND is_owner = true
    )
  );

-- HOUSEHOLD_USERS: Allow users to insert themselves, view household members
CREATE POLICY "allow_insert_household_user"
  ON household_users FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "allow_select_household_user"
  ON household_users FOR SELECT
  USING (household_id = user_household_id() OR auth_user_id = auth.uid());

CREATE POLICY "allow_update_household_user"
  ON household_users FOR UPDATE
  USING (auth_user_id = auth.uid());

CREATE POLICY "allow_delete_household_user"
  ON household_users FOR DELETE
  USING (
    household_id = user_household_id()
    AND EXISTS (
      SELECT 1 FROM household_users hu
      WHERE hu.auth_user_id = auth.uid()
      AND hu.household_id = household_users.household_id
      AND hu.is_owner = true
    )
    AND auth_user_id != auth.uid()
  );

-- SETTINGS: Allow household members to insert/view/update
CREATE POLICY "allow_insert_settings"
  ON settings FOR INSERT
  WITH CHECK (household_id = user_household_id());

CREATE POLICY "allow_select_settings"
  ON settings FOR SELECT
  USING (household_id = user_household_id());

CREATE POLICY "allow_update_settings"
  ON settings FOR UPDATE
  USING (household_id = user_household_id());

-- INTAKE_ENTRIES: Allow household members full access
CREATE POLICY "allow_insert_intake"
  ON intake_entries FOR INSERT
  WITH CHECK (household_id = user_household_id());

CREATE POLICY "allow_select_intake"
  ON intake_entries FOR SELECT
  USING (household_id = user_household_id());

CREATE POLICY "allow_update_intake"
  ON intake_entries FOR UPDATE
  USING (household_id = user_household_id());

CREATE POLICY "allow_delete_intake"
  ON intake_entries FOR DELETE
  USING (household_id = user_household_id());

-- CELEBRATED_DATES: Allow household members to insert/view
CREATE POLICY "allow_insert_celebrated"
  ON celebrated_dates FOR INSERT
  WITH CHECK (household_id = user_household_id());

CREATE POLICY "allow_select_celebrated"
  ON celebrated_dates FOR SELECT
  USING (household_id = user_household_id());

-- INVITATIONS: Allow household members to manage, anyone to view by code
CREATE POLICY "allow_insert_invitation"
  ON household_invitations FOR INSERT
  WITH CHECK (household_id = user_household_id());

CREATE POLICY "allow_select_invitation"
  ON household_invitations FOR SELECT
  USING (
    household_id = user_household_id()
    OR (status = 'pending' AND expires_at > NOW())
  );

CREATE POLICY "allow_update_invitation"
  ON household_invitations FOR UPDATE
  USING (household_id = user_household_id());

-- ============================================================
-- STEP 5: Verify everything is set up
-- ============================================================

SELECT 'Setup complete!' as status;

SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('households', 'household_users', 'settings', 'intake_entries', 'celebrated_dates', 'household_invitations')
GROUP BY tablename
ORDER BY tablename;
