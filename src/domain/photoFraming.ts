import type { Photo } from './model.ts';

// Positions are fractions of a fixed 3:4 portrait frame, never screen pixels.
export type PhotoFraming = { zoom: number; x: number; y: number };
export const ORIGINAL_FRAME: PhotoFraming = { zoom: 1, x: 0, y: 0 };
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
export function normalizeFraming(value: Partial<PhotoFraming> | undefined): PhotoFraming {
  const zoom = clamp(Number.isFinite(value?.zoom) ? value!.zoom! : 1, .5, 4);
  const limit = Math.min(1.5, (zoom - .5) / 2);
  return {
    zoom,
    x: clamp(Number.isFinite(value?.x) ? value!.x! : 0, -limit, limit),
    y: clamp(Number.isFinite(value?.y) ? value!.y! : 0, -limit, limit),
  };
}
export function photoFraming(photo: Photo, width = 360, height = 480): PhotoFraming {
  return normalizeFraming(photo.framing ?? { zoom: photo.scale, x: photo.x / width, y: photo.y / height });
}
export function portraitFrame(width: number, height: number) {
  const w = Math.min(width, height * .75);
  return { width: w, height: w / .75, left: (width - w) / 2, top: (height - w / .75) / 2 };
}
// Keep the image point under the pinch midpoint fixed while zooming.
export function zoomFraming(frame: PhotoFraming, zoom: number, anchorX = .5, anchorY = .5): PhotoFraming {
  const nextZoom = normalizeFraming({ zoom }).zoom;
  const ratio = nextZoom / frame.zoom;
  return normalizeFraming({ zoom: nextZoom, x: anchorX - .5 - (anchorX - .5 - frame.x) * ratio, y: anchorY - .5 - (anchorY - .5 - frame.y) * ratio });
}
export type FrameTouch = { pageX: number; pageY: number; locationX: number; locationY: number };
export function moveFraming(frame: PhotoFraming, before: FrameTouch[], after: FrameTouch[], width: number, height: number): PhotoFraming {
  if (!width || !height || !before.length || before.length !== after.length) return frame;
  const center = (touches: FrameTouch[]) => ({ x: touches.reduce((s, t) => s + t.pageX, 0) / touches.length, y: touches.reduce((s, t) => s + t.pageY, 0) / touches.length });
  const start = center(before), end = center(after);
  let next = frame;
  if (after.length === 2) {
    const distance = (t: FrameTouch[]) => Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY);
    const startDistance = distance(before);
    if (startDistance > 1) next = zoomFraming(frame, frame.zoom * distance(after) / startDistance, (before[0].locationX + before[1].locationX) / 2 / width, (before[0].locationY + before[1].locationY) / 2 / height);
  }
  return normalizeFraming({ ...next, x: next.x + (end.x - start.x) / width, y: next.y + (end.y - start.y) / height });
}
