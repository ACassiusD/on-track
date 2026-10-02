import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { authenticateWithApple } from '../src/cloud/appleFlow.ts';
function fixture() {
 const calls=[]; const nonce=randomBytes(32).toString('hex');
 return { calls, nonce, ports: { available:async()=>true, configured:async()=>true,
 random:async()=>nonce, sha256:async value=>createHash('sha256').update(value).digest('hex'),
 authorize:async hash=>{calls.push({hash});return {identityToken:'apple-signed-token'};},
 exchange:async(token,raw)=>{calls.push({token,raw});} } };
}
test('Apple receives only the hashed nonce; Supabase receives the original nonce and signed token',async()=> {
 const f=fixture(); assert.equal(await authenticateWithApple(f.ports),'signed-in');
 assert.equal(f.calls[0].hash,createHash('sha256').update(f.nonce).digest('hex')); assert.notEqual(f.calls[0].hash,f.nonce);
 assert.deepEqual(f.calls[1],{token:'apple-signed-token',raw:f.nonce});
});
test('unsupported builds and disabled providers cannot start Apple authorization or create accounts',async()=> {
 const f=fixture(); await assert.rejects(authenticateWithApple({...f.ports,available:async()=>false}),/supported iPhone/);
 await assert.rejects(authenticateWithApple({...f.ports,configured:async()=>false}),/not available yet/); assert.equal(f.calls.length,0);
});
test('Apple cancellation is harmless and does not exchange credentials',async()=> {
 const f=fixture(); const result=await authenticateWithApple({...f.ports,authorize:async()=>{throw {code:'ERR_REQUEST_CANCELED'};}});
 assert.equal(result,'cancelled'); assert.equal(f.calls.length,0);
});
test('missing Apple token and verification failure never report successful sign-in',async()=> {
 const f=fixture(); await assert.rejects(authenticateWithApple({...f.ports,authorize:async()=>({identityToken:null})}),/did not return/);assert.equal(f.calls.length,0);
 await assert.rejects(authenticateWithApple({...f.ports,exchange:async()=>{throw Error('Invalid nonce');}}),/Invalid nonce/);
});
test('authorization failure is surfaced rather than treated as cancellation',async()=> {
 const f=fixture();await assert.rejects(authenticateWithApple({...f.ports,authorize:async()=>{throw Error('Apple unavailable');}}),/Apple unavailable/);assert.equal(f.calls.length,0);
});
