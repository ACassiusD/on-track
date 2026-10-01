import { addDays } from './model.ts';
import type { DataSet } from './model.ts';
import { dailyTasks } from './dailyTasks.ts';
export type BuddyMood = 'thriving' | 'good' | 'normal' | 'low' | 'bad' | 'unknown';
export function buddyStatus(data: DataSet, today: string) {
  const from = addDays(today, -13);
  const window = Array.from({ length: 14 }, (_, i) => addDays(from, i));
  const started = (date: string) => {
    const day = data.days[date];
    return data.weights.some(w => w.date === date) || !!day && (day.calories !== null || day.food !== null || day.workout !== null || day.creatine !== null);
  };
  const first = window.find(started);
  // Before the first entry there is no routine to assess. Subsequent missed days
  // count, but an unfinished today cannot drag yesterday's mood down.
  const dates = first ? window.filter(d => d >= first && d < today) : [];
  const todayFinished = data.days[today]?.food === true && data.days[today]?.calories !== null;
  const includeToday = !!first && (todayFinished || dates.length === 0);
  const assessedDates = includeToday ? [...dates, today] : dates;
  const totals = dailyTasks(data, today).map((t, i) => ({ label: t.label, done: assessedDates.filter(d => dailyTasks(data, d)[i].value === true).length }));
  const completed = totals.reduce((sum, t) => sum + t.done, 0);
  const possible = assessedDates.length * 5;
  const rate = possible ? completed / possible : 0;
  const mood: BuddyMood = assessedDates.length < 7 ? 'unknown' : rate < .35 ? 'bad' : rate < .5 ? 'low' : assessedDates.length >= 12 && rate >= .9 ? 'thriving' : assessedDates.length >= 10 && rate >= .8 ? 'good' : 'normal';
  const label = { thriving: 'Thriving', good: 'Happy', normal: 'Doing okay', low: 'Needs care', bad: 'Needs a boost', unknown: first ? 'Getting to know you' : 'Meet your pet' }[mood];
  const nextMood: BuddyMood | null = { unknown: 'normal', bad: 'low', low: 'normal', normal: 'good', good: 'thriving', thriving: null }[mood] as BuddyMood | null;
  const weakest = [...totals].sort((a, b) => a.done - b.done)[0];
  const tips: Record<string, string> = {
    Workout: 'Try completing your workout more often.',
    Creatine: 'Remember your daily creatine check.',
    'Calories logged': 'Finish logging your calories each day.',
    'Weight entered': 'Add your daily weight to build the habit.',
    'Within calorie target': 'Aim to finish more days within your calorie target.',
  };
  const targetMissing = assessedDates.some(d => data.days[d]?.food === true && data.days[d]?.target === null);
  const hint = !first ? 'Its happiness reflects your habits over 14 days. Start with today’s tasks.' : mood === 'unknown' ? 'Each daily check helps you care for your pet. Keep building your routine.' : mood === 'thriving' ? 'Your habits are consistent—keep taking great care of your pet!' : rate >= (mood === 'good' ? .9 : .8) ? 'You’re doing well. Keep your routine going as your pet gets to know you.' : targetMissing && weakest.label === 'Within calorie target' ? 'Set a calorie target in Goals to complete that daily task.' : tips[weakest.label];
  const percent = Math.floor(rate * 100);
  const reason = !first ? 'Your pet is ready to grow with you. Each of your five daily habits helps shape its happiness.' : mood === 'unknown' ? `Your pet is learning your routine: ${assessedDates.length} of the first 7 days. Its mood will reflect all five habits, not weight changes.` : mood === 'normal' && rate >= .8 && assessedDates.length < 10 ? `Great consistency: ${percent}% of checks complete. Keep going—Happy needs at least 10 days of history.` : mood === 'good' && rate >= .9 && assessedDates.length < 12 ? `Great consistency: ${percent}% of checks complete. Thriving needs at least 12 days of history.` : `You've completed ${percent}% of daily checks across ${assessedDates.length} days in the past 14. ${mood === 'thriving' ? 'Your steady routine is helping your pet thrive.' : mood === 'good' ? 'Your routine is keeping your pet happy.' : mood === 'normal' ? 'Your pet is doing okay as you build consistency.' : 'More regular daily checks will help your pet perk up.'}`;
  const record = `${completed}/${possible} daily tasks complete · past 14 days`;
  return { mood, label, reason, from, through: today, rate, record, hint, nextMood, completed, possible, totals, assessedDays: assessedDates.length, isNew: !first, todayPending: !!first && !todayFinished };
}
