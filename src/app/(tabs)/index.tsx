import React, { useState } from 'react';
import { View, Pressable, Text, Platform, Modal, KeyboardAvoidingView } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../store/AppStore';
import { addDays, emptyDay, parseDate, setAnswer, trend, twoWeeks } from '../../domain/model';
import { weightRanges, WeightWindow } from '../../domain/weightRanges';
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
  const [weightWindow, setWeightWindow] = useState<WeightWindow>(7);
  const [rangePicker, setRangePicker] = useState(false);
  const selectedRange = weightRanges.find(r => r.days === weightWindow)!;
  const current = trend(data.weights, today, weightWindow);
  const dates = twoWeeks(today);
  const hasHistory = dates.some(date => date <= today && (data.weights.some(w => w.date === date) || Object.values(data.days[date] ? { calories: data.days[date].calories, workout: data.days[date].workout, creatine: data.days[date].creatine, food: data.days[date].food } : {}).some(v => v !== null)));
  const left = day.calories == null || displayedTarget == null ? null : displayedTarget - day.calories;
  const journey = milestoneProgress(data, state, today);
  const [weightEntry, setWeightEntry] = useState(false);
  const [calorieEntry, setCalorieEntry] = useState(false);
  const weightDone = data.weights.some(w => w.date === today);
  return <Screen title="" back={false} compact>
    <ProgressBuddy featured compact />
    <View accessibilityLabel="Daily tasks" style={{ flexDirection: 'row', gap: 7 }}>
      {(['workout', 'creatine', 'food', 'weight'] as const).map(key => {
        const done = key === 'weight' ? weightDone : key === 'food' ? day.food === true && day.calories !== null : day[key] === true;
        const label = key === 'workout' ? 'Workout' : key === 'creatine' ? 'Creatine' : key === 'weight' ? 'Weight' : 'Calories';
        return <Pressable key={key} accessibilityRole={key === 'weight' || key === 'food' ? 'button' : 'checkbox'} accessibilityState={key === 'weight' ? { expanded: weightEntry } : key === 'food' ? { expanded: calorieEntry } : { checked: done }} accessibilityLabel={key === 'weight' ? `Daily weight, ${done ? 'entered' : 'not entered'}` : key === 'food' ? `Calories, ${done ? 'complete' : 'incomplete'}` : label} accessibilityHint={key === 'weight' ? 'Enter today’s weight.' : key === 'food' ? 'Enter your daily calorie total and confirm you are done logging.' : 'Tap to mark complete or clear. Hold to edit today’s answers.'} onLongPress={() => router.push({ pathname: '/day', params: { date: today } })} onPress={() => {
          if (key === 'weight') { setWeightEntry(!weightEntry); return; }
          if (key === 'food') { setCalorieEntry(true); return; }
          updateData(d => setAnswer(d, today, target, key, done ? null : true));
        }} style={({ pressed }) => ({ flex: 1, minHeight: 48, padding: 5, borderRadius: p.retro ? 0 : p.fantasy ? 8 : 12, borderWidth: p.retro ? 2.5 : 1.5, borderColor: done ? p.primary : p.accent, backgroundColor: p.tile, opacity: pressed ? .7 : 1, flexDirection: 'column', gap: 4, alignItems: 'center', justifyContent: 'center' })}>
          <View style={{ width: 20, height: 20, borderRadius: p.retro ? 0 : 5, borderWidth: 2, borderColor: done ? p.primary : p.accent, backgroundColor: done ? p.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: p.bg, fontWeight: '800', fontSize: 13 }}>{done ? '✓' : ''}</Text></View>
          <View>{p.retro ? <View style={{ alignItems: 'center', gap: 2 }}>{[label].map(part => <Text key={part} style={{ color: done ? p.primary : p.text, fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontWeight: '700' }}>{part}</Text>)}</View> : <Text style={{ color: done ? p.primary : p.text, fontSize: 12, fontWeight: '700', flexShrink: 1 }}>{label}</Text>}</View>
        </Pressable>;
      })}
    </View>
    <Modal visible={weightEntry} transparent animationType="fade" onRequestClose={() => setWeightEntry(false)}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#000000bb' }}><View accessibilityViewIsModal style={{ width: '100%', maxWidth: 380, alignSelf: 'center' }}><Card><DailyWeightInput onSaved={() => setWeightEntry(false)} /><Button title="Cancel" onPress={() => setWeightEntry(false)} /></Card></View></KeyboardAvoidingView></Modal>
    <Modal visible={calorieEntry} transparent animationType="fade" onRequestClose={() => setCalorieEntry(false)}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#000000bb' }}><View accessibilityViewIsModal style={{ width: '100%', maxWidth: 380, alignSelf: 'center' }}>{calorieEntry ? <Card compact><DailyCaloriesInput onSaved={() => setCalorieEntry(false)} onCancel={() => setCalorieEntry(false)} /></Card> : null}</View></KeyboardAvoidingView></Modal>
    <Modal visible={rangePicker} transparent animationType="fade" onRequestClose={() => setRangePicker(false)}><View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#000000bb' }}><View accessibilityViewIsModal style={{ width: '100%', maxWidth: 380, alignSelf: 'center' }}><Card><Label>Weight range</Label><Label small>Changes the average and chart period.</Label>{weightRanges.map(r => <Pressable key={r.days} accessibilityRole="radio" accessibilityState={{ checked: weightWindow === r.days }} accessibilityLabel={`${r.label}, rolling ${r.days} days`} onPress={() => { setWeightWindow(r.days); setRangePicker(false); }} style={{ minHeight: 44, paddingHorizontal: 12, borderRadius: p.retro ? 0 : 8, backgroundColor: weightWindow === r.days ? p.primary : p.bg, justifyContent: 'center' }}><Text style={{ color: weightWindow === r.days ? p.bg : p.text, fontSize: 16 }}>{r.label}{weightWindow === r.days ? '  ✓' : ''}</Text></Pressable>)}<Label small>Months use 30, 90, and 180 days; a year uses 365. The chart shows the 7-day smoothed trend.</Label><Button title="Cancel" onPress={() => setRangePicker(false)} /></Card></View></View></Modal>
    {day.calories === null ? <Button title="Add today’s calories" primary onPress={() => setCalorieEntry(true)} /> : (<Card compact><Row><Label>Today’s calories</Label><Button title={day.calories == null ? "Add" : "Update"} primary onPress={() => setCalorieEntry(true)} /></Row><Row><View>{p.retro ? <PixelText text={day.calories?.toLocaleString() ?? '—'} color={p.text} scale={4} /> : <Text style={{ color: p.text, fontSize: 34, fontWeight: '700',  fontVariant: ['tabular-nums'], letterSpacing: -1.5 }}>{day.calories?.toLocaleString() ?? '—'}</Text>}</View><Label small>{displayedTarget == null ? 'Set target in Settings' : `/ ${displayedTarget.toLocaleString()} kcal`}</Label></Row><View style={{ height: 11, borderRadius: p.retro ? 0 : 8, backgroundColor: p.grey, overflow: 'hidden' }}><View style={{ height: 11, width: `${day.calories != null && displayedTarget ? Math.min(100, day.calories / displayedTarget * 100) : 0}%`, overflow: 'hidden' }}><Svg width="100%" height={11}><Defs><LinearGradient id="calorieFill" x1="0%" y1="0%" x2="100%" y2="0%"><Stop offset="0%" stopColor={left != null && left < 0 ? p.red : p.accent} /><Stop offset="100%" stopColor={left != null && left < 0 ? p.red : p.primary} /></LinearGradient></Defs><Rect width="100%" height={11} fill="url(#calorieFill)" />{p.retro ? Array.from({length:30},(_,i) => <Rect key={i} x={`${i*4}%`} y={0} width={2} height={11} fill={p.tile} />) : null}</Svg></View></View><Row><Label small>{left == null ? day.calories == null ? 'Enter today’s total' : 'Set a calorie target' : `${Math.abs(left)} kcal ${left < 0 ? 'over target' : 'remaining'}`}</Label></Row></Card>) }
    {hasHistory ? (<Card compact><Label>Two weeks</Label><View style={{ flexDirection: 'row', gap: 4 }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((name, i) => <View key={i} style={{ flex: 1, alignItems: 'center' }}><Label small>{name}</Label></View>)}</View>{[0, 7].map(offset => <View key={offset} style={{ flexDirection: 'row', gap: 4 }}>{dates.slice(offset, offset + 7).map(date => { const result = taskScore(data, date); const future = date > today; const color = future ? p.bg : result.tone === 'yellow' ? p.yellowSurface ?? p.yellow : result.tone === 'red' ? p.redSurface ?? p.red : p[result.tone]; const cellText = result.tone === 'yellow' && p.yellowSurface ? p.yellow : result.tone === 'red' && p.redSurface ? p.red : p.bg; return <Pressable key={date} accessibilityRole="button" accessibilityLabel={`${date}, ${future ? 'future' : `${result.count} of four completed`}`} onPress={() => router.push({ pathname: '/day', params: { date } })} style={{ flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: p.retro ? 0 : 10, borderWidth: 2, borderColor: date === today ? p.primary : 'transparent', backgroundColor: color }}><Text style={{ color: future || result.tone === 'grey' ? p.muted : cellText, fontSize: 11 }}>{date.slice(-2)}</Text><Text style={{ color: future || result.tone === 'grey' ? p.text : cellText, fontSize: 12, fontWeight: '800' }}>{future ? '—' : `${result.count}/4`}</Text></Pressable>; })}</View>)}</Card>) : <Card compact><Label>Two weeks</Label><Label small>Your daily check-ins will appear here.</Label></Card>}
    {current.average === null ? <Card compact><Row><Label>Weight</Label><Button title="Add weight" primary onPress={() => setWeightEntry(true)} /></Row><Label small>Add a weigh-in to start your trend.</Label></Card> : (<Card compact><Row><Pressable accessibilityRole="button" accessibilityLabel={`Weight range: ${selectedRange.label}. Change range`} accessibilityState={{ expanded: rangePicker }} onPress={() => setRangePicker(true)} style={{ minHeight: 40, flexDirection: 'row', gap: 8, alignItems: 'center' }}><Text style={{ color: p.text, fontSize: 16, fontWeight: '600' }}>{selectedRange.averageLabel}</Text><Text style={{ color: p.primary }}>▾</Text></Pressable><Pressable accessibilityRole="button" onPress={() => router.push('/weight')} style={{ minHeight: 40, justifyContent: 'center' }}><Text style={{ color: p.primary, fontSize: 13 }}>Details ›</Text></Pressable></Row>
      <Row><Text style={{ color: p.text, fontSize: 32, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{current.average?.toFixed(1) ?? '—'}<Text style={{ color: p.muted, fontSize: 12 }}> lb</Text></Text>{journey.next !== null ? <Label small>Next: {journey.next} lb</Label> : null}</Row>
      <WeightChart range={weightWindow} compact />
      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: p.line, paddingTop: 6 }}>
        {[0, 1, 2, 3].map(offset => {
          const date = addDays(today, -offset);
          const readings = data.weights.filter(w => w.date === date);
          const reading = readings.filter(w => w.source.kind === 'manual').slice(-1)[0] ?? readings.slice(-1)[0];
          const label = offset === 0 ? 'Today' : offset === 1 ? 'Yesterday' : parseDate(date).toLocaleDateString(undefined, { weekday: 'short' });
          return <View key={date} style={{ flex: 1, alignItems: 'center', gap: 3, borderLeftWidth: offset ? 1 : 0, borderLeftColor: p.line }}><Label small>{label}</Label><Text style={{ color: offset ? p.text : p.primary, fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{reading?.pounds.toFixed(1) ?? '—'}</Text></View>;
        })}
      </View>
    </Card>) }

  </Screen>;
}
