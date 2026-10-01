import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState } from '../src/domain/model.ts';
import { applyGoalSetup, parseCalorieTarget, parseGoalWeight } from '../src/domain/goalSetup.ts';
import { storedWeight, weightInput } from '../src/domain/weightUnits.ts';
const base=()=>initialState('2026-10-01');
test('calorie targets accept whole positive totals or an explicit unset value',()=>{
  assert.equal(parseCalorieTarget(' 1700 '),1700);
  assert.equal(parseCalorieTarget(''),null);
  for(const input of ['1700.5','1e3','0','-1700','NaN','0x100','9007199254740992'])assert.throws(()=>parseCalorieTarget(input));
});
test('weight goals convert chosen units once and keep existing canonical precision',()=>{
  const original=175.12345;
  assert.equal(parseGoalWeight(weightInput(original,'kg'),'kg',original),original);
  assert.equal(parseGoalWeight('75,5','kg'),storedWeight(75.5,'kg'));
  assert.equal(parseGoalWeight('','lb',original),null);
  assert.throws(()=>parseGoalWeight('-1','lb'));
});
test('finishing setup changes preferences atomically while preserving recorded data and milestone weights',()=>{
  const state=base();state.goal=175.12345;state.milestones=[180.456,178.123];
  const next=applyGoalSetup(state,{target:'1700',goal:weightInput(state.goal,'kg'),unit:'kg',milestones:[...state.milestones,state.milestones[0]],time:'14:00'});
  assert.equal(next.target,1700);assert.equal(next.goal,state.goal);assert.equal(next.weightUnit,'kg');
  assert.deepEqual(next.milestones,state.milestones);
  assert.equal(next.real,state.real);assert.equal(next.demo,state.demo);
  assert.equal(state.target,null);assert.equal(state.weightUnit,'lb');
});
test('optional goals and milestones can be left unset without blocking setup',()=>{
  const state=base();const next=applyGoalSetup(state,{target:'',goal:'',unit:'lb',milestones:[],time:'09:30'});
  assert.equal(next.target,null);assert.equal(next.goal,null);assert.deepEqual(next.milestones,[]);assert.equal(next.weighInTime,'09:30');
  for(const change of [{time:'25:00'},{milestones:[NaN]},{goal:'bad'}])assert.throws(()=>applyGoalSetup(state,{target:'1700',goal:'',unit:'lb',milestones:[],time:'14:00',...change}));
});
