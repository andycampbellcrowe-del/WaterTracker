# Multi-User Migration Guide

## Step 1: Run Database Migration (WIPES ALL DATA!)

1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/ndwuhouerkynnpuyxufo/sql
2. Run `supabase-migration-clean.sql` first (drops all tables)
3. Then run `supabase-schema-v2.sql` (creates new schema)

## Step 2: What's Changed

### Database Schema
- **Old**: Hardcoded "rachel" and "andy" as user names
- **New**: Dynamic `household_users` table - add unlimited users with custom names, colors, and bottle sizes

### User Flow
1. User signs up with email/password (same as before)
2. **NEW**: Onboarding screen to add household members
3. Each member has: name, color, bottle size
4. Track water for any member

### Key Changes Made So Far

**✅ Completed:**
- Updated `types.ts` with new data structures
- Created `supabaseService.ts` with new API methods
- Created `Onboarding.tsx` component for first-time setup
- Updated progress ring to use grey for group total
- Created new database schema

**❌ Still TODO (I'll create these files now):**
- Update AppContext to load/manage dynamic users
- Update Today page to work with dynamic users
- Update History page
- Update Settings page with user management
- Add password protection to reset button
- Update all utility functions

## Step 3: Files Being Created

I'm going to create stub/simplified versions of the remaining files so the app compiles. You'll need to test and refine, but the structure will be there.

