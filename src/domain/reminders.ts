import { addDays, emptyDay, localDate, parseDate, setAnswer } from './model.ts';
import type { DailyRecord, Reminder, State } from './model.ts';
export const REMINDER_PREFIX = 'ontrackreminder_';
export const HORIZON_DAYS = 14;
export type ReminderKind = 'workout' | 'creatine' | 'food';
export type ReminderPayload = { owner: 'ontrack'; version: 1; kind: ReminderKind; date: string; timezone: string; preferenceKey: string; fireAt: number; snoozeCount: number };
export type PlannedReminder = { id: string; payload: ReminderPayload };
export function isKind(kind: unknown): kind is ReminderKind { return kind === 'workout' || kind === 'creatine' || kind === 'food'; }
export function validDate(date: unknown): date is string { return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && localDate(parseDate(date)) === date; }
export function validTime(time: string): boolean { return /^([01]\d|2[0-3]):[0-5]\d$/.test(time); }
export function preferenceKey(r: Reminder, timezone: string): string { return `${r.id}|${r.time}|${r.weekendTime ?? r.time}|${r.dayOffset ?? 0}|${timezone}`; }
export function unresolved(day: DailyRecord, kind: ReminderKind): boolean { return kind === 'food' ? day.food !== true : day[kind] === null; }
export function readPayload(value: unknown): ReminderPayload | null {
  if (!value || typeof value !== 'object') return null; const p = value as ReminderPayload;
  return p.owner === 'ontrack' && p.version === 1 && isKind(p.kind) && validDate(p.date) && typeof p.timezone === 'string' && typeof p.preferenceKey === 'string' && Number.isFinite(p.fireAt) && Number.isInteger(p.snoozeCount) && p.snoozeCount >= 0 && p.snoozeCount <= 2 ? p : null;
}
export function reminderStillValid(state: State, payload: ReminderPayload, timezone: string): boolean { const preference = state.reminders.find(r => r.id === payload.kind); return state.mode === 'real' && !!preference?.enabled && payload.preferenceKey === preferenceKey(preference, timezone); }
export function planReminders(state: State, now = new Date(), zone = Intl.DateTimeFormat().resolvedOptions().timeZone): PlannedReminder[] {
  if (state.mode !== 'real') return []; const today = localDate(now); const result: PlannedReminder[] = [];
  for (let n = 0; n < HORIZON_DAYS; n++) for (const r of state.reminders) {
    if (!r.enabled || !isKind(r.id) || ![0, -1].includes(r.dayOffset ?? 0)) continue; const fireDate = addDays(today, n); const day = parseDate(fireDate); const weekend = [0, 6].includes(day.getDay()); const time = weekend ? r.weekendTime ?? r.time : r.time; if (!validTime(time)) continue;
    const [hours, minutes] = time.split(':').map(Number); day.setHours(hours, minutes, 0, 0);
    // A nonexistent DST wall time is skipped instead of silently shifting the alert.
    if (day.getHours() !== hours || day.getMinutes() !== minutes || day.getTime() <= now.getTime()) continue;
    const date = addDays(fireDate, r.dayOffset ?? 0); if (!unresolved(state.real.days[date] ?? emptyDay(date, state.target), r.id)) continue;
    const payload: ReminderPayload = { owner: 'ontrack', version: 1, kind: r.id, date, timezone: zone, preferenceKey: preferenceKey(r, zone), fireAt: day.getTime(), snoozeCount: 0 };
    result.push({ id: `${REMINDER_PREFIX}${r.id}_${date}_${day.getTime()}`, payload });
  }
  return result.sort((a, b) => a.payload.fireAt - b.payload.fireAt);
}
export function completeReminder(state: State, payload: ReminderPayload, now = new Date(), zone = Intl.DateTimeFormat().resolvedOptions().timeZone): State {
  if (!reminderStillValid(state, payload, zone) || payload.kind === 'food' || payload.date > localDate(now)) return state;
  const day = state.real.days[payload.date] ?? emptyDay(payload.date, state.target); if (!unresolved(day, payload.kind)) return state;
  const data = setAnswer(state.real, payload.date, state.target, payload.kind, true);
  const updated = data.days[payload.date]; return { ...state, real: { ...data, days: { ...data.days, [payload.date]: { ...updated, sources: [...updated.sources, { kind: 'notification', id: `${payload.kind}:${payload.fireAt}`, observedAt: now.toISOString(), timezone: zone }] } } } };
}
export function snoozePlan(state: State, payload: ReminderPayload, now = new Date(), zone = Intl.DateTimeFormat().resolvedOptions().timeZone): PlannedReminder | null {
  if (!reminderStillValid(state, payload, zone) || payload.snoozeCount >= 2 || payload.date > localDate(now) || payload.date < addDays(localDate(now), -1)) return null;
  if (!unresolved(state.real.days[payload.date] ?? emptyDay(payload.date, state.target), payload.kind)) return null;
  const next = { ...payload, fireAt: now.getTime() + 30 * 60 * 1000, snoozeCount: payload.snoozeCount + 1 };
  return { id: `${REMINDER_PREFIX}snooze_${payload.kind}_${payload.date}`, payload: next };
}
export type ScheduledItem = { id: string; payload: ReminderPayload | null };
export function reconciliation(state: State, now: Date, timezone: string, existing: ScheduledItem[], allowed: boolean): { cancel: string[]; add: PlannedReminder[]; desired: PlannedReminder[] } {
  const desired = allowed ? planReminders(state, now, timezone) : [];
  const extras = allowed ? existing.filter(item => item.id.startsWith(`${REMINDER_PREFIX}snooze_`) && item.payload && item.payload.fireAt > now.getTime() && reminderStillValid(state, item.payload, timezone) && unresolved(state.real.days[item.payload.date] ?? emptyDay(item.payload.date, state.target), item.payload.kind)).map(item => ({ id: item.id, payload: item.payload! })) : [];
  const all = [...desired, ...extras];
  const matches = (item: ScheduledItem, plan: PlannedReminder) => item.id === plan.id && item.payload?.preferenceKey === plan.payload.preferenceKey && item.payload?.fireAt === plan.payload.fireAt && item.payload?.snoozeCount === plan.payload.snoozeCount;
  return { cancel: existing.filter(item => item.id.startsWith(REMINDER_PREFIX) && !all.some(plan => matches(item, plan))).map(item => item.id), add: all.filter(plan => !existing.some(item => matches(item, plan))), desired: all };
}
