// A cancellable countdown and a synchronous lock prevent duplicate shutter taps.
export function createCaptureSession() {
  let generation = 0;
  let busy = false;
  return {
    cancel() { generation++; },
    isBusy() { return busy; },
    async run(seconds: number, wait: () => Promise<void>, onTick: (remaining: number) => void, capture: (isCurrent: () => boolean) => Promise<void>) {
      if (busy) return;
      busy = true;
      const token = ++generation;
      try {
        for (let remaining = seconds; remaining > 0; remaining--) {
          if (token !== generation) return;
          onTick(remaining);
          await wait();
        }
        if (token !== generation) return;
        onTick(0);
        await capture(() => token === generation);
      } finally {
        busy = false;
        if (token === generation) onTick(0);
      }
    },
  };
}
