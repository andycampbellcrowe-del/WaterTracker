-- Grant explicit permissions to authenticated and anon roles
-- Maybe RLS policies aren't enough and we need explicit grants
-- Run this in Supabase SQL Editor

-- Grant table permissions to authenticated role
GRANT ALL ON households TO authenticated;
GRANT ALL ON household_users TO authenticated;
GRANT ALL ON settings TO authenticated;
GRANT ALL ON intake_entries TO authenticated;
GRANT ALL ON celebrated_dates TO authenticated;
GRANT ALL ON household_invitations TO authenticated;

-- Grant table permissions to anon role (for public access during creation)
GRANT ALL ON households TO anon;
GRANT ALL ON household_users TO anon;
GRANT ALL ON settings TO anon;
GRANT ALL ON intake_entries TO anon;
GRANT ALL ON celebrated_dates TO anon;
GRANT ALL ON household_invitations TO anon;

-- Grant sequence usage (for auto-increment/uuid generation)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION user_household_id() TO authenticated;
GRANT EXECUTE ON FUNCTION user_household_id() TO anon;
GRANT EXECUTE ON FUNCTION generate_invite_code() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_invite_code() TO anon;
