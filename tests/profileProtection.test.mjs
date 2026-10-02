import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, emptyDay, validateStored } from '../src/domain/model.ts';
import { createBackup, restoreBackup, realSignature } from '../src/cloud/snapshot.ts';
import { profileSignature, needsAutomaticBackup, resetDevelopmentState } from '../src/cloud/profileProtection.ts';
const today='2026-10-02';
function profile() { const s=initialState(today); s.real.days[today]={...emptyDay(today,1950),calories:1500}; s.cloudAutoBackup=true; s.cloudBackupOwner='personal'; return s; }
test('backup protection binds to the chosen account and ignores empty profiles',()=> {
 const s=profile(); assert.equal(needsAutomaticBackup(s,'personal'),true); assert.equal(needsAutomaticBackup(s,'other'),false); assert.equal(needsAutomaticBackup(s,undefined),false);
 s.cloudAutoBackup=false; assert.equal(needsAutomaticBackup(s,'personal'),false);
 const blank={...initialState(today),cloudAutoBackup:true,cloudBackupOwner:'personal'}; assert.equal(needsAutomaticBackup(blank,'personal'),false);
});
test('demo activity, appearance and device photos cannot change the cloud personal profile',()=> {
 const s=profile(); const signature=profileSignature(s); s.cloudLastBackup={ownerId:'personal',signature,at:'2026-10-02T12:00:00Z'};
 s.mode='demo'; s.demo.days[today].calories=999; s.theme='astral'; s.real.photos.push({id:'photo',date:today,uri:'file:///personal.jpg',scale:1,x:0,y:0});
 assert.equal(profileSignature(s),signature); assert.equal(needsAutomaticBackup(s,'personal'),false);
 s.real.days[today].calories=1600; assert.equal(needsAutomaticBackup(s,'personal'),true);
});
test('edits made during an upload remain pending after that uploaded version is recorded',()=> {
 const s=profile(); const uploaded=profileSignature(s); s.real.days[today].calories=1600;
 s.cloudLastBackup={ownerId:'personal',signature:uploaded,at:'2026-10-02T12:00:00Z'};
 assert.equal(needsAutomaticBackup(s,'personal'),true);
 s.cloudLastBackup.signature=profileSignature(s); assert.equal(needsAutomaticBackup(s,'personal'),false);
});
test('development reset and storage reload preserve personal records and backup protection',()=> {
 const s=profile(); s.real.photos.push({id:'photo',date:today,uri:'file:///personal.jpg',scale:1,x:0,y:0}); s.target=1950; s.goal=160; s.milestones=[170]; s.onboardingCompleted=true;
 s.cloudLastBackup={ownerId:'personal',signature:profileSignature(s),at:'2026-10-02T12:00:00Z'}; s.demo.days[today].calories=999;
 const reset=validateStored(JSON.parse(JSON.stringify(resetDevelopmentState(s,today))));
 assert.deepEqual(reset.real,s.real); assert.equal(reset.target,s.target); assert.equal(reset.goal,s.goal); assert.deepEqual(reset.milestones,s.milestones);
 assert.equal(reset.mode,'demo'); assert.equal(reset.onboardingCompleted,false); assert.deepEqual(reset.cloudLastBackup,s.cloudLastBackup); assert.equal(needsAutomaticBackup(reset,'personal'),false); assert.notEqual(reset.demo.days[today].calories,999);
});
test('a fresh install can restore personal stats while keeping its own demo and photos',()=> {
 const original=profile(); original.goal=160; const fresh=initialState(today); const restored=restoreBackup(fresh,createBackup(original),realSignature(fresh));
 assert.deepEqual(restored.real,original.real); assert.equal(restored.goal,160); assert.deepEqual(restored.demo,fresh.demo);
});
test('old installs and malformed backup preferences stay off until explicitly enabled',()=> {
 const old=validateStored(JSON.parse(JSON.stringify(initialState(today)))); assert.equal(old.cloudAutoBackup,false);
 const invalid=validateStored({...old,cloudAutoBackup:'yes',cloudBackupOwner:7,cloudLastBackup:{ownerId:'personal',signature:7,at:'bad'}});
 assert.equal(invalid.cloudAutoBackup,false); assert.equal(invalid.cloudBackupOwner,undefined); assert.equal(invalid.cloudLastBackup,undefined);
});
test('a new local-only profile saves stats without an account and keeps photos out of cloud backups',()=> {
 const fresh=initialState(today);
 assert.equal(fresh.mode,'real');
 fresh.real.days[today]={...emptyDay(today,1950),calories:1500};
 fresh.real.photos.push({id:'private-photo',date:today,uri:'file:///private-progress.jpg',scale:1,x:0,y:0});
 const reopened=validateStored(JSON.parse(JSON.stringify(fresh)));
 assert.equal(reopened.real.days[today].calories,1500);
 assert.equal(reopened.real.photos[0].uri,'file:///private-progress.jpg');
 assert.equal(needsAutomaticBackup(reopened,undefined),false);
 assert.equal(needsAutomaticBackup(reopened,'new-account'),false);
 const backup=createBackup(reopened);
 assert.deepEqual(backup.real.photos,[]);
 assert.equal(backup.photosIncluded,false);
 assert.equal(JSON.stringify(backup).includes('private-progress'),false);
});
