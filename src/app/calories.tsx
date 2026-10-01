import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useApp } from '../store/AppStore';
import { validDate } from '../domain/reminders';
import { Button, Card, Label, Row, Screen } from '../components/UI';
import { DailyCaloriesInput } from '../components/DailyCaloriesInput';
export default function Calories() {
  const { today } = useApp();
  const params = useLocalSearchParams<{ date?: string }>();
  const date = validDate(params.date) && params.date <= today ? params.date : today;
  return <CalorieForm key={date} date={date} />;
}
function CalorieForm({ date }: { date: string }) {
  const { today, data } = useApp();
  const [history, setHistory] = useState(false);
  return <Screen title={date === today ? 'Today’s calories' : 'Calories'}>
    <Card><DailyCaloriesInput date={date} onSaved={() => router.back()} /></Card>
    <Button title={history ? 'Hide history' : 'View history'} onPress={() => setHistory(!history)} />
    {history ? <Card><Label>Daily totals</Label>{Object.values(data.days).filter(d => d.calories !== null).sort((a,b) => b.date.localeCompare(a.date)).map(d => <Row key={d.date}><Label small>{d.date} · {d.calories} kcal {d.food ? '✓' : ''}</Label><Button title="Edit" onPress={() => router.replace({ pathname: '/calories', params: { date: d.date } })} /></Row>)}<Label>Corrections</Label>{data.revisions.slice().reverse().map(r => <Label key={r.id} small>{r.date} · {r.oldTotal} → {r.newTotal} kcal</Label>)}{!data.revisions.length ? <Label small>No corrections.</Label> : null}</Card> : null}
  </Screen>;
}
