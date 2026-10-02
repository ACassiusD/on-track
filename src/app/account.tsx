import React, { useState } from 'react';
import { Alert, Pressable, Switch, Text, TextInput, View } from 'react-native';
import { AppleSignInButton } from '../components/AppleSignInButton';
import { useCloud } from '../store/CloudStore';
import { useApp } from '../store/AppStore';
import { needsAutomaticBackup } from '../cloud/profileProtection';
import { Button, Screen } from '../components/UI';

export default function Account() {
  const cloud = useCloud();
  const { state, update, palette: p } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showBackups, setShowBackups] = useState(false);
  const owner = cloud.session?.user.id;
  const enabled = !!owner && state.cloudAutoBackup === true && state.cloudBackupOwner === owner;
  const pending = needsAutomaticBackup(state, owner);
  const saved = owner && state.cloudLastBackup?.ownerId === owner ? state.cloudLastBackup : undefined;
  const field = { minHeight: 48, padding: 12, borderColor: p.line, borderWidth: 1, borderRadius: 12, color: p.text, backgroundColor: p.bg, fontSize: 16 };
  const panel = { padding: 18, gap: 14, backgroundColor: p.tile, borderColor: p.line, borderWidth: 1, borderRadius: 18 };
  const heading = { color: p.text, fontSize: 18, fontWeight: '600' as const };
  const detail = { color: p.muted, fontSize: 14, lineHeight: 21 };
  const disclosure = (title: string, expanded: boolean, onPress: () => void) => <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={onPress} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><Text style={{ color: p.primary, fontSize: 15, fontWeight: '600', flexShrink: 1 }}>{title}</Text><Text style={{ color: p.muted, fontSize: 18 }}>{expanded ? '−' : '+'}</Text></Pressable>;
  const busy = cloud.busy || !cloud.authReady;
  return <Screen title="Account & backup">
    {state.mode === 'demo' ? <View style={panel}><Text style={heading}>You’re trying sample data</Text><Text style={detail}>Your personal entries are kept separately.</Text><Button title="Use my own data" onPress={() => update(s => ({ ...s, mode: 'real' }))} /></View> : null}
    <View style={panel}>
      <Text style={heading}>Saved on this device</Text>
      <Text style={detail}>Auto-saved. No account needed.</Text>
      {Object.keys(state.real.days).length || state.real.weights.length ? <Text style={{ color: p.text, fontSize: 14 }}>{Object.keys(state.real.days).length} logged days · {state.real.weights.length} weigh-ins</Text> : null}
      <View style={{ borderTopWidth: 1, borderTopColor: p.line, paddingTop: 14 }}><Text style={detail}>Photos stay local. Never uploaded.</Text></View>
    </View>
    <View style={panel}>
      <Text style={heading}>{owner ? 'Cloud backup' : 'Cloud backup (optional)'}</Text>
      {!owner ? <>
        <Text style={detail}>Back up your stats and goals.</Text>
        {!cloud.available ? <Text style={detail}>Cloud sign-in is available in the mobile app.</Text> : <>
          <AppleSignInButton busy={busy} onPress={() => { void cloud.signInApple(); }} />
          {disclosure('Use email instead', showEmail, () => setShowEmail(!showEmail))}
          {showEmail ? <View style={{ gap: 12 }}>
            <Text style={{ color: p.text, fontSize: 16, fontWeight: '600' }}>{creating ? 'Create an account' : 'Sign in with email'}</Text>
            <TextInput accessibilityLabel="Email" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" placeholder="Email" placeholderTextColor={p.muted} value={email} onChangeText={setEmail} style={field} />
            <TextInput accessibilityLabel="Password" autoCapitalize="none" autoCorrect={false} secureTextEntry textContentType={creating ? 'newPassword' : 'password'} placeholder={creating ? 'Password (8+ characters)' : 'Password'} placeholderTextColor={p.muted} value={password} onChangeText={setPassword} style={field} />
            <Button title={creating ? 'Create account' : 'Sign in'} primary disabled={!email.includes('@') || password.length < 8 || busy} onPress={() => { void (creating ? cloud.signUp(email, password) : cloud.signIn(email, password)); }} />
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => setCreating(!creating)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: p.primary, fontSize: 14 }}>{creating ? 'Already have an account? Sign in' : 'New here? Create an account'}</Text></Pressable>
          </View> : null}
        </>}
      </> : <>
        <Text style={detail}>{cloud.session?.user.email ?? 'Signed in'}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ flex: 1, gap: 4 }}><Text style={{ color: p.text, fontSize: 16, fontWeight: '600' }}>Automatic backup</Text><Text style={detail}>Stats and goals only. Photos stay local.</Text></View><Switch accessibilityLabel="Automatic backup" value={enabled} disabled={cloud.busy} trackColor={{ false: p.grey, true: p.primary }} onValueChange={value => { void cloud.setAutomaticBackup(value); }} /></View>
        <Text accessibilityLiveRegion="polite" style={detail}>{enabled ? pending ? 'Changes saved locally · waiting for backup' : saved ? `Last backup: ${new Date(saved.at).toLocaleString()}` : 'Your first backup is pending' : saved ? `Backup paused · last saved ${new Date(saved.at).toLocaleString()}` : 'Backup is off · entries still save on this device'}</Text>
        <Text style={detail}>Have a backup? Restore it first.</Text>
        <Button title="Restore saved stats" disabled={cloud.busy || state.mode !== 'real'} onPress={() => { void cloud.previewLatest(); }} />
      </>}
      {cloud.available && (cloud.error || cloud.busy || cloud.status !== 'Local records only') ? <View style={{ borderTopWidth: 1, borderTopColor: p.line, paddingTop: 12, gap: 6 }}>{!cloud.error ? <Text accessibilityLiveRegion="polite" style={detail}>{cloud.status}</Text> : <Text accessibilityRole="alert" style={{ ...detail, color: p.red }}>{cloud.error}</Text>}</View> : null}
    </View>
    <View style={panel}>
      {disclosure('How it works', showHelp, () => setShowHelp(!showHelp))}
      {showHelp ? <View style={{ gap: 10 }}>
        <Text style={detail}>Tracking saves on this device without an account. Signing in keeps your entries and leaves cloud backup off until you enable it.</Text>
        <Text style={detail}>Cloud backups contain stats and goals, never photo files. After a reinstall, sign in and restore your backup.</Text>
        <Text style={detail}>Deleting the app can remove local data and photos. Normal updates keep them.</Text>
      </View> : null}
      {disclosure('More options', showOptions, () => setShowOptions(!showOptions))}
      {showOptions ? <View style={{ gap: 12 }}>
        {owner ? <>
          <Button title="Back up now" disabled={cloud.busy || state.mode !== 'real'} onPress={() => { void cloud.backupNow(); }} />
          {disclosure('Earlier cloud backups', showBackups, () => { setShowBackups(!showBackups); if (!showBackups) void cloud.refresh(); })}
          {showBackups && cloud.backups.length === 0 ? <Text style={detail}>No cloud backups yet.</Text> : null}
          {showBackups ? cloud.backups.map(row => <View key={row.id} style={{ gap: 10, borderTopWidth: 1, borderTopColor: p.line, paddingTop: 12 }}><Text style={{ color: p.text, fontSize: 15 }}>{new Date(row.captured_at).toLocaleString()}</Text><Text style={detail}>{row.summary.days} days · {row.summary.weights} weigh-ins</Text><Button title="Preview restore" disabled={cloud.busy || state.mode !== 'real'} onPress={() => { void cloud.previewBackup(row.id); }} /><Button title="Delete backup" disabled={cloud.busy} onPress={() => Alert.alert('Delete cloud backup?', 'This permanently removes this backup. Local records are unchanged.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { void cloud.removeBackup(row.id); } }])} /></View>) : null}
        </> : null}
        <Button title="Recover previous local stats" disabled={cloud.busy || state.mode !== 'real'} onPress={() => { void cloud.previewRecovery(); }} />
        <Text style={detail}>Local recovery can undo a previous restore or development reset. It cannot recover data after deleting the app.</Text>
        {owner ? <Button title="Sign out" disabled={cloud.busy} onPress={() => { void cloud.signOut(); }} /> : null}
      </View> : null}
    </View>
    {cloud.preview ? <View style={panel}><Text style={heading}>{cloud.preview.local ? 'Local recovery' : 'Restore preview'}</Text><Text style={detail}>{new Date(cloud.preview.capturedAt).toLocaleString()}</Text><Text style={{ color: p.text, fontSize: 16 }}>{cloud.preview.summary.days} days · {cloud.preview.summary.weights} weigh-ins</Text><Text style={detail}>This replaces your personal stats and goals. We save your current stats locally for recovery. Your photos stay unchanged.{cloud.preview.local ? '' : ' Restoring also turns on automatic backup for this account.'}</Text><Button title="Restore these stats" primary disabled={cloud.busy} onPress={() => Alert.alert('Restore personal stats?', 'Replace your current stats with this backup? Your current stats will be saved locally for recovery.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Restore', onPress: () => { void cloud.applyRestore(); } }])} /><Button title="Cancel" disabled={cloud.busy} onPress={cloud.cancelPreview} /></View> : null}
  </Screen>;
}
