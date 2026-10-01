export type SecurePort = { getItem: (key: string) => Promise<string | null>; setItem: (key: string, value: string) => Promise<void>; removeItem: (key: string) => Promise<void> };
const CHUNK_LENGTH = 400; // Worst-case UTF-8 remains below historical Keychain size limits.
const MAX_CHUNKS = 256;
type Manifest = { version: 1; generation: string; count: number };
function baseKey(key: string): string { return `ontrack.auth.${key.replace(/[^a-zA-Z0-9._-]/g, '_')}`; }
function parseManifest(raw: string | null): Manifest | null { if (!raw) return null; const m = JSON.parse(raw) as Manifest; if (m.version !== 1 || !/^[a-zA-Z0-9_-]+$/.test(m.generation) || !Number.isInteger(m.count) || m.count < 0 || m.count > MAX_CHUNKS) throw new Error('Invalid secure session manifest.'); return m; }
export function secureChunkStorage(port: SecurePort) {
  let queue = Promise.resolve();
  const serial = <T>(fn: () => Promise<T>): Promise<T> => { const result = queue.then(fn); queue = result.then(() => {}, () => {}); return result; };
  async function cleanup(base: string, manifest: Manifest | null) { if (!manifest) return; await Promise.allSettled(Array.from({ length: manifest.count }, (_, i) => port.removeItem(`${base}.${manifest.generation}.${i}`))); }
  return {
    getItem: (key: string) => serial(async () => { const base = baseKey(key); const manifest = parseManifest(await port.getItem(base)); if (!manifest) return null; const chunks = await Promise.all(Array.from({ length: manifest.count }, (_, i) => port.getItem(`${base}.${manifest.generation}.${i}`))); if (chunks.some(c => c === null)) throw new Error('Secure session incomplete. Sign in again.'); return chunks.join(''); }),
    setItem: (key: string, value: string) => serial(async () => { const base = baseKey(key); const old = parseManifest(await port.getItem(base)); const count = Math.ceil(value.length / CHUNK_LENGTH); if (count > MAX_CHUNKS) throw new Error('Session is too large for secure storage.'); const manifest: Manifest = { version: 1, generation: `${Date.now()}_${Math.random().toString(36).slice(2)}`, count }; try { for (let i = 0; i < count; i++) await port.setItem(`${base}.${manifest.generation}.${i}`, value.slice(i * CHUNK_LENGTH, (i + 1) * CHUNK_LENGTH)); await port.setItem(base, JSON.stringify(manifest)); } catch (error) { await cleanup(base, manifest); throw error; } await cleanup(base, old); }),
    removeItem: (key: string) => serial(async () => { const base = baseKey(key); const old = parseManifest(await port.getItem(base)); await port.removeItem(base); await cleanup(base, old); }),
  };
}
