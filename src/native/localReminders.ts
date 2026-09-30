import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { reconciliation, readPayload, reminderStillValid, unresolved, REMINDER_PREFIX } from '../domain/reminders';
import type { PlannedReminder } from '../domain/reminders';
import { emptyDay } from '../domain/model';
import type { State } from '../domain/model';
export type Permission = { label: string; allowed: boolean; canAsk: boolean };
export const ACTION_DONE = 'ONTRACK_DONE';
export const ACTION_LATER = 'ONTRACK_LATER';
export const ACTION_REVIEW = 'ONTRACK_REVIEW';
export function permissionView(p: Notifications.NotificationPermissionsStatus): Permission {
  const ios = p.ios?.status;
  if (ios === Notifications.IosAuthorizationStatus.PROVISIONAL) return { label: 'Quiet authorization (provisional)', allowed: true, canAsk: p.canAskAgain };
  if (ios === Notifications.IosAuthorizationStatus.EPHEMERAL) return { label: 'Temporary authorization', allowed: true, canAsk: p.canAskAgain };
  if (p.granted || ios === Notifications.IosAuthorizationStatus.AUTHORIZED) return { label: 'Allowed by iOS', allowed: true, canAsk: p.canAskAgain };
  return { label: p.status === 'denied' ? 'Denied in system settings' : 'Not requested', allowed: false, canAsk: p.canAskAgain };
}
export async function readPermission(): Promise<Permission> { if (Platform.OS !== 'ios') return { label: 'iPhone reminders only in this slice', allowed: false, canAsk: false }; return permissionView(await Notifications.getPermissionsAsync()); }
export async function requestPermission(): Promise<Permission> { if (Platform.OS !== 'ios') return readPermission(); return permissionView(await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } })); }
export function category(kind: string): string { return `ONTRACK_${kind.toUpperCase()}`; }
export async function registerCategories(): Promise<void> {
  for (const kind of ['workout', 'creatine', 'food']) await Notifications.setNotificationCategoryAsync(category(kind), [
    { identifier: kind === 'food' ? ACTION_REVIEW : ACTION_DONE, buttonTitle: kind === 'food' ? 'Review food' : kind === 'creatine' ? 'Taken' : 'Done', options: { opensAppToForeground: true, isAuthenticationRequired: true } },
    { identifier: ACTION_LATER, buttonTitle: 'Later (30 min)', options: { opensAppToForeground: true } },
  ]);
}
export async function schedule(plan: PlannedReminder): Promise<void> {
  const { kind, date } = plan.payload;
  await Notifications.scheduleNotificationAsync({ identifier: plan.id, content: { title: kind === 'food' ? 'Food review' : kind === 'workout' ? 'Workout check' : 'Creatine check', body: `${date} · ${kind === 'food' ? 'Check for anything you forgot to log.' : kind === 'workout' ? 'Any lifting or cardio done?' : 'Have you taken it?'}`, data: plan.payload, categoryIdentifier: category(kind), sound: 'default' }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(plan.payload.fireAt) } });
}
export async function syncSchedules(state: State, allowed: boolean, now = new Date()): Promise<{ count: number; through: string | null }> {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone; const existing = await Notifications.getAllScheduledNotificationsAsync(); const planned = reconciliation(state, now, zone, existing.map(item => ({ id: item.identifier, payload: readPayload(item.content.data) })), allowed);
  for (const id of planned.cancel) await Notifications.cancelScheduledNotificationAsync(id);
  for (const item of planned.add) await schedule(item);
  // Resolved/disabled stale cards must disappear from Notification Center too.
  const presented = await Notifications.getPresentedNotificationsAsync();
  for (const notification of presented) { const request = notification.request; const payload = readPayload(request.content.data); if (!request.identifier.startsWith(REMINDER_PREFIX)) continue; if (!allowed || !payload || !reminderStillValid(state, payload, zone) || !unresolved(state.real.days[payload.date] ?? emptyDay(payload.date, state.target), payload.kind)) await Notifications.dismissNotificationAsync(request.identifier); }
  return { count: planned.desired.length, through: planned.desired.length ? new Date(Math.max(...planned.desired.map(item => item.payload.fireAt))).toLocaleDateString() : null };
}
