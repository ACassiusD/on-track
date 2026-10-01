import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../store/AppStore';
import { confirmFood, emptyDay, score, setAnswer, trend, twoWeeks } from '../../domain/model';
import { milestoneProgress } from '../../domain/progress';
import { Button, Card, Label, Row, Screen } from '../../components/UI';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { DailyWeightInput } from '../../components/DailyWeightInput';
import { WeightChart } from '../../components/WeightChart';
export default function Dashboard() {
  const { state, data, target, today, palette: p, updateData } = useApp();
  const day = data.days[today] ?? emptyDay(today, target);
  const displayedTarget = day.target ?? target;
  const current = trend(data.weights, today);
  const dates = twoWeeks(today);
  const left = day.calories == null || displayedTarget == null ? null : displayedTarget - day.calories;
  const journey = milestoneProgress(data, state, today);
  return <Screen title="" back={false}>
    <View accessibilityLabel="Daily tasks" style={{ flexDirection: 'row', gap: 7 }}>
      {(['workout', 'creatine', 'food'] as const).map(key => {
        const done = day[key] === true;
        const label = key === 'workout' ? 'Workout' : key === 'creatine' ? 'Creatine' : 'Food logged';
        return <Pressable key={key} accessibilityRole="checkbox" accessibilityState={{ checked: done }} accessibilityLabel={label} accessibilityHint={key === 'food' ? 'Check when all food and drinks are logged. Tap again to clear.' : 'Tap to mark complete or clear. Hold to edit today’s answers.'} onLongPress={() => router.push({ pathname: '/day', params: { date: today } })} onPress={() => {
          if (key === 'food' && day.calories === null) { router.push('/calories'); return; }
          updateData(d => key === 'food' && !done ? confirmFood(d, today, target) : setAnswer(d, today, target, key, done ? null : true));
        }} style={({ pressed }) => ({ flex: 1, minHeight: 52, padding: 7, borderRadius: 12, borderWidth: 1.5, borderColor: done ? p.primary : p.accent, backgroundColor: p.tile, opacity: pressed ? .7 : 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' })}>
          <View style={{ width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: done ? p.primary : p.accent, backgroundColor: done ? p.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: p.bg, fontWeight: '800', fontSize: 13 }}>{done ? '✓' : ''}</Text></View>
          <Text style={{ color: done ? p.primary : p.text, fontSize: 12, fontWeight: '700', flexShrink: 1 }}>{label}</Text>
        </Pressable>;
      })}
    </View>
    <Card><Row><Label>Today’s calories</Label><Button title="Details" onPress={() => router.push('/calories')} /></Row><Row><Text style={{ color: p.text, fontSize: 42, fontWeight: '700', fontVariant: ['tabular-nums'], letterSpacing: -1.5 }}>{day.calories?.toLocaleString() ?? '—'}</Text><Label small>{displayedTarget == null ? 'Set target in Settings' : `/ ${displayedTarget.toLocaleString()} kcal`}</Label></Row><View style={{ height: 11, borderRadius: 8, backgroundColor: p.grey, overflow: 'hidden' }}><View style={{ height: 11, width: `${day.calories != null && displayedTarget ? Math.min(100, day.calories / displayedTarget * 100) : 0}%`, overflow: 'hidden' }}><Svg width="100%" height={11}><Defs><LinearGradient id="calorieFill" x1="0%" y1="0%" x2="100%" y2="0%"><Stop offset="0%" stopColor={left != null && left < 0 ? p.red : p.accent} /><Stop offset="100%" stopColor={left != null && left < 0 ? p.red : p.primary} /></LinearGradient></Defs><Rect width="100%" height={11} fill="url(#calorieFill)" /></Svg></View></View><Row><Label small>{left == null ? 'Enter today’s total' : `${Math.abs(left)} kcal ${left < 0 ? 'over target' : 'remaining'}`}</Label></Row><Row><Button title={day.calories == null ? "Add calories" : "Edit calories"} primary onPress={() => router.push({ pathname: '/calories', params: { edit: 'yes' } })} /></Row></Card>
    <Card><DailyWeightInput /><Row><Label small>Weight trend</Label><Button title="Details" onPress={() => router.push('/weight')} /></Row><Row><Label big>{current.average?.toFixed(1) ?? '—'}<Label small> lb</Label></Label><Label small>{journey.next === null ? journey.goal === null ? 'Goal not set' : 'Goal: '+journey.goal+' lb' : 'Next: '+journey.next+' lb'}</Label></Row><Row><Label small>7-day average</Label><Label small>{data.weights.filter(w => w.date === today).length ? `Today: ${data.weights.filter(w => w.date === today).slice(-1)[0].pounds.toFixed(1)} lb` : `Weigh-in: ${state.weighInTime ?? '14:00'}`}</Label></Row><WeightChart /></Card>
    <Card><Row><Label>Two weeks</Label><Button title="Details" onPress={() => router.push('/progress')} /></Row><View style={{ flexDirection: 'row', gap: 4 }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((name, i) => <View key={i} style={{ flex: 1, alignItems: 'center' }}><Label small>{name}</Label></View>)}</View>{[0, 7].map(offset => <View key={offset} style={{ flexDirection: 'row', gap: 4 }}>{dates.slice(offset, offset + 7).map(date => { const result = score(data.days[date] ?? emptyDay(date, target)); const future = date > today; const color = future ? p.bg : result.tone === 'yellow' ? p.yellowSurface ?? p.yellow : result.tone === 'red' ? p.redSurface ?? p.red : p[result.tone]; const cellText = result.tone === 'yellow' && p.yellowSurface ? p.yellow : result.tone === 'red' && p.redSurface ? p.red : p.bg; return <Pressable key={date} accessibilityRole="button" accessibilityLabel={`${date}, ${future ? 'future' : `${result.count} of four completed`}`} onPress={() => router.push({ pathname: '/day', params: { date } })} style={{ flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 2, borderColor: date === today ? p.primary : 'transparent', backgroundColor: color }}><Text style={{ color: future || result.tone === 'grey' ? p.muted : cellText, fontSize: 11 }}>{date.slice(-2)}</Text><Text style={{ color: future || result.tone === 'grey' ? p.text : cellText, fontSize: 12, fontWeight: '800' }}>{future ? '—' : `${result.count}/4`}</Text></Pressable>; })}</View>)}</Card>
  </Screen>;
}
