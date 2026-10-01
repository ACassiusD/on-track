import test from 'node:test';import assert from 'node:assert/strict';
import { initialState } from '../src/domain/model.ts';
import { validNativeAction,applyNativeAction } from '../src/domain/nativeActions.ts';
const action={id:'siri-1',date:'2026-09-30',kind:'creatine',value:true,at:'2026-10-01T01:00:00Z',timezone:'America/Toronto'};
test('native habit receipt is durable and idempotent, never confirms food',()=>{
 const s=initialState('2026-10-01');const next=applyNativeAction(s,action,'2026-10-01');assert.equal(next.real.days[action.date].creatine,true);assert.equal(next.real.days[action.date].food,null);assert.equal(next.real.days[action.date].sources[0].kind,'app-intent');assert.equal(applyNativeAction(next,action,'2026-10-01'),next);
});
test('demo, malformed and future native receipts cannot affect personal state',()=>{
 const s=initialState('2026-09-30');s.mode='demo';assert.equal(applyNativeAction(s,action,'2026-09-30'),s);assert.equal(validNativeAction({...action,date:'2026-02-30'},'2026-09-30'),false);assert.equal(validNativeAction({...action,kind:'food'},'2026-09-30'),false);assert.equal(validNativeAction({...action,date:'2026-10-01'},'2026-09-30'),false);
});
