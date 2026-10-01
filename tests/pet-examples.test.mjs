import test from 'node:test';
import assert from 'node:assert/strict';
import { petExample } from '../src/domain/petExamples.ts';
import { initialState } from '../src/domain/model.ts';
test('every calendar example actually produces its advertised pet mood', () => {
  for(const mood of ['thriving','good','normal','low','bad']) {
    const example=petExample(mood);
    assert.equal(example.status.mood,mood);
    assert.equal(example.days.length,14);
    assert.equal(example.status.assessedDays,14);
    assert.equal(example.days.reduce((total,d)=>total+d.count,0),example.status.completed);
    assert.equal(example.status.possible,70);
    assert.ok(example.days.every(d=>d.count>=0&&d.count<=5));
  }
});
test('preview samples are fresh and never change real or demo records', () => {
  const state=initialState('2026-10-01');
  const before=JSON.stringify(state);
  const example=petExample('thriving');
  example.days[0].count=0;
  assert.equal(petExample('thriving').days[0].count,5);
  assert.equal(JSON.stringify(state),before);
});
test('lower-mood examples have distinct missed days while doing okay includes a full day', () => {
  const okay = petExample('normal');
  const care = petExample('low');
  const boost = petExample('bad');
  assert.equal(okay.days.filter(day => day.count === 0).length, 0);
  assert.ok(okay.days.some(day => day.count === 5 && day.tone === 'green'));
  assert.equal(care.days.filter(day => day.count === 0 && day.tone === 'grey').length, 1);
  assert.equal(boost.days.filter(day => day.count === 0 && day.tone === 'grey').length, 3);
  assert.ok(okay.status.rate > care.status.rate && care.status.rate > boost.status.rate);
});
