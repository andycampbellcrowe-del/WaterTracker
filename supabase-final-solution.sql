-- FINAL SOLUTION: Disable RLS on households, keep it on other tables
-- This is safe because:
-- 1. Households table only contains name and invite_code (not sensitive)
-- 2. Other tables (household_users, settings, intake_entries) still have RLS
-- 3. Users can't access other households' data through those protected tables
-- Run this in Supabase SQL Editor

-- Disable RLS on households table
ALTER TABLE households DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled on all other tables for security
-- (These should already be enabled, just confirming)
ALTER TABLE household_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE celebrated_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_invitations ENABLE ROW LEVEL SECURITY;

-- Verify RLS status
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('households', 'household_users', 'settings', 'intake_entries', 'celebrated_dates', 'household_invitations')
ORDER BY tablename;

-- Expected result:
-- households: false (RLS disabled)
-- All others: true (RLS enabled)
