# Multi-User Implementation Status

## ✅ COMPLETED

1. **Database Schema** - `supabase-schema-v2.sql`
   - Multi-user support with `household_users` table
   - Dynamic user management
   - Run migration with `supabase-migration-clean.sql` first!

2. **Types** - `src/types.ts`
   - `HouseholdUser` type with id, name, color, bottleSize
   - Updated `IntakeEntry` to use `householdUserId`
   - Dynamic `DayStats` and `KPIData`

3. **Supabase Service** - `src/services/supabaseService.ts`
   - CRUD operations for household users
   - Updated all queries for new schema

4. **App Context** - `src/context/AppContext.tsx`
   - Loads dynamic users from database
   - `needsOnboarding` flag when no users exist
   - User management methods: `addUser`, `updateUser`, `deleteUser`
   - Updated `addIntake` to use `householdUserId`

5. **Onboarding Component** - `src/pages/Onboarding.tsx`
   - Collects user names, colors, bottle sizes
   - Shown automatically on first login

6. **App.tsx**
   - Shows Onboarding when `needsOnboarding === true`
   - Integrated with auth and app contexts

7. **Utility Functions** - `src/utils/calculations.ts`
   - `getTodayByUserId()` instead of hardcoded users
   - Dynamic `getDayStats()` and `calculateKPIs()`

8. **Progress Ring**
   - Grey color for group total (already done)

## ❌ TODO - Critical Files

### 1. Today Page (`src/pages/Today.tsx`)
**Status**: NOT UPDATED - will break!
**What to do**:
```typescript
// Replace hardcoded user selection:
const [selectedUser, setSelectedUser] = useState<string>(state.users[0]?.id || '');

// Dynamic user buttons:
{state.users.map(user => (
  <button
    key={user.id}
    onClick={() => setSelectedUser(user.id)}
    style={{
      background: selectedUser === user.id
        ? user.color
        : 'white',
      borderColor: user.color
    }}
  >
    {user.displayName}
  </button>
))}

// Get selected user object:
const selectedUserObj = state.users.find(u => u.id === selectedUser);
const bottleSize = selectedUserObj?.bottleSizeOz || 16;

// Update addIntake calls:
handleAddIntake(1) → handleAddIntake(selectedUser, bottleSize * 1)
handleAddIntake(0.5) → handleAddIntake(selectedUser, bottleSize * 0.5)
handleAddIntake(-1) → handleAddIntake(selectedUser, -bottleSize * 1)

// Update function:
const handleAddIntake = (userId: string, volumeOz: number) => {
  addIntake(userId, volumeOz);
};

// Calculate user totals:
const userTotals = state.users.map(user => ({
  user,
  total: getTodayByUserId(entries, user.id)
}));

// Update progress ring:
<DualProgressRing
  totalPercent={progressPercent}
  users={userTotals.map(ut => ({
    ...ut.user,
    percent: getProgressPercent(ut.total, goalOz)
  }))}
/>
```

### 2. Progress Ring (`src/components/DualProgressRing.tsx`)
**Status**: Needs multi-user support
**What to do**:
- Accept array of users with colors and percentages
- Render each user's segment dynamically
- Split the inner ring by number of users

### 3. Settings Page (`src/pages/Settings.tsx`)
**Status**: Has old fields, needs user management
**What to do**:
- Remove `rachelBottlesPerGoal` and `andyBottlesPerGoal` sections
- Add "Manage Users" section:
  ```typescript
  {state.users.map(user => (
    <div key={user.id}>
      <input value={user.displayName} onChange={(e) => updateUser(user.id, { displayName: e.target.value })} />
      <input type="color" value={user.color} onChange={(e) => updateUser(user.id, { color: e.target.value })} />
      <input type="number" value={user.bottleSizeOz} onChange={(e) => updateUser(user.id, { bottleSizeOz: parseFloat(e.target.value) })} />
      <button onClick={() => deleteUser(user.id)}>Delete</button>
    </div>
  ))}
  <button onClick={() => addUser('New User', '#3b82f6', 16)}>Add User</button>
  ```

- Add password protection to Reset Data button:
  ```typescript
  const [resetPassword, setResetPassword] = useState('');
  const [showResetPrompt, setShowResetPrompt] = useState(false);

  const handleReset = () => {
    if (resetPassword === 'AndyDrinksWater') {
      resetData();
      setShowResetPrompt(false);
      setResetPassword('');
    } else {
      alert('Incorrect password!');
    }
  };
  ```

### 4. History Page (`src/pages/History.tsx`)
**Status**: Uses old `entry.user` field
**What to do**:
- Update to use `entry.householdUserId`
- Look up user name: `state.users.find(u => u.id === entry.householdUserId)?.displayName`
- Update filters to use user IDs
- Update stats calculations to pass `users` array

## 🚀 Deployment Checklist

1. **Run Database Migration**:
   - Go to Supabase SQL Editor
   - Run `supabase-migration-clean.sql` (WIPES DATA!)
   - Run `supabase-schema-v2.sql`

2. **Update Remaining Files**:
   - Today.tsx
   - DualProgressRing.tsx
   - Settings.tsx
   - History.tsx

3. **Test Flow**:
   - Sign up → Onboarding → Add users → Track water
   - Switch between users
   - Add/remove users in Settings
   - Reset data with password

4. **Deploy to Vercel**:
   - Commit changes
   - Push to main
   - Vercel auto-deploys

## Estimated Time Remaining

- Today page: 30-45 minutes
- Progress Ring multi-user: 30 minutes
- Settings page: 30 minutes
- History page: 20 minutes
- Testing/bugfixes: 30-60 minutes

**Total: 2-3 hours**

## Quick Commands

```bash
# Kill old dev server
pkill -f vite

# Start fresh
npm run dev

# Check for TypeScript errors
npx tsc --noEmit

# Commit progress
git add .
git commit -m "wip: multi-user migration in progress"
```
