import test from 'node:test';
import assert from 'node:assert/strict';
import { moveFraming, normalizeFraming, photoFraming, portraitFrame, zoomFraming } from '../src/domain/photoFraming.ts';
import { initialState, validateStored } from '../src/domain/model.ts';

const touch = (x, y) => ({ pageX: x, pageY: y, locationX: x, locationY: y });
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);
test('saved framing keeps the same image position in thumbnails and larger comparisons', () => {
  const framing = { zoom: 2, x: .1, y: -.2 };
  for (const [width, height] of [[70, 78], [180, 240], [390, 507], [400, 300]]) {
    const box = portraitFrame(width, height);
    close(box.width / box.height, .75);
    // An original image point retains the same coordinates inside each portrait frame.
    const imagePoint = { x: .45, y: .65 };
    close(((imagePoint.x - .5) * framing.zoom + .5 + framing.x) * box.width / box.width, .5);
    close(((imagePoint.y - .5) * framing.zoom + .5 + framing.y) * box.height / box.height, .6);
    assert.ok(box.width <= width && box.height <= height);
  }
});
test('pinching keeps the image point under the fingers and dragging uses relative position', () => {
  const initial = { zoom: 1.5, x: .1, y: -.1 };
  const result = zoomFraming(initial, 3, .7, .6);
  close((.7 - .5 - initial.x) / initial.zoom, (.7 - .5 - result.x) / result.zoom);
  close((.6 - .5 - initial.y) / initial.zoom, (.6 - .5 - result.y) / result.zoom);
  const moved = moveFraming(initial, [touch(50, 50)], [touch(70, 90)], 200, 400);
  close(moved.x, .2); close(moved.y, 0); assert.equal(moved.zoom, 1.5);
  assert.deepEqual(moveFraming(initial, [touch(50, 50)], [touch(50, 50), touch(80, 80)], 200, 400), initial);
});
test('pinch distance controls zoom without a jump when finger count changes', () => {
  const result = moveFraming({ zoom: 1, x: 0, y: 0 }, [touch(75, 200), touch(125, 200)], [touch(50, 200), touch(150, 200)], 200, 400);
  assert.deepEqual(result, { zoom: 2, x: 0, y: 0 });
});
test('framing survives storage reload and matching a reference leaves the original unchanged', () => {
  const state = initialState('2026-10-02');
  const original = { id: 'photo', date: '2026-10-01', uri: 'original.jpg', scale: 1.2, x: 20, y: -15 };
  state.real.photos.push({ ...original, framing: { zoom: 2, x: .1, y: -.2 } });
  const loaded = validateStored(JSON.parse(JSON.stringify(state)));
  const matched = photoFraming(loaded.real.photos[0]);
  assert.deepEqual(matched, { zoom: 2, x: .1, y: -.2 });
  matched.x = 0;
  assert.equal(loaded.real.photos[0].framing.x, .1);
  assert.equal(loaded.real.photos[0].uri, original.uri);
  assert.equal(loaded.real.photos[0].scale, original.scale);
  assert.deepEqual(photoFraming(original, 200, 300), { zoom: 1.2, x: .1, y: -.05 });
});
test('malformed framing cannot produce invalid image transforms', () => {
  assert.deepEqual(normalizeFraming({ zoom: NaN, x: Infinity, y: NaN }), { zoom: 1, x: 0, y: 0 });
  assert.deepEqual(normalizeFraming({ zoom: 100, x: 100, y: -100 }), { zoom: 4, x: 1.5, y: -1.5 });
});
