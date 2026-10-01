import React, { useState } from 'react';
import { Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../store/AppStore';
import { useIPhone } from '../../store/IPhoneStore';
import { validTime } from '../../domain/reminders';
import type { ThemeName } from '../../domain/model';
import { Button, Card, Field, Label, Row, Screen } from '../../components/UI';
import { themes } from '../../components/themes';
export default function Settings() {
  const { state, commit, update } = useApp(); const iphone = useIPhone();
  const [target, setTarget] = useState(String(state.target ?? ''));
  const [goal, setGoal] = useState(String(state.goal ?? ''));
  const [milestones, setMilestones] = useState(state.milestones.join(', '));
  const [weighInTime, setWeighInTime] = useState(state.weighInTime ?? '14:00');
  const [saving, setSaving] = useState(false);
  const save = async () => {
    const t = target.trim() ? Number(target) : null;
    const g = goal.trim() ? Number(goal) : null;
    const ms = milestones.trim() ? milestones.split(',').map(n => Number(n.trim())) : [];
    if ((t !== null && (!Number.isSafeInteger(t) || t <= 0)) || (g !== null && (!Number.isFinite(g) || g <= 0)) || ms.some(m => !Number.isFinite(m) || m <= 0)) { Alert.alert('Enter positive targets'); return; }
    if (!validTime(weighInTime)) { Alert.alert('Enter weigh-in time as HH:MM'); return; }
    setSaving(true);
    try { await commit(s => ({ ...s, target: t, goal: g, weighInTime, milestones: [...new Set(ms)].sort((a,b) => b-a) })); Alert.alert('Targets saved', 'New days use the new calorie target. Existing days retain their recorded target.'); }
    catch (e) { Alert.alert('Could not save', String(e)); }
    finally { setSaving(false); }
  };
  return <Screen title="Settings" back={false}>
    <Card><Button title="Account & cloud backup" onPress={() => router.push('/account')} /><Button title="iPhone connections" onPress={() => router.push('/connections')} /><Button title="Reminders" onPress={() => router.push('/reminders')} />{iphone.error ? <Label small>{iphone.error}</Label> : null}</Card>
    <Card><Button title="Progress & sharing" onPress={() => router.push('/progress')} /><Button title="Check-in & ChatGPT" onPress={() => router.push('/coach')} /><Button title="Progress photos" onPress={() => router.push('/photos')} /></Card>
    <Card><Label>Theme</Label>{(Object.keys(themes) as ThemeName[]).map(theme => <Button key={theme} title={theme} selected={state.theme === theme} onPress={() => update(s => ({ ...s, theme }))} />)}</Card>
    <Card><Label>Personal targets</Label><Label small>Usual weigh-in time</Label><Field value={weighInTime} onChangeText={setWeighInTime} placeholder="Weigh-in time HH:MM" /><Label small>14:00 = 2 pm · recorded time can be changed per weigh-in.</Label><Field value={target} onChangeText={setTarget} placeholder="Daily calorie target" numeric /><Field value={goal} onChangeText={setGoal} placeholder="Goal weight in pounds" numeric /><Field value={milestones} onChangeText={setMilestones} placeholder="Milestones in pounds, comma separated" /><Button title={saving ? 'Saving…' : 'Save targets'} primary disabled={saving} onPress={() => { void save(); }} /><Label small>Targets are your choice. Demo numbers are illustrative.</Label></Card>
    <Card><Row><Label>Demo mode</Label><Switch accessibilityLabel="Demo mode" value={state.mode === 'demo'} onValueChange={value => update(s => ({ ...s, mode: value ? 'demo' : 'real' }))} /></Row><Label small>Personal and demo records stay separate. Cloud backup uses personal records only.</Label></Card>
  </Screen>;
}
