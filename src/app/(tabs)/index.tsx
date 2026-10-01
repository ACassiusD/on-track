import React, { useState } from 'react';
import { View, Pressable, Text, Platform, Modal, KeyboardAvoidingView } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../store/AppStore';
import { addDays, emptyDay, parseDate, setAnswer, trend, twoWeeks } from '../../domain/model';
import { taskScore } from '../../domain/dailyTasks';
import { PixelText } from '../../components/PixelText';
import { milestoneProgress } from '../../domain/progress';
import { Button, Card, Label, Row, Screen } from '../../components/UI';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { DailyCaloriesInput } from '../../components/DailyCaloriesInput';
import { DailyWeightInput } from '../../components/DailyWeightInput';
import { ProgressBuddy } from '../../components/ProgressBuddy';
import { WeightChart } from '../../components/WeightChart';
export default function Dashboard() {
  const { state, data, target, today, palette: p, updateData } = useApp();
  const day = data.days[today] ?? emptyDay(today, target);
  const displayedTarget = day.target ?? target;
  const current = trend(data.weights, today);
  const dates = twoWeeks(today);
  const left = day.calories == null || displayedTarget == null ? null : displayedTarget - day.calories;
  const journey = milestoneProgress(data, state, today);
  const [weightEntry, setWeightEntry] = useState(false);
  const [calorieEntry, setCalorieEntry] = useState(false);
  const weightDone = data.weights.some(w => w.date === today);
  return <Screen title="" back={false}>
    <ProgressBuddy featured />
    <View accessibilityLabel="Daily tasks" style={{ flexDirection: 'row', gap: 7 }}>
      {(['workout', 'creatine', 'food', 'weight'] as const).map(key => {
        const done = key === 'weight' ? weightDone : key === 'food' ? day.food === true && day.calories !== null : day[key] === true;
        const label = key === 'workout' ? 'Workout' : key === 'creatine' ? 'Creatine' : key === 'weight' ? 'Weight' : 'Calories';
        return <Pressable key={key} accessibilityRole={key === 'weight' || key === 'food' ? 'button' : 'checkbox'} accessibilityState={key === 'weight' ? { expanded: weightEntry } : key === 'food' ? { expanded: calorieEntry } : { checked: done }} accessibilityLabel={key === 'weight' ? `Daily weight, ${done ? 'entered' : 'not entered'}` : key === 'food' ? `Calories, ${done ? 'complete' : 'incomplete'}` : label} accessibilityHint={key === 'weight' ? 'Enter today’s weight.' : key === 'food' ? 'Enter your daily calorie total and confirm you are done logging.' : 'Tap to mark complete or clear. Hold to edit today’s answers.'} onLongPress={() => router.push({ pathname: '/day', params: { date: today } })} onPress={() => {
          if (key === 'weight') { setWeightEntry(!weightEntry); return; }
          if (key === 'food') { setCalorieEntry(true); return; }
          updateData(d => setAnswer(d, today, target, key, done ? null : true));
        }} style={({ pressed }) => ({ flex: 1, minHeight: 52, padding: 7, borderRadius: p.retro ? 0 : 12, borderWidth: p.retro ? 2.5 : 1.5, borderColor: done ? p.primary : p.accent, backgroundColor: p.tile, opacity: pressed ? .7 : 1, flexDirection: 'column', gap: 4, alignItems: 'center', justifyContent: 'center' })}>
          <View style={{ width: 20, height: 20, borderRadius: p.retro ? 0 : 5, borderWidth: 2, borderColor: done ? p.primary : p.accent, backgroundColor: done ? p.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: p.bg, fontWeight: '800', fontSize: 13 }}>{done ? '✓' : ''}</Text></View>
          <View>{p.retro ? <View style={{ alignItems: 'center', gap: 2 }}>{[label].map(part => <Text key={part} style={{ color: done ? p.primary : p.text, fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontWeight: '700' }}>{part}</Text>)}</View> : <Text style={{ color: done ? p.primary : p.text, fontSize: 12, fontWeight: '700', flexShrink: 1 }}>{label}</Text>}</View>
        </Pressable>;
      })}
    </View>
    <Modal visible={weightEntry} transparent animationType="fade" onRequestClose={() => setWeightEntry(false)}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#000000bb' }}><View accessibilityViewIsModal style={{ width: '100%', maxWidth: 380, alignSelf: 'center' }}><Card><DailyWeightInput onSaved={() => setWeightEntry(false)} /><Button title="Cancel" onPress={() => setWeightEntry(false)} /></Card></View></KeyboardAvoidingView></Modal>
    <Modal visible={calorieEntry} transparent animationType="fade" onRequestClose={() => setCalorieEntry(false)}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#000000bb' }}><View accessibilityViewIsModal style={{ width: '100%', maxWidth: 380, alignSelf: 'center' }}>{calorieEntry ? <Card><DailyCaloriesInput onSaved={() => setCalorieEntry(false)} /><Button title="Cancel" onPress={() => setCalorieEntry(false)} /></Card> : null}</View></KeyboardAvoidingView></Modal>
    <Card><Row><Label>Today’s calories</Label><Button title={day.calories == null ? "Add" : "Update"} primary onPress={() => setCalorieEntry(true)} /></Row><Row><View>{p.retro ? <PixelText text={day.calories?.toLocaleString() ?? '—'} color={p.text} scale={5} /> : <Text style={{ color: p.text, fontSize: 42, fontWeight: '700', fontFamily: p.fantasy ? Platform.OS === 'android' ? 'serif' : 'Georgia' : undefined, fontVariant: ['tabular-nums'], letterSpacing: -1.5 }}>{day.calories?.toLocaleString() ?? '—'}</Text>}</View><Label small>{displayedTarget == null ? 'Set target in Settings' : `/ ${displayedTarget.toLocaleString()} kcal`}</Label></Row><View style={{ height: 11, borderRadius: p.retro ? 0 : 8, backgroundColor: p.grey, overflow: 'hidden' }}><View style={{ height: 11, width: `${day.calories != null && displayedTarget ? Math.min(100, day.calories / displayedTarget * 100) : 0}%`, overflow: 'hidden' }}><Svg width="100%" height={11}><Defs><LinearGradient id="calorieFill" x1="0%" y1="0%" x2="100%" y2="0%"><Stop offset="0%" stopColor={left != null && left < 0 ? p.red : p.accent} /><Stop offset="100%" stopColor={left != null && left < 0 ? p.red : p.primary} /></LinearGradient></Defs><Rect width="100%" height={11} fill="url(#calorieFill)" />{p.retro ? Array.from({length:30},(_,i) => <Rect key={i} x={`${i*4}%`} y={0} width={2} height={11} fill={p.tile} />) : null}</Svg></View></View><Row><Label small>{left == null ? day.calories == null ? 'Enter today’s total' : 'Set a calorie target' : `${Math.abs(left)} kcal ${left < 0 ? 'over target' : 'remaining'}`}</Label></Row></Card>
    <Card><Row><Label>7-day average</Label><Button title="Details" onPress={() => router.push('/weight')} /></Row>
      <Row><Label big>{current.average?.toFixed(1) ?? '—'}<Label small> lb</Label></Label>{journey.next !== null ? <Label small>Next: {journey.next} lb</Label> : null}</Row>
      <WeightChart />
      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: p.line, paddingTop: 9 }}>
        {[0, 1, 2, 3].map(offset => {
          const date = addDays(today, -offset);
          const readings = data.weights.filter(w => w.date === date);
          const reading = readings.filter(w => w.source.kind === 'manual').slice(-1)[0] ?? readings.slice(-1)[0];
          const label = offset === 0 ? 'Today' : offset === 1 ? 'Yesterday' : parseDate(date).toLocaleDateString(undefined, { weekday: 'short' });
          return <View key={date} style={{ flex: 1, alignItems: 'center', gap: 3, borderLeftWidth: offset ? 1 : 0, borderLeftColor: p.line }}><Label small>{label}</Label><Text style={{ color: offset ? p.text : p.primary, fontSize: 17, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{reading?.pounds.toFixed(1) ?? '—'}</Text></View>;
        })}
      </View>
    </Card>
    <Card><Label>Two weeks</Label><View style={{ flexDirection: 'row', gap: 4 }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((name, i) => <View key={i} style={{ flex: 1, alignItems: 'center' }}><Label small>{name}</Label></View>)}</View>{[0, 7].map(offset => <View key={offset} style={{ flexDirection: 'row', gap: 4 }}>{dates.slice(offset, offset + 7).map(date => { const result = taskScore(data, date); const future = date > today; const color = future ? p.bg : result.tone === 'yellow' ? p.yellowSurface ?? p.yellow : result.tone === 'red' ? p.redSurface ?? p.red : p[result.tone]; const cellText = result.tone === 'yellow' && p.yellowSurface ? p.yellow : result.tone === 'red' && p.redSurface ? p.red : p.bg; return <Pressable key={date} accessibilityRole="button" accessibilityLabel={`${date}, ${future ? 'future' : `${result.count} of four completed`}`} onPress={() => router.push({ pathname: '/day', params: { date } })} style={{ flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: p.retro ? 0 : 10, borderWidth: 2, borderColor: date === today ? p.primary : 'transparent', backgroundColor: color }}><Text style={{ color: future || result.tone === 'grey' ? p.muted : cellText, fontSize: 11 }}>{date.slice(-2)}</Text><Text style={{ color: future || result.tone === 'grey' ? p.text : cellText, fontSize: 12, fontWeight: '800' }}>{future ? '—' : `${result.count}/4`}</Text></Pressable>; })}</View>)}</Card>
  </Screen>;
}
