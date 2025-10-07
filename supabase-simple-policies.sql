-- Start completely fresh with the SIMPLEST possible policies
-- Run this in Supabase SQL Editor

-- First, drop ALL policies on all tables
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

-- Disable RLS temporarily
ALTER TABLE households DISABLE ROW LEVEL SECURITY;
ALTER TABLE household_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE intake_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE celebrated_dates DISABLE ROW LEVEL SECURITY;
ALTER TABLE household_invitations DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE celebrated_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_invitations ENABLE ROW LEVEL SECURITY;

-- Create the SIMPLEST policies possible for households
CREATE POLICY "households_insert" ON households FOR INSERT WITH CHECK (true);
CREATE POLICY "households_select" ON households FOR SELECT USING (true);
CREATE POLICY "households_update" ON households FOR UPDATE USING (true);
CREATE POLICY "households_delete" ON households FOR DELETE USING (true);

-- Create the SIMPLEST policies possible for household_users
CREATE POLICY "household_users_insert" ON household_users FOR INSERT WITH CHECK (true);
CREATE POLICY "household_users_select" ON household_users FOR SELECT USING (true);
CREATE POLICY "household_users_update" ON household_users FOR UPDATE USING (true);
CREATE POLICY "household_users_delete" ON household_users FOR DELETE USING (true);

-- Create the SIMPLEST policies possible for settings
CREATE POLICY "settings_insert" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "settings_select" ON settings FOR SELECT USING (true);
CREATE POLICY "settings_update" ON settings FOR UPDATE USING (true);
CREATE POLICY "settings_delete" ON settings FOR DELETE USING (true);

-- Create the SIMPLEST policies possible for intake_entries
CREATE POLICY "intake_entries_insert" ON intake_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "intake_entries_select" ON intake_entries FOR SELECT USING (true);
CREATE POLICY "intake_entries_update" ON intake_entries FOR UPDATE USING (true);
CREATE POLICY "intake_entries_delete" ON intake_entries FOR DELETE USING (true);

-- Create the SIMPLEST policies possible for celebrated_dates
CREATE POLICY "celebrated_dates_insert" ON celebrated_dates FOR INSERT WITH CHECK (true);
CREATE POLICY "celebrated_dates_select" ON celebrated_dates FOR SELECT USING (true);

-- Create the SIMPLEST policies possible for household_invitations
CREATE POLICY "invitations_insert" ON household_invitations FOR INSERT WITH CHECK (true);
CREATE POLICY "invitations_select" ON household_invitations FOR SELECT USING (true);
CREATE POLICY "invitations_update" ON household_invitations FOR UPDATE USING (true);
CREATE POLICY "invitations_delete" ON household_invitations FOR DELETE USING (true);
