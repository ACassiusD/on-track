import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, validateStored } from '../src/domain/model.ts';
import { defaultPets } from '../src/domain/defaultPets.ts';
import { buddyStatus } from '../src/domain/buddy.ts';
const today = '2026-10-02';
test('old and invalid pet preferences load safely without losing records', () => {
  for (const value of [undefined, null, 'obsolete-pet', 4]) {
    const state = initialState(today);
    state.defaultPet = value;
    const records = JSON.stringify(state.real);
    const loaded = validateStored(JSON.parse(JSON.stringify(state)));
    assert.equal(loaded.defaultPet, 'mochi');
    assert.equal(JSON.stringify(loaded.real), records);
  }
});
test('each chosen pet survives reload and theme changes without altering mood or records', () => {
  for (const pet of defaultPets) {
    const state = initialState(today);
    state.defaultPet = pet.id;
    state.mode = 'demo';
    const mood = buddyStatus(state.demo, today);
    const records = JSON.stringify([state.real, state.demo]);
    for (const theme of ['Default', 'Astral', 'Arcade Pop', 'Enchanted Forest', 'Heavenly Realm', 'Default']) {
      state.theme = theme;
      const loaded = validateStored(JSON.parse(JSON.stringify(state)));
      assert.equal(loaded.defaultPet, pet.id);
      assert.equal(JSON.stringify([loaded.real, loaded.demo]), records);
      assert.deepEqual(buddyStatus(loaded.demo, today), mood);
    }
  }
});
