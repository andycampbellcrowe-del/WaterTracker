-- Check and fix the user_household_id function to be VOLATILE
-- Run this in Supabase SQL Editor

-- Check current function properties
SELECT
  proname as function_name,
  provolatile as volatility,  -- v=volatile, s=stable, i=immutable
  prosecdef as security_definer
FROM pg_proc
WHERE proname = 'user_household_id';

-- Drop and recreate as VOLATILE instead of STABLE
DROP FUNCTION IF EXISTS user_household_id() CASCADE;

CREATE OR REPLACE FUNCTION user_household_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
VOLATILE  -- Changed from STABLE to VOLATILE to prevent caching
AS $$
  SELECT household_id FROM household_users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION user_household_id() TO authenticated;
GRANT EXECUTE ON FUNCTION user_household_id() TO anon;
GRANT EXECUTE ON FUNCTION user_household_id() TO public;

-- Verify it changed
SELECT
  proname as function_name,
  provolatile as volatility,
  prosecdef as security_definer
FROM pg_proc
WHERE proname = 'user_household_id';
