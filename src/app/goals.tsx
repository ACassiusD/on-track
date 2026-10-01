import React, { useState } from 'react';
import { Alert } from 'react-native';
import { weightInput, storedWeight } from '../domain/weightUnits';
import { useApp } from '../store/AppStore';
import { validTime } from '../domain/reminders';
import { TimePicker } from '../components/TimePicker';
import { Button, Card, Field, Label, Screen } from '../components/UI';

export default function Goals() {
  const { state } = useApp();
  return <GoalsForm key={state.weightUnit ?? 'lb'} />;
}
function GoalsForm() {
  const { state, commit } = useApp();
  const unit = state.weightUnit ?? 'lb';
  const originalGoal = state.goal === null ? '' : weightInput(state.goal, unit);
  const originalMilestones = state.milestones.map(n => weightInput(n, unit)).join(', ');
  const [target, setTarget] = useState(String(state.target ?? ''));
  const [goal, setGoal] = useState(originalGoal);
  const [milestones, setMilestones] = useState(originalMilestones);
  const [weighInTime, setWeighInTime] = useState(state.weighInTime ?? '14:00');
  const [saving, setSaving] = useState(false);
  const save = async () => {
    const t = target.trim() ? Number(target) : null;
    const g = goal.trim() ? Number(goal.replace(',', '.')) : null;
    const ms = milestones.trim() ? milestones.split(',').map(n => Number(n.trim())) : [];
    if ((t !== null && (!Number.isSafeInteger(t) || t <= 0)) || (g !== null && (!Number.isFinite(g) || g <= 0)) || ms.some(m => !Number.isFinite(m) || m <= 0)) { Alert.alert('Enter positive targets'); return; }
    if (!validTime(weighInTime)) { Alert.alert('Choose a weigh-in time'); return; }
    setSaving(true);
    try { await commit(s => ({ ...s, target: t, goal: goal === originalGoal ? s.goal : g === null ? null : storedWeight(g, unit), weighInTime, milestones: [...new Set(milestones === originalMilestones ? s.milestones : ms.map(n => storedWeight(n, unit)))].sort((a,b) => b-a) })); Alert.alert('Goals saved'); }
    catch (e) { Alert.alert('Could not save', String(e)); }
    finally { setSaving(false); }
  };
  return <Screen title="Goals">
    <Card>
      <Label>Weight goals</Label>
      <Label small>Goal weight · {unit}</Label>
      <Field value={goal} onChangeText={setGoal} placeholder={unit === 'kg' ? 'e.g. 75' : 'e.g. 165'} numeric />
      <Label small>Milestones · optional</Label>
      <Field value={milestones} onChangeText={setMilestones} placeholder={unit === 'kg' ? 'e.g. 80, 77' : 'e.g. 175, 170'} />
      <Label small>Steps toward your goal, e.g. {unit === 'kg' ? '80, 77 kg' : '175, 170 lb'}.</Label>
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
