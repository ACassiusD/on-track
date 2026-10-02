import type { Photo, State } from './model.ts';
import { normalizeFraming, photoFraming, type PhotoFraming } from './photoFraming.ts';

export type PhotoAdjustment = { mode: State['mode']; photoId: string; referenceId?: string; target: 'reference' | 'photo'; frames: Record<string, PhotoFraming>; dirty: string[] };
export function beginPhotoAdjustment(mode: State['mode'], photo: Photo, reference: Photo | undefined, width: number, height: number): PhotoAdjustment {
  return { mode, photoId: photo.id, referenceId: reference?.id, target: 'photo', frames: Object.fromEntries([photo, ...(reference ? [reference] : [])].map(p => [p.id, photoFraming(p, width, height)])), dirty: [] };
}
export function adjustmentTarget(session: PhotoAdjustment): string { return session.target === 'reference' && session.referenceId ? session.referenceId : session.photoId; }
export function changePhotoAdjustment(session: PhotoAdjustment, frame: PhotoFraming): PhotoAdjustment {
  const id = adjustmentTarget(session);
  return { ...session, frames: { ...session.frames, [id]: normalizeFraming(frame) }, dirty: [...new Set([...session.dirty, id])] };
}
export function applyPhotoAdjustment(state: State, session: PhotoAdjustment): State {
  const data = state[session.mode];
  if (session.dirty.some(id => !data.photos.some(p => p.id === id))) throw new Error('An adjusted photo is no longer available.');
  return { ...state, [session.mode]: { ...data, photos: data.photos.map(p => session.dirty.includes(p.id) ? { ...p, framing: normalizeFraming(session.frames[p.id]) } : p) } };
}
