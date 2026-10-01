import { addDays } from './model.ts';
import type { DataSet } from './model.ts';
export type BuddyMood = 'good' | 'normal' | 'bad' | 'unknown';
export function buddyStatus(data: DataSet, today: string) {
  const from = addDays(today, -13);
  const logs = Object.values(data.days).filter(d => d.date >= from && d.date <= today && d.food === true && d.calories !== null);
  const assessed = logs.filter(d => d.target !== null);
  const within = assessed.filter(d => d.calories! <= d.target!).length;
  const rate = assessed.length ? within / assessed.length : 0;
  // Unknown days never count as successes. A happy state requires broad coverage.
  const mood: BuddyMood = assessed.length < 7 ? 'unknown' : rate < .5 ? 'bad' : assessed.length >= 10 && rate >= .8 ? 'good' : 'normal';
  const label = { good: 'On track', normal: 'Mixed', bad: 'Off track', unknown: 'Checking in' }[mood];
  return { mood, label, from, through: today, logged: logs.length, assessed: assessed.length, within, rate };
}
