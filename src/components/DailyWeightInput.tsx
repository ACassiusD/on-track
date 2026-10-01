import React, { useState } from 'react';
import { Alert, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useApp } from '../store/AppStore';
import { clearManualWeight, saveManualWeight, saveManualWeightInUnit } from '../domain/weightEntry';
import { parseDate } from '../domain/model';
import { weightInput } from '../domain/weightUnits';
import { Button, Field, Label } from './UI';

export function DailyWeightInput({ onSaved, onCancel }: { onSaved?: () => void; onCancel?: () => void }) {
  const { state, today } = useApp();
  return <Entry key={`${today}:${state.mode}:${state.weightUnit ?? 'lb'}`} onSaved={onSaved} onCancel={onCancel} />;
}
function Entry({ onSaved, onCancel }: { onSaved?: () => void; onCancel?: () => void }) {
  const { data, today, commit, state, palette: p } = useApp();
  const unit = state.weightUnit ?? 'lb';
  const [date, setDate] = useState(today);
  const reading = data.weights.filter(w => w.date === date && w.source.kind === 'manual').slice(-1)[0];
  const initial = reading ? weightInput(reading.pounds, unit) : '';
  const [value, setValue] = useState(initial);
  const [dateOpen, setDateOpen] = useState(false);
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
  const changeDate = (next: string) => {
    setDate(next); setError('');
    const existing = data.weights.filter(w => w.date === next && w.source.kind === 'manual').slice(-1)[0];
    if (existing) setValue(weightInput(existing.pounds, unit));
  };
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && date <= today;
  const dateLabel = date === today ? 'Today' : validDate ? parseDate(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Choose date';
  return <View>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, gap: 8, borderBottomWidth: 1, borderColor: p.line }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Cancel adding weight" disabled={saving} onPress={onCancel} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: p.primary, fontSize: 16 }}>Cancel</Text></Pressable>
      <Text style={{ color: p.text, fontSize: 18, fontWeight: '600' }}>Add weight</Text>
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: saving || !value.trim() || !validDate }} disabled={saving || !value.trim() || !validDate} onPress={() => { void save(); }} style={{ minHeight: 44, justifyContent: 'center', opacity: saving || !value.trim() || !validDate ? .4 : 1 }}><Text style={{ color: p.primary, fontSize: 16, fontWeight: '600' }}>{saving ? 'Saving…' : 'Save'}</Text></Pressable>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, minHeight: 64, borderBottomWidth: 1, borderColor: p.line, gap: 12 }}>
      <Label>Weight</Label>
      <TextInput accessibilityLabel={`Weight in ${unit === 'kg' ? 'kilograms' : 'pounds'}`} value={value} onChangeText={setValue} placeholder="Enter weight" placeholderTextColor={p.muted} keyboardType="decimal-pad" selectTextOnFocus editable={!saving} style={{ flex: 1, flexBasis: 0, minWidth: 0, minHeight: 48, color: p.primary, fontSize: 20, textAlign: 'right', fontVariant: ['tabular-nums'], ...(Platform.OS === 'web' ? { outlineWidth: 0 } : {}) }} />
      <Text style={{ color: p.primary, fontSize: 18 }}>{unit}</Text>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={`Date: ${dateLabel}`} accessibilityState={{ expanded: dateOpen }} disabled={saving} onPress={() => setDateOpen(!dateOpen)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 64, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: p.line }}><Label>Date</Label><Text style={{ color: p.primary, fontSize: 17 }}>{dateLabel} ▾</Text></Pressable>
    {dateOpen ? <View style={{ padding: 12, gap: 8 }}><Field value={date} onChangeText={changeDate} placeholder="Date YYYY-MM-DD" /><Button title="Today" disabled={saving} onPress={() => { changeDate(today); setDateOpen(false); }} /></View> : null}
    {error ? <Text accessibilityRole="alert" style={{ color: p.red, padding: 12 }}>{error}</Text> : null}
    {reading || value ? <Pressable accessibilityRole="button" disabled={saving} onPress={() => { void clear(); }} style={{ minHeight: 48, paddingHorizontal: 16, justifyContent: 'center' }}><Text style={{ color: p.muted, fontSize: 14 }}>Clear weight</Text></Pressable> : null}
  </View>;
}
