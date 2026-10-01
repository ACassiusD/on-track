export type HealthSample = { id: string; start: string; end: string; sourceBundleId: string; sourceName: string };
export type HealthWeight = HealthSample & { pounds: number };
export type HealthWorkout = HealthSample & { durationSeconds: number; activityType: number };
export type HealthEnergy = HealthSample & { kcal: number };
export type HealthSampleBatch = { start: string; end: string; weights: HealthWeight[]; workouts: HealthWorkout[]; energy: HealthEnergy[]; emptyReadMayBeDenied: true };
export type NativeAction = { id: string; date: string; kind: 'creatine' | 'workout'; value: true; at: string; timezone: string };
export function isNativeAction(value: unknown): value is NativeAction {
  const a = value as NativeAction;
  if (!a || typeof a.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(a.id) || typeof a.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(a.date) || !['creatine', 'workout'].includes(a.kind) || a.value !== true || typeof a.at !== 'string' || !Number.isFinite(Date.parse(a.at)) || typeof a.timezone !== 'string') return false;
  const [year, month, day] = a.date.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}
// Never combine energy sources: multiple apps can export the same meal summary.
// Empty samples remain unknown. The day is an explicit calendar projection, not
// a claim that the source app exported accurate meal timestamps.
export function energyForDay(samples: HealthEnergy[], sourceBundleId: string, date: string, dayForISO: (iso: string) => string): number | null {
  const selected = new Map<string, HealthEnergy>();
  for (const sample of samples) if (sample.sourceBundleId === sourceBundleId && dayForISO(sample.start) === date && Number.isFinite(sample.kcal) && sample.kcal >= 0) selected.set(sample.id, sample);
  return selected.size ? Math.round([...selected.values()].reduce((sum, sample) => sum + sample.kcal, 0)) : null;
}
