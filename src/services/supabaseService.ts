import { supabase } from '../lib/supabase';
import type { AppSettings, IntakeEntry, HouseholdUser, Household, HouseholdInvitation } from '../types';

// ============================================================
// AUTHENTICATION & SETUP
// ============================================================

/**
 * Get the current authenticated user's household_user record
 * Returns null if user hasn't joined/created a household yet
 */
export async function getCurrentHouseholdUser(): Promise<HouseholdUser | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('household_users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No row found
    throw error;
  }

  return {
    id: data.id,
    householdId: data.household_id,
    authUserId: data.auth_user_id,
    displayName: data.display_name,
    color: data.color,
    bottleSizeOz: Number(data.bottle_size_oz),
    isOwner: data.is_owner,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

/**
 * Check if current user needs onboarding
 * (no household_user record exists)
 */
export async function needsOnboarding(): Promise<boolean> {
  const householdUser = await getCurrentHouseholdUser();
  return householdUser === null;
}

// ============================================================
// HOUSEHOLD CREATION & MANAGEMENT
// ============================================================

/**
 * Create a new household (for first-time user)
 * Returns the created household and household_user
 */
export async function createHousehold(
  householdName: string,
  userName: string,
  userColor: string,
  userBottleSize: number
): Promise<{ household: Household; user: HouseholdUser }> {
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error('Not authenticated');
  }

  // Generate invite code
  const { data: inviteCodeData } = await supabase.rpc('generate_invite_code');
  const inviteCode = inviteCodeData || generateClientSideInviteCode();

  // Create household
  const { data: household, error: householdError } = await supabase
    .from('households')
    .insert({
      name: householdName,
      invite_code: inviteCode
    })
    .select()
    .single();

  if (householdError) throw householdError;

  // Create household user (owner)
  const { data: householdUser, error: userError } = await supabase
    .from('household_users')
    .insert({
      household_id: household.id,
      auth_user_id: authUser.id,
      display_name: userName,
      color: userColor,
      bottle_size_oz: userBottleSize,
      is_owner: true
    })
    .select()
    .single();

  if (userError) throw userError;

  // Create default settings
  await supabase.from('settings').insert({
    household_id: household.id,
    unit: 'oz',
    daily_goal_volume: 128,
    celebration_enabled: true,
    sound_enabled: true
  });

  return {
    household: {
      id: household.id,
      name: household.name,
      inviteCode: household.invite_code,
      createdAt: household.created_at,
      updatedAt: household.updated_at
    },
    user: {
      id: householdUser.id,
      householdId: householdUser.household_id,
      authUserId: householdUser.auth_user_id,
      displayName: householdUser.display_name,
      color: householdUser.color,
      bottleSizeOz: Number(householdUser.bottle_size_oz),
      isOwner: householdUser.is_owner,
      createdAt: householdUser.created_at,
      updatedAt: householdUser.updated_at
    }
  };
}

/**
 * Get household by ID
 */
export async function getHousehold(householdId: string): Promise<Household> {
  const { data, error } = await supabase
    .from('households')
    .select('*')
    .eq('id', householdId)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    inviteCode: data.invite_code,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

/**
 * Update household name
 */
export async function updateHousehold(householdId: string, name: string) {
  const { error } = await supabase
    .from('households')
    .update({ name })
    .eq('id', householdId);

  if (error) throw error;
}

// ============================================================
// INVITATION SYSTEM
// ============================================================

/**
 * Create an invitation to join household
 */
export async function createInvitation(
  householdId: string,
  invitedByUserId: string,
  email?: string
): Promise<HouseholdInvitation> {
  const inviteCode = generateClientSideInviteCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

  const { data, error } = await supabase
    .from('household_invitations')
    .insert({
      household_id: householdId,
      invited_by_user_id: invitedByUserId,
      email: email || null,
      invite_code: inviteCode,
      status: 'pending',
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    householdId: data.household_id,
    invitedByUserId: data.invited_by_user_id,
    email: data.email,
    inviteCode: data.invite_code,
    status: data.status,
    expiresAt: data.expires_at,
    createdAt: data.created_at,
    acceptedAt: data.accepted_at,
    acceptedByUserId: data.accepted_by_user_id
  };
}

/**
 * Get invitation by code
 * Checks both household_invitations table and households.invite_code
 */
export async function getInvitationByCode(inviteCode: string): Promise<HouseholdInvitation | null> {
  // First, try to find in household_invitations table (temporary invites)
  const { data, error } = await supabase
    .from('household_invitations')
    .select('*')
    .eq('invite_code', inviteCode)
    .eq('status', 'pending')
    .single();

  if (!error && data) {
    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      return null;
    }

    return {
      id: data.id,
      householdId: data.household_id,
      invitedByUserId: data.invited_by_user_id,
      email: data.email,
      inviteCode: data.invite_code,
      status: data.status,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
      acceptedAt: data.accepted_at,
      acceptedByUserId: data.accepted_by_user_id
    };
  }

  // If not found in household_invitations, check households.invite_code (permanent invite)
  const { data: household, error: householdError } = await supabase
    .from('households')
    .select('id, invite_code')
    .eq('invite_code', inviteCode)
    .single();

  if (householdError || !household) {
    return null;
  }

  // Return a mock invitation object for permanent household invite codes
  // Permanent invites never expire, so set far future date
  const farFuture = new Date('2099-12-31').toISOString();

  return {
    id: '',
    householdId: household.id,
    invitedByUserId: '',
    email: null,
    inviteCode: household.invite_code!,
    status: 'pending',
    expiresAt: farFuture,
    createdAt: new Date().toISOString(),
    acceptedAt: null,
    acceptedByUserId: null
  };
}

/**
 * Accept invitation and join household
 */
export async function acceptInvitation(
  inviteCode: string,
  userName: string,
  userColor: string,
  userBottleSize: number
): Promise<HouseholdUser> {
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error('Not authenticated');
  }

  // Get invitation
  const invitation = await getInvitationByCode(inviteCode);
  if (!invitation) {
    throw new Error('Invalid or expired invitation code');
  }

  // Create household user
  const { data: householdUser, error: userError } = await supabase
    .from('household_users')
    .insert({
      household_id: invitation.householdId,
      auth_user_id: authUser.id,
      display_name: userName,
      color: userColor,
      bottle_size_oz: userBottleSize,
      is_owner: false
    })
    .select()
    .single();

  if (userError) throw userError;

  // Mark invitation as accepted
  await supabase
    .from('household_invitations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      accepted_by_user_id: householdUser.id
    })
    .eq('id', invitation.id);

  return {
    id: householdUser.id,
    householdId: householdUser.household_id,
    authUserId: householdUser.auth_user_id,
    displayName: householdUser.display_name,
    color: householdUser.color,
    bottleSizeOz: Number(householdUser.bottle_size_oz),
    isOwner: householdUser.is_owner,
    createdAt: householdUser.created_at,
    updatedAt: householdUser.updated_at
  };
}

// ============================================================
// HOUSEHOLD USERS
// ============================================================

/**
 * Get all users in a household
 */
export async function getHouseholdUsers(householdId: string): Promise<HouseholdUser[]> {
  const { data, error } = await supabase
    .from('household_users')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data || []).map(user => ({
    id: user.id,
    householdId: user.household_id,
    authUserId: user.auth_user_id,
    displayName: user.display_name,
    color: user.color,
    bottleSizeOz: Number(user.bottle_size_oz),
    isOwner: user.is_owner,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  }));
}

/**
 * Update household user (only for current user or owner)
 */
export async function updateHouseholdUser(
  userId: string,
  updates: { displayName?: string; color?: string; bottleSizeOz?: number }
) {
  const dbUpdates: any = {};
  if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
  if (updates.color !== undefined) dbUpdates.color = updates.color;
  if (updates.bottleSizeOz !== undefined) dbUpdates.bottle_size_oz = updates.bottleSizeOz;

  const { error } = await supabase
    .from('household_users')
    .update(dbUpdates)
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Delete household user (owner only, can't delete self)
 */
export async function deleteHouseholdUser(userId: string) {
  const { error } = await supabase
    .from('household_users')
    .delete()
    .eq('id', userId);

  if (error) throw error;
}

// ============================================================
// SETTINGS
// ============================================================

/**
 * Get settings for household
 */
export async function getSettings(householdId: string): Promise<AppSettings> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('household_id', householdId)
    .single();

  if (error) throw error;

  return {
    unit: data.unit,
    dailyGoalVolume: Number(data.daily_goal_volume),
    celebrationEnabled: data.celebration_enabled,
    soundEnabled: data.sound_enabled
  };
}

/**
 * Update settings
 */
export async function updateSettings(householdId: string, settings: Partial<AppSettings>) {
  const dbUpdates: any = {};
  if (settings.unit !== undefined) dbUpdates.unit = settings.unit;
  if (settings.dailyGoalVolume !== undefined) dbUpdates.daily_goal_volume = settings.dailyGoalVolume;
  if (settings.celebrationEnabled !== undefined) dbUpdates.celebration_enabled = settings.celebrationEnabled;
  if (settings.soundEnabled !== undefined) dbUpdates.sound_enabled = settings.soundEnabled;

  const { error } = await supabase
    .from('settings')
    .update(dbUpdates)
    .eq('household_id', householdId);

  if (error) throw error;
}

// ============================================================
// INTAKE ENTRIES
// ============================================================

/**
 * Get all intake entries for household
 */
export async function getIntakeEntries(householdId: string): Promise<IntakeEntry[]> {
  const { data, error } = await supabase
    .from('intake_entries')
    .select('*')
    .eq('household_id', householdId)
    .order('timestamp', { ascending: false });

  if (error) throw error;

  return (data || []).map(entry => ({
    id: entry.id,
    householdUserId: entry.household_user_id,
    volumeOz: Number(entry.volume_oz),
    timestamp: entry.timestamp
  }));
}

/**
 * Add intake entry
 */
export async function addIntakeEntry(
  householdId: string,
  householdUserId: string,
  volumeOz: number,
  timestamp?: Date
): Promise<IntakeEntry> {
  const { data, error } = await supabase
    .from('intake_entries')
    .insert({
      household_id: householdId,
      household_user_id: householdUserId,
      volume_oz: volumeOz,
      timestamp: timestamp ? timestamp.toISOString() : new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    householdUserId: data.household_user_id,
    volumeOz: Number(data.volume_oz),
    timestamp: data.timestamp
  };
}

/**
 * Delete intake entry
 */
export async function deleteIntakeEntry(entryId: string) {
  const { error } = await supabase
    .from('intake_entries')
    .delete()
    .eq('id', entryId);

  if (error) throw error;
}

// ============================================================
// CELEBRATED DATES
// ============================================================

/**
 * Get celebrated dates for household
 */
export async function getCelebratedDates(householdId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('celebrated_dates')
    .select('date')
    .eq('household_id', householdId);

  if (error) throw error;

  return (data || []).map(d => d.date);
}

/**
 * Add celebrated date
 */
export async function addCelebratedDate(householdId: string, date: string) {
  const { error } = await supabase
    .from('celebrated_dates')
    .insert({
      household_id: householdId,
      date
    });

  if (error && error.code !== '23505') { // Ignore unique constraint violation
    throw error;
  }
}

// ============================================================
// RESET DATA
// ============================================================

/**
 * Reset all household data
 */
export async function resetData(householdId: string) {
  // Delete all intake entries
  await supabase
    .from('intake_entries')
    .delete()
    .eq('household_id', householdId);

  // Delete all celebrated dates
  await supabase
    .from('celebrated_dates')
    .delete()
    .eq('household_id', householdId);
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Generate a 6-character invite code (client-side fallback)
 */
function generateClientSideInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
