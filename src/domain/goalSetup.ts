import type { State } from './model.ts';
import { validTime } from './reminders.ts';
import { parseWeightInput, weightInput } from './weightUnits.ts';
import type { WeightUnit } from './weightUnits.ts';
export function parseCalorieTarget(input: string): number | null {
  const value = input.trim();
  if (!value) return null;
  const number = Number(value);
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(number) || number <= 0) throw new Error('Enter a whole calorie target above zero.');
  return number;
}
export function parseGoalWeight(input: string, unit: WeightUnit, existing: number | null = null): number | null {
  if (!input.trim()) return null;
  // Editing another setting must not round an existing canonical weight.
  if (existing !== null && input.trim() === weightInput(existing, unit)) return existing;
  return parseWeightInput(input, unit);
}
export function applyGoalSetup(state: State, draft: { target: string; goal: string; unit: WeightUnit; milestones: number[]; time: string }): State {
  const target = parseCalorieTarget(draft.target);
  const goal = parseGoalWeight(draft.goal, draft.unit, state.goal);
  if (!validTime(draft.time)) throw new Error('Choose a valid weigh-in time.');
  if (draft.milestones.some(n => !Number.isFinite(n) || n <= 0)) throw new Error('Enter a positive milestone weight.');
  return { ...state, target, goal, weightUnit: draft.unit, weighInTime: draft.time, milestones: [...new Set(draft.milestones)].sort((a,b) => b-a) };
}
