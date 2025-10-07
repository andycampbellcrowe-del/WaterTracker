import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, AppSettings } from '../types';
import { getLocalDateString } from '../utils/calculations';
import { useAuth } from './AuthContext';
import * as supabaseService from '../services/supabaseService';

const defaultSettings: AppSettings = {
  unit: 'oz',
  dailyGoalVolume: 128,
  celebrationEnabled: true,
  soundEnabled: true
};

const defaultState: AppState = {
  household: null,
  currentUser: null,
  settings: defaultSettings,
  users: [],
  entries: [],
  celebratedDates: []
};

interface AppContextType {
  state: AppState;
  loading: boolean;
  needsOnboarding: boolean;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  addIntake: (householdUserId: string, volumeOz: number) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateUser: (userId: string, updates: { displayName?: string; color?: string; bottleSizeOz?: number }) => Promise<void>;
  deleteUserFromHousehold: (userId: string) => Promise<void>;
  exportData: () => string;
  resetData: () => Promise<void>;
  markDateCelebrated: (date: string) => Promise<void>;
  hasBeenCelebratedToday: () => boolean;
  refreshData: () => Promise<void>;
  getInviteCode: () => string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<AppState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Load data from Supabase when user logs in
  useEffect(() => {
    if (user) {
      loadDataFromSupabase();
    } else {
      setLoading(false);
      setState(defaultState);
      setNeedsOnboarding(false);
    }
  }, [user]);

  const loadDataFromSupabase = async () => {
    try {
      setLoading(true);

      // Get current user's household_user record
      const currentHouseholdUser = await supabaseService.getCurrentHouseholdUser();

      if (!currentHouseholdUser) {
        // User needs onboarding (create or join household)
        console.log('No household user found - needs onboarding');
        setNeedsOnboarding(true);
        setState(defaultState);
        setLoading(false);
        return;
      }

      // User is already in a household - load all data
      console.log('Household user found:', currentHouseholdUser);
      setNeedsOnboarding(false);

      const [household, settings, users, entries, celebratedDates] = await Promise.all([
        supabaseService.getHousehold(currentHouseholdUser.householdId),
        supabaseService.getSettings(currentHouseholdUser.householdId),
        supabaseService.getHouseholdUsers(currentHouseholdUser.householdId),
        supabaseService.getIntakeEntries(currentHouseholdUser.householdId),
        supabaseService.getCelebratedDates(currentHouseholdUser.householdId)
      ]);

      setState({
        household,
        currentUser: currentHouseholdUser,
        settings,
        users,
        entries,
        celebratedDates
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      // If we fail to load data, assume needs onboarding
      setNeedsOnboarding(true);
      setState(defaultState);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadDataFromSupabase();
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    if (!state.household) return;

    try {
      await supabaseService.updateSettings(state.household.id, newSettings);
      setState(prev => ({
        ...prev,
        settings: { ...prev.settings, ...newSettings }
      }));
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  };

  const addIntake = async (householdUserId: string, volumeOz: number) => {
    if (!state.household) return;

    try {
      const newEntry = await supabaseService.addIntakeEntry(
        state.household.id,
        householdUserId,
        volumeOz
      );

      setState(prev => ({
        ...prev,
        entries: [newEntry, ...prev.entries]
      }));
    } catch (error) {
      console.error('Failed to add intake:', error);
      throw error;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await supabaseService.deleteIntakeEntry(id);
      setState(prev => ({
        ...prev,
        entries: prev.entries.filter(e => e.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete entry:', error);
      throw error;
    }
  };

  const updateUser = async (
    userId: string,
    updates: { displayName?: string; color?: string; bottleSizeOz?: number }
  ) => {
    try {
      await supabaseService.updateHouseholdUser(userId, updates);

      setState(prev => ({
        ...prev,
        users: prev.users.map(u =>
          u.id === userId ? { ...u, ...updates } : u
        ),
        // Update currentUser if it's them
        currentUser: prev.currentUser?.id === userId
          ? { ...prev.currentUser, ...updates }
          : prev.currentUser
      }));
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const deleteUserFromHousehold = async (userId: string) => {
    if (!state.currentUser?.isOwner) {
      throw new Error('Only the household owner can delete users');
    }

    if (userId === state.currentUser.id) {
      throw new Error('Cannot delete yourself');
    }

    if (state.users.length <= 1) {
      throw new Error('Cannot delete the last user');
    }

    try {
      await supabaseService.deleteHouseholdUser(userId);
      setState(prev => ({
        ...prev,
        users: prev.users.filter(u => u.id !== userId)
      }));
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  };

  const resetData = async () => {
    if (!state.household) return;

    try {
      await supabaseService.resetData(state.household.id);
      setState(prev => ({
        ...prev,
        entries: [],
        celebratedDates: []
      }));
    } catch (error) {
      console.error('Failed to reset data:', error);
      throw error;
    }
  };

  const markDateCelebrated = async (date: string) => {
    if (!state.household) return;

    try {
      await supabaseService.addCelebratedDate(state.household.id, date);
      setState(prev => ({
        ...prev,
        celebratedDates: [...prev.celebratedDates, date]
      }));
    } catch (error) {
      console.error('Failed to mark date celebrated:', error);
      throw error;
    }
  };

  const hasBeenCelebratedToday = (): boolean => {
    const today = getLocalDateString();
    return state.celebratedDates.includes(today);
  };

  const exportData = (): string => {
    return JSON.stringify(state, null, 2);
  };

  const getInviteCode = (): string | null => {
    return state.household?.inviteCode || null;
  };

  const value: AppContextType = {
    state,
    loading,
    needsOnboarding,
    updateSettings,
    addIntake,
    deleteEntry,
    updateUser,
    deleteUserFromHousehold,
    exportData,
    resetData,
    markDateCelebrated,
    hasBeenCelebratedToday,
    refreshData,
    getInviteCode
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
