import test from 'node:test';
import assert from 'node:assert/strict';
import { createCaptureSession } from '../src/photos/captureSession.ts';

test('rapid shutter taps produce one photo and one countdown',async()=>{
 const session=createCaptureSession();let resolve;let captures=0;const ticks=[];
 const waiting=new Promise(r=>resolve=r);
 const first=session.run(3,()=>waiting,n=>ticks.push(n),async()=>captures++);
 await session.run(3,()=>waiting,n=>ticks.push(n),async()=>captures++);
 resolve();await first;
 assert.equal(captures,1);assert.deepEqual(ticks,[3,2,1,0,0]);
});
test('closing or backgrounding during a countdown cancels capture',async()=>{
 const session=createCaptureSession();let resolve;let captures=0;
 const first=session.run(3,()=>new Promise(r=>resolve=r),()=>{},async()=>captures++);
 session.cancel();resolve();await first;assert.equal(captures,0);
 await session.run(0,async()=>{},()=>{},async()=>captures++);assert.equal(captures,1);
});
test('a failed camera call releases the shutter lock for retry',async()=>{
 const session=createCaptureSession();await assert.rejects(session.run(0,async()=>{},()=>{},async()=>{throw Error('camera failed')}));
 let captures=0;await session.run(0,async()=>{},()=>{},async()=>captures++);assert.equal(captures,1);
});
test('cancelled in-flight capture cannot be accepted or overlap another shutter call',async()=>{
 const session=createCaptureSession();let resolve;let accepted=0;let calls=0;
 const first=session.run(0,async()=>{},()=>{},async isCurrent=>{calls++;await new Promise(r=>resolve=r);if(isCurrent())accepted++;});
 session.cancel();await session.run(0,async()=>{},()=>{},async()=>calls++);assert.equal(calls,1);
 resolve();await first;assert.equal(accepted,0);
 await session.run(0,async()=>{},()=>{},async()=>calls++);assert.equal(calls,2);
});
