import { readFileSync, writeFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../app.json', import.meta.url), 'utf8'));
const id = config.expo.extra?.eas?.projectId;
if (typeof id !== 'string' || !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(id)) {
  throw new Error('Link your Expo account first: npx eas-cli@latest login, then npx eas-cli@latest init.');
}
const url = `https://u.expo.dev/${id}`;
if (process.argv.includes('--check')) {
  if (config.expo.updates?.url !== url || config.expo.runtimeVersion?.policy !== 'fingerprint') {
    throw new Error('Run npm run setup:updates and commit app.json before publishing or building.');
  }
} else {
  config.expo.runtimeVersion = { policy: 'fingerprint' };
  config.expo.updates = { ...config.expo.updates, url, checkAutomatically: 'ON_LOAD' };
  writeFileSync(new URL('../app.json', import.meta.url), JSON.stringify(config, null, 2) + '\n');
  console.log('EAS Update configured. Commit app.json before building the preview profile.');
}
