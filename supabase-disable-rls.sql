-- Temporarily disable RLS to test if that's the issue
-- Run this in Supabase SQL Editor

-- Disable RLS on all tables temporarily
ALTER TABLE households DISABLE ROW LEVEL SECURITY;
ALTER TABLE household_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE intake_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE celebrated_dates DISABLE ROW LEVEL SECURITY;
ALTER TABLE household_invitations DISABLE ROW LEVEL SECURITY;
