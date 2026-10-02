import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import type { SupabaseClient } from '@supabase/supabase-js';
import { authenticateWithApple } from './appleFlow';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config';

export const appleSignInAvailable = async () => Platform.OS === 'ios' && await AppleAuthentication.isAvailableAsync();
async function appleProviderConfigured(): Promise<boolean> {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_PUBLISHABLE_KEY }, signal: controller.signal });
    if (!response.ok) throw new Error('Could not check Apple sign-in. Check your connection and try again.');
    const settings = await response.json(); return settings.external?.apple === true;
  } finally { clearTimeout(timer); }
}
export function signInWithApple(client: SupabaseClient) {
  return authenticateWithApple({
    available: appleSignInAvailable,
    configured: appleProviderConfigured,
    random: async () => Array.from(await Crypto.getRandomBytesAsync(32), value => value.toString(16).padStart(2, '0')).join(''),
    sha256: nonce => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce),
    authorize: nonce => AppleAuthentication.signInAsync({ nonce, requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL] }),
    exchange: async (token, nonce) => {
      const { data, error } = await client.auth.signInWithIdToken({ provider: 'apple', token, nonce });
      if (error) throw error;
      if (!data.session) throw new Error('Apple sign-in did not create a session. Please try again.');
    },
  });
}
