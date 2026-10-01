import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyData, emptyDay, withinTarget } from '../src/domain/model.ts';
import { saveDailyCalories } from '../src/domain/calorieEntry.ts';
import { dailyTasks, taskScore } from '../src/domain/dailyTasks.ts';
const date = '2026-10-01';
test('a saved total stays incomplete until logging is confirmed', () => {
  const partial = saveDailyCalories(emptyData(), date, 1900, '1700', false);
  assert.equal(partial.days[date].calories, 1700);
  assert.equal(taskScore(partial, date).count, 0);
  const done = saveDailyCalories(partial, date, 1900, '1700', true);
  assert.equal(taskScore(done, date).count, 1);
  assert.equal(dailyTasks(done, date)[2].label, 'Calories');
  assert.equal(done.confirmations.length, 1);
});
test('over-target logs complete the task and retain the over-target result', () => {
  const done = saveDailyCalories(emptyData(), date, 1900, '2200', true);
  assert.equal(taskScore(done, date).count, 1);
  assert.equal(withinTarget(done.days[date]), false);
});
test('corrections can reopen logging and preserve the previous confirmed total', () => {
  const done = saveDailyCalories(emptyData(), date, 1900, '1700', true);
  const edited = saveDailyCalories(done, date, 1900, '2000', false);
  assert.equal(taskScore(edited, date).count, 0);
  assert.equal(edited.revisions[0].oldTotal, 1700);
  assert.equal(edited.revisions[0].newTotal, 2000);
  const confirmed = saveDailyCalories(edited, date, 1900, '2000', true);
  assert.equal(taskScore(confirmed, date).count, 1);
  assert.equal(confirmed.confirmations.length, 2);
});
test('missing or invalid totals cannot complete calories', () => {
  for (const input of ['', ' ', '-1', '1.5', 'abc', '9007199254740992']) assert.throws(() => saveDailyCalories(emptyData(), date, null, input, true));
  const data = emptyData();
  data.days[date] = { ...emptyDay(date, null), food: true };
  assert.equal(taskScore(data, date).count, 0);
});
test('explicit zero and totals without targets can be confirmed', () => {
  assert.equal(taskScore(saveDailyCalories(emptyData(), date, null, '0', true), date).count, 1);
});
