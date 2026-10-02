import test from 'node:test';
import assert from 'node:assert/strict';
import { TourNavigation } from '../src/domain/tourNavigation.ts';

test('rapid Next taps advance from the requested slide, ignoring intermediate scroll events', () => {
  const tour = new TourNavigation(5); const width = 390;
  for (const offset of [10, 80, 180, 420]) {
    tour.goTo(tour.page + 1);
    const destination = tour.page;
    tour.observePosition(offset, width);
    assert.equal(tour.page, destination);
    assert.equal(tour.transitioning, true);
  }
  for (let i = 0; i < 20; i++) tour.goTo(tour.page + 1);
  assert.equal(tour.page, 4);
  assert.equal(tour.transitioning, true);
  tour.observePosition(4 * width, width);
  assert.equal(tour.page, 4);
  assert.equal(tour.transitioning, false);
});
test('Back and dot taps retarget in-flight navigation and cannot overshoot either end', () => {
  const tour = new TourNavigation(5);
  tour.goTo(4); tour.goTo(tour.page - 1); tour.observePosition(390 * 4, 390);
  assert.equal(tour.page, 3); assert.equal(tour.transitioning, true);
  tour.goTo(1); tour.observePosition(390 * 3, 390);
  assert.equal(tour.page, 1);
  tour.observePosition(390, 390); assert.equal(tour.transitioning, false);
  tour.goTo(-50); tour.observePosition(0, 390);
  assert.equal(tour.page, 0); assert.equal(tour.transitioning, false);
  tour.goTo(50); tour.observePosition(390 * 4, 390);
  assert.equal(tour.page, 4); assert.equal(tour.transitioning, false);
});
test('dragging interrupts an animation and subsequent navigation starts from the visible slide', () => {
  const tour = new TourNavigation(5);
  tour.goTo(4); tour.beginDrag(390, 390);
  assert.equal(tour.page, 1); assert.equal(tour.transitioning, false);
  tour.observePosition(780, 390); assert.equal(tour.page, 2);
  tour.goTo(tour.page + 1); assert.equal(tour.page, 3);
  tour.observePosition(1170, 390); assert.equal(tour.transitioning, false);
});
test('missing final events can be settled and invalid coordinates never corrupt navigation', () => {
  const tour = new TourNavigation(5); tour.goTo(3); tour.settle();
  assert.equal(tour.page, 3); assert.equal(tour.transitioning, false);
  for (const [offset, width] of [[NaN, 390], [390, 0], [Infinity, 390], [390, NaN]]) tour.observePosition(offset, width);
  tour.goTo(NaN);
  assert.equal(tour.page, 3); assert.equal(tour.transitioning, false);
});
