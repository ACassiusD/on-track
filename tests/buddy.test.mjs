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
