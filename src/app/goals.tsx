import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useApp } from '../store/AppStore';
import { validTime } from '../domain/reminders';
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
    if (!validTime(weighInTime)) { Alert.alert('Enter weigh-in time as HH:MM'); return; }
    setSaving(true);
    try { await commit(s => ({ ...s, target: t, goal: g, weighInTime, milestones: [...new Set(ms)].sort((a,b) => b-a) })); Alert.alert('Goals saved', 'New days use the new calorie target. Existing days retain their recorded target.'); }
    catch (e) { Alert.alert('Could not save', String(e)); }
    finally { setSaving(false); }
  };
  return <Screen title="Goals">
    <Card>
      <Label>Weight goals</Label>
      <Label small>Final goal weight · lb</Label>
      <Field value={goal} onChangeText={setGoal} placeholder="e.g. 165" numeric />
      <Label small>The weight you want to reach.</Label>
      <Label small>Milestones along the way · optional</Label>
      <Field value={milestones} onChangeText={setMilestones} placeholder="e.g. 175, 170" />
      <Label small>Smaller weight targets before your final goal. Separate each with a comma.</Label>
    </Card>
    <Card>
      <Label>Daily routine</Label>
      <Label small>Daily calorie target · kcal</Label>
      <Field value={target} onChangeText={setTarget} placeholder="Daily calorie target" numeric />
      <Label small>Usual weigh-in time</Label>
      <Field value={weighInTime} onChangeText={setWeighInTime} placeholder="HH:MM" />
      <Label small>24-hour time: 14:00 = 2 pm.</Label>
    </Card>
    <Button title={saving ? 'Saving…' : 'Save goals'} primary disabled={saving} onPress={() => { void save(); }} />
  </Screen>;
}
