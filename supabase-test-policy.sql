-- Temporary test to see if the issue is with the authenticated check
-- Run this in Supabase SQL Editor

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert their household" ON households;

-- Create a completely permissive policy for testing
CREATE POLICY "Users can insert their household"
  ON households FOR INSERT
  WITH CHECK (true);  -- Removed the "TO authenticated" restriction temporarily

-- Also let's make the household_users insert policy more permissive
DROP POLICY IF EXISTS "Users can insert themselves as household user" ON household_users;

CREATE POLICY "Users can insert themselves as household user"
  ON household_users FOR INSERT
  WITH CHECK (true);  -- Temporarily allow any insert to debug
