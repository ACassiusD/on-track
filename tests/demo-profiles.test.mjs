import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, validateStored } from '../src/domain/model.ts';
import { selectDemoProfile } from '../src/domain/demoProfiles.ts';
import { buddyStatus } from '../src/domain/buddy.ts';
const today='2026-10-01';
test('demo profiles reliably preview all five moods and getting started', () => { const state=initialState(today);for(const [profile,mood] of [['thriving','thriving'],['good','good'],['mixed','normal'],['low','low'],['bad','bad'],['new','unknown']]){const selected=selectDemoProfile(state,profile,today);assert.equal(buddyStatus(selected.demo,today).mood,mood);assert.equal(selected.mode,'demo');assert.equal(validateStored(JSON.parse(JSON.stringify(selected))).demoProfile,profile);}});
test('changing demo profiles preserves personal records, targets and theme',()=>{const state=initialState(today);state.target=1700;state.theme='Arcade Pop';state.real.weights.push({id:'mine',date:today,pounds:175});const selected=selectDemoProfile(state,'bad',today);assert.equal(selected.real,state.real);assert.equal(selected.target,1700);assert.equal(selected.theme,'Arcade Pop');assert.equal(selected.demo.weights.some(w=>w.id==='mine'),false);});
