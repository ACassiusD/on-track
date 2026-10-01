import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { useApp } from '../store/AppStore';
import { clearManualWeight, saveManualWeightInUnit } from '../domain/weightEntry';
import { WeightField } from './WeightField';
import { weightInput } from '../domain/weightUnits';
import { Button, Label, Row } from './UI';
export function DailyWeightInput({ onSaved, onCancel }: { onSaved?: () => void; onCancel?: () => void }) {
  const { data, state, today } = useApp();
  const unit = state.weightUnit ?? 'lb';
  const reading = data.weights.filter(w => w.date === today && w.source.kind === 'manual').slice(-1)[0];
  return <Entry key={`${today}:${state.mode}:${reading?.id ?? ''}:${reading?.pounds ?? ''}:${unit}`} onSaved={onSaved} onCancel={onCancel} initial={reading ? weightInput(reading.pounds, unit) : ''} time={reading?.time ?? state.weighInTime ?? '14:00'} />;
}
function Entry({ initial, time, onSaved, onCancel }: { initial: string; time: string; onSaved?: () => void; onCancel?: () => void }) {
  const { today, commit, state } = useApp();
  const unit = state.weightUnit ?? 'lb';
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try { await commit(s => ({ ...s, [s.mode]: saveManualWeightInUnit(s[s.mode], today, value, time, today, unit) })); onSaved?.(); }
    catch (e) { Alert.alert('Could not save weight', String(e)); }
    finally { setSaving(false); }
  };
  const clear = async () => {
    setSaving(true);
    try {
      if (initial) await commit(s => ({ ...s, [s.mode]: clearManualWeight(s[s.mode], today) }));
      setValue('');
    } catch (e) { Alert.alert('Could not clear weight', String(e)); }
    finally { setSaving(false); }
  };
  return <View style={{ gap: 12 }}>
    <Label>Today’s weight</Label>
    <WeightField value={value} onChangeText={setValue} unit={unit} autoFocus disabled={saving} />
    <Button title={saving ? 'Saving…' : 'Save weight'} primary disabled={saving || !value.trim() || value === initial} onPress={() => { void save(); }} />
    <Row>{onCancel ? <Button title="Cancel" disabled={saving} onPress={onCancel} /> : null}<Button title="Clear weight" disabled={saving || (!initial && !value)} onPress={() => { void clear(); }} /></Row>
  </View>;
}
