import React from 'react';
import { Switch } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../store/AppStore';
import { useIPhone } from '../../store/IPhoneStore';
import { selectDemoProfile } from '../../domain/demoProfiles';
import type { ThemeName } from '../../domain/model';
import { Button, Card, Label, Row, Screen } from '../../components/UI';
import { themes } from '../../components/themes';
export default function Settings() {
  const { state, update, today } = useApp(); const iphone = useIPhone();
  return <Screen title="Settings" back={false}>
    <Card><Button title="Goals" onPress={() => router.push('/goals')} /><Button title="Account & cloud backup" onPress={() => router.push('/account')} /><Button title="iPhone connections" onPress={() => router.push('/connections')} /><Button title="Reminders" onPress={() => router.push('/reminders')} />{iphone.error ? <Label small>{iphone.error}</Label> : null}</Card>
    <Card><Button title="Progress & sharing" onPress={() => router.push('/progress')} /><Button title="Check-in & ChatGPT" onPress={() => router.push('/coach')} /><Button title="Progress photos" onPress={() => router.push('/photos')} /></Card>
    <Card><Label>Theme</Label>{(Object.keys(themes) as ThemeName[]).map(theme => <Button key={theme} title={theme} selected={state.theme === theme} onPress={() => update(s => ({ ...s, theme }))} />)}</Card>

    <Card><Row><Label>Demo mode</Label><Switch accessibilityLabel="Demo mode" value={state.mode === 'demo'} onValueChange={value => update(s => ({ ...s, mode: value ? 'demo' : 'real' }))} /></Row><Row>{(['thriving','good','mixed','low','bad','new'] as const).map(profile => <Button key={profile} title={{ thriving: 'Thriving', good: 'Happy', mixed: 'Doing okay', low: 'Needs care', bad: 'Needs a boost', new: 'Getting started' }[profile]} selected={state.mode === 'demo' && state.demoProfile === profile} onPress={() => update(s => selectDemoProfile(s,profile,today))} />)}</Row><Label small>Profiles replace demo data only. Personal records stay separate.</Label></Card>
  </Screen>;
}
