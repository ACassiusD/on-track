import test from 'node:test';
import assert from 'node:assert/strict';
import { displayedWeight, storedWeight, formatWeight, parseWeightInput } from '../src/domain/weightUnits.ts';
import { initialState, validateStored, emptyData } from '../src/domain/model.ts';
import { saveManualWeightInUnit } from '../src/domain/weightEntry.ts';
import { snapshotFor } from '../src/native/iphoneWidgetContract.ts';
import { shareSummary } from '../src/domain/progress.ts';

test('kg entry converts once and equivalent lb readings produce the same weight', () => {
  const date='2026-10-01';
  const kg=saveManualWeightInUnit(emptyData(),date,'80','14:00',date,'kg');
  assert.ok(Math.abs(kg.weights[0].pounds-176.36980975)<.00001);
  assert.equal(formatWeight(kg.weights[0].pounds,'kg'),'80.0');
  const lb=saveManualWeightInUnit(emptyData(),date,String(kg.weights[0].pounds),'14:00',date,'lb');
  assert.equal(lb.weights[0].pounds,kg.weights[0].pounds);
  assert.equal(parseWeightInput('80,5','kg'),storedWeight(80.5,'kg'));
  for(const input of ['', ' ', '0', '-80', '0x50', '8e1', '80kg', 'Infinity']) assert.throws(()=>parseWeightInput(input,'kg'));
  assert.throws(()=>saveManualWeightInUnit(emptyData(),date,'800','14:00',date,'kg'),/kg/);
});
test('switching units changes presentation without changing readings or goals', () => {
  const date='2026-10-01'; const state=initialState(date); state.goal=165; state.milestones=[170];
  state.real=saveManualWeightInUnit(state.real,date,'175.4','14:00',date,'lb');
  const original=JSON.stringify({weights:state.real.weights,goal:state.goal,milestones:state.milestones});
  for(let i=0;i<20;i++){state.weightUnit=i%2?'lb':'kg';assert.equal(JSON.stringify({weights:state.real.weights,goal:state.goal,milestones:state.milestones}),original);}
  delete state.weightUnit;assert.equal(validateStored(state).weightUnit,'lb');
  state.weightUnit='kg';assert.equal(validateStored(state).weightUnit,'kg');
  assert.equal(formatWeight(175.4,'kg'),'79.6');
  assert.ok(Math.abs(storedWeight(displayedWeight(175.4,'kg'),'kg')-175.4)<1e-10);
});
test('widgets and sharing label converted numbers with the selected unit', () => {
  const date='2026-10-01';const state=initialState(date);state.weightUnit='kg';
  state.real=saveManualWeightInUnit(state.real,date,'80','14:00',date,'kg');
  const snapshot=snapshotFor(state,date,new Date('2026-10-01T18:00:00Z'));
  assert.equal(snapshot.weightUnit,'kg');assert.equal(snapshot.trend,80);
  assert.match(shareSummary(state.real,state,date),/80\.0 kg/);
});
