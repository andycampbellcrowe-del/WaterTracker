-- Fix the infinite recursion in household_users SELECT policy
-- The problem: We can't check household_users while selecting from household_users
-- Solution: Create a SECURITY DEFINER function that bypasses RLS
-- Run this in Supabase SQL Editor

-- Create a function that checks if current user can see a household_user record
-- SECURITY DEFINER allows it to bypass RLS and avoid recursion
CREATE OR REPLACE FUNCTION can_view_household_user(target_household_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM household_users
    WHERE auth_user_id = auth.uid()
    AND household_id = target_household_id
  );
$$;

-- Drop the problematic household_users SELECT policy
DROP POLICY IF EXISTS "household_users_select" ON household_users;

-- Create a new policy using the security definer function
CREATE POLICY "household_users_select"
  ON household_users FOR SELECT
  USING (
    auth_user_id = auth.uid() -- Can always see yourself
    OR can_view_household_user(household_id) -- Or use function to check membership
  );
