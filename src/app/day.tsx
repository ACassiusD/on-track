import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useApp } from '../store/AppStore';
import { emptyDay, setAnswer } from '../domain/model';
import { dailyTasks, taskScore } from '../domain/dailyTasks';
import { validDate } from '../domain/reminders';
import { Button, Card, Label, Row, Screen } from '../components/UI';
import { DailyWeightInput } from '../components/DailyWeightInput';
export default function Day() {
  const { date: supplied } = useLocalSearchParams<{ date: string }>();
  const { today, data, target, updateData, palette: p } = useApp();
  const date = validDate(supplied) ? supplied : today;
  const day = data.days[date] ?? emptyDay(date, target);
  const [weightOpen, setWeightOpen] = useState(false);
  return <Screen title={date}>
    <Card>
      <Label big>{taskScore(data,date).count}/5</Label>
      {dailyTasks(data,date).map(c => <Row key={c.label}><Label>{c.label}</Label><Label>{c.value === null ? 'Unknown' : c.value ? 'Yes ✓' : 'No'}</Label></Row>)}
      <Label small>{date > today ? 'Future day. No checks required yet.' : 'Calories logged and Calories within target are separate checks. The target check is automatic after logging is finished.'}</Label>
    </Card>
    {date <= today ? <Card>
      <Label>Edit this day</Label>
      {(['workout', 'creatine'] as const).map(key => <Row key={key}><Label>{key === 'workout' ? 'Workout' : 'Creatine'}</Label><Row>{[true, false, null].map(value => <Button key={String(value)} title={value === null ? 'Clear' : value ? 'Yes' : 'No'} selected={day[key] === value} onPress={() => updateData(d => setAnswer(d, date, target, key, value))} />)}</Row></Row>)}
      <Button title="Calories" onPress={() => router.push({ pathname: '/calories', params: { date } })} />
      <Button title="Weight" onPress={() => setWeightOpen(true)} />
    </Card> : null}
    <Modal visible={weightOpen && date <= today} transparent animationType="fade" onRequestClose={() => setWeightOpen(false)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#000000bb' }}>
        <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 380, alignSelf: 'center', backgroundColor: p.tile, borderRadius: p.retro ? 0 : 18, borderWidth: 1, borderColor: p.line, overflow: 'hidden' }}>
          {weightOpen ? <DailyWeightInput key={date} date={date} onSaved={() => setWeightOpen(false)} onCancel={() => setWeightOpen(false)} /> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  </Screen>;
}
