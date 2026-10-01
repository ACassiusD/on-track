import { useRef, useState } from 'react';
import * as Updates from 'expo-updates';
import { Text } from 'react-native';
import { useApp } from '../store/AppStore';
import { Button, Card, Label } from './UI';

export const isTestingBuild = Updates.channel === 'testing';
export function TestUpdateCard() {
  const { commit, palette } = useApp();
  const { isUpdatePending } = Updates.useUpdates();
  const [phase, setPhase] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const running = useRef(false);
  if (__DEV__ || !isTestingBuild || !Updates.isEnabled) return null;
  const update = async () => {
    if (running.current) return;
    running.current = true; setError(''); setMessage(''); setPhase('Checking…');
    try {
      const result = await Updates.checkForUpdateAsync();
      if (result.isAvailable) {
        setPhase('Downloading…');
        await Updates.fetchUpdateAsync();
      } else if (!isUpdatePending) {
        setMessage('Latest compatible test version installed. Native changes may require a new build.');
        return;
      }
      setPhase('Restarting…');
      // Wait for any earlier record writes before restarting the JS application.
      await commit(s => s);
      await Updates.reloadAsync();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not get the update. Try again.'); }
    finally { running.current = false; setPhase(''); }
  };
  return <Card>
    <Label>Test version</Label>
    <Button title={phase || 'Get latest test version'} disabled={Boolean(phase)} onPress={() => { void update(); }} />
    <Label small>Downloads the latest compatible changes and restarts the app.</Label>
    <Label small>{Updates.updateId ? `Version ${Updates.updateId.slice(0, 8)}` : 'Original test build'}</Label>
    {message ? <Text accessibilityLiveRegion="polite" style={{ color: palette.muted, fontSize: 12 }}>{message}</Text> : null}
    {error ? <Text accessibilityRole="alert" style={{ color: palette.red, fontSize: 12 }}>{error}</Text> : null}
  </Card>;
}
