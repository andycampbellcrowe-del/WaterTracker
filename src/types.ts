export type Unit = "oz" | "l";

export type UserId = "rachel" | "andy";

export type AppSettings = {
  unit: Unit;
  dailyGoalVolume: number; // in current unit
  rachelBottlesPerGoal: number;
  andyBottlesPerGoal: number;
  celebrationEnabled: boolean;
  soundEnabled: boolean;
};

export type IntakeEntry = {
  id: string;
  user: UserId;
  volumeOz: number; // always stored in oz
  timestamp: string; // ISO
};

export type AppState = {
  settings: AppSettings;
  entries: IntakeEntry[];
  celebratedDates: string[]; // ISO dates where goal was met and celebrated
};

export type DateRange = "week" | "month" | "year";

export type UserFilter = "all" | "rachel" | "andy" | "combined";

export type DayStats = {
  date: string; // ISO date (YYYY-MM-DD)
  rachelVolume: number;
  andyVolume: number;
  totalVolume: number;
  goalMet: boolean;
};

export type KPIData = {
  daysGoalMet: number;
  daysGoalMetPercent: number;
  totalDays: number;
  avgDailyIntake: number;
  avgDailyRachel: number;
  avgDailyAndy: number;
  currentStreak: number;
  longestStreak: number;
  rachelPercent: number;
  andyPercent: number;
  peakDay: {
    date: string;
    volume: number;
  } | null;
};
