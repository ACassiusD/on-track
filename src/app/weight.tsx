import React, { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../store/AppStore';
import { saveManualWeight, saveManualWeightInUnit } from '../domain/weightEntry';
import { Button, Card, Field, Label, Row, Screen } from '../components/UI';
import { WeightField } from '../components/WeightField';
import { TimePicker } from '../components/TimePicker';
import { formatWeight, weightInput } from '../domain/weightUnits';
import { WeightChart } from '../components/WeightChart';
export default function Weight() {
  const { state } = useApp();
  return <WeightForm key={state.weightUnit ?? 'lb'} />;
}
function WeightForm() {
  const { data, today, state, commit } = useApp();
  const unit = state.weightUnit ?? 'lb';
  const latest = data.weights.filter(w => w.date === today && w.source.kind === 'manual').slice(-1)[0];
  const [pounds, setPounds] = useState(latest ? weightInput(latest.pounds, unit) : '');
  const [date, setDate] = useState(today);
  const [time, setTime] = useState(latest?.time ?? state.weighInTime ?? '14:00');
  const [details, setDetails] = useState(false);
  const [history, setHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try { await commit(s => ({ ...s, [s.mode]: latest && pounds === weightInput(latest.pounds, unit) ? saveManualWeight(s[s.mode], date, latest.pounds, time, today) : saveManualWeightInUnit(s[s.mode], date, pounds, time, today, unit) })); router.back(); }
    catch (e) { Alert.alert('Could not save weight', String(e)); }
    finally { setSaving(false); }
  };
  return <Screen title="Daily weight">
    <Card><Label small>{date === today ? 'Today' : date}</Label><Label>Weight</Label>
      <WeightField value={pounds} onChangeText={setPounds} unit={unit} disabled={saving} />
      <Row><Label small>Weigh-in time · {time}</Label><Button title={details ? 'Hide' : 'Change date / time'} onPress={() => setDetails(!details)} /></Row>
      {details ? <><Field value={date} onChangeText={setDate} placeholder="Date YYYY-MM-DD" /><TimePicker value={time} onChange={setTime} /></> : null}
      <Button title={saving ? 'Saving…' : 'Save weight'} primary disabled={saving} onPress={() => { void save(); }} />
    </Card>
    <Card><Label>Weight trend</Label><WeightChart /><Button title="More stats" onPress={() => router.push('/progress')} /></Card>
    <Button title={history ? 'Hide weigh-ins' : 'View weigh-ins'} onPress={() => setHistory(!history)} />
    {history ? <Card>{data.weights.slice().reverse().map(w => <Label key={w.id} small>{w.date} {w.time ?? ''} · {formatWeight(w.pounds, unit)} {unit}</Label>)}</Card> : null}
  </Screen>;
}
