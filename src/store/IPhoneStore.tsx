import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useApp } from './AppStore';
import { applyNativeAction, validNativeAction } from '../domain/nativeActions';
import { acknowledgeNativeActions, cancelResolvedReviewAlarms, getIPhoneStatus, publishNativeContext, readNativeActions } from '../native/iphone';

type Context = { available: boolean; error: string | null };
const Ctx = createContext<Context>({ available: false, error: null });
export function IPhoneStore({ children }: { children: React.ReactNode }) {
  const app = useApp();
  const latest = useRef(app);
  useEffect(() => { latest.current = app; }, [app]);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false); const retry = useRef(false); const mounted = useRef(true);
  const available = getIPhoneStatus().available;
  const reconcile = useCallback(async function reconcile() {
    if (!available || !latest.current.ready || latest.current.error) return;
    if (busy.current) { retry.current = true; return; }
    busy.current = true;
    try {
      const { today, getState, commit } = latest.current;
      await publishNativeContext(today, getState().mode);
      if (getState().mode === 'real') {
        const actions = await readNativeActions();
        const receipts = actions.filter(a => validNativeAction(a, today));
        if (receipts.some(a => !getState().nativeActionIds?.includes(a.id))) {
          await commit(s => receipts.reduce((next, action) => applyNativeAction(next, action, today), s));
        }
        // Acknowledge only receipts already saved locally. A failed durable commit
        // leaves the native inbox intact for replay after relaunch.
        if (getState().mode === 'real') await acknowledgeNativeActions(receipts.filter(a => getState().nativeActionIds?.includes(a.id)).map(a => a.id));
      }
      await cancelResolvedReviewAlarms(getState());
      if (getIPhoneStatus().widgetsAvailable) {
        const widgets = await import('../native/iphoneWidgets');
        widgets.publishIPhoneSnapshot(getState(), today);
        await widgets.syncEveningActivities(getState());
      }
      if (mounted.current) setError(null);
    } catch (e) {
      if (mounted.current) setError(e instanceof Error ? e.message : 'Could not update iPhone connections.');
    } finally {
      busy.current = false;
      if (retry.current && mounted.current) { retry.current = false; void reconcile(); }
    }
  }, [available]);
  useEffect(() => { mounted.current = true; const listener = AppState.addEventListener('change', status => { if (status === 'active') void reconcile(); }); return () => { mounted.current = false; listener.remove(); }; }, [reconcile]);
  useEffect(() => { const timer = setTimeout(() => { void reconcile(); }, 250); return () => clearTimeout(timer); }, [app.ready, app.state, app.today, reconcile]);
  return <Ctx.Provider value={{ available, error }}>{children}</Ctx.Provider>;
}
export function useIPhone() { return useContext(Ctx); }
