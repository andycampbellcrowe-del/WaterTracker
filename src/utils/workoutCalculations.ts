import { WorkoutEntry, HouseholdUser } from '../types';

export interface WorkoutUserStat {
  user: HouseholdUser;
  cardioHours: number;
  strengthHours: number;
  cardioPercent: number;
  strengthPercent: number;
  totalHours: number;
}

export interface WorkoutKPIData {
  totalCardioHours: number;
  totalStrengthHours: number;
  totalHours: number;
  combinedPercent: number;
  workoutDays: number;
  totalDays: number;
  consistencyPercent: number;
  cardioPercent: number;
  strengthPercent: number;
  currentStreak: number;
  longestStreak: number;
  mostActiveDay: {
    dayName: string;
    avgHours: number;
  } | null;
  userContributions: Array<{
    user: HouseholdUser;
    totalHours: number;
    percent: number;
  }>;
}

/**
 * Get the start of the current week (Sunday)
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of the current week (Saturday)
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}

/**
 * Filter workout entries for the current week
 */
export function getThisWeekWorkouts(entries: WorkoutEntry[]): WorkoutEntry[] {
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();

  return entries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= weekStart && entryDate <= weekEnd;
  });
}

/**
 * Filter workout entries for a specific week
 */
export function getWorkoutsForWeek(entries: WorkoutEntry[], weekStartDate: Date): WorkoutEntry[] {
  const weekStart = new Date(weekStartDate);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return entries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= weekStart && entryDate <= weekEnd;
  });
}

/**
 * Calculate workout stats for each user this week
 */
export function getWeeklyWorkoutStats(
  entries: WorkoutEntry[],
  users: HouseholdUser[]
): WorkoutUserStat[] {
  const thisWeekEntries = getThisWeekWorkouts(entries);

  return users.map(user => {
    const userEntries = thisWeekEntries.filter(e => e.householdUserId === user.id);

    const cardioHours = userEntries
      .filter(e => e.workoutType === 'cardio')
      .reduce((sum, e) => sum + e.durationHours, 0);

    const strengthHours = userEntries
      .filter(e => e.workoutType === 'strength')
      .reduce((sum, e) => sum + e.durationHours, 0);

    const cardioPercent = user.weeklyCardioGoalHours > 0
      ? (cardioHours / user.weeklyCardioGoalHours) * 100
      : 0;

    const strengthPercent = user.weeklyStrengthGoalHours > 0
      ? (strengthHours / user.weeklyStrengthGoalHours) * 100
      : 0;

    return {
      user,
      cardioHours,
      strengthHours,
      cardioPercent,
      strengthPercent,
      totalHours: cardioHours + strengthHours
    };
  });
}

/**
 * Calculate combined household workout progress
 */
export function getCombinedWorkoutPercent(
  entries: WorkoutEntry[],
  users: HouseholdUser[]
): number {
  const thisWeekEntries = getThisWeekWorkouts(entries);

  const totalCardioHours = thisWeekEntries
    .filter(e => e.workoutType === 'cardio')
    .reduce((sum, e) => sum + e.durationHours, 0);

  const totalStrengthHours = thisWeekEntries
    .filter(e => e.workoutType === 'strength')
    .reduce((sum, e) => sum + e.durationHours, 0);

  const totalGoalHours = users.reduce(
    (sum, user) => sum + user.weeklyCardioGoalHours + user.weeklyStrengthGoalHours,
    0
  );

  if (totalGoalHours === 0) return 0;

  return ((totalCardioHours + totalStrengthHours) / totalGoalHours) * 100;
}

/**
 * Get number of unique days with workouts this week
 */
export function getWorkoutDaysThisWeek(entries: WorkoutEntry[]): number {
  const thisWeekEntries = getThisWeekWorkouts(entries);

  const uniqueDates = new Set<string>();
  thisWeekEntries.forEach(entry => {
    const date = new Date(entry.timestamp);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    uniqueDates.add(dateStr);
  });

  return uniqueDates.size;
}

/**
 * Calculate cardio vs strength balance (percentage of total hours)
 */
export function getWorkoutBalance(entries: WorkoutEntry[]): {
  cardioPercent: number;
  strengthPercent: number;
} {
  const thisWeekEntries = getThisWeekWorkouts(entries);

  const cardioHours = thisWeekEntries
    .filter(e => e.workoutType === 'cardio')
    .reduce((sum, e) => sum + e.durationHours, 0);

  const strengthHours = thisWeekEntries
    .filter(e => e.workoutType === 'strength')
    .reduce((sum, e) => sum + e.durationHours, 0);

  const totalHours = cardioHours + strengthHours;

  if (totalHours === 0) {
    return { cardioPercent: 50, strengthPercent: 50 };
  }

  return {
    cardioPercent: (cardioHours / totalHours) * 100,
    strengthPercent: (strengthHours / totalHours) * 100
  };
}

/**
 * Calculate workout streaks (consecutive weeks meeting combined household goal)
 */
export function calculateWorkoutStreaks(
  entries: WorkoutEntry[],
  users: HouseholdUser[]
): { currentStreak: number; longestStreak: number } {
  const totalGoalHours = users.reduce(
    (sum, user) => sum + user.weeklyCardioGoalHours + user.weeklyStrengthGoalHours,
    0
  );

  if (totalGoalHours === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Get last 52 weeks of data
  const weeks: Date[] = [];
  const now = new Date();
  for (let i = 0; i < 52; i++) {
    const weekStart = getWeekStart(now);
    weekStart.setDate(weekStart.getDate() - (i * 7));
    weeks.unshift(weekStart);
  }

  const weeklyGoalsMet = weeks.map(weekStart => {
    const weekEntries = getWorkoutsForWeek(entries, weekStart);
    const totalHours = weekEntries.reduce((sum, e) => sum + e.durationHours, 0);
    return totalHours >= totalGoalHours;
  });

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Calculate from most recent week backwards
  for (let i = weeklyGoalsMet.length - 1; i >= 0; i--) {
    if (weeklyGoalsMet[i]) {
      tempStreak++;
      if (i === weeklyGoalsMet.length - 1) {
        currentStreak = tempStreak;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      if (i === weeklyGoalsMet.length - 1) {
        currentStreak = 0;
      }
      tempStreak = 0;
    }
  }

  return { currentStreak, longestStreak };
}

/**
 * Find the most active day of the week
 */
export function getMostActiveDay(entries: WorkoutEntry[]): {
  dayName: string;
  avgHours: number;
} | null {
  if (entries.length === 0) return null;

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayTotals: { [key: number]: number } = {};
  const dayCounts: { [key: number]: number } = {};

  entries.forEach(entry => {
    const date = new Date(entry.timestamp);
    const dayOfWeek = date.getDay();

    dayTotals[dayOfWeek] = (dayTotals[dayOfWeek] || 0) + entry.durationHours;
    dayCounts[dayOfWeek] = (dayCounts[dayOfWeek] || 0) + 1;
  });

  let maxAvg = 0;
  let maxDay = 0;

  Object.keys(dayTotals).forEach(dayStr => {
    const day = parseInt(dayStr);
    const avg = dayTotals[day] / dayCounts[day];
    if (avg > maxAvg) {
      maxAvg = avg;
      maxDay = day;
    }
  });

  if (maxAvg === 0) return null;

  return {
    dayName: dayNames[maxDay],
    avgHours: maxAvg
  };
}

/**
 * Calculate comprehensive workout KPIs for the current week
 */
export function calculateWorkoutKPIs(
  entries: WorkoutEntry[],
  users: HouseholdUser[]
): WorkoutKPIData {
  const thisWeekEntries = getThisWeekWorkouts(entries);

  const totalCardioHours = thisWeekEntries
    .filter(e => e.workoutType === 'cardio')
    .reduce((sum, e) => sum + e.durationHours, 0);

  const totalStrengthHours = thisWeekEntries
    .filter(e => e.workoutType === 'strength')
    .reduce((sum, e) => sum + e.durationHours, 0);

  const totalHours = totalCardioHours + totalStrengthHours;

  const totalGoalHours = users.reduce(
    (sum, user) => sum + user.weeklyCardioGoalHours + user.weeklyStrengthGoalHours,
    0
  );

  const combinedPercent = totalGoalHours > 0 ? (totalHours / totalGoalHours) * 100 : 0;

  const workoutDays = getWorkoutDaysThisWeek(entries);
  const totalDays = 7;
  const consistencyPercent = (workoutDays / totalDays) * 100;

  const balance = getWorkoutBalance(entries);
  const streaks = calculateWorkoutStreaks(entries, users);
  const mostActiveDay = getMostActiveDay(entries);

  // Calculate user contributions
  const userContributions = users.map(user => {
    const userHours = thisWeekEntries
      .filter(e => e.householdUserId === user.id)
      .reduce((sum, e) => sum + e.durationHours, 0);

    const percent = totalHours > 0 ? (userHours / totalHours) * 100 : 100 / users.length;

    return {
      user,
      totalHours: userHours,
      percent
    };
  });

  return {
    totalCardioHours,
    totalStrengthHours,
    totalHours,
    combinedPercent,
    workoutDays,
    totalDays,
    consistencyPercent,
    cardioPercent: balance.cardioPercent,
    strengthPercent: balance.strengthPercent,
    currentStreak: streaks.currentStreak,
    longestStreak: streaks.longestStreak,
    mostActiveDay,
    userContributions
  };
}
