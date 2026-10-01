import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyData, emptyDay } from '../src/domain/model.ts';
import { newTaskReactions, taskSnapshot } from '../src/domain/taskReactions.ts';
const today = '2026-10-01';
const snapshot = data => taskSnapshot(data, today, 'real');
function logged(over = false) {
  const data = emptyData();
  data.days[today] = { ...emptyDay(today, 1700), calories: over ? 1800 : 1600, food: true, workout: true, creatine: true };
  return data;
}
test('opening an already complete day or switching demo/day does not celebrate', () => {
  const data = logged(); data.weights = [{ id: 'w', date: today, pounds: 175, time: '14:00', source: { kind: 'manual' } }];
  const next = snapshot(data);
  assert.deepEqual(newTaskReactions(null, next), []);
  assert.deepEqual(newTaskReactions({ ...next, context: 'demo:' + today }, next), []);
  assert.deepEqual(newTaskReactions({ ...next, context: 'real:2026-09-30' }, next), []);
});
test('each new completion has its own reaction and full completion comes last', () => {
  const data = logged(); data.weights = [{ id: 'w', date: today, pounds: 175, time: '14:00', source: { kind: 'manual' } }];
  assert.deepEqual(newTaskReactions(snapshot(emptyData()), snapshot(data)), ['workout', 'creatine', 'calories', 'weight', 'target', 'complete']);
  assert.deepEqual(newTaskReactions(snapshot(data), snapshot(data)), []);
});
test('an over-target calorie log earns a logging reaction, not a target or all-done celebration', () => {
  const data = logged(true);
  const previous = snapshot({ ...data, days: { [today]: { ...data.days[today], food: null } } });
  assert.deepEqual(newTaskReactions(previous, snapshot(data)), ['calories']);
});
test('editing a saved weight or an earlier day does not replay today’s reaction; clearing and re-entering does', () => {
  const data = logged(); data.weights = [{ id: 'w', date: today, pounds: 175, time: '14:00', source: { kind: 'manual' } }];
  const updated = { ...data, weights: [{ ...data.weights[0], pounds: 174 }], days: { ...data.days, '2026-09-30': { ...emptyDay('2026-09-30',1700), workout: true } } };
  assert.deepEqual(newTaskReactions(snapshot(data), snapshot(updated)), []);
  const cleared = { ...data, weights: [] };
  assert.deepEqual(newTaskReactions(snapshot(data), snapshot(cleared)), []);
  assert.deepEqual(newTaskReactions(snapshot(cleared), snapshot(data)), ['weight', 'complete']);
});
