-- Re-enable RLS one table at a time to find the problem
-- Run this in Supabase SQL Editor

-- First, let's re-enable RLS on all tables
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE celebrated_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_invitations ENABLE ROW LEVEL SECURITY;

-- Now let's check what policies currently exist
SELECT tablename, policyname, cmd, with_check::text
FROM pg_policies
WHERE tablename IN ('households', 'household_users', 'settings')
ORDER BY tablename, cmd;
