-- Test if authentication is working properly
-- Run this in Supabase SQL Editor

-- Check what auth.uid() returns (should be your user ID)
SELECT auth.uid() as current_user_id;

-- Check what role is being used
SELECT current_user as current_role;

-- Check if there are any users in auth.users
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Test if we can insert into households with current session
-- This will fail with RLS error if there's a policy issue
-- INSERT INTO households (name, invite_code) VALUES ('Test Household', 'TEST01');
-- Uncomment above line to test insert (then delete the test record)
