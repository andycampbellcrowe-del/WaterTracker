-- Water Tracker Database Schema V3 - Multi-Account Household System
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ndwuhouerkynnpuyxufo/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- HOUSEHOLDS: Container for shared household/group data
-- ============================================================
CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE, -- 6-char code for inviting others
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- HOUSEHOLD USERS: Each auth user maps to one household user
-- ============================================================
CREATE TABLE IF NOT EXISTS household_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  bottle_size_oz NUMERIC NOT NULL DEFAULT 16,
  is_owner BOOLEAN NOT NULL DEFAULT false, -- First user who creates household
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(auth_user_id), -- Each auth user can only have one household_user record
  UNIQUE(household_id, display_name) -- Names must be unique within household
);

-- ============================================================
-- HOUSEHOLD INVITATIONS: For inviting users to join household
-- ============================================================
CREATE TABLE IF NOT EXISTS household_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  invited_by_user_id UUID REFERENCES household_users(id) ON DELETE CASCADE,
  email TEXT, -- Optional: if inviting by email
  invite_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by_user_id UUID REFERENCES household_users(id) ON DELETE SET NULL
);

-- ============================================================
-- SETTINGS: Shared household settings
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  unit TEXT NOT NULL DEFAULT 'oz' CHECK (unit IN ('oz', 'l')),
  daily_goal_volume NUMERIC NOT NULL DEFAULT 128,
  celebration_enabled BOOLEAN NOT NULL DEFAULT true,
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(household_id)
);

-- ============================================================
-- INTAKE ENTRIES: Water tracking data
-- ============================================================
CREATE TABLE IF NOT EXISTS intake_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  household_user_id UUID REFERENCES household_users(id) ON DELETE CASCADE,
  volume_oz NUMERIC NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- CELEBRATED DATES: Track when household hit goals
-- ============================================================
CREATE TABLE IF NOT EXISTS celebrated_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(household_id, date)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_household_users_household_id ON household_users(household_id);
CREATE INDEX IF NOT EXISTS idx_household_users_auth_user_id ON household_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_household_invitations_household_id ON household_invitations(household_id);
CREATE INDEX IF NOT EXISTS idx_household_invitations_invite_code ON household_invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_intake_entries_household_id ON intake_entries(household_id);
CREATE INDEX IF NOT EXISTS idx_intake_entries_household_user_id ON intake_entries(household_user_id);
CREATE INDEX IF NOT EXISTS idx_intake_entries_timestamp ON intake_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_celebrated_dates_household_id ON celebrated_dates(household_id);
CREATE INDEX IF NOT EXISTS idx_settings_household_id ON settings(household_id);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE celebrated_dates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- DROP EXISTING POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Users can view their household" ON households;
DROP POLICY IF EXISTS "Users can update their household" ON households;
DROP POLICY IF EXISTS "Users can insert their household" ON households;

DROP POLICY IF EXISTS "Users can view household users in their household" ON household_users;
DROP POLICY IF EXISTS "Users can insert themselves as household user" ON household_users;
DROP POLICY IF EXISTS "Users can update their own household user" ON household_users;
DROP POLICY IF EXISTS "Users can update household users in their household" ON household_users;
DROP POLICY IF EXISTS "Owners can delete household users" ON household_users;

DROP POLICY IF EXISTS "Users can view invitations for their household" ON household_invitations;
DROP POLICY IF EXISTS "Users can create invitations for their household" ON household_invitations;
DROP POLICY IF EXISTS "Anyone can view invitation by code" ON household_invitations;
DROP POLICY IF EXISTS "Users can update invitations they accepted" ON household_invitations;

DROP POLICY IF EXISTS "Users can view their household settings" ON settings;
DROP POLICY IF EXISTS "Users can insert their household settings" ON settings;
DROP POLICY IF EXISTS "Users can update their household settings" ON settings;

DROP POLICY IF EXISTS "Users can view their household intake entries" ON intake_entries;
DROP POLICY IF EXISTS "Users can insert their household intake entries" ON intake_entries;
DROP POLICY IF EXISTS "Users can update their household intake entries" ON intake_entries;
DROP POLICY IF EXISTS "Users can delete their household intake entries" ON intake_entries;

DROP POLICY IF EXISTS "Users can view their household celebrated dates" ON celebrated_dates;
DROP POLICY IF EXISTS "Users can insert their household celebrated dates" ON celebrated_dates;

-- ============================================================
-- HELPER FUNCTION FOR RLS POLICIES
-- ============================================================
-- Function to get user's household_id (security definer to bypass RLS)
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION get_user_household_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT household_id FROM household_users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- ============================================================
-- RLS POLICIES: HOUSEHOLDS
-- ============================================================
CREATE POLICY "Users can view their household"
  ON households FOR SELECT
  USING (id = get_user_household_id());

CREATE POLICY "Users can update their household"
  ON households FOR UPDATE
  USING (
    id = get_user_household_id()
    AND EXISTS (SELECT 1 FROM household_users WHERE auth_user_id = auth.uid() AND is_owner = true AND household_id = get_user_household_id())
  );

CREATE POLICY "Users can insert their household"
  ON households FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Any authenticated user can create a household

-- ============================================================
-- RLS POLICIES: HOUSEHOLD USERS
-- ============================================================
CREATE POLICY "Users can view household users in their household"
  ON household_users FOR SELECT
  USING (household_id = get_user_household_id());

CREATE POLICY "Users can insert themselves as household user"
  ON household_users FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can update their own household user"
  ON household_users FOR UPDATE
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update household users in their household"
  ON household_users FOR UPDATE
  USING (
    household_id = get_user_household_id()
    AND EXISTS (SELECT 1 FROM household_users WHERE auth_user_id = auth.uid() AND is_owner = true AND household_id = get_user_household_id())
  );

CREATE POLICY "Owners can delete household users"
  ON household_users FOR DELETE
  USING (
    household_id = get_user_household_id()
    AND EXISTS (SELECT 1 FROM household_users WHERE auth_user_id = auth.uid() AND is_owner = true AND household_id = get_user_household_id())
  );

-- ============================================================
-- RLS POLICIES: HOUSEHOLD INVITATIONS
-- ============================================================
CREATE POLICY "Users can view invitations for their household"
  ON household_invitations FOR SELECT
  USING (household_id = get_user_household_id());

CREATE POLICY "Users can create invitations for their household"
  ON household_invitations FOR INSERT
  WITH CHECK (household_id = get_user_household_id());

-- Special policy: Anyone can view invitation by code (needed for join flow)
CREATE POLICY "Anyone can view invitation by code"
  ON household_invitations FOR SELECT
  USING (status = 'pending' AND expires_at > NOW());

CREATE POLICY "Users can update invitations they accepted"
  ON household_invitations FOR UPDATE
  USING (accepted_by_user_id IN (SELECT id FROM household_users WHERE auth_user_id = auth.uid()));

-- ============================================================
-- RLS POLICIES: SETTINGS
-- ============================================================
CREATE POLICY "Users can view their household settings"
  ON settings FOR SELECT
  USING (household_id = get_user_household_id());

CREATE POLICY "Users can insert their household settings"
  ON settings FOR INSERT
  WITH CHECK (household_id = get_user_household_id());

CREATE POLICY "Users can update their household settings"
  ON settings FOR UPDATE
  USING (household_id = get_user_household_id());

-- ============================================================
-- RLS POLICIES: INTAKE ENTRIES
-- ============================================================
CREATE POLICY "Users can view their household intake entries"
  ON intake_entries FOR SELECT
  USING (household_id = get_user_household_id());

CREATE POLICY "Users can insert their household intake entries"
  ON intake_entries FOR INSERT
  WITH CHECK (household_id = get_user_household_id());

CREATE POLICY "Users can update their household intake entries"
  ON intake_entries FOR UPDATE
  USING (household_id = get_user_household_id());

CREATE POLICY "Users can delete their household intake entries"
  ON intake_entries FOR DELETE
  USING (household_id = get_user_household_id());

-- ============================================================
-- RLS POLICIES: CELEBRATED DATES
-- ============================================================
CREATE POLICY "Users can view their household celebrated dates"
  ON celebrated_dates FOR SELECT
  USING (household_id = get_user_household_id());

CREATE POLICY "Users can insert their household celebrated dates"
  ON celebrated_dates FOR INSERT
  WITH CHECK (household_id = get_user_household_id());

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to generate random invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Removed ambiguous chars
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_households_updated_at ON households;
DROP TRIGGER IF EXISTS update_household_users_updated_at ON household_users;
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;

-- Triggers for updated_at
CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON households
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
