import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { appleSignInAvailable } from '../cloud/appleSignIn';
export function AppleSignInButton({ busy, onPress }: { busy: boolean; onPress: () => void }) {
  const [available, setAvailable] = useState(false);
  useEffect(() => { let alive = true; void appleSignInAvailable().then(value => { if (alive) setAvailable(value); }).catch(() => {}); return () => { alive = false; }; }, []);
  if (!available) return null;
  return <View pointerEvents={busy ? 'none' : 'auto'} accessibilityState={{ disabled: busy }} style={{ opacity: busy ? .5 : 1 }}>
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
      cornerRadius={12}
      style={{ width: '100%', height: 50 }}
      onPress={() => { if (!busy) onPress(); }}
    />
  </View>;
}
