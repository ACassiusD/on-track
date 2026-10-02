import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../store/AppStore';
import { useIPhone } from '../../store/IPhoneStore';
import { selectDemoProfile } from '../../domain/demoProfiles';
import { type ThemeName } from '../../domain/model';
import { resetDevelopmentState } from '../../cloud/profileProtection';
import { Button, Card, Label, Screen } from '../../components/UI';
import { WelcomeTour } from '../../components/WelcomeTour';
import { DefaultPetPicker } from '../../components/DefaultPetPicker';
import { defaultPets, normalizeDefaultPet } from '../../domain/defaultPets';
import { themes } from '../../components/themes';
import { TestUpdateCard, isTestingBuild } from '../../components/TestUpdateCard';
import { SettingsItem, SettingsSection } from '../../components/SettingsList';
const demoProfiles = [
  { value: 'thriving', label: 'Thriving' },
  { value: 'good', label: 'Happy' },
  { value: 'mixed', label: 'Doing okay' },
  { value: 'low', label: 'Needs care' },
  { value: 'bad', label: 'Needs a boost' },
  { value: 'new', label: 'Getting started' },
] as const;

export default function Settings() {
  const { state, update, commit, today, palette: p } = useApp(); const iphone = useIPhone();
  const [tourOpen, setTourOpen] = useState(false);
  const [profilePicker, setProfilePicker] = useState(false);
  const [petPicker, setPetPicker] = useState(false);
  const [themePicker, setThemePicker] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState('');
  const reset = async () => {
    setResetting(true); setResetError('');
    try { await commit(s => resetDevelopmentState(s, today)); setResetOpen(false); router.replace('/'); }
    catch (e) { setResetError(e instanceof Error ? e.message : 'Could not reset.'); }
    finally { setResetting(false); }
  };
  const selected = demoProfiles.find(profile => profile.value === state.demoProfile) ?? demoProfiles[2];
  return <Screen title="Settings" back={false}>
    <SettingsSection title="Account">
      <SettingsItem title="Account & backup" icon="cloud" detail="Optional cloud backup" onPress={() => router.push('/account')} />
    </SettingsSection>
    <SettingsSection title="Tracking">
      <SettingsItem title="Goals" icon="goal" detail="Calorie target, goal weight & milestones" onPress={() => router.push('/goals')} />
      <SettingsItem title="Reminders" icon="bell" onPress={() => router.push('/reminders')} />
    </SettingsSection>
    <SettingsSection title="Preferences">
      <SettingsItem title="Weight units" icon="weight" trailing={<View accessibilityRole="radiogroup" accessibilityLabel="Weight units" style={{ flexDirection: 'row', padding: 3, gap: 3, borderRadius: p.retro ? 0 : 10, backgroundColor: p.bg }}>{(['lb', 'kg'] as const).map(unit => <Pressable key={unit} accessibilityRole="radio" accessibilityLabel={unit === 'lb' ? 'Pounds' : 'Kilograms'} accessibilityState={{ checked: (state.weightUnit ?? 'lb') === unit }} aria-checked={(state.weightUnit ?? 'lb') === unit} onPress={() => update(s => ({ ...s, weightUnit: unit }))} style={({ pressed }) => ({ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: p.retro ? 0 : 7, backgroundColor: (state.weightUnit ?? 'lb') === unit ? p.primary : undefined, opacity: pressed ? .7 : 1 })}><Text style={{ color: (state.weightUnit ?? 'lb') === unit ? p.bg : p.muted, fontSize: 14, fontWeight: '700' }}>{unit}</Text></Pressable>)}</View>} />
      <SettingsItem title="Theme" icon="theme" detail={state.theme} onPress={() => setThemePicker(true)} />
      <SettingsItem title="Your pet" icon="pet" detail={`${defaultPets.find(pet => pet.id === normalizeDefaultPet(state.defaultPet))!.name} · Default theme`} onPress={() => setPetPicker(true)} />
    </SettingsSection>
    <SettingsSection title="Connections">
      <SettingsItem title="iPhone connections" icon="phone" detail={iphone.error ? 'Needs attention · tap to retry' : 'Apple Health, widgets & shortcuts'} onPress={() => router.push('/connections')} />
    </SettingsSection>
    <SettingsSection title="Progress">
      <SettingsItem title="Progress & sharing" icon="chart" onPress={() => router.push('/progress')} />
      <SettingsItem title="Progress photos" icon="photo" onPress={() => router.push('/photos')} />
      <SettingsItem title="Check-in & ChatGPT" icon="chat" onPress={() => router.push('/coach')} />
    </SettingsSection>
    <SettingsSection title="App" footer={state.mode === 'demo' ? 'Demo profiles use sample data. Your personal records stay separate.' : undefined}>
      <SettingsItem title="App & pet guide" icon="guide" onPress={() => setTourOpen(true)} />
      <SettingsItem title="Demo mode" icon="demo" trailing={<Switch accessibilityLabel="Demo mode" value={state.mode === 'demo'} trackColor={{ false: p.grey, true: p.primary }} onValueChange={value => update(s => ({ ...s, mode: value ? 'demo' : 'real' }))} />} />
      {state.mode === 'demo' ? <SettingsItem title="Demo profile" icon="profile" detail={selected.label} onPress={() => setProfilePicker(true)} /> : null}
    </SettingsSection>
    {tourOpen ? <WelcomeTour replay onClose={() => setTourOpen(false)} /> : null}
    {petPicker ? <DefaultPetPicker onClose={() => setPetPicker(false)} /> : null}
    <TestUpdateCard />
    {__DEV__ || isTestingBuild ? <SettingsSection title="Development"><SettingsItem title="Reset development sandbox" icon="reset" detail="Reset demo & appearance · keep personal profile" danger onPress={() => setResetOpen(true)} /></SettingsSection> : null}
    <Modal visible={themePicker} transparent animationType="fade" onRequestClose={() => setThemePicker(false)}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#000000bb' }}>
        <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 380, maxHeight: '85%', alignSelf: 'center' }}>
          <ScrollView><Card compact>
            <Label>Choose a theme</Label>
            {(Object.keys(themes) as ThemeName[]).map(theme => <Pressable key={theme} accessibilityRole="radio" accessibilityLabel={theme} accessibilityState={{ checked: state.theme === theme }} aria-checked={state.theme === theme} onPress={() => { update(s => ({ ...s, theme })); setThemePicker(false); }} style={({ pressed }) => ({ minHeight: 58, paddingHorizontal: 12, paddingVertical: 10, gap: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: state.theme === theme ? p.primary : p.line, borderRadius: p.retro ? 0 : 10, backgroundColor: pressed ? p.grey : p.bg })}>
              <View accessibilityElementsHidden aria-hidden style={{ flexDirection: 'row', gap: 3 }}>{[themes[theme].bg, themes[theme].primary, themes[theme].accent].map((color, index) => <View key={index} style={{ width: 13, height: 26, borderRadius: p.retro ? 0 : 4, backgroundColor: color, borderWidth: 1, borderColor: p.line }} />)}</View>
              <Text style={{ flex: 1, color: p.text, fontSize: 15 }}>{theme}</Text>
              {state.theme === theme ? <Text style={{ color: p.primary, fontSize: 18 }}>✓</Text> : null}
            </Pressable>)}
            <Button title="Cancel" onPress={() => setThemePicker(false)} />
          </Card></ScrollView>
        </View>
      </View>
    </Modal>
    <Modal visible={resetOpen} transparent animationType="fade" onRequestClose={() => { if (!resetting) setResetOpen(false); }}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#000000bb' }}><View accessibilityViewIsModal style={{ width: '100%', maxWidth: 380, alignSelf: 'center' }}><Card>
        <Label>Reset the development sandbox?</Label><Label small>Resets demo data, appearance, reminders and the app guide. Your personal records, photos, goals and account backup settings are preserved. The app opens in demo mode.</Label>
        {resetError ? <Text accessibilityRole="alert" style={{ color: p.red }}>{resetError}</Text> : null}
        <Button title={resetting ? 'Resetting…' : 'Reset sandbox'} primary disabled={resetting} onPress={() => { void reset(); }} />
        <Button title="Cancel" disabled={resetting} onPress={() => setResetOpen(false)} />
      </Card></View></View>
    </Modal>
    <Modal visible={profilePicker} transparent animationType="fade" onRequestClose={() => setProfilePicker(false)}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#000000bb' }}>
        <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 380, maxHeight: '85%', alignSelf: 'center' }}>
          <ScrollView><Card>
            <Label>Demo profile</Label>
            {demoProfiles.map(profile => <Pressable key={profile.value} accessibilityRole="radio" accessibilityState={{ checked: selected.value === profile.value }} aria-checked={selected.value === profile.value} onPress={() => { update(s => selectDemoProfile(s, profile.value, today)); setProfilePicker(false); }} style={{ minHeight: 44, paddingHorizontal: 12, borderRadius: p.retro ? 0 : 8, backgroundColor: selected.value === profile.value ? p.primary : p.bg, justifyContent: 'center' }}><Text style={{ color: selected.value === profile.value ? p.bg : p.text, fontSize: 16 }}>{profile.label}{selected.value === profile.value ? '  ✓' : ''}</Text></Pressable>)}
            <Button title="Cancel" onPress={() => setProfilePicker(false)} />
          </Card></ScrollView>
        </View>
      </View>
    </Modal>
  </Screen>;
}
