import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../store/AppStore';
import { useIPhone } from '../../store/IPhoneStore';
import { selectDemoProfile } from '../../domain/demoProfiles';
import type { ThemeName } from '../../domain/model';
import { Button, Card, Label, Row, Screen } from '../../components/UI';
import { themes } from '../../components/themes';
const demoProfiles = [
  { value: 'thriving', label: 'Thriving' },
  { value: 'good', label: 'Happy' },
  { value: 'mixed', label: 'Doing okay' },
  { value: 'low', label: 'Needs care' },
  { value: 'bad', label: 'Needs a boost' },
  { value: 'new', label: 'Getting started' },
] as const;

export default function Settings() {
  const { state, update, today, palette: p } = useApp(); const iphone = useIPhone();
  const [profilePicker, setProfilePicker] = useState(false);
  const selected = demoProfiles.find(profile => profile.value === state.demoProfile) ?? demoProfiles[2];
  return <Screen title="Settings" back={false}>
    <Card><Button title="Goals" onPress={() => router.push('/goals')} /><Button title="Account & cloud backup" onPress={() => router.push('/account')} /><Button title="iPhone connections" onPress={() => router.push('/connections')} /><Button title="Reminders" onPress={() => router.push('/reminders')} />{iphone.error ? <Label small>{iphone.error}</Label> : null}</Card>
    <Card><Button title="Progress & sharing" onPress={() => router.push('/progress')} /><Button title="Check-in & ChatGPT" onPress={() => router.push('/coach')} /><Button title="Progress photos" onPress={() => router.push('/photos')} /></Card>
    <Card><Label>Theme</Label>{(Object.keys(themes) as ThemeName[]).map(theme => <Button key={theme} title={theme} selected={state.theme === theme} onPress={() => update(s => ({ ...s, theme }))} />)}</Card>

    <Card><Row><Label>Demo mode</Label><Switch accessibilityLabel="Demo mode" value={state.mode === 'demo'} onValueChange={value => update(s => ({ ...s, mode: value ? 'demo' : 'real' }))} /></Row><Pressable accessibilityRole="button" accessibilityLabel={`Demo profile: ${selected.label}. Change profile`} accessibilityState={{ expanded: profilePicker }} onPress={() => setProfilePicker(true)} style={{ minHeight: 48, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: p.line, borderRadius: p.retro ? 0 : 12, backgroundColor: p.bg }}><Text style={{ color: p.text, fontSize: 16 }}>{selected.label}</Text><Text style={{ color: p.primary }}>▾</Text></Pressable><Label small>Profiles replace demo data only. Personal records stay separate.</Label></Card>
    <Modal visible={profilePicker} transparent animationType="fade" onRequestClose={() => setProfilePicker(false)}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#000000bb' }}>
        <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 380, maxHeight: '85%', alignSelf: 'center' }}>
          <ScrollView><Card>
            <Label>Demo profile</Label>
            {demoProfiles.map(profile => <Pressable key={profile.value} accessibilityRole="radio" accessibilityState={{ checked: selected.value === profile.value }} onPress={() => { update(s => selectDemoProfile(s, profile.value, today)); setProfilePicker(false); }} style={{ minHeight: 44, paddingHorizontal: 12, borderRadius: p.retro ? 0 : 8, backgroundColor: selected.value === profile.value ? p.primary : p.bg, justifyContent: 'center' }}><Text style={{ color: selected.value === profile.value ? p.bg : p.text, fontSize: 16 }}>{profile.label}{selected.value === profile.value ? '  ✓' : ''}</Text></Pressable>)}
            <Button title="Cancel" onPress={() => setProfilePicker(false)} />
          </Card></ScrollView>
        </View>
      </View>
    </Modal>
  </Screen>;
}
