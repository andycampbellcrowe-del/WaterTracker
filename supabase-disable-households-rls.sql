-- Temporarily disable RLS on households table only
-- This is just for testing - we'll re-enable with better policies
-- Run this in Supabase SQL Editor

ALTER TABLE households DISABLE ROW LEVEL SECURITY;
