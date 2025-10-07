-- Fix for RLS policy issue when creating new household
-- The problem: get_user_household_id() function uses STABLE which can cache results
-- within a transaction, causing issues during household creation flow
--
-- Run this in Supabase SQL Editor after applying supabase-schema-v3-multi-account.sql

-- First, fix the helper function to be VOLATILE instead of STABLE
-- This prevents caching issues during the household creation transaction
DROP FUNCTION IF EXISTS get_user_household_id();

CREATE OR REPLACE FUNCTION get_user_household_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
VOLATILE  -- Changed from STABLE to VOLATILE to prevent caching
AS $$
  SELECT household_id FROM household_users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- Also update the settings INSERT policy to directly check household_users
-- instead of relying on the helper function
DROP POLICY IF EXISTS "Users can insert their household settings" ON settings;

CREATE POLICY "Users can insert their household settings"
  ON settings FOR INSERT
  WITH CHECK (
    -- Check directly if user is a member of the household
    EXISTS (
      SELECT 1 FROM household_users
      WHERE auth_user_id = auth.uid()
      AND household_id = settings.household_id
    )
  );
