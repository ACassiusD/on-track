// Keep the requested slide authoritative while an animated scroll passes other
// slides. Scroll events describe position, not a new navigation request.
export class TourNavigation {
  private current = 0;
  private destination: number | null = null;
  private readonly count: number;
  constructor(count: number) {
    if (!Number.isInteger(count) || count < 1) throw new Error('A tour needs at least one slide.');
    this.count = count;
  }
  get page() { return this.current; }
  get transitioning() { return this.destination !== null; }
  goTo(page: number) {
    if (!Number.isFinite(page)) return;
    const next = Math.max(0, Math.min(this.count - 1, Math.round(page)));
    if (next === this.current) return;
    this.current = next;
    this.destination = next;
  }
  observePosition(offset: number, width: number) {
    if (!Number.isFinite(offset) || !Number.isFinite(width) || width <= 0) return;
    if (this.destination !== null && Math.abs(offset - this.destination * width) > 1) return;
    this.current = Math.max(0, Math.min(this.count - 1, Math.round(offset / width)));
    this.destination = null;
  }
  beginDrag(offset: number, width: number) {
    this.destination = null;
    this.observePosition(offset, width);
  }
  settle() { this.destination = null; }
}
