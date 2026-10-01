import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { useApp } from '../store/AppStore';
import { clearManualWeight, saveManualWeight } from '../domain/weightEntry';
import { Button, Field, Label, Row } from './UI';
export function DailyWeightInput({ onSaved, onCancel }: { onSaved?: () => void; onCancel?: () => void }) {
  const { data, state, today } = useApp();
  const reading = data.weights.filter(w => w.date === today && w.source.kind === 'manual').slice(-1)[0];
  return <Entry key={`${today}:${state.mode}:${reading?.id ?? ''}:${reading?.pounds ?? ''}`} onSaved={onSaved} onCancel={onCancel} initial={reading ? String(reading.pounds) : ''} time={reading?.time ?? state.weighInTime ?? '14:00'} />;
}
function Entry({ initial, time, onSaved, onCancel }: { initial: string; time: string; onSaved?: () => void; onCancel?: () => void }) {
  const { today, commit } = useApp();
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try { await commit(s => ({ ...s, [s.mode]: saveManualWeight(s[s.mode], today, Number(value), time, today) })); onSaved?.(); }
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
  return <View style={{ gap: 6 }}><Label>Today’s weight · lb</Label><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ flex: 1 }}><Field value={value} onChangeText={setValue} placeholder="Enter today’s weight" numeric autoFocus /></View><Button title={saving ? 'Saving…' : 'Save'} primary disabled={saving || !value.trim() || value === initial} onPress={() => { void save(); }} /></View><Row>{onCancel ? <Button title="Cancel" disabled={saving} onPress={onCancel} /> : null}<Button title="Clear weight" disabled={saving || (!initial && !value)} onPress={() => { void clear(); }} /></Row></View>;
}
