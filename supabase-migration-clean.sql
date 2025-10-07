-- MIGRATION SCRIPT - Wipes all existing data and creates V2 schema
-- Run this in Supabase SQL Editor
-- WARNING: This will DELETE ALL existing data!

-- Drop all existing tables
DROP TABLE IF EXISTS celebrated_dates CASCADE;
DROP TABLE IF EXISTS intake_entries CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS household_users CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Now run the supabase-schema-v2.sql file to create the new schema
