import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyData, initialState, validateStored, trend } from '../src/domain/model.ts';
import { saveManualWeight } from '../src/domain/weightEntry.ts';
test('correcting a daily weight replaces the manual reading without changing Health samples', () => {
  const data = emptyData();
  data.weights.push({ id: 'health', date: '2026-09-30', pounds: 176, source: { kind: 'healthkit', id: 'sample', observedAt: '2026-09-30T18:00:00Z', timezone: 'America/Toronto' } });
  const first = saveManualWeight(data, '2026-09-30', 175, '14:00', '2026-09-30');
  const edited = saveManualWeight(first, '2026-09-30', 174, '14:10', '2026-09-30');
  assert.equal(edited.weights.length, 2);
  assert.equal(edited.weights.find(w => w.source.kind === 'manual').time, '14:10');
  assert.equal(trend(edited.weights, '2026-09-30').average, 175);
});
test('weight entry rejects impossible dates, future dates, invalid time and invalid weight', () => {
  for (const [date, pounds, time] of [['2026-02-30',175,'14:00'],['2026-10-01',175,'14:00'],['2026-09-30',0,'14:00'],['2026-09-30',175,'25:00'],['2026-09-30',NaN,'14:00']]) assert.throws(() => saveManualWeight(emptyData(), date, pounds, time, '2026-09-30'));
});
test('existing saved states migrate to a 2 pm weigh-in preference and keep valid changes', () => {
  const old = initialState('2026-09-30'); delete old.weighInTime;
  assert.equal(validateStored(old).weighInTime, '14:00');
  old.weighInTime = '13:30'; assert.equal(validateStored(old).weighInTime, '13:30');
});
