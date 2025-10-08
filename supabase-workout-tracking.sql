-- Add workout tracking to Water Tracker
-- Run this in Supabase SQL Editor after the main schema

-- ============================================================
-- ADD WORKOUT GOAL COLUMNS TO HOUSEHOLD_USERS
-- ============================================================
-- Goals are in hours per week, stored as NUMERIC to allow 0.25 increments
ALTER TABLE household_users
ADD COLUMN IF NOT EXISTS weekly_cardio_goal_hours NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS weekly_strength_goal_hours NUMERIC(5,2) DEFAULT 0;

-- Add check constraints to ensure goals are in 0.25 hour increments
ALTER TABLE household_users
ADD CONSTRAINT weekly_cardio_goal_quarters CHECK (weekly_cardio_goal_hours * 4 = FLOOR(weekly_cardio_goal_hours * 4)),
ADD CONSTRAINT weekly_strength_goal_quarters CHECK (weekly_strength_goal_hours * 4 = FLOOR(weekly_strength_goal_hours * 4));

-- ============================================================
-- CREATE WORKOUT_ENTRIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS workout_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  household_user_id UUID NOT NULL REFERENCES household_users(id) ON DELETE CASCADE,
  workout_type TEXT NOT NULL CHECK (workout_type IN ('cardio', 'strength')),
  duration_hours NUMERIC(5,2) NOT NULL CHECK (duration_hours > 0 AND duration_hours * 4 = FLOOR(duration_hours * 4)),
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR WORKOUT_ENTRIES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_workout_entries_household_id ON workout_entries(household_id);
CREATE INDEX IF NOT EXISTS idx_workout_entries_household_user_id ON workout_entries(household_user_id);
CREATE INDEX IF NOT EXISTS idx_workout_entries_timestamp ON workout_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_workout_entries_type ON workout_entries(workout_type);

-- ============================================================
-- ENABLE RLS ON WORKOUT_ENTRIES
-- ============================================================
ALTER TABLE workout_entries ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES FOR WORKOUT_ENTRIES
-- ============================================================
-- Users can insert their own workout entries
CREATE POLICY "allow_insert_workout"
  ON workout_entries FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    household_id IN (
      SELECT household_id
      FROM household_users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Users can view workout entries in their household
CREATE POLICY "allow_select_workout"
  ON workout_entries FOR SELECT
  TO authenticated, anon
  USING (
    household_id IN (
      SELECT household_id
      FROM household_users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Users can update their own workout entries
CREATE POLICY "allow_update_workout"
  ON workout_entries FOR UPDATE
  TO authenticated, anon
  USING (
    household_user_id IN (
      SELECT id
      FROM household_users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Users can delete their own workout entries
CREATE POLICY "allow_delete_workout"
  ON workout_entries FOR DELETE
  TO authenticated, anon
  USING (
    household_user_id IN (
      SELECT id
      FROM household_users
      WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================
GRANT ALL ON workout_entries TO authenticated;
GRANT ALL ON workout_entries TO anon;

-- Verify setup
SELECT
  'Workout tracking tables created successfully!' as status,
  COUNT(*) as workout_entry_count
FROM workout_entries;
