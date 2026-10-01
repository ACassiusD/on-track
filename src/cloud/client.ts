import 'react-native-url-polyfill/auto';
import { createClient, processLock } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './config';
import { secureChunkStorage } from './secureChunks';
export const cloudAvailable = Platform.OS === 'ios' || Platform.OS === 'android';
const storage = secureChunkStorage({
  getItem: key => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }),
  removeItem: key => SecureStore.deleteItemAsync(key),
});
const timeoutFetch: typeof fetch = async (input, init) => { const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 25000); const original = init?.signal; const abort = () => controller.abort(); original?.addEventListener('abort', abort); if (original?.aborted) controller.abort(); try { return await fetch(input, { ...init, signal: controller.signal }); } finally { clearTimeout(timer); original?.removeEventListener('abort', abort); } };
// Do not use localStorage/AsyncStorage for refresh tokens. Cloud account is native-only.
export const supabase = cloudAvailable ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { global: { fetch: timeoutFetch }, auth: { storage, storageKey: 'ontrack.supabase.session', autoRefreshToken: true, persistSession: true, detectSessionInUrl: false, lock: processLock } }) : null;
