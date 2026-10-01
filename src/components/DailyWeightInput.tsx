import React, { useState } from 'react';
import { Alert, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useApp } from '../store/AppStore';
import { clearManualWeight, saveManualWeight, saveManualWeightInUnit } from '../domain/weightEntry';
import { parseDate } from '../domain/model';
import { weightInput } from '../domain/weightUnits';
import { Label } from './UI';

export function DailyWeightInput({ date, onSaved, onCancel }: { date?: string; onSaved?: () => void; onCancel?: () => void }) {
  const { state, today } = useApp();
  // Keep an open draft on its original day if midnight passes.
  const [entryDate] = useState(date ?? today);
  return <Entry key={`${entryDate}:${state.mode}:${state.weightUnit ?? 'lb'}`} date={entryDate} onSaved={onSaved} onCancel={onCancel} />;
}
function Entry({ date, onSaved, onCancel }: { date: string; onSaved?: () => void; onCancel?: () => void }) {
  const { data, today, commit, state, palette: p } = useApp();
  const unit = state.weightUnit ?? 'lb';
  const reading = data.weights.filter(w => w.date === date && w.source.kind === 'manual').slice(-1)[0];
  const initial = reading ? weightInput(reading.pounds, unit) : '';
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const save = async () => {
    setSaving(true); setError('');
    try {
      const time = reading?.time ?? state.weighInTime ?? '14:00';
      await commit(s => ({ ...s, [s.mode]: reading && value === initial ? saveManualWeight(s[s.mode], date, reading.pounds, time, today) : saveManualWeightInUnit(s[s.mode], date, value, time, today, unit) }));
      onSaved?.();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save weight.'); }
    finally { setSaving(false); }
  };
  const clear = async () => {
    setSaving(true); setError('');
    try {
      if (reading) await commit(s => ({ ...s, [s.mode]: clearManualWeight(s[s.mode], date) }));
      setValue('');
    } catch (e) { Alert.alert('Could not clear weight', String(e)); }
    finally { setSaving(false); }
  };
  return <View>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, gap: 8, borderBottomWidth: 1, borderColor: p.line }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Cancel adding weight" disabled={saving} onPress={onCancel} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: p.primary, fontSize: 16 }}>Cancel</Text></Pressable>
      <Text style={{ color: p.text, fontSize: 18, fontWeight: '600' }}>{date === today ? 'Today’s weight' : 'Add weight'}</Text>
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: saving || !value.trim() }} disabled={saving || !value.trim()} onPress={() => { void save(); }} style={{ minHeight: 44, justifyContent: 'center', opacity: saving || !value.trim() ? .4 : 1 }}><Text style={{ color: p.primary, fontSize: 16, fontWeight: '600' }}>{saving ? 'Saving…' : 'Save'}</Text></Pressable>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, minHeight: 64, borderBottomWidth: 1, borderColor: p.line, gap: 12 }}>
      <Label>Weight</Label>
      <TextInput accessibilityLabel={`Weight in ${unit === 'kg' ? 'kilograms' : 'pounds'}`} value={value} onChangeText={setValue} placeholder="Enter weight" placeholderTextColor={p.muted} keyboardType="decimal-pad" selectTextOnFocus editable={!saving} style={{ flex: 1, flexBasis: 0, minWidth: 0, minHeight: 48, color: p.primary, fontSize: 20, textAlign: 'right', fontVariant: ['tabular-nums'], ...(Platform.OS === 'web' ? { outlineWidth: 0 } : {}) }} />
      <Text style={{ color: p.primary, fontSize: 18 }}>{unit}</Text>
    </View>
    {date !== today ? <View style={{ paddingHorizontal: 16, paddingTop: 8 }}><Label small>{parseDate(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Label></View> : null}
    {error ? <Text accessibilityRole="alert" style={{ color: p.red, padding: 12 }}>{error}</Text> : null}
    {reading || value ? <Pressable accessibilityRole="button" disabled={saving} onPress={() => { void clear(); }} style={{ minHeight: 48, paddingHorizontal: 16, justifyContent: 'center' }}><Text style={{ color: p.muted, fontSize: 14 }}>Clear weight</Text></Pressable> : null}
  </View>;
}
