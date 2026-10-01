import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyData, emptyDay, initialState, validateStored } from '../src/domain/model.ts';
import { taskScore, dailyTasks, taskSummary } from '../src/domain/dailyTasks.ts';
import { saveManualWeight } from '../src/domain/weightEntry.ts';
const today='2026-10-01';
test('without a calorie target, four tasks can complete but the fifth remains unknown', () => { const data=emptyData();data.days[today]={...emptyDay(today,null),calories:1700,food:true,workout:true,creatine:true};assert.equal(taskScore(data,today).count,3);const next=saveManualWeight(data,today,175,'14:00',today);assert.equal(taskScore(next,today).count,4);assert.equal(taskScore(next,today).tone,'yellow');assert.equal(taskSummary(next,today).completeDays,0);assert.equal(dailyTasks(next,today)[3].label,'Weight entered'); });
test('honest over-target logs keep task credit and weight from another date does not check off today', () => { const data=emptyData();data.days[today]={...emptyDay(today,1700),calories:2100,food:true,workout:true,creatine:true};const prior=saveManualWeight(data,'2026-09-30',175,'14:00',today);assert.equal(taskScore(prior,today).count,3);assert.equal(taskScore(prior,'2026-09-30').count,1); });
test('obvious misplaced-decimal weights cannot be saved', () => { assert.throws(()=>saveManualWeight(emptyData(),today,17543,'14:00',today),/decimal/);assert.throws(()=>saveManualWeight(emptyData(),today,17.5,'14:00',today)); });

test('removed themes migrate without losing saved logs', () => {
  for (const theme of ['Neon Arcade', 'Classic', 'Cozy Quest', 'Pocket Arcade']) {
    const saved=initialState(today);
    saved.theme=theme;
    saved.real.days[today]={...emptyDay(today,1700),calories:1800,food:true};
    const loaded=validateStored(saved);
    assert.equal(loaded.theme,'Default');
    assert.equal(loaded.real.days[today].calories,1800);
    assert.equal(loaded.real.days[today].food,true);
  }
});

test('five checks separate calorie logging from staying within target', () => {
  const data=emptyData();
  data.days[today]={...emptyDay(today,1700),calories:1800,food:true,workout:true,creatine:true};
  const over=saveManualWeight(data,today,175,'14:00',today);
  assert.equal(taskScore(over,today).count,4);
  assert.equal(taskScore(over,today).total,5);
  assert.equal(taskScore(over,today).tone,'yellow');
  assert.equal(dailyTasks(over,today)[2].value,true);
  assert.equal(dailyTasks(over,today)[4].value,false);
  assert.equal(taskSummary(over,today).completeDays,0);
  const within={...over,days:{...over.days,[today]:{...over.days[today],calories:1700}}};
  assert.equal(taskScore(within,today).count,5);
  assert.equal(taskScore(within,today).tone,'green');
  assert.equal(taskSummary(within,today).completeDays,1);
  const reopened={...within,days:{...within.days,[today]:{...within.days[today],food:null}}};
  assert.equal(taskScore(reopened,today).count,3);
  assert.equal(dailyTasks(reopened,today)[4].value,null);
});
