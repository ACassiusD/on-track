import { requireOptionalNativeModule } from 'expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { State } from '../domain/model';
import { Platform } from 'react-native';
import type { HealthSampleBatch, NativeAction } from './iphoneContract';
export type { HealthSampleBatch, NativeAction } from './iphoneContract';
export { isNativeAction } from './iphoneContract';
interface IPhoneModule {
  alarmStatus(): { supported: boolean; authorization: string };
  requestAlarmAccess(): Promise<{ supported: boolean; authorization: string }>;
  scheduleReviewAlarm(fireAt: string): Promise<string>;
  cancelReviewAlarm(id: string): Promise<void>;
  status(): { available: boolean; healthAvailable: boolean };
  requestHealthAccess(): Promise<{ requested: true }>;
  readHealth(start: string, end: string): Promise<HealthSampleBatch>;
  publishNativeContext(date: string, mode: string): Promise<void>;
  readNativeActions(): Promise<NativeAction[]>;
  acknowledgeNativeActions(ids: string[]): Promise<void>;
}
const widgets = Platform.OS === 'ios' ? requireOptionalNativeModule('ExpoWidgets') : null;
const native = Platform.OS === 'ios' ? requireOptionalNativeModule<IPhoneModule>('OnTrackIPhone') : null;
function moduleOrThrow(): IPhoneModule { if (!native) throw new Error('This connection needs an iPhone development build. It is unavailable in Expo Go and on Android.'); return native; }
export function getIPhoneStatus() { return native ? { ...native.status(), widgetsAvailable: !!widgets, reason: undefined as string | undefined } : { widgetsAvailable: false, available: false, healthAvailable: false, reason: Platform.OS === 'ios' ? 'Install an iPhone development build.' : 'Available on iPhone only.' }; }
export async function requestHealthAccess() { return moduleOrThrow().requestHealthAccess(); }
export async function readHealth(start: string, end: string) { return moduleOrThrow().readHealth(start, end); }
export async function publishNativeContext(date: string, mode: 'real' | 'demo') { if (native) await native.publishNativeContext(date, mode); }
export async function readNativeActions(): Promise<NativeAction[]> { return native ? native.readNativeActions() : []; }
export async function acknowledgeNativeActions(ids: string[]) { if (native && ids.length) await native.acknowledgeNativeActions(ids); }

export function getReviewAlarmStatus() { return native ? native.alarmStatus() : { supported: false, authorization: 'unavailable' }; }
export async function requestAlarmAccess() { return moduleOrThrow().requestAlarmAccess(); }
type SavedAlarm = { id: string; date: string; fireAt: string };
const ALARM_KEY = 'on-track:review-alarms:v1';
let alarmQueue: Promise<unknown> = Promise.resolve();
function alarmOperation<T>(run: () => Promise<T>): Promise<T> { const next = alarmQueue.then(run); alarmQueue = next.catch(() => undefined); return next; }
export async function getSavedReviewAlarms(): Promise<SavedAlarm[]> {
  const raw = await AsyncStorage.getItem(ALARM_KEY);
  if (!raw) return [];
  const records = JSON.parse(raw) as SavedAlarm[];
  if (!Array.isArray(records) || records.some(a => typeof a.id !== 'string' || typeof a.date !== 'string' || !Number.isFinite(Date.parse(a.fireAt)))) throw new Error('Saved alarm metadata is invalid.');
  return records;
}
export function scheduleReviewAlarm(date: string, fireAt: string): Promise<void> { return alarmOperation(async () => {
  const old = await getSavedReviewAlarms();
  if (old.some(a => a.date === date && Date.parse(a.fireAt) > Date.now())) throw new Error('Cancel the existing alarm for this food record before scheduling another.');
  const id = await moduleOrThrow().scheduleReviewAlarm(fireAt);
  try { await AsyncStorage.setItem(ALARM_KEY, JSON.stringify([...old, { id, date, fireAt }])); }
  catch (error) { await moduleOrThrow().cancelReviewAlarm(id); throw error; }
}); }
export function cancelReviewAlarm(id: string): Promise<void> { return alarmOperation(async () => {
  const old = await getSavedReviewAlarms();
  await moduleOrThrow().cancelReviewAlarm(id);
  await AsyncStorage.setItem(ALARM_KEY, JSON.stringify(old.filter(a => a.id !== id)));
}); }
export function cancelResolvedReviewAlarms(state: State): Promise<void> { return alarmOperation(async () => {
  if (!native) return;
  const old = await getSavedReviewAlarms();
  const keep: SavedAlarm[] = [];
  for (const alarm of old) { if (state.mode === 'demo' || state.real.days[alarm.date]?.food === true || Date.parse(alarm.fireAt) < Date.now() - 3600000) await native.cancelReviewAlarm(alarm.id); else keep.push(alarm); }
  await AsyncStorage.setItem(ALARM_KEY, JSON.stringify(keep));
}); }
