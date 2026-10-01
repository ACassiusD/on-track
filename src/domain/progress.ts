import { addDays, checks, emptyDay, trend, twoWeeks } from './model.ts';
import { taskSummary } from './dailyTasks.ts';
import type { DataSet, State } from './model.ts';
export const TREND_COVERAGE = 4; // Display rule, not a persisted award or health assessment.
export function periodSummary(data: DataSet, today: string) {
  const dates = twoWeeks(today).filter(date => date <= today);
  const rows = dates.map(date => ({ date, day: data.days[date] ?? emptyDay(date, null) }));
  const totals = checks(emptyDay(today, null)).map((check, i) => {
    const values = rows.map(row => checks(row.day)[i].value);
    return { label: check.label, done: values.filter(v => v === true).length, known: values.filter(v => v !== null).length, unknown: values.filter(v => v === null).length, days: dates.length };
  });
  const revisions = data.revisions.filter(r => r.date >= dates[0] && r.date <= today);
  const calorieDays = rows.filter(row => row.day.food === true && row.day.calories !== null);
  return { dates, rows, totals, completeDays: taskSummary(data,today).completeDays, answeredDays: rows.filter(row => checks(row.day).every(c => c.value !== null)).length, revisionCount: revisions.length, revisedDays: new Set(revisions.map(r => r.date)).size, meanCompleteCalories: calorieDays.length ? calorieDays.reduce((sum,row) => sum + row.day.calories!,0)/calorieDays.length : null, completeCalorieDays: calorieDays.length };
}
export function milestoneProgress(data: DataSet, state: Pick<State,'mode'|'goal'|'milestones'>, today: string) {
  const current = trend(data.weights,today);
  const candidates = [...new Set(data.weights.filter(w=>w.date<=today).map(w=>w.date))].sort();
  const baselineDate = candidates.find(date=>trend(data.weights,date).coverage>=TREND_COVERAGE) ?? null;
  const baseline = baselineDate ? trend(data.weights,baselineDate).average : null;
  const goal = state.mode==='demo' ? 155 : state.goal;
  const milestones = [...new Set((state.mode==='demo' ? [172,170,165,160,155] : [...state.milestones,...(goal===null?[]:[goal])]).filter(n=>Number.isFinite(n)&&n>0))].sort((a,b)=>b-a);
  const qualified = current.coverage>=TREND_COVERAGE && current.average!==null;
  const next = current.average===null ? milestones[0]??null : milestones.find(n=>n<current.average!)??null;
  const fraction = baseline!==null && current.average!==null && goal!==null && baseline>goal ? Math.max(0,Math.min(1,(baseline-current.average)/(baseline-goal))) : null;
  return { current, baseline, baselineDate, goal, milestones, qualified, next, remaining: next!==null&&current.average!==null ? Math.max(0,current.average-next) : null, fraction, reached: qualified ? milestones.filter(n=>current.average!<=n) : [] };
}
export function shareSummary(data: DataSet, state: Pick<State,'mode'|'goal'|'milestones'>, today: string): string {
  const period=periodSummary(data,today); const tasks=taskSummary(data,today); const weight=milestoneProgress(data,state,today);
  return `${state.mode==='demo'?'DEMO · ':''}ON TRACK · ${period.dates[0]} to ${today}\n${tasks.completeDays}/${period.dates.length} days with all five daily tasks complete\n${tasks.totals.map(t=>`${t.label}: ${t.done} done · ${t.known}/${t.days} reported`).join('\n')}\nWeight trend: ${weight.current.average===null?'No readings in the past seven days':`${weight.current.average.toFixed(1)} lb · ${weight.current.coverage}/7 days measured${weight.qualified?'':' · provisional'}`}\n${period.revisionCount} calorie corrections on ${period.revisedDays} days\nUnknown checks remain unknown. Photos are excluded.`;
}

export type TrendRange = 7 | 14 | 28 | 30 | 90 | 180 | 365 | 'all';
export function trendSeries(data: DataSet, today: string, range: TrendRange = 28) {
  const start = range === 'all' ? null : addDays(today, -range + 1);
  const dates = [...new Set(data.weights.filter(w => w.date <= today && (start === null || w.date >= start)).map(w => w.date))].sort();
  // Plot measurement days, plus the current measured-window estimate. Gaps are preserved.
  if (trend(data.weights,today).average !== null && !dates.includes(today)) dates.push(today);
  return dates.map(date => ({date,...trend(data.weights,date)})).filter(point=>point.average!==null);
}
