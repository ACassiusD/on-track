import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { DataSet, State, activeTarget, initialState, localDate, validateStored } from '../domain/model';
import { extendDemoHistory } from '../domain/demoProfiles';
import { themes } from '../components/themes';
const KEY = 'on-track:state:v1';
type Context = { getState: () => State; state: State; data: DataSet; target: number | null; today: string; ready: boolean; error: string | null; commit: (fn: (s: State) => State) => Promise<void>; update: (fn: (s: State) => State) => void; updateData: (fn: (d: DataSet) => DataSet) => void; palette: typeof themes['Neon Arcade'] };
const Ctx = createContext<Context | null>(null);
export function AppStore({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialState); const current = useRef(state); const [ready, setReady] = useState(false); const [error, setError] = useState<string | null>(null); const [today, setToday] = useState(localDate()); const queue = useRef(Promise.resolve()); const loadFailed = useRef(false); const hydrated = useRef(false);
  useEffect(() => { AsyncStorage.getItem(KEY).then(raw => { if (raw) { current.current = extendDemoHistory(validateStored(JSON.parse(raw)), localDate()); setState(current.current); } hydrated.current = true; setReady(true); }).catch(() => { loadFailed.current = true; setError('Saved data could not be loaded. Existing data has not been overwritten. Restart to retry.'); setReady(true); }); }, []);
  useEffect(() => { const refresh = () => setToday(localDate()); const timer = setInterval(refresh, 30000); const listener = AppState.addEventListener('change', status => { if (status === 'active') refresh(); }); return () => { clearInterval(timer); listener.remove(); }; }, []);
  const commit = (fn: (s: State) => State): Promise<void> => {
    if (!hydrated.current || loadFailed.current) return Promise.reject(new Error('Storage is unavailable.'));
    const job = queue.current.then(async () => { const next = fn(current.current); await AsyncStorage.setItem(KEY, JSON.stringify(next)); current.current = next; setState(next); setError(null); });
    queue.current = job.catch(() => { setError('Could not save changes. They were not applied. Retry your last action.'); }); return job;
  };
  const update = (fn: (s: State) => State) => { void commit(fn).catch(() => {}); };
  const updateData = (fn: (d: DataSet) => DataSet) => update(s => ({ ...s, [s.mode]: fn(s[s.mode]) }));
  return <Ctx.Provider value={{ getState: () => current.current, state, data: state[state.mode], target: activeTarget(state), today, ready, error, commit, update, updateData, palette: themes[state.theme] }}>{children}</Ctx.Provider>;
}
export function useApp() { const value = useContext(Ctx); if (!value) throw new Error('AppStore is missing.'); return value; }
