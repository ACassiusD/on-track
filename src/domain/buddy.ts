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
  const nextMood: BuddyMood | null = { unknown: 'normal', bad: 'low', low: 'normal', normal: 'good', good: 'thriving', thriving: null }[mood] as BuddyMood | null;
  const minimumLogs = mood === 'normal' ? 10 : mood === 'good' ? 12 : 7;
  const requiredLogs = Math.max(minimumLogs, assessed.length);
  const nextRate = mood === 'bad' ? .35 : mood === 'low' ? .5 : mood === 'normal' ? .8 : .9;
  const requiredWithin = Math.ceil(requiredLogs * nextRate);
  const nextLabel = nextMood === 'low' ? 'Needs care' : nextMood === 'normal' ? 'Doing okay' : nextMood === 'good' ? 'Happy' : nextMood === 'thriving' ? 'Thriving' : null;
  const day = data.days[today];
  const todayOnTarget = day?.food === true && day.calories !== null && day.target !== null && day.calories <= day.target;
  const record = assessed.length ? `${within}/${assessed.length} calorie logs on target · 14 days` : 'Mood follows 14-day calorie consistency';
  let hint: string;
  if (mood === 'unknown') hint = logs.length > 0 && assessed.length === 0 ? 'Set a calorie target to start.' : `Log ${7 - assessed.length} more calorie ${7 - assessed.length === 1 ? 'day' : 'days'} to reveal my mood.`;
  else if (mood === 'thriving') hint = 'Keep it up—you’re taking great care of me!';
  else hint = `${todayOnTarget ? 'Today counts! ' : ''}Aim for ${requiredWithin}/${requiredLogs} on target for ${nextLabel}.`;
  return { mood, label, from, through: today, logged: logs.length, assessed: assessed.length, within, rate, record, hint, todayOnTarget, nextMood, requiredWithin: nextMood && mood !== 'unknown' ? requiredWithin : null, requiredLogs: nextMood ? requiredLogs : null };

}
