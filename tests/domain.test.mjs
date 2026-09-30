import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, confirmFood, emptyData, emptyDay, initialState, localDate, score, setCalories, trend, twoWeeks, upsertWeight, validateStored, withinTarget } from '../src/domain/model.ts';
test('fixed weeks advance on Monday, including year boundary', () => {
  assert.deepEqual(twoWeeks('2026-09-30'), Array.from({length:14}, (_,i) => addDays('2026-09-21',i)));
  assert.equal(twoWeeks('2026-10-04')[0], '2026-09-21');
  assert.equal(twoWeeks('2026-10-05')[0], '2026-09-28');
  assert.equal(twoWeeks('2027-01-04')[0], '2026-12-28');
});
test('date arithmetic across DST uses calendar days', () => {
  assert.equal(addDays('2026-03-08',1), '2026-03-09');
  assert.equal(addDays('2026-11-01',-1), '2026-10-31');
  assert.equal(localDate(new Date(2026,8,30,23,59)), '2026-09-30');
  assert.equal(localDate(new Date(2026,9,1,0,1)), '2026-10-01');
});
test('low partial total never earns target check; high total can fail', () => {
  const d = {...emptyDay('2026-09-30',1950),calories:1400}; assert.equal(withinTarget(d), null);
  assert.equal(withinTarget({...d, calories:2200}),false);
  assert.equal(withinTarget({...d,food:true}),true);
});
test('four independent checks distinguish unknown and reported zero', () => {
  const d=emptyDay('2026-09-30',1950); assert.deepEqual(score(d), {count:0,tone:'grey'});
  assert.deepEqual(score({...d,calories:2200,food:false,workout:false,creatine:false}), {count:0,tone:'red'});
  assert.deepEqual(score({...d,calories:1400,food:true,workout:true,creatine:true}),{count:4,tone:'green'});
  assert.deepEqual(score({...d,calories:2200,food:true,workout:true,creatine:true}),{count:3,tone:'yellow'});
});
test('confirmed over-target keeps logging success; revisions immutable and reopen check', () => {
  let d=setCalories(emptyData(),'2026-09-30',1950,2200,'Unspecified'); d=confirmFood(d,'2026-09-30',1950);
  assert.equal(score(d.days['2026-09-30']).count,1); const original=d.confirmations[0];
  d=setCalories(d,'2026-09-30',1950,2250,'Forgotten food'); assert.equal(d.days['2026-09-30'].food,null);assert.equal(d.revisions[0].confirmationId,original.id);
  d=setCalories(d,'2026-09-30',1950,2300,'Ate afterward');assert.equal(d.revisions.length,2);assert.equal(new Set(d.revisions.map(r=>r.date)).size,1);assert.equal(d.revisions[0].oldTotal,2200);assert.equal(original.total,2200);
  d=confirmFood(d,'2026-09-30',1950); assert.equal(d.confirmations.length,2);
});
test('empty real mode survives storage serialization; demo does not leak', () => {
  const s=validateStored(JSON.parse(JSON.stringify(initialState('2026-09-30')))); assert.equal(s.mode,'real');assert.equal(s.target,null);assert.deepEqual(s.real,emptyData());assert.ok(s.demo.weights.length);assert.throws(()=>validateStored({version:2}));
});
test('source identity replaces imported weight without double-counting', () => {
  const source={kind:'healthkit',id:'sample1',observedAt:'2026-09-30T20:00:00Z',timezone:'America/Toronto'};
  const reading={id:'one',date:'2026-09-30',pounds:175,source}; let d=upsertWeight(emptyData(),reading);d=upsertWeight(d,{...reading,pounds:174});assert.equal(d.weights.length,1);assert.equal(trend(d.weights,'2026-09-30').average,174);assert.equal(trend(d.weights,'2026-09-30').coverage,1);
});
test('trend coverage counts days, averages repeat readings per day', () => {
  const source={kind:'manual',id:'x',observedAt:'',timezone:'America/Toronto'};
  const weights=[{id:'1',date:'2026-09-30',pounds:174,source},{id:'2',date:'2026-09-30',pounds:176,source},{id:'3',date:'2026-09-29',pounds:173,source},{id:'4',date:'2026-09-01',pounds:190,source}];assert.deepEqual(trend(weights,'2026-09-30'),{average:174,coverage:2});assert.deepEqual(trend([],'2026-09-30'),{average:null,coverage:0});
});
test('photo review survives hydration and legacy v1 adds empty history', () => {
  const s=initialState('2026-09-30');s.real.photoReviewedDates.push('2026-09-30');const restored=validateStored(JSON.parse(JSON.stringify(s)));assert.deepEqual(restored.real.photoReviewedDates,['2026-09-30']);const old=JSON.parse(JSON.stringify(s));delete old.real.photoReviewedDates;assert.deepEqual(validateStored(old).real.photoReviewedDates,[]);
});
