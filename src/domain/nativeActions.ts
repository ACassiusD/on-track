import { emptyDay, setAnswer } from './model.ts';
import type { State, Source } from './model.ts';
import { validDate } from './reminders.ts';
export type NativeHabitAction = { id: string; date: string; kind: 'creatine' | 'workout'; value: true; at: string; timezone: string };
export function validNativeAction(value: unknown, today: string): value is NativeHabitAction {
  if (!value || typeof value !== 'object') return false;
  const a = value as NativeHabitAction;
  return typeof a.id === 'string' && a.id.length > 0 && a.id.length <= 200 && validDate(a.date) && a.date <= today
    && (a.kind === 'creatine' || a.kind === 'workout') && a.value === true
    && typeof a.at === 'string' && Number.isFinite(Date.parse(a.at))
    && typeof a.timezone === 'string' && a.timezone.length > 0 && a.timezone.length <= 100;
}
export function applyNativeAction(state: State, action: NativeHabitAction, today: string): State {
  if (state.mode !== 'real' || !validNativeAction(action, today) || state.nativeActionIds?.includes(action.id)) return state;
  const source: Source = { kind: 'app-intent', id: action.id, observedAt: action.at, timezone: action.timezone };
  const real = setAnswer(state.real, action.date, state.target, action.kind, true);
  const day = real.days[action.date] ?? emptyDay(action.date, state.target);
  return { ...state, real: { ...real, days: { ...real.days, [action.date]: { ...day, sources: [...day.sources, source] } } }, nativeActionIds: [...(state.nativeActionIds ?? []), action.id] };
}
