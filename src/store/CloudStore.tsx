import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { useApp } from './AppStore';
import { supabase, cloudAvailable } from '../cloud/client';
import { deleteBackup, getBackup, listBackups, saveBackup } from '../cloud/repository';
import type { BackupRow } from '../cloud/repository';
import { backupSummary, createBackup, realSignature, restoreBackup, validateBackup } from '../cloud/snapshot';
import type { Backup, BackupSummary } from '../cloud/snapshot';
import { profileSignature, hasPersonalProfile, needsAutomaticBackup } from '../cloud/profileProtection';
import type { ReviewFacts } from '../domain/coach';
import { validateFacts } from '../../supabase/functions/_shared/coachHandler';
const RECOVERY_KEY = 'ontrack.cloud.local-recovery.v1';
export type RestorePreview = { id: string; capturedAt: string; summary: BackupSummary; local: boolean };
type Staged = { backup: Backup; signature: string; userId: string | null; preview: RestorePreview };
type Context = { available: boolean; session: Session | null; authReady: boolean; busy: boolean; status: string; error: string | null; backups: BackupRow[]; preview: RestorePreview | null; signIn: (email: string, password: string) => Promise<void>; signUp: (email: string, password: string) => Promise<void>; signOut: () => Promise<void>; refresh: () => Promise<void>; backupNow: () => Promise<void>; setAutomaticBackup: (enabled: boolean) => Promise<void>; previewLatest: () => Promise<void>; previewBackup: (id: string) => Promise<void>; previewRecovery: () => Promise<void>; cancelPreview: () => void; applyRestore: () => Promise<void>; removeBackup: (id: string) => Promise<void>; requestReview: (facts: ReviewFacts) => Promise<string> };
const Ctx = createContext<Context | null>(null);
export function CloudStore({ children }: { children: React.ReactNode }) {
  const app = useApp(); const appRef = useRef(app); const [session, setSession] = useState<Session | null>(null); const sessionRef = useRef(session); const [authReady, setAuthReady] = useState(!supabase); const [busy, setBusy] = useState(false); const lock = useRef(false); const [status, setStatus] = useState('Local records only'); const [error, setError] = useState<string | null>(null); const [backups, setBackups] = useState<BackupRow[]>([]); const [staged, setStaged] = useState<Staged | null>(null);
  useEffect(() => { appRef.current = app; }, [app]);
  const [retryTick, setRetryTick] = useState(0);
  useEffect(() => { const timer = setInterval(() => setRetryTick(tick => tick + 1), 30000); const sub = AppState.addEventListener('change', next => { if (next === 'active') setRetryTick(tick => tick + 1); }); return () => { clearInterval(timer); sub.remove(); }; }, []);
  useEffect(() => { if (!supabase) return; let alive = true;
    supabase.auth.getSession().then(({ data, error: e }) => { if (!alive) return; if (e) setError(e.message); sessionRef.current = data.session; setSession(data.session); setAuthReady(true); }).catch(() => { if (alive) { setError('Secure session could not be loaded. Sign in again when storage is available.'); setAuthReady(true); } });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => { if (!alive) return; const oldId = sessionRef.current?.user.id; sessionRef.current = next; setSession(next); if (oldId !== next?.user.id) { setBackups([]); setStaged(null); } });
    const refresh = (next: string) => { if (next === 'active') supabase?.auth.startAutoRefresh(); else supabase?.auth.stopAutoRefresh(); }; refresh(AppState.currentState); const sub = AppState.addEventListener('change', refresh);
    return () => { alive = false; listener.subscription.unsubscribe(); sub.remove(); supabase?.auth.stopAutoRefresh(); };
  }, []);
  async function run(task: () => Promise<void>) { if (lock.current) return; lock.current = true; setBusy(true); setError(null); try { await task(); } catch (e) { setError(e instanceof Error ? e.message : 'Cloud operation failed. Your local records are unchanged.'); setStatus('Action needs retry'); } finally { setBusy(false); lock.current = false; } }
  const requireClient = () => { if (!supabase) throw new Error('Cloud account requires secure native storage.'); return supabase; };
  const refresh = () => run(async () => { setStatus('Fetching backup list…'); const owner = sessionRef.current?.user.id; const rows = await listBackups(); if (owner !== sessionRef.current?.user.id) throw new Error('Account changed. Refresh again.'); setBackups(rows); setStatus('Cloud list refreshed'); });
  const signIn = (email: string, password: string) => run(async () => { setStatus('Signing in…'); const { error: e } = await requireClient().auth.signInWithPassword({ email: email.trim(), password }); if (e) throw e; setStatus('Signed in. Enable automatic backup to protect this profile.'); });
  const signUp = (email: string, password: string) => run(async () => { setStatus('Creating account…'); const { data, error: e } = await requireClient().auth.signUp({ email: email.trim(), password }); if (e) throw e; setStatus(data.session ? 'Account ready. Enable automatic backup to protect this profile.' : 'Check your confirmation email, then return here and sign in.'); });
  const signOut = () => run(async () => { const { error: e } = await requireClient().auth.signOut({ scope: 'local' }); if (e) throw e; setBackups([]); setStaged(null); setStatus('Signed out. Personal records remain on this device.'); });
  async function uploadPersonal(automatic: boolean) {
    const s = appRef.current.getState(); const owner = sessionRef.current?.user.id;
    if (!appRef.current.ready || appRef.current.error) throw new Error('Local storage must be ready before backing up.');
    if (!owner) throw new Error('Sign in first.');
    if (automatic && !needsAutomaticBackup(s, owner)) return;
    if (!automatic && s.mode !== 'real') throw new Error('Switch to personal mode before backing up.');
    const signature = profileSignature(s);
    const backup = createBackup({ ...s, mode: 'real' });
    setStatus('Saving personal stats to your account…');
    const saved = await saveBackup(backup, owner);
    if (owner !== sessionRef.current?.user.id || saved.owner_id !== owner) throw new Error('Account changed. Refresh your list before continuing.');
    // Store the exact uploaded version, so edits made during upload remain pending.
    await appRef.current.commit(current => {
      if (owner !== sessionRef.current?.user.id) throw new Error('Account changed during backup.');
      return { ...current, cloudLastBackup: { ownerId: owner, signature, at: saved.created_at } };
    });
    setBackups(rows => [saved, ...rows.filter(row => row.id !== saved.id)].slice(0, 30));
    setStatus('Personal stats backed up. Photos remain on this device.');
  }
  const backupNow = () => run(() => uploadPersonal(false));
  const setAutomaticBackup = (enabled: boolean) => run(async () => {
    const owner = sessionRef.current?.user.id; if (!owner) throw new Error('Sign in first.');
    if (enabled) {
      const rows = await listBackups();
      if (owner !== sessionRef.current?.user.id) throw new Error('Account changed.');
      setBackups(rows);
      if (rows.length && !hasPersonalProfile(appRef.current.getState())) throw new Error('Your account has saved stats. Restore a backup before enabling automatic backup on this empty device.');
    }
    await appRef.current.commit(s => {
      if (owner !== sessionRef.current?.user.id) throw new Error('Account changed.');
      return { ...s, cloudAutoBackup: enabled, cloudBackupOwner: owner };
    });
    setStatus(enabled ? 'Automatic backup enabled. Demo activity is excluded.' : 'Automatic backup paused. Existing cloud backups are kept.');
    if (enabled) await uploadPersonal(true);
  });
  const pendingBackup = app.ready && !app.error && needsAutomaticBackup(app.state, session?.user.id);
  const pendingSignature = pendingBackup ? profileSignature(app.state) : '';
  useEffect(() => {
    if (!authReady || !pendingBackup) return;
    const timer = setTimeout(() => {
      if (lock.current || AppState.currentState !== 'active' && AppState.currentState !== null) return;
      void run(() => uploadPersonal(true));
    }, 2500);
    return () => clearTimeout(timer);
    // Use the data version and retry clock, rather than function identities, so
    // status updates cannot repeatedly restart the debounce or upload loop.
  }, [authReady, pendingBackup, pendingSignature, session?.user.id, retryTick]);
  const previewBackup = (id: string) => run(async () => { const userId = sessionRef.current?.user.id; if (!userId) throw new Error('Sign in first.'); const backup = await getBackup(id, userId); if (userId !== sessionRef.current?.user.id) throw new Error('Account changed.'); const s = appRef.current.getState(); if (s.mode !== 'real') throw new Error('Switch to personal mode to restore.'); setStaged({ backup, signature: realSignature(s), userId, preview: { id, capturedAt: backup.capturedAt, summary: backupSummary(backup), local: false } }); setStatus('Preview ready. Nothing restored yet.'); });
  const previewLatest = () => run(async () => {
    const userId = sessionRef.current?.user.id; if (!userId) throw new Error('Sign in first.');
    const rows = await listBackups(); if (userId !== sessionRef.current?.user.id) throw new Error('Account changed.');
    setBackups(rows); if (!rows.length) throw new Error('No cloud backups yet.');
    const backup = await getBackup(rows[0].id, userId); if (userId !== sessionRef.current?.user.id) throw new Error('Account changed.');
    const s = appRef.current.getState(); if (s.mode !== 'real') throw new Error('Switch to personal mode to restore.');
    setStaged({ backup, signature: realSignature(s), userId, preview: { id: rows[0].id, capturedAt: backup.capturedAt, summary: backupSummary(backup), local: false } });
    setStatus('Latest backup ready to restore. Your local stats have not changed.');
  });
  const previewRecovery = () => run(async () => { const raw = await AsyncStorage.getItem(RECOVERY_KEY); if (!raw) throw new Error('No local recovery snapshot yet.'); const backup = validateBackup(JSON.parse(raw)); const s = appRef.current.getState(); if (s.mode !== 'real') throw new Error('Switch to personal mode to restore.'); setStaged({ backup, signature: realSignature(s), userId: null, preview: { id: 'local', capturedAt: backup.capturedAt, summary: backupSummary(backup), local: true } }); setStatus('Local recovery preview ready.'); });
  const applyRestore = () => run(async () => { if (!staged) throw new Error('Preview a snapshot first.'); if (!staged.preview.local && staged.userId !== sessionRef.current?.user.id) throw new Error('Account changed. Preview again.'); const before = appRef.current.getState(); restoreBackup(before, staged.backup, staged.signature); const recovery = createBackup(before); await AsyncStorage.setItem(RECOVERY_KEY, JSON.stringify(recovery));
    await appRef.current.commit(current => { if (!staged.preview.local && staged.userId !== sessionRef.current?.user.id) throw new Error('Account changed during restore.'); const restored = restoreBackup(current, staged.backup, staged.signature); return staged.preview.local ? restored : { ...restored, onboardingCompleted: true, cloudAutoBackup: true, cloudBackupOwner: staged.userId!, cloudLastBackup: { ownerId: staged.userId!, signature: profileSignature(restored), at: staged.backup.capturedAt } }; }); setStaged(null); setStatus('Real records restored. Device photos, themes, reminders and demo records preserved. Previous records saved locally for recovery.'); });
  const removeBackup = (id: string) => run(async () => { const owner = sessionRef.current?.user.id; await deleteBackup(id); if (owner !== sessionRef.current?.user.id) throw new Error('Account changed. Refresh again.'); await appRef.current.commit(s => ({ ...s, cloudLastBackup: s.cloudLastBackup?.ownerId === owner ? undefined : s.cloudLastBackup })); setBackups(rows => rows.filter(row => row.id !== id)); if (staged?.preview.id === id) setStaged(null); setStatus('Cloud snapshot deleted. Automatic backup will create a fresh recovery point if enabled.'); });
  const requestReview = async (facts: ReviewFacts): Promise<string> => { if (lock.current) throw new Error('Another cloud action is pending.'); if (appRef.current.getState().mode !== 'real') throw new Error('Cloud AI does not accept demo data.'); if (!sessionRef.current) throw new Error('Sign in before requesting cloud AI.'); const verified = validateFacts(facts); lock.current = true; setBusy(true); setError(null); setStatus('Requesting optional AI review…'); try { const { data, error: e } = await requireClient().functions.invoke('weekly-coach', { body: { mode: 'real', facts: verified } }); if (e) throw new Error('Cloud AI is unavailable or the request was rejected. Use the local review.'); if (typeof data?.review !== 'string') throw new Error('No review returned.'); setStatus('AI review received.'); return data.review; } catch (e) { setError(e instanceof Error ? e.message : 'AI review failed.'); setStatus('Local review remains available'); throw e; } finally { lock.current = false; setBusy(false); } };
  return <Ctx.Provider value={{ available: cloudAvailable, session, authReady, busy, status, error, backups, preview: staged?.preview ?? null, signIn, signUp, signOut, refresh, backupNow, setAutomaticBackup, previewLatest, previewBackup, previewRecovery, cancelPreview: () => setStaged(null), applyRestore, removeBackup, requestReview }}>{children}</Ctx.Provider>;
}
export function useCloud() { const value = useContext(Ctx); if (!value) throw new Error('CloudStore must be mounted inside AppStore.'); return value; }
