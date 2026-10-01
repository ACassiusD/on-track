import { displayedWeight } from '../domain/weightUnits.ts';
import { activeTarget, emptyDay, trend } from '../domain/model.ts';
import type { State } from '../domain/model.ts';
export type IPhoneSnapshot = { date: string; mode: 'real' | 'demo'; calories: number | null; target: number | null; trend: number | null; weightUnit?: 'lb' | 'kg'; coverage: number; foodComplete: boolean; workout: boolean | null; creatine: boolean | null; updatedAt: string; updatedLabel: string };
export function snapshotFor(state: State, date: string, now = new Date()): IPhoneSnapshot {
  const data = state[state.mode];
  const day = data.days[date] ?? emptyDay(date, activeTarget(state));
  const weight = trend(data.weights, date);
  return { date, mode: state.mode, calories: day.calories, target: day.target ?? activeTarget(state), trend: weight.average === null ? null : displayedWeight(weight.average, state.weightUnit ?? 'lb'), weightUnit: state.weightUnit ?? 'lb', coverage: weight.coverage, foodComplete: day.food === true, workout: day.workout, creatine: day.creatine, updatedAt: now.toISOString(), updatedLabel: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
}
export function shouldEndActivity(state: State, date: string, expiresAt: string, now = new Date()): boolean {
  return state.mode !== 'real' || state.real.days[date]?.food === true || !Number.isFinite(Date.parse(expiresAt)) || now.getTime() >= Date.parse(expiresAt);
}
