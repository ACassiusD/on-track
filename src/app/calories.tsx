import React, { useState } from 'react';
import { Alert, Switch } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useApp } from '../store/AppStore';
import { confirmFood, emptyDay, setAnswer, setCalories } from '../domain/model';
import { validDate } from '../domain/reminders';
import { Button, Card, Field, Label, Row, Screen } from '../components/UI';
export default function Calories() {
  const { today } = useApp();
  const params = useLocalSearchParams<{ date?: string }>();
  const date = validDate(params.date) && params.date <= today ? params.date : today;
  return <CalorieForm key={date} date={date} />;
}
function CalorieForm({ date }: { date: string }) {
  const { today, data, target, commit } = useApp();
  const day = data.days[date] ?? emptyDay(date, target);
  const [input, setInput] = useState(String(day.calories ?? ''));
  const [complete, setComplete] = useState(day.food === true);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState(false);
  const save = async () => {
    if (!/^\d+$/.test(input) || !Number.isSafeInteger(Number(input))) { Alert.alert('Enter a whole calorie total'); return; }
    setSaving(true);
    try {
      await commit(s => {
        let next = setCalories(s[s.mode], date, target, Number(input), 'Total corrected');
        if (complete && next.days[date].food !== true) next = confirmFood(next, date, target);
        if (!complete) next = setAnswer(next, date, target, 'food', null);
        return { ...s, [s.mode]: next };
      });
      router.back();
    } catch (e) { Alert.alert('Could not save', String(e)); }
    finally { setSaving(false); }
  };
  return <Screen title={date === today ? 'Today’s calories' : 'Calories'}>
    <Card><Label small>{date === today ? 'Today' : date}</Label><Label>Daily total · kcal</Label>
      <Field value={input} onChangeText={value => { setInput(value); setComplete(false); }} placeholder="e.g. 1700" numeric />
      <Label small>{day.target == null && target == null ? 'Set your target in Settings' : `Target: ${day.target ?? target} kcal`}</Label>
      <Row><Label>Food logged</Label><Switch accessibilityLabel="Food logged" value={complete} onValueChange={setComplete} /></Row>
      <Label small>Check when all food and drinks are included.</Label>
      <Button title={saving ? 'Saving…' : 'Save'} primary disabled={saving} onPress={() => { void save(); }} />
    </Card>
    <Button title={history ? 'Hide history' : 'View history'} onPress={() => setHistory(!history)} />
    {history ? <Card><Label>Daily totals</Label>{Object.values(data.days).filter(d => d.calories !== null).sort((a,b) => b.date.localeCompare(a.date)).map(d => <Row key={d.date}><Label small>{d.date} · {d.calories} kcal {d.food ? '✓' : ''}</Label><Button title="Edit" onPress={() => router.replace({ pathname: '/calories', params: { date: d.date } })} /></Row>)}<Label>Corrections</Label>{data.revisions.slice().reverse().map(r => <Label key={r.id} small>{r.date} · {r.oldTotal} → {r.newTotal} kcal</Label>)}{!data.revisions.length ? <Label small>No corrections.</Label> : null}</Card> : null}
  </Screen>;
}
