# 🚀 Quick Start: Backend Setup

Your Water Tracker now has **cloud sync** powered by Supabase! Follow these steps to get it running.

## ⚠️ IMPORTANT: Complete These Steps Before Testing

### Step 1: Set Up the Database (5 minutes)

1. Open your Supabase dashboard: https://supabase.com/dashboard/project/ndwuhouerkynnpuyxufo/sql
2. Click **SQL Editor** → **New Query**
3. Copy **ALL** the SQL from the file `supabase-schema.sql`
4. Paste it into the SQL editor
5. Click **Run** (you should see "Success. No rows returned")

### Step 2: Configure Authentication

Go to: https://supabase.com/dashboard/project/ndwuhouerkynnpuyxufo/auth/providers

**For easy testing (recommended):**
- Click on **Email** provider
- Scroll down to find "Enable email confirmations"
- **Turn it OFF** (this lets you test without checking email)
- Click Save

**For production (more secure):**
- Leave email confirmations ON
- Users will receive verification emails when they sign up

### Step 3: Test Locally

The dev server is already running at http://localhost:3000/

1. Open http://localhost:3000/ in your browser
2. You should see a login screen
3. Click "Sign Up"
4. Enter any email (e.g., `test@test.com`) and password (min 6 chars)
5. You should be logged in and see the app!

### Step 4: Test Multi-Device Sync

1. Open the app in a second browser tab or incognito window
2. Sign in with the same credentials
3. Add water in one tab
4. Refresh the other tab - you should see the update!

## 🎉 What You Get

- ✅ **Multi-device sync** - Access from any device
- ✅ **Cloud backup** - Data stored securely in Supabase
- ✅ **Real-time updates** - Changes sync across devices
- ✅ **Authentication** - Each couple has their own account
- ✅ **Migration tool** - Import existing localStorage data
- ✅ **Offline fallback** - Still works without internet (syncs later)

## 📱 How You and Rachel Will Use It

1. **Sign up once** - Create one account to share
2. **Both sign in** - Use same email/password on both phones
3. **Track together** - All water intake syncs automatically
4. **Works everywhere** - Any device, any browser

## 🚀 Ready to Deploy?

Once you've tested locally and everything works:

1. Follow `DEPLOYMENT.md` for full deployment instructions
2. Add environment variables to Vercel
3. Push your code
4. Vercel will automatically deploy!

## 📚 Full Documentation

- `SETUP.md` - Detailed Supabase setup
- `DEPLOYMENT.md` - Step-by-step deployment guide
- `supabase-schema.sql` - Database schema

## ❓ Having Issues?

**"Missing Supabase environment variables"**
- Make sure you ran Step 1 (database setup)
- Check that `.env` file exists

**Can't sign in**
- Check if email confirmation is enabled in Supabase
- If enabled, check your email for verification link
- Or disable it (see Step 2 above)

**Data not syncing**
- Make sure you're signed in on both devices
- Check that you're using the same account
- Try refreshing the page

Need help? Check the detailed guides mentioned above!
