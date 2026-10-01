import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyDay, initialState, validateStored } from '../src/domain/model.ts';
const today = '2026-10-01';
test('new installs and development resets show the tour; completing or skipping survives reload', () => {
  const fresh = initialState(today);
  assert.equal(fresh.onboardingCompleted, false);
  const finished = validateStored(JSON.parse(JSON.stringify({ ...fresh, onboardingCompleted: true })));
  assert.equal(finished.onboardingCompleted, true);
  assert.deepEqual(finished.real, fresh.real);
  assert.equal(initialState(today).onboardingCompleted, false);
});
test('existing users migrate without an unsolicited tour while empty older installs get the introduction', () => {
  const unused = initialState(today); delete unused.onboardingCompleted;
  assert.equal(validateStored(unused).onboardingCompleted, false);
  for (const field of ['target', 'days', 'weights', 'photos']) {
    const used = initialState(today); delete used.onboardingCompleted;
    if (field === 'target') used.target = 1700;
    if (field === 'days') used.real.days[today] = { ...emptyDay(today, 1700), creatine: true };
    if (field === 'weights') used.real.weights.push({ date: today, pounds: 175 });
    if (field === 'photos') used.real.photos.push({ id: 'photo', date: today, uri: 'local-photo' });
    assert.equal(validateStored(used).onboardingCompleted, true, field);
  }
});
test('explicit onboarding state is preserved, and invalid flags cannot masquerade as completion', () => {
  const state = initialState(today); state.target = 1700;
  assert.equal(validateStored(state).onboardingCompleted, false);
  state.onboardingCompleted = 'yes'; state.target = null;
  assert.equal(validateStored(state).onboardingCompleted, false);
});
