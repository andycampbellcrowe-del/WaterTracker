# Migration to Multi-Account System

This guide will walk you through migrating your Water Tracker app from the simple profile-based system to a full multi-account household system where each person has their own login.

## ⚠️ Important Notes

- **All existing data will be deleted** during this migration
- This is a breaking change that requires database schema changes
- You'll need to create new accounts after migration
- Have your Supabase dashboard open before starting

## Prerequisites

- Supabase project URL and anon key in your `.env` file
- Access to Supabase dashboard (https://app.supabase.com)
- Current codebase pulled with all latest changes

## Step 1: Run Database Migration

### 1.1 Open Supabase SQL Editor

1. Go to https://app.supabase.com
2. Select your Water Tracker project
3. Click "SQL Editor" in the left sidebar
4. Click "New query"

### 1.2 Clean Up Old Schema

Copy and paste this SQL to remove old tables:

```sql
-- Drop old tables and policies
-- Note: Some of these may not exist depending on your schema version, that's OK

-- Drop policies only if tables exist
DO $$
BEGIN
    -- Drop profile policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    END IF;

    -- Drop household_users policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'household_users') THEN
        DROP POLICY IF EXISTS "Users can view household users" ON household_users;
        DROP POLICY IF EXISTS "Users can manage household users" ON household_users;
    END IF;

    -- Drop app_settings policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'app_settings') THEN
        DROP POLICY IF EXISTS "Users can view their settings" ON app_settings;
        DROP POLICY IF EXISTS "Users can update their settings" ON app_settings;
    END IF;

    -- Drop intake_entries policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'intake_entries') THEN
        DROP POLICY IF EXISTS "Users can view their intake entries" ON intake_entries;
        DROP POLICY IF EXISTS "Users can insert their intake entries" ON intake_entries;
        DROP POLICY IF EXISTS "Users can delete their intake entries" ON intake_entries;
    END IF;

    -- Drop celebrated_dates policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'celebrated_dates') THEN
        DROP POLICY IF EXISTS "Users can view their celebrated dates" ON celebrated_dates;
        DROP POLICY IF EXISTS "Users can manage their celebrated dates" ON celebrated_dates;
    END IF;
END $$;

-- Drop tables in correct dependency order (CASCADE drops dependent objects automatically)
DROP TABLE IF EXISTS celebrated_dates CASCADE;
DROP TABLE IF EXISTS intake_entries CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;
DROP TABLE IF EXISTS household_users CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
```

Click "Run" to execute this query.

### 1.3 Create New Multi-Account Schema

Now copy the entire contents of `supabase-schema-v3-multi-account.sql` from your project root and paste it into a new query in the SQL Editor.

Click "Run" to execute the migration.

### 1.4 Verify Migration Success

Run this query to verify all tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('households', 'household_users', 'household_invitations', 'app_settings', 'intake_entries', 'celebrated_dates')
ORDER BY table_name;
```

You should see all 6 tables listed.

## Step 2: Test the Multi-Account Flow

### 2.1 Start Development Server

```bash
npm run dev
```

### 2.2 Create First Household (Andy's Account)

1. The app will show a login screen
2. Click "Sign Up"
3. Enter Andy's email and password (make up test credentials)
4. Click "Sign Up"
5. You'll see the onboarding screen with two options
6. Click "Create New Household"
7. Fill in the form:
   - Household Name: "The Smiths" (or whatever you want)
   - Your Name: "Andy"
   - Pick a color (e.g., blue)
   - Bottle Size: 16 oz
8. Click "Create Household"
9. You should now see the Today page with "Welcome back, Andy!"

### 2.3 Get Invite Code

1. Click "Settings" in the bottom navigation
2. You should see a section called "Household: The Smiths"
3. Copy the 6-character invite code displayed (e.g., "ABC123")
4. **Save this code** - you'll need it for Rachel's account

### 2.4 Create Second Account (Rachel's Account)

1. Sign out by clicking the sign out button in Settings
2. On the login screen, click "Sign Up"
3. Enter Rachel's email and password (different from Andy's)
4. Click "Sign Up"
5. You'll see the onboarding screen
6. This time click "Join Existing Household"
7. Fill in the form:
   - Invite Code: Paste the code from step 2.3
   - Your Name: "Rachel"
   - Pick a color (e.g., pink)
   - Bottle Size: 16 oz
8. Click "Join Household"
9. You should now see "Welcome back, Rachel!"

### 2.5 Verify Multi-Account Works

**Test Rachel's session:**
1. Rachel should see both herself and Andy in Settings
2. Rachel should NOT be able to edit or remove Andy (she's not the owner)
3. Rachel CAN edit her own profile
4. Add some water intake for Rachel

**Switch to Andy's session:**
1. Sign out
2. Sign in with Andy's credentials
3. Andy should see the water intake Rachel just added (synced!)
4. Andy SHOULD see "Edit" and "Remove" buttons for Rachel in Settings (he's the owner)
5. Andy should see the invite code (owner privilege)

**Test on mobile:**
1. Open the Vercel URL on your phone
2. Sign in as Andy - you should see all the data from desktop
3. Add water intake on mobile
4. Check desktop - it should sync automatically

## Step 3: Deploy to Production

### 3.1 Verify Environment Variables

Make sure your Vercel deployment has these environment variables set:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3.2 Deploy

```bash
git add .
git commit -m "feat: implement multi-account household system with invite codes"
git push
```

Vercel will automatically deploy the changes.

### 3.3 Production Testing

Once deployed:
1. Open your production URL
2. Sign up with real credentials
3. Create your actual household
4. Share invite code with Rachel
5. Have Rachel sign up and join

## Troubleshooting

### "User not authenticated" errors
- Make sure you're signed in
- Try refreshing the page
- Check browser console for detailed errors

### "No household found" after migration
- This is expected - everyone needs to create or join a household again
- Old data was wiped as part of the migration

### Invite code not working
- Make sure you copied the full 6-character code
- Check that the code hasn't been used already
- Verify the household still exists

### Data not syncing between devices
- Check that both accounts are in the same household
- Look in Settings to verify you see the same household name
- Check Supabase logs for RLS policy errors

### White screen on load
- Check browser console for errors
- Verify environment variables are set correctly
- Make sure Supabase project is active

## What Changed

### Database Schema
- **Added:** `households` table - container for shared data
- **Added:** `household_invitations` table - invite code system
- **Modified:** `household_users` now links to `auth.users` via `auth_user_id`
- **Added:** `is_owner` flag for permission management
- **Removed:** `profiles` table (no longer needed)

### Application Flow
- Each person signs up with their own email/password
- First person creates a household (becomes owner)
- Owner can share invite code from Settings
- Others sign up and use invite code to join
- All household data is shared and synced in real-time
- Owner can manage (edit/remove) all household members
- Non-owners can only edit their own profile

### User Experience
- Personalized "Welcome back, [Name]!" message on Today page
- Current user is auto-selected when adding water
- Settings shows "Your Profile" section (always editable)
- Settings shows "Other Members" section (owner can manage)
- Invite code prominently displayed for easy sharing

## Next Steps

After successful migration:

1. **Real-world testing** - Use the app for a few days with both accounts
2. **Invite system testing** - Try creating a third account and joining via invite
3. **Permission testing** - Verify owner can manage members, non-owners cannot
4. **Mobile testing** - Access from both phones simultaneously
5. **Data persistence** - Verify water intake syncs across all sessions

## Rolling Back (Emergency Only)

If something goes catastrophically wrong and you need the old system back:

1. Restore from Supabase backup (if you created one)
2. Or re-run the old schema from git history
3. Contact support if you need help recovering data

However, since you confirmed all current data is test data, this shouldn't be necessary.
