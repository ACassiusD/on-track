import * as Notifications from 'expo-notifications';
import { router, useRootNavigationState } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { completeReminder, readPayload, reminderStillValid, snoozePlan } from '../domain/reminders';
import { ACTION_DONE, ACTION_LATER, ACTION_REVIEW, readPermission, registerCategories, requestPermission, schedule, syncSchedules } from '../native/localReminders';
import type { Permission } from '../native/localReminders';
import { useApp } from './AppStore';

type Status = { permission: Permission | null; count: number; through: string | null; error: string | null; refresh: () => Promise<void>; authorize: () => Promise<void> };
const Context = createContext<Status | null>(null);
export function ReminderStore({ children }: { children: React.ReactNode }) {
  const { state, ready, error: storageError, commit, today, getState } = useApp(); const navigation = useRootNavigationState();
  // Store functions read the authoritative ref and do not capture a state snapshot.
  const latest = useRef({ getState, commit });
  const queue = useRef(Promise.resolve());
  const [status, setStatus] = useState<Omit<Status, 'refresh' | 'authorize'>>({ permission: null, count: 0, through: null, error: null });
  const serial = useCallback((job: () => Promise<void>) => {
    const next = queue.current.then(job); queue.current = next.catch(() => { setStatus(s => ({ ...s, error: 'Reminders could not be updated. Reopen this screen to retry.' })); }); return next;
  }, []);
  const refresh = useCallback(() => serial(async () => {
    const permission = await readPermission();
    if (Platform.OS !== 'ios') { setStatus({ permission, count: 0, through: null, error: null }); return; }
    await registerCategories();
    const result = await syncSchedules(latest.current.getState(), permission.allowed);
    setStatus({ permission, ...result, error: null });
  }), [serial]);
  const authorize = useCallback(async () => { await requestPermission(); await refresh(); }, [refresh]);
  useEffect(() => {
    if (!ready || storageError || !navigation?.key) return;
    const handle = (response: Notifications.NotificationResponse) => { void serial(async () => {
      const request = response.notification.request; const payload = readPayload(request.content.data);
      if (!payload) return;
      const id = `${request.identifier}:${response.actionIdentifier}`; const current = latest.current.getState();
      if (current.notificationResponseIds?.includes(id)) { await Notifications.clearLastNotificationResponseAsync(); return; }
      const valid = reminderStillValid(current, payload, Intl.DateTimeFormat().resolvedOptions().timeZone);
      let destination: { pathname: '/calories' | '/day'; params: { date: string; audit?: string } } | null = null;
      if (valid) {
        if (response.actionIdentifier === ACTION_LATER) { const plan = snoozePlan(current, payload); if (plan && (await readPermission()).allowed) await schedule(plan); }
        else if (response.actionIdentifier === ACTION_DONE) { await latest.current.commit(s => completeReminder(s, payload)); }
        else if (response.actionIdentifier === ACTION_REVIEW || response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
          destination = payload.kind === 'food' ? { pathname: '/calories', params: { date: payload.date, audit: 'yes' } } : { pathname: '/day', params: { date: payload.date } };
        }
      }
      await latest.current.commit(s => ({ ...s, notificationResponseIds: [...(s.notificationResponseIds ?? []), id].slice(-256) }));
      await Notifications.dismissNotificationAsync(request.identifier); await Notifications.clearLastNotificationResponseAsync();
      if (destination) router.push(destination);
    }).then(refresh).catch(() => {}); };
    if (Platform.OS !== 'ios') return;
    Notifications.setNotificationHandler({ handleNotification: async notification => ({ shouldPlaySound: true, shouldSetBadge: false, shouldShowBanner: latest.current.getState().mode === 'real' && !!readPayload(notification.request.content.data), shouldShowList: latest.current.getState().mode === 'real' && !!readPayload(notification.request.content.data) }) });
    const listener = Notifications.addNotificationResponseReceivedListener(handle);
    const previous = Notifications.getLastNotificationResponse(); if (previous) handle(previous);
    return () => { listener.remove(); };
  }, [ready, storageError, navigation?.key, serial, refresh]);
  useEffect(() => { if (ready && !storageError) void refresh().catch(() => {}); }, [ready, storageError, state, today, refresh]);
  useEffect(() => { const listener = AppState.addEventListener('change', next => { if (next === 'active' && ready && !storageError) void refresh().catch(() => {}); }); return () => listener.remove(); }, [ready, storageError, refresh]);
  return <Context.Provider value={{ ...status, refresh, authorize }}>{children}</Context.Provider>;
}
export function useReminders() { const context = useContext(Context); if (!context) throw new Error('ReminderStore missing'); return context; }
