import { AppSettings, IntakeEntry, UserId, DayStats, KPIData } from '../types';

export function getBottleSize(settings: AppSettings, user: UserId): number {
  const bottlesPerGoal = user === 'rachel' ? settings.rachelBottlesPerGoal : settings.andyBottlesPerGoal;
  return settings.dailyGoalVolume / bottlesPerGoal;
}

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isToday(dateString: string): boolean {
  return dateString === getLocalDateString();
}

export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function filterEntriesByDate(entries: IntakeEntry[], dateString: string): IntakeEntry[] {
  return entries.filter(entry => {
    const entryDate = getLocalDateString(new Date(entry.timestamp));
    return entryDate === dateString;
  });
}

export function getTodayEntries(entries: IntakeEntry[]): IntakeEntry[] {
  return filterEntriesByDate(entries, getLocalDateString());
}

export function getTodayTotal(entries: IntakeEntry[]): number {
  const todayEntries = getTodayEntries(entries);
  return todayEntries.reduce((sum, entry) => sum + entry.volumeOz, 0);
}

export function getTodayByUser(entries: IntakeEntry[], user: UserId): number {
  const todayEntries = getTodayEntries(entries);
  return todayEntries.filter(e => e.user === user)
    .reduce((sum, entry) => sum + entry.volumeOz, 0);
}

export function getProgressPercent(totalOz: number, goalOz: number): number {
  return Math.min(100, Math.max(0, (totalOz / goalOz) * 100));
}

export function getDayStats(entries: IntakeEntry[], dateString: string, goalOz: number): DayStats {
  const dayEntries = filterEntriesByDate(entries, dateString);

  const rachelVolume = dayEntries
    .filter(e => e.user === 'rachel')
    .reduce((sum, e) => sum + e.volumeOz, 0);

  const andyVolume = dayEntries
    .filter(e => e.user === 'andy')
    .reduce((sum, e) => sum + e.volumeOz, 0);

  const totalVolume = rachelVolume + andyVolume;

  return {
    date: dateString,
    rachelVolume,
    andyVolume,
    totalVolume,
    goalMet: totalVolume >= goalOz
  };
}

export function getDateRange(rangeType: 'week' | 'month' | 'year'): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  if (rangeType === 'week') {
    start.setDate(end.getDate() - 6);
  } else if (rangeType === 'month') {
    start.setDate(end.getDate() - 29);
  } else {
    start.setDate(end.getDate() - 364);
  }

  return { start: getStartOfDay(start), end: getStartOfDay(end) };
}

export function getStatsForRange(
  entries: IntakeEntry[],
  rangeType: 'week' | 'month' | 'year',
  goalOz: number
): DayStats[] {
  const { start, end } = getDateRange(rangeType);
  const stats: DayStats[] = [];

  const current = new Date(start);
  while (current <= end) {
    const dateString = getLocalDateString(current);
    stats.push(getDayStats(entries, dateString, goalOz));
    current.setDate(current.getDate() + 1);
  }

  return stats;
}

export function calculateKPIs(stats: DayStats[]): KPIData {
  const totalDays = stats.length;
  const daysGoalMet = stats.filter(s => s.goalMet).length;
  const daysGoalMetPercent = totalDays > 0 ? (daysGoalMet / totalDays) * 100 : 0;

  const totalVolume = stats.reduce((sum, s) => sum + s.totalVolume, 0);
  const avgDailyIntake = totalDays > 0 ? totalVolume / totalDays : 0;

  const totalRachel = stats.reduce((sum, s) => sum + s.rachelVolume, 0);
  const totalAndy = stats.reduce((sum, s) => sum + s.andyVolume, 0);

  const avgDailyRachel = totalDays > 0 ? totalRachel / totalDays : 0;
  const avgDailyAndy = totalDays > 0 ? totalAndy / totalDays : 0;

  const rachelPercent = totalVolume > 0 ? (totalRachel / totalVolume) * 100 : 50;
  const andyPercent = totalVolume > 0 ? (totalAndy / totalVolume) * 100 : 50;

  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = stats.length - 1; i >= 0; i--) {
    if (stats[i].goalMet) {
      tempStreak++;
      if (i === stats.length - 1 || currentStreak > 0) {
        currentStreak = tempStreak;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      if (i === stats.length - 1) {
        currentStreak = 0;
      }
      tempStreak = 0;
    }
  }

  // Find peak day
  const peakStat = stats.reduce((max, s) =>
    s.totalVolume > (max?.totalVolume || 0) ? s : max,
    stats[0]
  );

  const peakDay = peakStat && peakStat.totalVolume > 0 ? {
    date: peakStat.date,
    volume: peakStat.totalVolume
  } : null;

  return {
    daysGoalMet,
    daysGoalMetPercent,
    totalDays,
    avgDailyIntake,
    avgDailyRachel,
    avgDailyAndy,
    currentStreak,
    longestStreak,
    rachelPercent,
    andyPercent,
    peakDay
  };
}
