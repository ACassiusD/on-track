import { localDate, makeId, manualSource, parseDate, upsertWeight } from './model.ts';
import type { DataSet } from './model.ts';
export function saveManualWeight(data: DataSet, date: string, pounds: number, time: string, today: string): DataSet {
  if (!Number.isFinite(pounds) || pounds <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || localDate(parseDate(date)) !== date || date > today || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Enter a positive weight, valid date and time (HH:MM).');
  if (pounds < 50 || pounds > 1000) throw new Error('Enter weight in pounds between 50 and 1000. Check for a missing decimal.');
  const prior = data.weights.find(w => w.date === date && w.source.kind === 'manual');
  const source = { ...manualSource(), ...(prior ? { id: prior.source.id } : {}) };
  // Editing a manual day's entry replaces it; HealthKit source samples remain intact.
  const base = { ...data, weights: data.weights.filter(w => w.date !== date || w.source.kind !== 'manual') };
  return upsertWeight(base, { id: prior?.id ?? makeId(), date, pounds, time, source });
}
