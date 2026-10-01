import type { Photo } from './model.ts';

// A date with no photo must stay empty, rather than borrowing another day's image.
export function photoForDate(photos: Photo[], date: string, preferredId: string | null = null): Photo | undefined {
  const matching = photos.filter(photo => photo.date === date);
  return matching.find(photo => photo.id === preferredId) ?? matching[matching.length - 1];
}
