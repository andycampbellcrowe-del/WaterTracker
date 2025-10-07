-- Water Tracker Database Schema V2 - Multi-User Support
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ndwuhouerkynnpuyxufo/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop old tables if migrating (CAREFUL - this deletes data!)
-- DROP TABLE IF EXISTS celebrated_dates CASCADE;
-- DROP TABLE IF EXISTS intake_entries CASCADE;
-- DROP TABLE IF EXISTS settings CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table (one per household/group)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  household_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create household_users table (multiple users per household)
CREATE TABLE IF NOT EXISTS household_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6', -- hex color for UI
  bottle_size_oz NUMERIC NOT NULL DEFAULT 16,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  unit TEXT NOT NULL DEFAULT 'oz' CHECK (unit IN ('oz', 'l')),
  daily_goal_volume NUMERIC NOT NULL DEFAULT 128,
  celebration_enabled BOOLEAN NOT NULL DEFAULT true,
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- Create intake entries table (now references household_users)
CREATE TABLE IF NOT EXISTS intake_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  household_user_id UUID REFERENCES household_users(id) ON DELETE CASCADE,
  volume_oz NUMERIC NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create celebrated dates table
CREATE TABLE IF NOT EXISTS celebrated_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_household_users_profile_id ON household_users(profile_id);
CREATE INDEX IF NOT EXISTS idx_intake_entries_profile_id ON intake_entries(profile_id);
CREATE INDEX IF NOT EXISTS idx_intake_entries_household_user_id ON intake_entries(household_user_id);
CREATE INDEX IF NOT EXISTS idx_intake_entries_timestamp ON intake_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_celebrated_dates_profile_id ON celebrated_dates(profile_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE celebrated_dates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view own household users" ON household_users;
DROP POLICY IF EXISTS "Users can insert own household users" ON household_users;
DROP POLICY IF EXISTS "Users can update own household users" ON household_users;
DROP POLICY IF EXISTS "Users can delete own household users" ON household_users;

DROP POLICY IF EXISTS "Users can view own settings" ON settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON settings;
DROP POLICY IF EXISTS "Users can update own settings" ON settings;

DROP POLICY IF EXISTS "Users can view own intake entries" ON intake_entries;
DROP POLICY IF EXISTS "Users can insert own intake entries" ON intake_entries;
DROP POLICY IF EXISTS "Users can update own intake entries" ON intake_entries;
DROP POLICY IF EXISTS "Users can delete own intake entries" ON intake_entries;

DROP POLICY IF EXISTS "Users can view own celebrated dates" ON celebrated_dates;
DROP POLICY IF EXISTS "Users can insert own celebrated dates" ON celebrated_dates;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Household users policies
CREATE POLICY "Users can view own household users"
  ON household_users FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own household users"
  ON household_users FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own household users"
  ON household_users FOR UPDATE
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own household users"
  ON household_users FOR DELETE
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Settings policies
CREATE POLICY "Users can view own settings"
  ON settings FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own settings"
  ON settings FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own settings"
  ON settings FOR UPDATE
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Intake entries policies
CREATE POLICY "Users can view own intake entries"
  ON intake_entries FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own intake entries"
  ON intake_entries FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own intake entries"
  ON intake_entries FOR UPDATE
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own intake entries"
  ON intake_entries FOR DELETE
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Celebrated dates policies
CREATE POLICY "Users can view own celebrated dates"
  ON celebrated_dates FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own celebrated dates"
  ON celebrated_dates FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_household_users_updated_at ON household_users;
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_household_users_updated_at
  BEFORE UPDATE ON household_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
