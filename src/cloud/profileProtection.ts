import type { State } from '../domain/model';
import { initialState } from '../domain/model.ts';
import { createBackup } from './snapshot.ts';

// Compare only restorable personal stats. Demo, photos and device preferences never
// trigger uploads, and every upload is an immutable recovery point.
export function profileSignature(state: State): string {
  const backup = createBackup({ ...state, mode: 'real' });
  return JSON.stringify({ real: backup.real, targets: backup.targets });
}
export function hasPersonalProfile(state: State): boolean {
  return Object.keys(state.real.days).length > 0 || state.real.weights.length > 0 ||
    state.real.confirmations.length > 0 || state.target !== null || state.goal !== null || state.milestones.length > 0;
}
export function needsAutomaticBackup(state: State, userId: string | undefined): boolean {
  return !!userId && state.cloudAutoBackup === true && state.cloudBackupOwner === userId && hasPersonalProfile(state) &&
    (state.cloudLastBackup?.ownerId !== userId || state.cloudLastBackup.signature !== profileSignature(state));
}
export function resetDevelopmentState(state: State, today: string): State {
  // Keep the entire personal dataset (including device photos), goals and account
  // protection. Only the development sandbox and app presentation are reset.
  return { ...initialState(today), mode: 'demo', real: state.real, target: state.target,
    goal: state.goal, milestones: state.milestones, weightUnit: state.weightUnit,
    weighInTime: state.weighInTime, cloudAutoBackup: state.cloudAutoBackup,
    cloudBackupOwner: state.cloudBackupOwner, cloudLastBackup: state.cloudLastBackup,
    notificationResponseIds: state.notificationResponseIds, nativeActionIds: state.nativeActionIds };
}
