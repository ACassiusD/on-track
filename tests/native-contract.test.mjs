import test from 'node:test';
import assert from 'node:assert/strict';
import { isNativeAction, energyForDay } from '../src/native/iphoneContract.ts';
import { initialState, emptyDay } from '../src/domain/model.ts';
import { snapshotFor, shouldEndActivity, widgetTimelineFor } from '../src/native/iphoneWidgetContract.ts';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { groupIdentifier } = require('../plugins/with-on-track-iphone.js');

const action = { id: '9409AB42-02DC-4579-9527-F1206BB53B25', date: '2026-09-30', kind: 'creatine', value: true, at: '2026-09-30T23:00:00Z', timezone: 'America/Toronto' };
test('native actions accept only durable IDs and true habit actions on real dates', () => {
  assert.equal(isNativeAction(action), true);
  for (const change of [{ id: '../../file' }, { date: '2026-02-30' }, { kind: 'food' }, { value: false }, { at: 'bad' }]) assert.equal(isNativeAction({ ...action, ...change }), false);
});
test('calorie summary counts one selected source and deduplicates sample UUIDs', () => {
  const a = { id: 'a', start: '2026-09-30T12:00:00Z', end: '2026-09-30T13:00:00Z', kcal: 900, sourceBundleId: 'mfp', sourceName: 'MyFitnessPal' };
  const b = { ...a, id: 'b', kcal: 700 };
  const duplicateSource = { ...a, id: 'c', sourceBundleId: 'other' };
  const mapDate = iso => iso.slice(0, 10);
  assert.equal(energyForDay([a, a, b, duplicateSource], 'mfp', '2026-09-30', mapDate), 1600);
  assert.equal(energyForDay([], 'mfp', '2026-09-30', mapDate), null);
  assert.equal(energyForDay([{ ...a, kcal: 0 }], 'mfp', '2026-09-30', mapDate), 0);
});
test('widget dates retain saved targets and reset unknown tomorrow without inventing data', () => {
  const state = initialState('2026-09-30'); state.target = 1700;
  state.real.days['2026-09-30'] = { ...emptyDay('2026-09-30', 1950), calories: 1800, food: true };
  const now = new Date('2026-09-30T23:00:00Z');
  assert.equal(snapshotFor(state, '2026-09-30', now).target, 1950);
  assert.equal(snapshotFor(state, '2026-09-30', now).foodComplete, true);
  const next = snapshotFor(state, '2026-10-01', now);
  assert.equal(next.target, 1700); assert.equal(next.calories, null); assert.equal(next.creatine, null);
});
test('bounded evening checks end on completion, demo mode, expiry, or corrupt metadata', () => {
  const state = initialState('2026-09-30');
  const now = new Date('2026-09-30T23:00:00Z'); const future = '2026-10-01T01:00:00Z';
  assert.equal(shouldEndActivity(state, '2026-09-30', future, now), false);
  assert.equal(shouldEndActivity(state, '2026-09-30', 'bad', now), true);
  assert.equal(shouldEndActivity(state, '2026-09-30', '2026-09-30T22:00:00Z', now), true);
  state.real.days['2026-09-30'] = { ...emptyDay('2026-09-30', 1700), food: true };
  assert.equal(shouldEndActivity(state, '2026-09-30', future, now), true);
  state.mode = 'demo'; assert.equal(shouldEndActivity(state, '2026-09-29', future, now), true);
});
test('widget timelines contain property-list values on empty days and tomorrow', () => {
  const date = '2026-09-30'; const now = new Date(`${date}T23:00:00`);
  const state = initialState(date);
  const supportsPropertyList = value => {
    if (typeof value === 'string' || typeof value === 'boolean') return true;
    if (typeof value === 'number') return Number.isFinite(value);
    if (Array.isArray(value)) return value.every(supportsPropertyList);
    return value !== null && typeof value === 'object' && Object.values(value).every(supportsPropertyList);
  };
  // The original payload reproduced the failure even for a completely empty app.
  assert.equal(supportsPropertyList(snapshotFor(state, date, now)), false);
  for (const mode of ['real', 'demo']) {
    state.mode = mode;
    const timeline = widgetTimelineFor(state, date, now);
    assert.equal(timeline.length, 2);
    assert.equal(timeline[0].date.getTime(), now.getTime());
    assert.equal(timeline[1].date.getTime(), new Date('2026-10-01T00:00:00').getTime());
    for (const entry of timeline) assert.equal(supportsPropertyList(entry.props), true);
    const next = timeline[1].props;
    for (const key of ['calories', 'trend', 'workout', 'creatine']) {
      // Demo weight trends legitimately carry forward; no future answers do.
      if (key !== 'trend' || mode === 'real') assert.equal(key in next, false);
    }
    assert.equal(next.foodComplete, false);
  }
  assert.equal(state.real.days[date], undefined);
});
test('widget omission preserves zero, false, units and saved targets without mutating records', () => {
  const date = '2026-09-30'; const state = initialState(date);
  state.target = 1700; state.weightUnit = 'kg';
  state.real.days[date] = { ...emptyDay(date, 1950), calories: 0, workout: false, creatine: true };
  const before = JSON.stringify(state);
  const [current, next] = widgetTimelineFor(state, date);
  assert.equal(current.props.calories, 0);
  assert.equal(current.props.workout, false);
  assert.equal(current.props.creatine, true);
  assert.equal(current.props.foodComplete, false);
  assert.equal(current.props.target, 1950);
  assert.equal(current.props.weightUnit, 'kg');
  assert.equal('trend' in current.props, false);
  assert.equal(next.props.target, 1700);
  assert.equal('calories' in next.props, false);
  assert.equal(JSON.stringify(state), before);
});
test('native app group must be stable and match widget signing configuration', () => {
  assert.equal(groupIdentifier({ ios: { bundleIdentifier: 'com.acassiusd.ontrack' } }), 'group.com.acassiusd.ontrack');
  assert.throws(() => groupIdentifier({}), /requires/);
  assert.throws(() => groupIdentifier({}, { groupIdentifier: 'bad' }), /valid/);
});
