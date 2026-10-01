import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, validateStored } from '../src/domain/model.ts';
const today='2026-10-01';
test('new realms persist and the old fantasy selection migrates without losing data',()=>{
  for(const theme of ['Enchanted Forest','Heavenly Realm','Astral','Fantasy RPG']){
    const state=initialState(today);state.theme=theme;state.real.days[today]={date:today,calories:1700,food:true};
    const loaded=validateStored(JSON.parse(JSON.stringify(state)));
    assert.equal(loaded.theme,theme==='Fantasy RPG'?'Enchanted Forest':theme);
    assert.equal(loaded.real.days[today].calories,1700);
  }
});
