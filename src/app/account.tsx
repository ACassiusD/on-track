import React, { useState } from 'react';
import { Alert, Pressable, Switch, Text, TextInput, View } from 'react-native';
import { AppleSignInButton } from '../components/AppleSignInButton';
import { useCloud } from '../store/CloudStore';
import { useApp } from '../store/AppStore';
import { needsAutomaticBackup } from '../cloud/profileProtection';
import { Screen } from '../components/UI';
import Svg, { Path } from 'react-native-svg';

function Button({ title, onPress, primary = false, disabled = false }: { title: string; onPress: () => void; primary?: boolean; disabled?: boolean }) {
  const { palette: p } = useApp();
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => ({ minHeight: 46, padding: 12, borderRadius: 12, backgroundColor: primary ? p.primary : p.grey, opacity: disabled ? .45 : pressed ? .7 : 1, alignItems: 'center', justifyContent: 'center' })}><Text style={{ color: primary ? p.bg : p.text, fontSize: 15, fontWeight: '600' }}>{title}</Text></Pressable>;
}

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
  const panel = { padding: 18, gap: 16, backgroundColor: p.tile, borderColor: `${p.line}70`, borderWidth: 1, borderRadius: 16 };
  const heading = { color: p.text, fontSize: 17, fontWeight: '600' as const };
  const detail = { color: p.muted, fontSize: 13, lineHeight: 19 };
  const icon = (path: string, size = 20, color = p.primary) => <Svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><Path d={path} /></Svg>;
  const disclosure = (title: string, expanded: boolean, onPress: () => void) => <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ expanded }} onPress={onPress} style={({ pressed }) => ({ minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, opacity: pressed ? .6 : 1 })}><Text style={{ color: p.text, fontSize: 14, flexShrink: 1 }}>{title}</Text>{icon(expanded ? 'm5 15 7-7 7 7' : 'm9 5 7 7-7 7', 16, p.muted)}</Pressable>;
  const busy = cloud.busy || !cloud.authReady;
  return <Screen title="Account" quiet>
    {state.mode === 'demo' ? <View style={panel}><Text style={heading}>You’re trying sample data</Text><Text style={detail}>Your personal entries are kept separately.</Text><Button title="Use my own data" onPress={() => update(s => ({ ...s, mode: 'real' }))} /></View> : null}
    <View style={{ ...panel, gap: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: p.grey, alignItems: 'center', justifyContent: 'center' }}>{icon('M8 7a4 4 0 1 0 8 0 4 4 0 1 0-8 0 M4 21v-2a8 8 0 0 1 16 0v2', 24)}</View>
        <View style={{ flex: 1, gap: 4 }}><Text style={{ ...heading, fontSize: 19 }}>Your account</Text><Text style={detail}>{owner ? 'Connected' : 'No sign-in required'}</Text></View>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: p.green }} />
      </View>
      <View style={{ borderTopWidth: 1, borderTopColor: `${p.line}70`, paddingTop: 16, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>{icon('M9 12l2 2 4-4 M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z', 18, p.muted)}<Text style={{ color: p.text, fontSize: 14, flex: 1 }}>Tracking data</Text><Text style={detail}>Auto-saved</Text></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>{icon('M7 10V7a5 5 0 0 1 10 0v3 M5 10h14v11H5z', 18, p.muted)}<Text style={{ color: p.text, fontSize: 14, flex: 1 }}>Progress photos</Text><Text style={detail}>Device only</Text></View>
      </View>
      {Object.keys(state.real.days).length || state.real.weights.length ? <Text style={detail}>{Object.keys(state.real.days).length} logged days · {state.real.weights.length} weigh-ins</Text> : null}
    </View>
    <View style={panel}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>{icon('M6 18a5 5 0 0 1-1-10 7 7 0 0 1 13 0 5 5 0 0 1 0 10 M12 12v9 M9 15l3-3 3 3', 22)}<Text style={{ ...heading, flex: 1 }}>Cloud backup</Text>{!owner ? <Text style={{ ...detail, fontSize: 11, backgroundColor: p.grey, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>Optional</Text> : null}</View>
      {!owner ? <>
        <Text style={detail}>Keep your stats and goals safe across devices.</Text>
        {!cloud.available ? <Text style={detail}>Cloud sign-in is available in the mobile app.</Text> : <>
          <AppleSignInButton busy={busy} onPress={() => { void cloud.signInApple(); }} />
          <View style={{ borderTopWidth: 1, borderTopColor: `${p.line}70` }}>{disclosure('Continue with email', showEmail, () => setShowEmail(!showEmail))}</View>
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
    <View style={{ ...panel, paddingVertical: 2, gap: 0 }}>
      {disclosure('How it works', showHelp, () => setShowHelp(!showHelp))}
      {showHelp ? <View style={{ gap: 10, paddingBottom: 16 }}>
        <Text style={detail}>Tracking saves on this device without an account. Signing in keeps your entries and leaves cloud backup off until you enable it.</Text>
        <Text style={detail}>Cloud backups contain stats and goals, never photo files. After a reinstall, sign in and restore your backup.</Text>
        <Text style={detail}>Deleting the app can remove local data and photos. Normal updates keep them.</Text>
      </View> : null}
      <View style={{ borderTopWidth: 1, borderTopColor: `${p.line}70` }}>{disclosure('Recovery & account options', showOptions, () => setShowOptions(!showOptions))}</View>
      {showOptions ? <View style={{ gap: 12, paddingBottom: 16 }}>
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
