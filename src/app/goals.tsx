import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useApp } from '../store/AppStore';
import { validTime } from '../domain/reminders';
import { TimePicker } from '../components/TimePicker';
import { Button, Card, Field, Label, Screen } from '../components/UI';

export default function Goals() {
  const { state, commit } = useApp();
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
    if (!validTime(weighInTime)) { Alert.alert('Choose a weigh-in time'); return; }
    setSaving(true);
    try { await commit(s => ({ ...s, target: t, goal: g, weighInTime, milestones: [...new Set(ms)].sort((a,b) => b-a) })); Alert.alert('Goals saved'); }
    catch (e) { Alert.alert('Could not save', String(e)); }
    finally { setSaving(false); }
  };
  return <Screen title="Goals">
    <Card>
      <Label>Weight goals</Label>
      <Label small>Goal weight · lb</Label>
      <Field value={goal} onChangeText={setGoal} placeholder="e.g. 165" numeric />
      <Label small>Milestones · optional</Label>
      <Field value={milestones} onChangeText={setMilestones} placeholder="e.g. 175, 170" />
      <Label small>Steps toward your goal, e.g. 175, 170 lb.</Label>
    </Card>
    <Card>
      <Label>Daily routine</Label>
      <Label small>Daily calories</Label>
      <Field value={target} onChangeText={setTarget} placeholder="e.g. 1700" numeric />
      <Label small>Weigh-in time</Label>
      <TimePicker value={weighInTime} onChange={setWeighInTime} />
    </Card>
    <Button title={saving ? 'Saving…' : 'Save goals'} primary disabled={saving} onPress={() => { void save(); }} />
  </Screen>;
}
