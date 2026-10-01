import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewFacts, nextAction, chatGPTPrompt } from '../src/domain/coach.ts';
import { emptyData, emptyDay } from '../src/domain/model.ts';
test('review excludes future calendar cells and separates unknown from failure', () => {
 const d=emptyData(); d.days['2026-09-30']={...emptyDay('2026-09-30',1950),calories:1400};
 d.days['2026-10-01']={...emptyDay('2026-10-01',1950),calories:5000,food:true};
 const f=reviewFacts(d,'2026-09-30'); assert.equal(f.elapsedDays,10); assert.equal(f.overTarget,0); assert.equal(f.unknownTarget,10);
});
test('over-target honest log still counts completeness',()=>{
 const d=emptyData();d.days['2026-09-30']={...emptyDay('2026-09-30',1950),calories:2200,food:true};
 const f=reviewFacts(d,'2026-09-30'); assert.equal(f.foodComplete,1);assert.equal(f.overTarget,1);
});
test('review counts edits and distinct days independently',()=>{
 const d=emptyData();d.revisions=[{date:'2026-09-29',reason:'Forgotten food'},{date:'2026-09-29',reason:'Forgotten food'},{date:'2026-08-01',reason:'Forgotten food'}];
 const f=reviewFacts(d,'2026-09-30');assert.equal(f.revisions,2);assert.equal(f.revisedDays,1);assert.deepEqual(f.forgottenFoodDays,['2026-09-29']);assert.match(nextAction(f),/small bites/);assert.match(chatGPTPrompt(f),/Unknown means unreported/);
});
