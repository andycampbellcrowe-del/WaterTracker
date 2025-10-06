import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, AppSettings, IntakeEntry, UserId } from '../types';
import { generateDemoData } from '../utils/demoData';
import { litersToOz, ozToLiters } from '../utils/conversions';
import { getLocalDateString } from '../utils/calculations';

const STORAGE_KEY = 'water-tracker-state';

const defaultSettings: AppSettings = {
  unit: 'oz',
  dailyGoalVolume: 128, // 128 oz = 1 gallon
  rachelBottlesPerGoal: 8,
  andyBottlesPerGoal: 8,
  celebrationEnabled: true,
  soundEnabled: true
};

const defaultState: AppState = {
  settings: defaultSettings,
  entries: [],
  celebratedDates: []
};

interface AppContextType {
  state: AppState;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addIntake: (user: UserId, bottleCount: number) => void;
  deleteEntry: (id: string) => void;
  updateEntry: (id: string, volumeOz: number) => void;
  exportData: () => string;
  importData: (jsonString: string) => boolean;
  resetData: () => void;
  markDateCelebrated: (date: string) => void;
  hasBeenCelebratedToday: () => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Migration: handle old bottlesPerGoal format
        if (parsed.settings && 'bottlesPerGoal' in parsed.settings) {
          const oldBottlesPerGoal = parsed.settings.bottlesPerGoal;
          parsed.settings.rachelBottlesPerGoal = oldBottlesPerGoal;
          parsed.settings.andyBottlesPerGoal = oldBottlesPerGoal;
          delete parsed.settings.bottlesPerGoal;
        }
        return parsed;
      } catch {
        return { ...defaultState, entries: generateDemoData() };
      }
    }
    return { ...defaultState, entries: generateDemoData() };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setState(prev => {
      let settings = { ...prev.settings, ...newSettings };

      // Handle unit conversion
      if (newSettings.unit && newSettings.unit !== prev.settings.unit) {
        if (newSettings.unit === 'l') {
          settings.dailyGoalVolume = ozToLiters(prev.settings.dailyGoalVolume);
        } else {
          settings.dailyGoalVolume = litersToOz(prev.settings.dailyGoalVolume);
        }
      }

      return { ...prev, settings };
    });
  };

  const addIntake = (user: UserId, bottleCount: number) => {
    setState(prev => {
      const bottlesPerGoal = user === 'rachel' ? prev.settings.rachelBottlesPerGoal : prev.settings.andyBottlesPerGoal;
      const bottleSize = prev.settings.dailyGoalVolume / bottlesPerGoal;
      const volumeInCurrentUnit = bottleSize * bottleCount;

      // Convert to oz if needed
      const volumeOz = prev.settings.unit === 'l'
        ? litersToOz(volumeInCurrentUnit)
        : volumeInCurrentUnit;

      const newEntry: IntakeEntry = {
        id: `${Date.now()}-${Math.random()}`,
        user,
        volumeOz,
        timestamp: new Date().toISOString()
      };

      return {
        ...prev,
        entries: [...prev.entries, newEntry]
      };
    });
  };

  const deleteEntry = (id: string) => {
    setState(prev => ({
      ...prev,
      entries: prev.entries.filter(e => e.id !== id)
    }));
  };

  const updateEntry = (id: string, volumeOz: number) => {
    setState(prev => ({
      ...prev,
      entries: prev.entries.map(e =>
        e.id === id ? { ...e, volumeOz } : e
      )
    }));
  };

  const exportData = (): string => {
    return JSON.stringify(state, null, 2);
  };

  const importData = (jsonString: string): boolean => {
    try {
      const imported = JSON.parse(jsonString);
      if (imported.settings && imported.entries && Array.isArray(imported.entries)) {
        setState(imported);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const resetData = () => {
    setState({ ...defaultState, entries: [] });
  };

  const markDateCelebrated = (date: string) => {
    setState(prev => {
      if (!prev.celebratedDates.includes(date)) {
        return {
          ...prev,
          celebratedDates: [...prev.celebratedDates, date]
        };
      }
      return prev;
    });
  };

  const hasBeenCelebratedToday = (): boolean => {
    const today = getLocalDateString();
    return state.celebratedDates.includes(today);
  };

  return (
    <AppContext.Provider
      value={{
        state,
        updateSettings,
        addIntake,
        deleteEntry,
        updateEntry,
        exportData,
        importData,
        resetData,
        markDateCelebrated,
        hasBeenCelebratedToday
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
