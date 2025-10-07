# Deployment Guide

## Prerequisites

Before deploying, you must complete the database setup:

1. **Run the SQL schema** - Follow instructions in `SETUP.md` to set up your Supabase database
2. **Verify tables are created** - Check that all 4 tables exist in Supabase

## Deploying to Vercel

### Step 1: Add Environment Variables to Vercel

1. Go to https://vercel.com/dashboard
2. Select your Water Tracker project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables (for Production, Preview, and Development):

```
VITE_SUPABASE_URL=https://ndwuhouerkynnpuyxufo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kd3Vob3Vlcmt5bm5wdXl4dWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NjIzNTUsImV4cCI6MjA3NTMzODM1NX0.33sCdrqUziLjutYywfq9sn5EBcXYpnEuRv0DTIBV76k
```

5. Click **Save**

### Step 2: Commit and Push Your Changes

Since you're on branch `fix/add-remove-bottle-button`, you have two options:

**Option A: Continue current workflow (Recommended)**
```bash
# Commit all the backend changes
git add .
git commit -m "feat: add Supabase backend for multi-device sync

- Add authentication with Supabase
- Implement cloud data storage
- Add multi-device sync
- Add data migration from localStorage
- Include -1 Bottle button
- Add safeguard to prevent negative water intake"

# Push to create preview deployment
git push origin fix/add-remove-bottle-button
```

This will create a **preview deployment** on Vercel that you can test.

**Option B: Deploy to production immediately**
```bash
# Commit changes
git add .
git commit -m "feat: add Supabase backend for multi-device sync"

# Merge to main and push
git checkout main
git merge fix/add-remove-bottle-button
git push origin main
```

This will deploy directly to production.

### Step 3: Test the Deployment

1. Wait for Vercel to finish building (usually 1-2 minutes)
2. Open your production/preview URL
3. Sign up with an email
4. Test adding water intake
5. Sign in from a different device to verify sync works

## First-Time Setup After Deployment

### For You and Rachel:

1. **Create one shared account**:
   - One of you signs up with an email/password
   - Share these credentials with each other

2. **Sign in on both devices**:
   - You: Sign in on your phone
   - Rachel: Sign in on her phone using the same credentials

3. **Migrate existing data** (if you have any):
   - The person who was using the app locally before
   - Go to Settings → "Migrate Local Data to Cloud"
   - This uploads your old localStorage data

4. **Start tracking!**
   - Both phones now show the same data
   - Updates happen in real-time
   - Works even if one device is offline (syncs when back online)

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure you added the environment variables in Vercel
- Redeploy the app after adding them

### Email verification required
- Check your email for verification link
- Or disable email verification in Supabase (see SETUP.md)

### Data not syncing
- Make sure both devices are signed in with the same account
- Check internet connection
- Try refreshing the page

### "Not authenticated" error
- Sign out and sign back in
- Clear browser cache and try again

## Security Best Practices

1. **Use a strong password** - This account will be shared, so make it secure
2. **Don't share credentials publicly** - Only share with Rachel
3. **Regular backups** - Use the Export Data feature periodically as backup
4. **Email ownership** - Use an email you both have access to (or create a shared one)

## Rolling Back

If something goes wrong, you can quickly rollback:

1. Go to Vercel Dashboard → Your Project → Deployments
2. Find a previous working deployment
3. Click the three dots → "Promote to Production"
