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

  const day = data.days[today];
  const todayOnTarget = day?.food === true && day.calories !== null && day.target !== null && day.calories <= day.target;
  const record = assessed.length ? `${within}/${assessed.length} calorie logs on target · 14 days` : 'Mood follows 14-day calorie consistency';
  let hint: string;
  if (mood === 'unknown') {
    if (logs.length > assessed.length) hint = 'Add a calorie target to your logs.';
    else hint = 'Keep logging daily calories so I can see your progress.';
  } else if (mood === 'thriving') hint = 'You’re consistent—keep taking great care of me!';
  else if (mood === 'normal' && rate >= .8) hint = 'You’re on target—keep logging daily to reach Happy.';
  else if (mood === 'good' && rate >= .9) hint = 'You’re on target—keep logging daily to reach Thriving.';
  else if (mood === 'good') hint = 'Stay within your calorie target more often to reach Thriving.';
  else hint = logs.length >= 10 ? 'You’re logging consistently—stay within your calorie target more often.' : 'Stay within your calorie target more often to help me feel better.';
  return { mood, label, from, through: today, logged: logs.length, assessed: assessed.length, within, rate, record, hint, todayOnTarget, nextMood, requiredWithin: nextMood && mood !== 'unknown' ? requiredWithin : null, requiredLogs: nextMood ? requiredLogs : null };

}
