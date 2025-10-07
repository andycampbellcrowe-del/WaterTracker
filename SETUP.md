# Supabase Backend Setup Guide

## Step 1: Run the Database Schema

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/ndwuhouerkynnpuyxufo
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-schema.sql` file
5. Paste it into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned" - this is correct!

## Step 2: Verify the Setup

After running the SQL, verify your tables were created:

1. Click on **Table Editor** in the left sidebar
2. You should see these tables:
   - `profiles`
   - `settings`
   - `intake_entries`
   - `celebrated_dates`

## Step 3: Configure Email Authentication (Optional but Recommended)

By default, Supabase requires email verification for new signups:

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Click on **Email**
3. You can either:
   - **Keep email verification ON** (recommended for production) - users will receive a verification email
   - **Turn OFF email confirmation** (for testing) - scroll down and toggle "Enable email confirmations" to OFF

## Step 4: Test the App

1. Make sure your `.env` file exists with the correct credentials (already created)
2. Restart the dev server: `npm run dev`
3. Open the app in your browser
4. Sign up with an email and password
5. If email confirmation is ON, check your email for verification link
6. Once signed in, you should see the app!

## How to Use

### Multi-Device Access

1. **Sign up once** - Create one account that both you and Rachel will use
2. **Share the login** - Both of you can use the same email/password on your respective devices
3. **Automatic sync** - All water tracking data syncs automatically across devices

### Migrating Existing Data

If you have existing data in localStorage (from before the backend was set up):

1. Sign in to your account
2. Go to **Settings**
3. Click **"Migrate Local Data to Cloud"**
4. Your existing data will be uploaded to Supabase

## Environment Variables for Vercel

When deploying to production on Vercel, add these environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL` = `https://ndwuhouerkynnpuyxufo.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kd3Vob3Vlcmt5bm5wdXl4dWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NjIzNTUsImV4cCI6MjA3NTMzODM1NX0.33sCdrqUziLjutYywfq9sn5EBcXYpnEuRv0DTIBV76k`
3. Redeploy your app

## Security Notes

- The anon key is safe to expose in client-side code
- Row Level Security (RLS) ensures users can only access their own data
- Never share your Supabase service role key (which is different and not used here)
