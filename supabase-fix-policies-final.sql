-- Final fix: Create policies that work with both authenticated and anon roles
-- Run this in Supabase SQL Editor

-- Re-enable RLS first
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE celebrated_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_invitations ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the households insert policy for ALL roles
DROP POLICY IF EXISTS "Users can insert their household" ON households;

CREATE POLICY "Users can insert their household"
  ON households FOR INSERT
  TO public  -- This applies to all roles including authenticated and anon
  WITH CHECK (true);

-- Drop and recreate the household_users insert policy
DROP POLICY IF EXISTS "Users can insert themselves as household user" ON household_users;

CREATE POLICY "Users can insert themselves as household user"
  ON household_users FOR INSERT
  TO public
  WITH CHECK (auth_user_id = auth.uid());

-- Also need a SELECT policy for authenticated users to see households they create
DROP POLICY IF EXISTS "Users can view their household" ON households;

CREATE POLICY "Users can view their household"
  ON households FOR SELECT
  TO public
  USING (
    id IN (SELECT household_id FROM household_users WHERE auth_user_id = auth.uid())
  );

-- And for household_users
DROP POLICY IF EXISTS "Users can view household users in their household" ON household_users;

CREATE POLICY "Users can view household users in their household"
  ON household_users FOR SELECT
  TO public
  USING (
    household_id IN (SELECT household_id FROM household_users WHERE auth_user_id = auth.uid())
  );

-- Settings policies
DROP POLICY IF EXISTS "Users can insert their household settings" ON settings;

CREATE POLICY "Users can insert their household settings"
  ON settings FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_users
      WHERE auth_user_id = auth.uid()
      AND household_id = settings.household_id
    )
  );

DROP POLICY IF EXISTS "Users can view their household settings" ON settings;

CREATE POLICY "Users can view their household settings"
  ON settings FOR SELECT
  TO public
  USING (
    household_id IN (SELECT household_id FROM household_users WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update their household settings" ON settings;

CREATE POLICY "Users can update their household settings"
  ON settings FOR UPDATE
  TO public
  USING (
    household_id IN (SELECT household_id FROM household_users WHERE auth_user_id = auth.uid())
  );
