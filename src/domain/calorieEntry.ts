import { confirmFood, setAnswer, setCalories } from './model.ts';
import type { DataSet } from './model.ts';

export function saveDailyCalories(data: DataSet, date: string, target: number | null, input: string, complete: boolean): DataSet {
  const value = input.trim();
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) throw new Error('Enter a whole calorie total of zero or more.');
  let next = setCalories(data, date, target, Number(value), 'Total corrected');
  if (complete && next.days[date].food !== true) next = confirmFood(next, date, target);
  if (!complete) next = setAnswer(next, date, target, 'food', null);
  return next;
}
