import { addDays, emptyDay, checks, trend, twoWeeks } from './model.ts';
import type { DataSet } from './model.ts';

export type ReviewFacts = {
  from: string; through: string; elapsedDays: number;
  foodComplete: number; foodUnconfirmed: number; workouts: number; creatine: number;
  withinTarget: number; overTarget: number; unknownTarget: number;
  revisions: number; revisedDays: number; forgottenFoodDays: string[];
  trend: number | null; measuredDays: number;
};
export function reviewFacts(data: DataSet, today: string): ReviewFacts {
  const dates = twoWeeks(today).filter(date => date <= today);
  const days = dates.map(date => data.days[date] ?? emptyDay(date, null));
  const revisions = data.revisions.filter(r => dates.includes(r.date));
  const weight = trend(data.weights, today);
  const targetValues = days.map(d => checks(d)[3].value);
  return {
    from: dates[0], through: today, elapsedDays: dates.length,
    foodComplete: days.filter(d => d.food === true).length,
    foodUnconfirmed: days.filter(d => d.food !== true).length,
    workouts: days.filter(d => d.workout === true).length,
    creatine: days.filter(d => d.creatine === true).length,
    withinTarget: targetValues.filter(v => v === true).length,
    overTarget: targetValues.filter(v => v === false).length,
    unknownTarget: targetValues.filter(v => v === null).length,
    revisions: revisions.length, revisedDays: new Set(revisions.map(r => r.date)).size,
    forgottenFoodDays: [...new Set(revisions.filter(r => r.reason === 'Forgotten food').map(r => r.date))],
    trend: weight.average, measuredDays: weight.coverage,
  };
}
export function nextAction(facts: ReviewFacts): string {
  if (facts.forgottenFoodDays.length) return 'Before confirming tonight, check small bites, drinks, and sauces.';
  if (facts.foodUnconfirmed) return 'Enter your current calorie total, then check whether anything is missing.';
  return 'Keep tonight’s food check at the same time. Correct the total if you eat afterward.';
}
export function reviewText(facts: ReviewFacts): string {
  return [
    `${facts.from}–${facts.through} (${facts.elapsedDays} elapsed days)`,
    `Food fully logged: ${facts.foodComplete}. Unconfirmed: ${facts.foodUnconfirmed}.`,
    `Within target: ${facts.withinTarget}. Over target: ${facts.overTarget}. Unknown: ${facts.unknownTarget}.`,
    `Workout completed: ${facts.workouts}. Creatine taken: ${facts.creatine}.`,
    `Corrections: ${facts.revisions} across ${facts.revisedDays} days. Corrections retain honest history.`,
    facts.trend == null ? 'Weight trend: no readings.' : `Weight trend: ${facts.trend.toFixed(1)} lb from ${facts.measuredDays}/7 measurement days.`,
    `Next action: ${nextAction(facts)}`,
  ].join('\n');
}
export function chatGPTPrompt(facts: ReviewFacts): string {
  return `Help me follow through on food logging and stay motivated. Use only the facts below. Unknown means unreported, not overeating. Do not shame me, diagnose me, prescribe a calorie target, or punish corrections. Give one short observation and one concrete evening action.\n\n${reviewText(facts)}`;
}
export function recentReviewDate(today: string): string { return addDays(today, -6); }
