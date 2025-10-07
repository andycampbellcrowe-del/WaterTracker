import { IntakeEntry } from '../types';

export function generateDemoData(): IntakeEntry[] {
  const entries: IntakeEntry[] = [];
  const now = new Date();

  // Generate 30 days of data
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);

    // Each user drinks 3-8 times per day
    const rachelDrinks = Math.floor(Math.random() * 6) + 3;
    const andyDrinks = Math.floor(Math.random() * 6) + 3;

    // Generate Rachel's entries
    for (let i = 0; i < rachelDrinks; i++) {
      const hour = 7 + Math.floor(Math.random() * 14); // Between 7am and 9pm
      const minute = Math.floor(Math.random() * 60);
      const timestamp = new Date(date);
      timestamp.setHours(hour, minute, 0, 0);

      // Random volume: mostly full bottles (16oz) or half bottles (8oz)
      const volumeOz = Math.random() > 0.3 ? 16 : 8;

      entries.push({
        id: `demo-rachel-${dayOffset}-${i}`,
        householdUserId: 'rachel',
        volumeOz,
        timestamp: timestamp.toISOString()
      });
    }

    // Generate Andy's entries
    for (let i = 0; i < andyDrinks; i++) {
      const hour = 7 + Math.floor(Math.random() * 14);
      const minute = Math.floor(Math.random() * 60);
      const timestamp = new Date(date);
      timestamp.setHours(hour, minute, 0, 0);

      const volumeOz = Math.random() > 0.3 ? 16 : 8;

      entries.push({
        id: `demo-andy-${dayOffset}-${i}`,
        householdUserId: 'andy',
        volumeOz,
        timestamp: timestamp.toISOString()
      });
    }
  }

  // Sort by timestamp
  entries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return entries;
}
