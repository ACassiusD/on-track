import { displayedWeight } from '../domain/weightUnits.ts';
import { activeTarget, addDays, emptyDay, trend } from '../domain/model.ts';
import type { State } from '../domain/model.ts';
export type IPhoneSnapshot = { date: string; mode: 'real' | 'demo'; calories: number | null; target: number | null; trend: number | null; weightUnit?: 'lb' | 'kg'; coverage: number; foodComplete: boolean; workout: boolean | null; creatine: boolean | null; updatedAt: string; updatedLabel: string };
export function snapshotFor(state: State, date: string, now = new Date()): IPhoneSnapshot {
  const data = state[state.mode];
  const day = data.days[date] ?? emptyDay(date, activeTarget(state));
  const weight = trend(data.weights, date);
  return { date, mode: state.mode, calories: day.calories, target: day.target ?? activeTarget(state), trend: weight.average === null ? null : displayedWeight(weight.average, state.weightUnit ?? 'lb'), weightUnit: state.weightUnit ?? 'lb', coverage: weight.coverage, foodComplete: day.food === true, workout: day.workout, creatine: day.creatine, updatedAt: now.toISOString(), updatedLabel: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
}
export type WidgetSnapshot = Omit<IPhoneSnapshot, 'calories' | 'target' | 'trend' | 'workout' | 'creatine'> & {
  calories?: number; target?: number; trend?: number; workout?: boolean; creatine?: boolean;
};
export function widgetTimelineFor(state: State, today: string, now = new Date()): { date: Date; props: WidgetSnapshot }[] {
  // Expo Widgets stores timeline dictionaries in UserDefaults, whose property-list
  // format cannot contain NSNull. Omit unknown values at this boundary only;
  // missing props still render as pending, and personal records retain their nulls.
  const propsFor = (date: string): WidgetSnapshot => Object.fromEntries(
    Object.entries(snapshotFor(state, date, now)).filter(([, value]) => value != null)
  ) as WidgetSnapshot;
  const tomorrow = addDays(today, 1);
  return [{ date: now, props: propsFor(today) }, { date: new Date(`${tomorrow}T00:00:00`), props: propsFor(tomorrow) }];
}
export function shouldEndActivity(state: State, date: string, expiresAt: string, now = new Date()): boolean {
  return state.mode !== 'real' || state.real.days[date]?.food === true || !Number.isFinite(Date.parse(expiresAt)) || now.getTime() >= Date.parse(expiresAt);
}
