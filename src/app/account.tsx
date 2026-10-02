import React, { useState } from 'react';
import { Alert, Switch, Text, TextInput, View } from 'react-native';
import { AppleSignInButton } from '../components/AppleSignInButton';
import { useCloud } from '../store/CloudStore';
import { useApp } from '../store/AppStore';
import { needsAutomaticBackup } from '../cloud/profileProtection';
import { Button, Card, Label, Row, Screen } from '../components/UI';

export default function Account() {
  const cloud = useCloud(); const { state, update, palette: p } = useApp();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [showBackups, setShowBackups] = useState(false);
  const field = { minHeight: 48, padding: 12, borderColor: p.line, borderWidth: 1, borderRadius: 12, color: p.text, backgroundColor: p.bg, fontSize: 16 };
  const credentialsValid = email.includes('@') && password.length >= 8;
  const owner = cloud.session?.user.id;
  const enabled = !!owner && state.cloudAutoBackup === true && state.cloudBackupOwner === owner;
  const pending = needsAutomaticBackup(state, owner);
  const saved = state.cloudLastBackup?.ownerId === owner ? state.cloudLastBackup : undefined;
  return <Screen title="Your account">
    <Card>
      <Label>Your personal profile</Label>
      <Label small>Keep tracking while you develop. Personal and demo records are separate, and the development reset keeps your personal profile.</Label>
      <Row><Label>{Object.keys(state.real.days).length} logged days</Label><Label>{state.real.weights.length} weigh-ins</Label></Row>
      <Label small>{cloud.authReady ? cloud.session?.user.email ?? 'Sign in to protect your stats across installs.' : 'Loading your account…'}</Label>
      {state.mode === 'demo' ? <Button title="Switch to personal mode" onPress={() => update(s => ({ ...s, mode: 'real' }))} /> : null}
    </Card>
    {!cloud.available ? <Card><Label>Open the iPhone app to sign in.</Label><Label small>Your local tracking still works here.</Label></Card> : !cloud.session ? <Card>
      <Label>Sign in or create an account</Label>
      <AppleSignInButton busy={cloud.busy || !cloud.authReady} onPress={() => { void cloud.signInApple(); }} />
      <Label small>Email and password</Label>
      <TextInput accessibilityLabel="Email" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" placeholder="Email" placeholderTextColor={p.muted} value={email} onChangeText={setEmail} style={field} />
      <TextInput accessibilityLabel="Password" autoCapitalize="none" autoCorrect={false} secureTextEntry textContentType="password" placeholder="Password (at least 8 characters)" placeholderTextColor={p.muted} value={password} onChangeText={setPassword} style={field} />
      <Button title="Sign in" primary disabled={!credentialsValid || cloud.busy || !cloud.authReady} onPress={() => { void cloud.signIn(email, password).then(() => setPassword('')); }} />
      <Button title="Create account" disabled={!credentialsValid || cloud.busy || !cloud.authReady} onPress={() => { void cloud.signUp(email, password).then(() => setPassword('')); }} />
      <Label small>After signing in, turn on automatic backup. On a fresh install, restore your latest backup first.</Label>
    </Card> : <>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ flex: 1 }}><Label>Automatic backup</Label><Label small>Save personal stats after edits while the app is open. Demo activity is never uploaded.</Label></View><Switch accessibilityLabel="Automatic backup" value={enabled} disabled={cloud.busy} trackColor={{ false: p.grey, true: p.primary }} onValueChange={value => { void cloud.setAutomaticBackup(value); }} /></View>
        <Text accessibilityLiveRegion="polite" style={{ color: pending ? p.yellow : p.primary, fontSize: 13 }}>{pending ? 'Saved on this device · waiting for cloud backup' : saved ? `Last backup: ${new Date(saved.at).toLocaleString()}` : 'No backup from this device yet'}</Text>
        <Label small>Offline edits stay on this device and retry when you reopen the app or reconnect. Photos remain on this device; cloud backups cover your stats and goals.</Label>
        <Button title="Back up now" primary disabled={cloud.busy || state.mode !== 'real'} onPress={() => { void cloud.backupNow(); }} />
      </Card>
      <Card>
        <Label>Continue on a new install</Label>
        <Label small>Sign in with this account and restore your latest backup. Previous backups are kept, so you can recover an earlier version too.</Label>
        <Button title="Restore latest backup" primary disabled={cloud.busy || state.mode !== 'real'} onPress={() => { void cloud.previewLatest(); }} />
        <Button title={showBackups ? "Hide cloud backups" : "Show cloud backups"} disabled={cloud.busy} onPress={() => { setShowBackups(!showBackups); if (!showBackups) void cloud.refresh(); }} />
      </Card>
      {showBackups ? cloud.backups.map(row => <Card key={row.id}><Label>{new Date(row.captured_at).toLocaleString()}</Label><Label small>{row.summary.days} days · {row.summary.weights} weights · {row.summary.revisions} revisions</Label><Button title="Preview restore" disabled={cloud.busy || state.mode !== 'real'} onPress={() => { void cloud.previewBackup(row.id); }} /><Button title="Delete snapshot" disabled={cloud.busy} onPress={() => Alert.alert('Delete cloud snapshot?', 'This permanently removes this backup. Local records are unchanged.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { void cloud.removeBackup(row.id); } }])} /></Card>) : null}
      <Button title="Sign out on this device" disabled={cloud.busy} onPress={() => { void cloud.signOut(); }} />
    </>}
    {cloud.available ? <Card><Label small>{cloud.status}</Label>{cloud.error ? <Text accessibilityRole="alert" style={{ color: p.red }}>{cloud.error}</Text> : null}</Card> : null}
    <Button title="Preview last local recovery" disabled={cloud.busy || state.mode !== 'real'} onPress={() => { void cloud.previewRecovery(); }} />
    {cloud.preview ? <Card><Label>{cloud.preview.local ? 'Local recovery' : 'Restore preview'}</Label><Label small>{new Date(cloud.preview.capturedAt).toLocaleString()}</Label><Label>{cloud.preview.summary.days} days · {cloud.preview.summary.weights} weights</Label><Label small>Replaces personal stats and goals. Existing records are saved locally for recovery; photos stay on this device. Restoring a cloud backup also enables automatic backup for this account.</Label><Row><Button title="Cancel" disabled={cloud.busy} onPress={cloud.cancelPreview} /><Button title="Restore this snapshot" primary disabled={cloud.busy} onPress={() => Alert.alert('Restore personal profile?', 'Replace your current personal stats with this backup? Your current stats are saved locally for recovery.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Restore', onPress: () => { void cloud.applyRestore(); } }])} /></Row></Card> : null}
  </Screen>;
}
