-- Clear all data from all tables for testing
-- CAUTION: This will delete ALL data in your database!
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ndwuhouerkynnpuyxufo/sql

-- Delete all data (CASCADE will handle foreign key relationships)
-- Order matters: delete child tables first, then parent tables

-- Delete intake entries first
DELETE FROM intake_entries;

-- Delete celebrated dates
DELETE FROM celebrated_dates;

-- Delete household invitations
DELETE FROM household_invitations;

-- Delete settings
DELETE FROM settings;

-- Delete household users
DELETE FROM household_users;

-- Delete households last
DELETE FROM households;

-- Verify all tables are empty
SELECT 'households' as table_name, COUNT(*) as row_count FROM households
UNION ALL
SELECT 'household_users', COUNT(*) FROM household_users
UNION ALL
SELECT 'household_invitations', COUNT(*) FROM household_invitations
UNION ALL
SELECT 'settings', COUNT(*) FROM settings
UNION ALL
SELECT 'intake_entries', COUNT(*) FROM intake_entries
UNION ALL
SELECT 'celebrated_dates', COUNT(*) FROM celebrated_dates;
