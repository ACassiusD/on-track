import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

test('update setup rejects unlinked projects without altering config and rejects mismatched publish URLs', () => {
  const root = mkdtempSync(join(tmpdir(), 'on-track-updates-'));
  try {
    mkdirSync(join(root, 'scripts'));
    const script = join(root, 'scripts/configure-updates.mjs');
    copyFileSync(new URL('../scripts/configure-updates.mjs', import.meta.url), script);
    const config = join(root, 'app.json');
    const unlinked = JSON.stringify({ expo: { name: 'ON TRACK' } });
    writeFileSync(config, unlinked);
    assert.notEqual(spawnSync(process.execPath, [script]).status, 0);
    assert.equal(readFileSync(config, 'utf8'), unlinked);
    const id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    writeFileSync(config, JSON.stringify({ expo: { name: 'ON TRACK', extra: { eas: { projectId: id } }, updates: { url: 'https://u.expo.dev/wrong-project' }, runtimeVersion: { policy: 'appVersion' } } }));
    assert.notEqual(spawnSync(process.execPath, [script, '--check']).status, 0);
    assert.equal(spawnSync(process.execPath, [script]).status, 0);
    assert.equal(spawnSync(process.execPath, [script, '--check']).status, 0);
    const linked = JSON.parse(readFileSync(config, 'utf8'));
    assert.equal(linked.expo.updates.url, `https://u.expo.dev/${id}`);
    assert.equal(linked.expo.name, 'ON TRACK');
    assert.equal(linked.expo.runtimeVersion.policy, 'fingerprint');
  } finally { rmSync(root, { recursive: true, force: true }); }
});
