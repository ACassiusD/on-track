import { addDays } from './model.ts';
import type { DataSet } from './model.ts';
export type BuddyMood = 'thriving' | 'good' | 'normal' | 'low' | 'bad' | 'unknown';
export function buddyStatus(data: DataSet, today: string) {
  const from = addDays(today, -13);
  const logs = Object.values(data.days).filter(d => d.date >= from && d.date <= today && d.food === true && d.calories !== null);
  const assessed = logs.filter(d => d.target !== null);
  const within = assessed.filter(d => d.calories! <= d.target!).length;
  const rate = assessed.length ? within / assessed.length : 0;
  // Unknown days never count as successes. A happy state requires broad coverage.
  const mood: BuddyMood = assessed.length < 7 ? 'unknown' : rate < .35 ? 'bad' : rate < .5 ? 'low' : assessed.length >= 12 && rate >= .9 ? 'thriving' : assessed.length >= 10 && rate >= .8 ? 'good' : 'normal';
  const label = { thriving: 'Thriving', good: 'Happy', normal: 'Doing okay', low: 'Needs care', bad: 'Needs a boost', unknown: 'Getting started' }[mood];
  return { mood, label, from, through: today, logged: logs.length, assessed: assessed.length, within, rate };
}
