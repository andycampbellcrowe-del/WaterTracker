# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A multi-user water and workout tracking application for households. Users authenticate with Supabase, then join or create a household to track shared water intake goals and individual workout goals. The app features a modern React frontend with TypeScript, Tailwind CSS, and Recharts for visualizations.

## Commands

### Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server on http://localhost:3000
npm run build        # TypeScript check + Vite build
npm run preview      # Preview production build
npm run lint         # ESLint check
```

### Versioning & Releases
```bash
npm run version:patch   # Bump patch version and push tags
npm run version:minor   # Bump minor version and push tags
npm run version:major   # Bump major version and push tags
npm run release         # Build + patch version + push tags
```

## Architecture

### Context Hierarchy
The app uses a nested context structure:
1. **AuthContext** (`src/context/AuthContext.tsx`) - Wraps entire app, manages Supabase authentication
2. **AppProvider** (`src/context/AppContext.tsx`) - Depends on AuthContext, manages all application state and Supabase data operations

### Multi-Account Household System
- Each auth user belongs to one household via a `household_user` record
- Households can have multiple users sharing the same water goal
- Users can leave households and join different ones
- Households have invite codes for adding new members
- Each user has their own bottle size, color, and workout goals

### State Management Pattern
- **Single source of truth**: `AppState` in AppContext contains all app data
- **Data flow**: Supabase → AppContext → Components
- **Loading states**: Both contexts have `loading` flags; app shows loading spinner until both resolve
- **Onboarding flow**: If user has no `household_user` record, `needsOnboarding` triggers onboarding UI

### Data Model

#### Core Types (src/types.ts)
- `Household`: Household metadata and invite code
- `HouseholdUser`: User profile within a household (display name, color, bottle size, workout goals)
- `AppSettings`: Water tracking settings (unit, daily goal, celebration preferences) - **household-wide**
- `IntakeEntry`: Individual water intake log (always stored in oz)
- `WorkoutEntry`: Individual workout log (cardio/strength, duration in 0.25 hour increments)

#### Key State Properties
- `state.household`: Current household info
- `state.currentUser`: The logged-in user's household_user record
- `state.users`: All users in the household
- `state.settings`: Household-wide water tracking settings
- `state.entries`: All water intake entries for the household
- `state.workoutEntries`: All workout entries for the household

### Supabase Service Layer
All database operations go through `src/services/supabaseService.ts`:
- **Household management**: Create, join, leave households
- **Invitation system**: Generate and accept invite codes
- **Data operations**: CRUD for intake entries, workout entries, settings
- **RLS security**: All tables use Row Level Security policies

Important: The service layer handles conversion between snake_case database columns and camelCase TypeScript types.

### Page Structure
- **Login** (`src/pages/Login.tsx`) - Supabase email/password auth
- **OnboardingMultiAccount** (`src/pages/OnboardingMultiAccount.tsx`) - Create or join household
- **Today** (`src/pages/Today.tsx`) - Log water intake, view today's progress
- **Workouts** (`src/pages/Workouts.tsx`) - Log workouts, view weekly progress
- **History** (`src/pages/History.tsx`) - View historical charts and KPIs for water tracking
- **Settings** (`src/pages/Settings.tsx`) - Configure household settings, manage users

### Routing & Layout
- Uses React Router v6
- `Layout.tsx` provides bottom navigation (visible after onboarding)
- Routes are protected by auth + onboarding checks in `App.tsx`

### Unit Conversion
- Water volume is **always stored in oz** in the database
- Display unit (oz/liters) is a setting that only affects UI
- Conversion happens in `src/utils/conversions.ts`
- When changing units, the goal volume is converted for display

### Workout Tracking
- Two workout types: cardio and strength
- Duration stored in 0.25 hour increments (15-minute intervals)
- Weekly goals are per-user, not household-wide
- Calculations in `src/utils/workoutCalculations.ts`

### Chart Libraries
- **Recharts** for all charts (History and Workouts pages)
- Custom chart components in `src/components/charts/`
- Progress rings use custom SVG implementation (`ProgressRing.tsx`, `DualProgressRing.tsx`, `WorkoutProgressRing.tsx`)

### Styling
- **Tailwind CSS** for all styling
- Mobile-first responsive design
- Smooth color gradients (primary blues, accent pinks/purples)
- WCAG AA accessibility compliance

## Environment Variables

Required in `.env.local`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

Key tables (see `supabase-workout-tracking-migration.sql` for current schema):
- `households`: Household info and permanent invite codes
- `household_users`: User profiles within households
- `household_invitations`: Temporary invitation codes
- `settings`: Per-household water tracking settings
- `intake_entries`: Water intake logs
- `workout_entries`: Workout logs
- `celebrated_dates`: Dates when household water goal was celebrated

All tables have RLS policies restricting access to household members only.

## TypeScript Configuration

- Strict mode enabled
- Target: ES2020
- Bundler module resolution (Vite)
- No unused locals/parameters enforcement

## Common Patterns

### Adding a new AppContext method:
1. Add the function signature to `AppContextType` interface
2. Implement the async function (usually calls supabaseService)
3. Update local state optimistically or refetch
4. Add to the context value object
5. Export via `useApp()` hook

### Adding a new Supabase table:
1. Create SQL migration file
2. Add RLS policies (template: check if user is in same household)
3. Add TypeScript types to `src/types.ts`
4. Add service layer functions in `src/services/supabaseService.ts`
5. Update `AppState` and `AppContext` if needed

### Handling user switching between households:
- Call `leaveHousehold()` to delete current `household_user` record
- This triggers `needsOnboarding` flag
- User goes through onboarding flow again to create/join new household
- After onboarding, `refreshData()` is called to load new household data
