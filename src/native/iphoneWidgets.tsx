// Import lazily only after getIPhoneStatus().available && widgetsAvailable.
// expo-widgets' iOS module is deliberately absent from Expo Go.
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { HStack, Link, ProgressView, Text, VStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, padding, widgetURL } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, createWidget, type WidgetEnvironment } from 'expo-widgets';
import { addDays, localDate, type State } from '../domain/model';
import { snapshotFor, shouldEndActivity, type IPhoneSnapshot } from './iphoneWidgetContract';

const ProgressWidget = (props: IPhoneSnapshot, environment: WidgetEnvironment) => {
  'widget';
  const dayURL = props.date ? `ontrack://day?date=${props.date}` : 'ontrack://';
  const foodURL = props.date ? `ontrack://calories?date=${props.date}` : 'ontrack://';
  const accent = environment.widgetRenderingMode === 'fullColor' ? '#67F6CD' : '#FFFFFF';
  const bg = environment.widgetRenderingMode === 'fullColor' ? '#11112B' : '#101019';
  if (environment.widgetFamily === 'accessoryInline') return <Text>{props.calories == null ? 'Calories pending' : `${props.calories} kcal`} · {props.foodComplete ? 'Logged' : 'Food check pending'}</Text>;
  if (environment.widgetFamily === 'accessoryRectangular') return <VStack alignment="leading" modifiers={[widgetURL(foodURL)]}><Text modifiers={[font({ weight: 'bold' })]}>{props.calories == null ? '—' : props.calories} kcal</Text><Text>{props.foodComplete ? 'Food logged' : 'Food check pending'}</Text><Text>{props.date} · {props.updatedLabel}</Text></VStack>;
  return <VStack alignment="leading" spacing={5} modifiers={[containerBackground(bg, 'widget'), widgetURL('ontrack://'), padding({ all: 5 })]}><Text modifiers={[font({ size: 12, weight: 'bold' }), foregroundStyle(accent)]}>{props.mode === 'demo' ? 'DEMO · ' : ''}ON TRACK · {props.date}</Text><HStack><Text modifiers={[font({ size: 28, weight: 'bold' }), foregroundStyle('#FFFFFF')]}>{props.calories == null ? '—' : props.calories}</Text><Text modifiers={[foregroundStyle('#C5C5DE')]}>/ {props.target == null ? '—' : props.target} kcal</Text></HStack>{props.calories != null && props.target != null ? <ProgressView value={Math.min(props.calories / props.target, 1)} /> : null}<Text modifiers={[foregroundStyle(accent)]}>{props.trend == null ? 'Weight pending' : `${props.trend.toFixed(1)} ${props.weightUnit ?? 'lb'} trend · ${props.coverage}/7 days`}</Text>{environment.widgetFamily === 'systemMedium' ? <HStack><Link label={props.creatine === true ? 'Creatine ✓' : 'Creatine check'} destination={dayURL} /><Link label={props.workout === true ? 'Workout ✓' : 'Workout check'} destination={dayURL} /></HStack> : null}<Text modifiers={[font({ size: 11 }), foregroundStyle('#C5C5DE')]}>{props.foodComplete ? 'Food logged' : 'Food check pending'} · Updated {props.updatedLabel}</Text>{props.calories != null && props.target != null && props.calories > props.target ? <Text modifiers={[foregroundStyle('#FFABBB')]}>+{props.calories - props.target} over target</Text> : null}</VStack>;
};
const widget = createWidget('OnTrackProgress', ProgressWidget);

type EveningProps = IPhoneSnapshot & { expiresAt: string };
const EveningLayout = (props: EveningProps) => {
  'widget';
  return { banner: <VStack alignment="leading" modifiers={[padding({ all: 12 })]}><Text modifiers={[font({ weight: 'bold' }), foregroundStyle('#67F6CD')]}>Food check · {props.date}</Text><Text modifiers={[font({ size: 24, weight: 'bold' })]}>{props.calories == null ? '—' : props.calories} / {props.target == null ? '—' : props.target} kcal</Text><Text>{props.foodComplete ? 'Food logged' : 'Review all food before bed'}</Text><Link label="Review food" destination={`ontrack://calories?date=${props.date}`} /><Text modifiers={[font({ size: 11 })]}>Updated {props.updatedLabel}</Text></VStack>, compactLeading: <Text>kcal</Text>, compactTrailing: <Text>{props.calories == null ? '—' : props.calories}</Text>, minimal: <Text>✓?</Text>, expandedBottom: <Link label="Review food" destination={`ontrack://calories?date=${props.date}`} /> };
};
const evening = createLiveActivity('OnTrackEvening', EveningLayout);
const SESSION_KEY = 'on-track:evening-activity:v1';
type Session = { id: string; date: string; expiresAt: string };
let operations: Promise<unknown> = Promise.resolve();
function serialize<T>(run: () => Promise<T>): Promise<T> { const next = operations.then(run); operations = next.catch(() => undefined); return next; }
export function publishIPhoneSnapshot(state: State, today: string) {
  if (Platform.OS !== 'ios') return;
  const now = new Date(); const midnight = new Date(`${addDays(today, 1)}T00:00:00`);
  // Tomorrow's entry clears today's answers even when the app stays closed.
  widget.updateTimeline([{ date: now, props: snapshotFor(state, today, now) }, { date: midnight, props: snapshotFor(state, addDays(today, 1), now) }]);
}
export function startEveningActivity(state: State, date = localDate()): Promise<void> {
  return serialize(async () => {
    if (Platform.OS !== 'ios') throw new Error('Live Activities require an iPhone development build.');
    if (state.mode !== 'real') throw new Error('Switch off demo mode first.');
    if (state.real.days[date]?.food === true) throw new Error('Food is already confirmed for this date.');
    await endNow();
    const expiresAt = new Date(Date.now() + 2 * 3600000).toISOString();
    const activity = evening.start({ ...snapshotFor(state, date), expiresAt }, `ontrack://calories?date=${date}`, new Date(expiresAt));
    if (!activity.getId()) throw new Error('Live Activities are unavailable in this build.');
    try { await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ id: activity.getId(), date, expiresAt })); }
    catch (error) { await activity.end('immediate'); throw error; }
  });
}
async function endNow() { for (const activity of evening.getInstances()) await activity.end('immediate'); await AsyncStorage.removeItem(SESSION_KEY); }
export function endEveningActivities(): Promise<void> { return serialize(endNow); }
export function syncEveningActivities(state: State): Promise<void> {
  return serialize(async () => {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) { await endNow(); return; }
    let session: Session;
    try { session = JSON.parse(raw); } catch { await endNow(); return; }
    if (!session || typeof session.id !== 'string' || typeof session.date !== 'string' || shouldEndActivity(state, session.date, session.expiresAt)) { await endNow(); return; }
    const activities = evening.getInstances();
    for (const activity of activities) { if (activity.getId() !== session.id) await activity.end('immediate'); else await activity.update({ ...snapshotFor(state, session.date), expiresAt: session.expiresAt }, new Date(session.expiresAt)); }
    if (!activities.some(a => a.getId() === session.id)) await AsyncStorage.removeItem(SESSION_KEY);
  });
}
