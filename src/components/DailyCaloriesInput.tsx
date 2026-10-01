import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useApp } from '../store/AppStore';
import { emptyDay } from '../domain/model';
import { saveDailyCalories } from '../domain/calorieEntry';
import { Button, Field, Label } from './UI';

export function DailyCaloriesInput({ date, onSaved, onCancel }: { date?: string; onSaved: () => void; onCancel?: () => void }) {
  const { today, state } = useApp();
  // Do not switch a draft to the next day or discard it at midnight.
  const [openedDate] = useState(today);
  const selectedDate = date ?? openedDate;
  return <Entry key={`${selectedDate}:${state.mode}`} date={selectedDate} onSaved={onSaved} onCancel={onCancel} />;
}
function Entry({ date, onSaved, onCancel }: { date: string; onSaved: () => void; onCancel?: () => void }) {
  const { today, data, target, commit, palette: p } = useApp();
  const day = data.days[date] ?? emptyDay(date, target);
  const [input, setInput] = useState(String(day.calories ?? ''));
  const [complete, setComplete] = useState(day.food === true && day.calories !== null);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      await commit(s => ({ ...s, [s.mode]: saveDailyCalories(s[s.mode], date, target, input, complete) }));
      onSaved();
    } catch (e) { Alert.alert('Could not save calories', e instanceof Error ? e.message : String(e)); }
    finally { setSaving(false); }
  };
  return <View style={{ gap: 10 }}>
    <Label>Calories</Label>
    {date !== today ? <Label small>{date}</Label> : null}
    <Field value={input} onChangeText={value => { setInput(value); setComplete(false); }} placeholder="Total calories" numeric autoFocus />
    <Pressable accessibilityRole="checkbox" accessibilityLabel={date === today ? 'Done logging today' : 'Done logging'} accessibilityState={{ checked: complete, disabled: saving }} disabled={saving} onPress={() => setComplete(!complete)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, padding: 10, borderWidth: 1.5, borderColor: complete ? p.primary : p.accent, borderRadius: p.retro ? 0 : 10, opacity: pressed ? .7 : 1 })}>
      <View style={{ width: 24, height: 24, borderWidth: 2, borderColor: p.primary, backgroundColor: complete ? p.primary : 'transparent', borderRadius: p.retro ? 0 : 5, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: p.bg, fontWeight: '800', fontSize: 16 }}>{complete ? '✓' : ''}</Text></View>
      <Text style={{ flex: 1, color: p.text, fontSize: 16, fontWeight: '600' }}>{date === today ? 'Done logging today' : 'Done logging'}</Text>
    </Pressable>
    <Label small>Finished logging earns one check. Finishing within target earns a second.</Label>
    {day.target === null ? <Label small>Set a calorie target in Goals to earn the second check.</Label> : null}
    <View style={{ flexDirection: 'row', gap: 8 }}>{onCancel ? <View style={{ flex: 1 }}><Button title="Cancel" disabled={saving} onPress={onCancel} /></View> : null}<View style={{ flex: 1 }}><Button title={saving ? 'Saving…' : 'Save'} primary disabled={saving || !input.trim()} onPress={() => { void save(); }} /></View></View>
  </View>;
}
