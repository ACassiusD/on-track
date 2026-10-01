import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, emptyData, emptyDay } from '../src/domain/model.ts';
import { buddyStatus } from '../src/domain/buddy.ts';
const today = '2026-09-30';
function days(n, count=5) {
  const data=emptyData();
  for(let i=0;i<n;i++) {
    const date=addDays(today,-i);
    data.days[date]={...emptyDay(date,1700),workout:count>=1,creatine:count>=2,food:count>=3,calories:count>=3?count>=5?1600:1900:null};
    if(count>=4)data.weights.push({id:date,date,pounds:175,source:{kind:'manual'}});
  }
  return data;
}
test('first use introduces the pet and its habits, rather than a calorie-only score',()=>{
  const s=buddyStatus(emptyData(),today);
  assert.equal(s.mood,'unknown');assert.equal(s.label,'Meet your pet');assert.equal(s.possible,0);
  assert.match(s.hint,/happiness.*habits.*14 days.*today’s tasks/);
});
test('all five habits contribute equally and four checks usually mean happy',()=>{
  for(const [count,mood] of [[1,'bad'],[2,'low'],[3,'normal'],[4,'good'],[5,'thriving']]) {
    const s=buddyStatus(days(14,count),today);assert.equal(s.mood,mood);assert.equal(s.rate,count/5);
  }
});
test('calorie-only consistency cannot earn happy while other habits are missing',()=>{
  const data=days(14,0);for(const day of Object.values(data.days)){day.food=true;day.calories=1600;}
  assert.equal(buddyStatus(data,today).mood,'low');
});
test('the pet learns before happy or thriving and does not count pre-start empty days',()=>{
  assert.equal(buddyStatus(days(6),today).mood,'unknown');
  assert.equal(buddyStatus(days(7),today).mood,'normal');
  assert.equal(buddyStatus(days(10),today).mood,'good');
  assert.equal(buddyStatus(days(12),today).mood,'thriving');
  assert.equal(buddyStatus(days(1),today).possible,5);
});
test('future and stale activity do not inflate the mood; missed days after starting count',()=>{
  const data=days(14);delete data.days[addDays(today,-5)];data.weights=data.weights.filter(w=>w.date!==addDays(today,-5));
  const s=buddyStatus(data,today);assert.equal(s.possible,70);assert.equal(s.completed,65);
  const future=days(1);future.days[addDays(today,1)]=future.days[today];delete future.days[today];future.weights[0].date=addDays(today,1);
  assert.equal(buddyStatus(future,today).isNew,true);
  future.weights[0].date=addDays(today,-14);assert.equal(buddyStatus(future,today).isNew,true);
});
test('an unfinished today does not lower the mood before the day is finished',()=>{
  const data=days(14);const before=buddyStatus(data,today);
  data.days[today]=emptyDay(today,1700);data.weights=data.weights.filter(w=>w.date!==today);
  const s=buddyStatus(data,today);assert.equal(s.mood,before.mood);assert.equal(s.rate,1);assert.equal(s.assessedDays,13);assert.equal(s.todayPending,true);
});
test('one missed day preserves thriving; an over-target log still earns its own task',()=>{
  const data=days(14);const missed=addDays(today,-1);delete data.days[missed];data.weights=data.weights.filter(w=>w.date!==missed);
  assert.equal(buddyStatus(data,today).mood,'thriving');
  data.days[today].calories=1900;assert.equal(buddyStatus(data,today).totals.find(t=>t.label==='Calories logged').done,13);
  assert.equal(buddyStatus(data,today).totals.find(t=>t.label==='Within calorie target').done,12);
});
test('tips explain the weakest habit, including missing calorie targets',()=>{
  const data=days(14);Object.values(data.days).forEach(d=>{d.calories=1900;});
  assert.equal(buddyStatus(data,today).mood,'good');assert.match(buddyStatus(data,today).hint,/calorie target/);
  Object.values(data.days).forEach(d=>{d.target=null;});assert.match(buddyStatus(data,today).hint,/Set a calorie target in Goals/);
  const weight=days(14);weight.weights=[];assert.match(buddyStatus(weight,today).hint,/daily weight/);
});
test('weight values do not affect mood and duplicate readings earn one check',()=>{
  const data=days(14);const before=buddyStatus(data,today);
  data.weights.forEach(w=>w.pounds=300);data.weights.push({...data.weights[0],id:'extra',pounds:150});
  assert.equal(buddyStatus(data,today).rate,before.rate);
});
