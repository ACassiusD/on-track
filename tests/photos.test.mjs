import test from 'node:test';
import assert from 'node:assert/strict';
import { photoForDate } from '../src/domain/photos.ts';

test('photo dates stay independent when browsing empty days, selecting and deleting photos', () => {
  const photos = [
    { id: 'yesterday', date: '2026-09-30', uri: 'old.jpg', scale: 1.1, x: 4, y: 2 },
    { id: 'today', date: '2026-10-01', uri: 'new.jpg', scale: .95, x: -3, y: 0 },
  ];
  assert.equal(photoForDate(photos, '2026-09-01', 'today'), undefined);
  assert.equal(photoForDate(photos, '2026-09-30', 'today'), photos[0]);
  assert.equal(photoForDate(photos, '2026-10-01', 'yesterday'), photos[1]);
  const uploaded = { ...photos[0], id: 'backdated', date: '2026-09-01', uri: 'backdated.jpg' };
  const updated = [...photos, uploaded];
  assert.equal(photoForDate(updated, '2026-09-01'), uploaded);
  assert.equal(photoForDate(updated, '2026-10-01'), photos[1]);
  assert.equal(photoForDate(updated.filter(photo => photo.id !== 'today'), '2026-10-01'), undefined);
  assert.deepEqual(photos.map(photo => photo.date), ['2026-09-30', '2026-10-01']);
});
