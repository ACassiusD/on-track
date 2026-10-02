import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState } from '../src/domain/model.ts';
import { applyPhotoAdjustment, beginPhotoAdjustment, changePhotoAdjustment } from '../src/domain/photoAdjustment.ts';

const ref = { id: 'reference', date: '2026-10-01', uri: 'ref.jpg', scale: 1, x: 0, y: 0, framing: { zoom: 1.5, x: .1, y: -.1 } };
const photo = { id: 'photo', date: '2026-10-02', uri: 'photo.jpg', scale: 1, x: 0, y: 0, framing: { zoom: 1.5, x: 0, y: 0 } };
test('inline drafts adjust both photos independently and do not touch stored framing before Done', () => {
  const state = initialState('2026-10-02'); state.real.photos = [ref, photo];
  let session = beginPhotoAdjustment('real', photo, ref, 300, 400);
  session = changePhotoAdjustment(session, { zoom: 2, x: .05, y: -.1 });
  session = changePhotoAdjustment({ ...session, target: 'reference' }, { zoom: 1.7, x: -.1, y: .2 });
  assert.deepEqual(state.real.photos, [ref, photo]);
  const saved = applyPhotoAdjustment(state, session);
  assert.deepEqual(saved.real.photos[0].framing, { zoom: 1.7, x: -.1, y: .2 });
  assert.deepEqual(saved.real.photos[1].framing, { zoom: 2, x: .05, y: -.1 });
  assert.equal(saved.real.photos[0].uri, ref.uri);
  assert.equal(saved.real.photos[1].uri, photo.uri);
});
test('saving a bound demo draft keeps personal photos and unrelated new photos intact', () => {
  const state = initialState('2026-10-02'); state.real.photos = [ref]; state.demo.photos = [photo];
  const session = changePhotoAdjustment(beginPhotoAdjustment('demo', photo, undefined, 300, 400), { zoom: 2, x: .1, y: 0 });
  state.mode = 'real'; state.demo.photos.push({ ...photo, id: 'later' });
  const saved = applyPhotoAdjustment(state, session);
  assert.equal(saved.real.photos[0], ref);
  assert.equal(saved.demo.photos[1], state.demo.photos[1]);
  assert.deepEqual(saved.demo.photos[0].framing, session.frames.photo);
});
test('untouched legacy framing is preserved and deleted photos cannot silently accept adjustments', () => {
  const state = initialState('2026-10-02'); const legacy = { ...ref, framing: undefined, x: 20, scale: 1.2 }; state.real.photos = [legacy, photo];
  const session = changePhotoAdjustment(beginPhotoAdjustment('real', photo, legacy, 300, 400), { zoom: 1.6, x: 0, y: 0 });
  assert.equal(applyPhotoAdjustment(state, session).real.photos[0], legacy);
  state.real.photos = [legacy];
  assert.throws(() => applyPhotoAdjustment(state, session), /no longer available/);
});
