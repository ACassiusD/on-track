import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { useApp } from '../store/AppStore';
import { saveManualWeight } from '../domain/weightEntry';
import { Button, Field, Label } from './UI';
export function DailyWeightInput() {
  const { data, state, today } = useApp();
  const reading = data.weights.filter(w => w.date === today && w.source.kind === 'manual').slice(-1)[0];
  return <Entry key={`${today}:${state.mode}:${reading?.id ?? ''}:${reading?.pounds ?? ''}`} initial={reading ? String(reading.pounds) : ''} time={reading?.time ?? state.weighInTime ?? '14:00'} />;
}
function Entry({ initial, time }: { initial: string; time: string }) {
  const { today, commit } = useApp();
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try { await commit(s => ({ ...s, [s.mode]: saveManualWeight(s[s.mode], today, Number(value), time, today) })); }
    catch (e) { Alert.alert('Could not save weight', String(e)); }
    finally { setSaving(false); }
  };
  return <View style={{ gap: 6 }}><Label>Today’s weight · lb</Label><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ flex: 1 }}><Field value={value} onChangeText={setValue} placeholder="Enter today’s weight" numeric /></View><Button title={saving ? 'Saving…' : 'Save'} primary disabled={saving || !value.trim() || value === initial} onPress={() => { void save(); }} /></View></View>;
}
