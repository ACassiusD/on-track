import { addDays, emptyData, emptyDay } from './model.ts';
import type { BuddyMood } from './buddy.ts';
import { buddyStatus } from './buddy.ts';
import { taskScore } from './dailyTasks.ts';

export type ExampleMood = Exclude<BuddyMood, 'unknown'>;
const patterns: Record<ExampleMood, number[]> = {
  thriving: [5,5,5,4,5,5,5,5,4,5,5,5,5,5],
  good: [4,4,5,3,4,4,4,5,4,4,4,3,4,4],
  normal: [3,3,5,2,3,3,3,4,2,3,3,3,4,3],
  low: [2,2,3,1,2,2,2,3,0,2,2,2,3,3],
  bad: [1,1,2,0,1,1,1,2,0,1,0,1,2,3],
};
export function petExample(mood: ExampleMood) {
  // Two full Monday–Sunday weeks. These samples never touch the user's data.
  const today = '2026-09-27';
  const data = emptyData();
  const dates = patterns[mood].map((count, i) => {
    const date = addDays(today, i - 13);
    if (count > 0) data.days[date] = { ...emptyDay(date, 1700), workout: count >= 1, creatine: count >= 2, food: count >= 3, calories: count >= 5 ? 1600 : 1900 };
    if (count >= 4) data.weights.push({ id: `example-${date}`, date, pounds: 175, time: '14:00', source: { kind: 'manual', id: `example-${date}`, observedAt: `${date}T14:00:00Z`, timezone: 'UTC' } });
    return date;
  });
  return { status: buddyStatus(data, today), days: dates.map(date => ({ date, ...taskScore(data, date) })) };
}
