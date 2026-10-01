import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, emptyData, initialState, trend } from '../src/domain/model.ts';
import { weightRanges } from '../src/domain/weightRanges.ts';
import { trendSeries } from '../src/domain/progress.ts';
import { extendDemoHistory, selectDemoProfile } from '../src/domain/demoProfiles.ts';
const today='2026-10-01';
test('range averages exclude old and future dates and count each measured day equally',()=>{
  const data=emptyData();
  data.weights=[{date:today,pounds:170},{date:today,pounds:174},{date:addDays(today,-10),pounds:180},{date:addDays(today,-60),pounds:190},{date:addDays(today,1),pounds:100}];
  assert.deepEqual(trend(data.weights,today,7),{average:172,coverage:1});
  assert.deepEqual(trend(data.weights,today,14),{average:176,coverage:2});
  assert.equal(trend(data.weights,today,90).average,(172+180+190)/3);
});
test('populated demo profiles cover every requested window with believable weights',()=>{
  for(const profile of ['good','mixed','bad']){
    const state=selectDemoProfile(initialState(today),profile,today);
    for(const range of weightRanges){
      assert.equal(trend(state.demo.weights,today,range.days).coverage,range.days);
      assert.ok(trendSeries(state.demo,today,range.days).length>=range.days);
    }
    assert.ok(state.demo.weights.every(w=>w.pounds>150&&w.pounds<205));
  }
});
test('older demo installs gain history without replacing edits or changing real data',()=>{
  const state=selectDemoProfile(initialState(today),'good',today);
  state.demo.weights=state.demo.weights.filter(w=>w.date>=addDays(today,-27));
  state.demo.weights.at(-1).pounds=177.7;
  state.demo.days[today].calories=2500;
  const extended=extendDemoHistory(state,today);
  assert.equal(extended.real,state.real);
  assert.equal(extended.mode,state.mode);
  assert.equal(extended.demo.weights.at(-1).pounds,177.7);
  assert.equal(extended.demo.days[today].calories,2500);
  assert.equal(trend(extended.demo.weights,today,365).coverage,365);
  const empty=selectDemoProfile(state,'new',today);
  assert.equal(extendDemoHistory(empty,today),empty);
});
