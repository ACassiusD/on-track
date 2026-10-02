// Native Apple credentials are exchanged with Supabase, which verifies the signed
// identity token and nonce before creating the same account session used by backups.
export type AppleFlowPorts = {
  available: () => Promise<boolean>;
  configured: () => Promise<boolean>;
  random: () => Promise<string>;
  sha256: (value: string) => Promise<string>;
  authorize: (hashedNonce: string) => Promise<{ identityToken: string | null }>;
  exchange: (token: string, nonce: string) => Promise<void>;
};
export async function authenticateWithApple(ports: AppleFlowPorts): Promise<'signed-in' | 'cancelled'> {
  if (!await ports.available()) throw new Error('Sign in with Apple requires a supported iPhone build.');
  if (!await ports.configured()) throw new Error('Apple sign-in is not available yet. You can use email for now.');
  const nonce = await ports.random();
  const hashedNonce = await ports.sha256(nonce);
  let credential;
  try { credential = await ports.authorize(hashedNonce); }
  catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ERR_REQUEST_CANCELED') return 'cancelled';
    throw error;
  }
  if (!credential.identityToken) throw new Error('Apple did not return a sign-in token. Please try again.');
  await ports.exchange(credential.identityToken, nonce);
  return 'signed-in';
}
