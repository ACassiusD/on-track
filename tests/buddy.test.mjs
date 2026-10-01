import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, emptyData, emptyDay, initialState, validateStored } from '../src/domain/model.ts';
import { buddyStatus } from '../src/domain/buddy.ts';
const today = '2026-09-30';
function days(n, over = 0) { const data = emptyData(); for (let i = 0; i < n; i++) { const date = addDays(today, -i); data.days[date] = { ...emptyDay(date, 1700), food: true, calories: i < over ? 1900 : 1600 }; } return data; }
test('buddy needs enough reported days and missing logs cannot earn a happy mood', () => { assert.equal(buddyStatus(emptyData(), today).mood, 'unknown'); assert.equal(buddyStatus(days(6), today).mood, 'unknown'); assert.equal(buddyStatus(days(7), today).mood, 'normal'); assert.equal(buddyStatus(days(10), today).mood, 'good'); });
test('mood boundaries separate mixed from consistently within or over target', () => { assert.equal(buddyStatus(days(10,2), today).mood, 'good'); assert.equal(buddyStatus(days(10,3), today).mood, 'normal'); assert.equal(buddyStatus(days(10,5), today).mood, 'normal'); assert.equal(buddyStatus(days(10,6), today).mood, 'low'); });
test('future, stale, unconfirmed and target-free data cannot inflate the mood', () => { const data = days(10); const old = addDays(today, -14); data.days[old] = { ...emptyDay(old,1700), food: true, calories: 1000 }; data.days[addDays(today,1)] = { ...emptyDay(addDays(today,1),1700), food: true, calories: 1000 }; data.days[today].food = null; data.days[addDays(today,-1)].target = null; const status = buddyStatus(data,today); assert.equal(status.logged,9); assert.equal(status.assessed,8); assert.equal(status.mood,'normal'); });
test('rest days and one weight spike do not punish food consistency; arcade theme hydrates', () => { const data = days(10); Object.values(data.days).forEach(d => { d.workout = false; }); data.weights.push({date:today,pounds:190}); assert.equal(buddyStatus(data,today).mood,'good'); const state = initialState(today); state.theme = 'Arcade Pop'; assert.equal(validateStored(state).theme,'Arcade Pop'); });

test('five moods have clear boundaries and thriving requires broad coverage', () => {
  for (const [count, over, expected] of [[14,0,'thriving'],[14,1,'thriving'],[14,2,'good'],[12,1,'thriving'],[12,2,'good'],[11,0,'good'],[9,0,'normal'],[14,7,'normal'],[14,8,'low'],[14,9,'low'],[14,10,'bad'],[6,6,'unknown']]) {
    assert.equal(buddyStatus(days(count,over),today).mood,expected, `${count} logged, ${over} over target`);
  }
});
test('one rough day cannot turn a thriving pet unhappy', () => {
  assert.equal(buddyStatus(days(14,1),today).mood,'thriving');
  assert.equal(buddyStatus(days(14,2),today).mood,'good');
});

test('next-mood advice shows the actual threshold, coverage and today’s credit', () => {
  const data = days(14,10);
  data.days[today].calories = 1600;
  data.days[addDays(today,-10)].calories = 1900;
  const status = buddyStatus(data,today);
  assert.equal(status.mood,'bad');
  assert.equal(status.within,4);
  assert.equal(status.nextMood,'low');
  assert.equal(status.requiredWithin,5);
  assert.equal(status.requiredLogs,14);
  assert.match(status.hint,/Today counts!.*5\/14.*Needs care/);
  assert.match(status.record,/4\/14 calorie logs on target/);
  assert.equal(buddyStatus(days(10,6),today).requiredWithin,5);
  assert.equal(buddyStatus(days(10,3),today).requiredWithin,8);
  assert.equal(buddyStatus(days(14,2),today).requiredWithin,13);
});
test('coverage advice never promises happiness from a single extra log', () => {
  const status = buddyStatus(days(7),today);
  assert.equal(status.mood,'normal');
  assert.equal(status.requiredLogs,10);
  assert.equal(status.requiredWithin,8);
  assert.match(status.hint,/8\/10/);
  assert.match(buddyStatus(days(6),today).hint,/1 more calorie day/);
  const data=days(7);Object.values(data.days).forEach(d=>d.target=null);
  assert.match(buddyStatus(data,today).hint,/Set a calorie target/);
  assert.equal(buddyStatus(days(14),today).nextMood,null);
});
