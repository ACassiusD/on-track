import { emptyDay, twoWeeks, withinTarget } from './model.ts';
import type { DataSet } from './model.ts';
export function dailyTasks(data: DataSet, date: string) {
  const day = data.days[date] ?? emptyDay(date, null);
  return [
    { label: 'Workout', value: day.workout },
    { label: 'Creatine', value: day.creatine },
    { label: 'Calories logged', value: day.calories !== null ? day.food : null },
    { label: 'Weight entered', value: data.weights.some(w => w.date === date) ? true : null },
    { label: 'Within calorie target', value: day.food === true && day.calories !== null ? withinTarget(day) : null },
  ];
}
export function taskScore(data: DataSet, date: string) {
  const values = dailyTasks(data, date).map(t => t.value);
  const count = values.filter(v => v === true).length;
  const tone: 'green' | 'yellow' | 'red' | 'grey' = count === values.length ? 'green' : count > 0 ? 'yellow' : values.every(v => v === false) ? 'red' : 'grey';
  return { count, total: values.length, tone };
}
export function taskSummary(data: DataSet, today: string) {
  const dates = twoWeeks(today).filter(date => date <= today);
  const totals = dailyTasks(data,today).map((task,i) => {
    const values = dates.map(date => dailyTasks(data,date)[i].value);
    return { label: task.label, done: values.filter(v => v === true).length, known: values.filter(v => v !== null).length, unknown: values.filter(v => v === null).length, days: dates.length };
  });
  return { dates, totals, completeDays: dates.filter(date => taskScore(data,date).count === dailyTasks(data,date).length).length };
}
