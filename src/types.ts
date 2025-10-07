export type Unit = "oz" | "l";

export type Household = {
  id: string;
  name: string;
  inviteCode: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HouseholdUser = {
  id: string;
  householdId: string;
  authUserId: string;
  displayName: string;
  color: string; // hex color
  bottleSizeOz: number;
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HouseholdInvitation = {
  id: string;
  householdId: string;
  invitedByUserId: string;
  email: string | null;
  inviteCode: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
  createdAt: string;
  acceptedAt: string | null;
  acceptedByUserId: string | null;
};

export type AppSettings = {
  unit: Unit;
  dailyGoalVolume: number; // in current unit
  celebrationEnabled: boolean;
  soundEnabled: boolean;
};

export type IntakeEntry = {
  id: string;
  householdUserId: string;
  volumeOz: number; // always stored in oz
  timestamp: string; // ISO
};

export type AppState = {
  household: Household | null;
  currentUser: HouseholdUser | null; // The logged-in user's household_user record
  settings: AppSettings;
  users: HouseholdUser[]; // All users in the household
  entries: IntakeEntry[];
  celebratedDates: string[]; // ISO dates where goal was met and celebrated
};

export type DateRange = "week" | "month" | "year";

export type UserFilter = "all" | "combined" | string; // string allows dynamic user IDs

export type DayStats = {
  date: string; // ISO date (YYYY-MM-DD)
  userVolumes: { [userId: string]: number };
  totalVolume: number;
  goalMet: boolean;
};

export type KPIData = {
  daysGoalMet: number;
  daysGoalMetPercent: number;
  totalDays: number;
  avgDailyIntake: number;
  userAverages: { [userId: string]: number };
  currentStreak: number;
  longestStreak: number;
  userPercentages: { [userId: string]: number };
  peakDay: {
    date: string;
    volume: number;
  } | null;
};
