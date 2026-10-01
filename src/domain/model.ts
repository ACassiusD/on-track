export type Answer = boolean | null;
export type ThemeName = 'Neon Arcade' | 'Cozy Quest' | 'Pocket Arcade' | 'Classic';
export type Source = { kind: 'manual' | 'healthkit' | 'notification' | 'app-intent'; id: string; observedAt: string; timezone: string; providerBundleId?: string; providerName?: string };
export type DailyRecord = { date: string; calories: number | null; target: number | null; food: Answer; workout: Answer; creatine: Answer; confirmationId?: string; sources: Source[] };
export type Confirmation = { id: string; date: string; total: number; at: string; timezone: string };
export type Revision = { id: string; date: string; oldTotal: number; newTotal: number; at: string; reason: string; confirmationId: string; source: Source };
export type WeightReading = { id: string; date: string; pounds: number; source: Source };
export type Photo = { id: string; date: string; uri: string; scale: number; x: number; y: number };
export type Reminder = { id: string; label: string; time: string; weekendTime?: string; dayOffset?: 0 | -1; enabled: boolean };
export type DataSet = { days: Record<string, DailyRecord>; confirmations: Confirmation[]; revisions: Revision[]; weights: WeightReading[]; photos: Photo[]; photoReviewedDates: string[] };
export type State = { version: 1; mode: 'real' | 'demo'; theme: ThemeName; target: number | null; goal: number | null; milestones: number[]; reminders: Reminder[]; notificationResponseIds?: string[]; nativeActionIds?: string[]; real: DataSet; demo: DataSet };
export function emptyData(): DataSet { return { days: {}, confirmations: [], revisions: [], weights: [], photos: [], photoReviewedDates: [] }; }
export function emptyDay(date: string, target: number | null): DailyRecord { return { date, calories: null, target, food: null, workout: null, creatine: null, sources: [] }; }
export function localDate(d = new Date()): string { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
export function parseDate(s: string): Date { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); }
export function addDays(s: string, n: number): string { const d = parseDate(s); d.setDate(d.getDate() + n); return localDate(d); }
export function twoWeeks(today: string): string[] { const weekday = (parseDate(today).getDay() + 6) % 7; const start = addDays(today, -weekday - 7); return Array.from({ length: 14 }, (_, i) => addDays(start, i)); }
export function withinTarget(day: DailyRecord): Answer { if (day.calories == null || day.target == null) return null; if (day.calories > day.target) return false; return day.food === true ? true : null; }
export function checks(day: DailyRecord): { label: string; value: Answer }[] { return [{ label: 'Workout', value: day.workout }, { label: 'Creatine', value: day.creatine }, { label: 'Food fully logged', value: day.food }, { label: 'Within calorie target', value: withinTarget(day) }]; }
export function score(day: DailyRecord): { count: number; tone: 'green' | 'yellow' | 'red' | 'grey' } { const values = checks(day).map(c => c.value); const count = values.filter(v => v === true).length; return { count, tone: count === 4 ? 'green' : count > 0 ? 'yellow' : values.every(v => v !== null) ? 'red' : 'grey' }; }
export function timezone(): string { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
export function manualSource(): Source { return { kind: 'manual', id: makeId(), observedAt: new Date().toISOString(), timezone: timezone() }; }
export function makeId(): string { return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`; }
export function setCalories(data: DataSet, date: string, target: number | null, total: number, reason: string, source = manualSource()): DataSet {
  if (!Number.isInteger(total) || total < 0) throw new Error('Enter a whole calorie total of zero or more.');
  const old = data.days[date] ?? emptyDay(date, target); const changed = old.calories !== total;
  const revision: Revision | null = changed && old.calories != null && old.confirmationId ? { id: makeId(), date, oldTotal: old.calories, newTotal: total, reason, source, at: source.observedAt, confirmationId: old.confirmationId } : null;
  return { ...data, days: { ...data.days, [date]: { ...old, calories: total, target: old.target ?? target, food: changed ? null : old.food, sources: [...old.sources, source] } }, revisions: revision ? [...data.revisions, revision] : data.revisions };
}
export function confirmFood(data: DataSet, date: string, target: number | null): DataSet { const day = data.days[date] ?? emptyDay(date, target); if (day.calories == null) throw new Error('Enter your calorie total first.'); const c: Confirmation = { id: makeId(), date, total: day.calories, at: new Date().toISOString(), timezone: timezone() }; return { ...data, days: { ...data.days, [date]: { ...day, food: true, confirmationId: c.id } }, confirmations: [...data.confirmations, c] }; }
export function setAnswer(data: DataSet, date: string, target: number | null, key: 'workout' | 'creatine' | 'food', value: Answer): DataSet { const day = data.days[date] ?? emptyDay(date, target); return { ...data, days: { ...data.days, [date]: { ...day, [key]: value } } }; }
// Source samples are replaced by source ID, never accumulated twice. Nutrition reconciliation
// intentionally remains unavailable until source overlap behavior has been verified.
export function upsertWeight(data: DataSet, reading: WeightReading): DataSet { return { ...data, weights: [...data.weights.filter(w => w.source.kind !== reading.source.kind || w.source.id !== reading.source.id), reading].sort((a, b) => a.date.localeCompare(b.date)) }; }
export function trend(weights: WeightReading[], date: string): { average: number | null; coverage: number } { const start = addDays(date, -6); const byDay = new Map<string, WeightReading[]>(); weights.filter(w => w.date >= start && w.date <= date).forEach(w => byDay.set(w.date, [...(byDay.get(w.date) ?? []), w])); const daily = [...byDay.values()].map(ws => ws.reduce((sum, w) => sum + w.pounds, 0) / ws.length); return { average: daily.length ? daily.reduce((sum, w) => sum + w, 0) / daily.length : null, coverage: daily.length }; }
export function initialState(today = localDate()): State {
  const demo = emptyData(); const dates = twoWeeks(today); dates.filter(d => d < today).forEach((date, i) => { demo.days[date] = { ...emptyDay(date, 1950), calories: i % 5 === 0 ? 2150 : 1750 + i * 10, food: i % 4 === 0 ? null : true, workout: i % 3 !== 0, creatine: i % 4 !== 0 }; });
  demo.days[today] = { ...emptyDay(today, 1950), calories: 1400 };
  for (let i = 27; i >= 0; i--) { const date = addDays(today, -i); const source = { ...manualSource(), id: `demo-${i}` }; demo.weights.push({ id: `demo-${i}`, date, pounds: 175 + i * .074 + Math.sin(i) * .22, source }); }
  return { version: 1, mode: 'real', theme: 'Neon Arcade', target: null, goal: null, milestones: [], reminders: [{ id: 'food', label: 'Food review', time: '01:00', weekendTime: '01:00', dayOffset: -1, enabled: false }, { id: 'workout', label: 'Workout check', time: '18:00', weekendTime: '18:00', dayOffset: 0, enabled: false }, { id: 'creatine', label: 'Creatine check', time: '11:00', weekendTime: '11:00', dayOffset: 0, enabled: false }], real: emptyData(), demo };
}
export function activeTarget(s: State): number | null { return s.mode === 'demo' ? 1950 : s.target; }
export function validateStored(value: unknown): State {
  const s = value as State;
  if (!s || s.version !== 1 || !['real', 'demo'].includes(s.mode) || !['Neon Arcade', 'Cozy Quest', 'Pocket Arcade', 'Classic'].includes(s.theme) || !Array.isArray(s.reminders) || !Array.isArray(s.milestones)) throw new Error('Unsupported or invalid saved data.');
  for (const data of [s.real, s.demo]) { if (!data || !data.days || !Array.isArray(data.confirmations) || !Array.isArray(data.revisions) || !Array.isArray(data.weights) || !Array.isArray(data.photos)) throw new Error('Saved data is incomplete.'); if (!data.photoReviewedDates) data.photoReviewedDates = []; if (!Array.isArray(data.photoReviewedDates)) throw new Error('Invalid photo review history.'); }
  s.reminders = s.reminders.map(r => ({ ...r, weekendTime: r.weekendTime ?? r.time, dayOffset: r.dayOffset ?? (r.id === 'food' && r.time < '06:00' ? -1 : 0) }));
  s.notificationResponseIds ??= [];
  s.nativeActionIds ??= [];
  if (!Array.isArray(s.nativeActionIds) || s.nativeActionIds.some(id => typeof id !== 'string')) throw new Error('Invalid native action history.');
  if (!Array.isArray(s.notificationResponseIds) || s.notificationResponseIds.some(id => typeof id !== 'string')) throw new Error('Invalid reminder response history.');
  return s;
}
