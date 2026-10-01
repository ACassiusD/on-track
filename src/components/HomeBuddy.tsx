import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useApp } from '../store/AppStore';
import { buddyStatus } from '../domain/buddy';
import { dailyTasks } from '../domain/dailyTasks';
import { milestoneProgress } from '../domain/progress';
import { formatWeight } from '../domain/weightUnits';
import { ProgressBuddy } from './ProgressBuddy';
import { Button } from './UI';

export function HomeBuddy() {
  const [open, setOpen] = useState(false);
  return <><ProgressBuddy featured compact onInspect={() => setOpen(true)} />{open ? <PetDetails onClose={() => setOpen(false)} /> : null}</>;
}
function PetDetails({ onClose }: { onClose: () => void }) {
  const { data, state, today, target, palette: p } = useApp();
  const { height } = useWindowDimensions();
  const [history, setHistory] = useState(false);
  const [showToday, setShowToday] = useState(false);
  const status = buddyStatus(data, today);
  const tasks = dailyTasks(data, today);
  const done = tasks.filter(t => t.value === true).length;
  const journey = milestoneProgress(data, state, today);
  const unit = state.weightUnit ?? 'lb';
  const color = status.mood === 'thriving' ? p.primary : status.mood === 'good' ? p.green : status.mood === 'bad' ? p.red : status.mood === 'low' || status.mood === 'normal' ? p.yellow : p.accent;
  const box = { backgroundColor: p.bg, borderWidth: 1, borderColor: p.line, borderRadius: p.retro ? 0 : 12, padding: 12, gap: 7 };
  const openPage = (path: '/progress' | '/goals') => { onClose(); router.push(path); };
  return <Modal visible transparent animationType="fade" onRequestClose={onClose}>
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#000000bb' }}>
      <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 430, maxHeight: '92%', alignSelf: 'center', flexShrink: 1, backgroundColor: p.tile, borderWidth: 1, borderColor: p.line, borderRadius: p.retro ? 0 : 20, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 6, borderBottomWidth: 1, borderColor: p.line }}>
          <Text accessibilityRole="header" style={{ color: p.text, fontSize: 18, fontWeight: '600' }}>Your pet</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Close pet details" onPress={onClose} style={{ minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'flex-end' }}><Text style={{ color: p.primary, fontSize: 15 }}>Close</Text></Pressable>
        </View>
        <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ padding: 18, gap: 14 }}>
          <View style={{ gap: 4, alignItems: 'center' }}>
            <ProgressBuddy artworkOnly sizeOverride={height < 700 ? 132 : 174} />
            <Text style={{ color, fontSize: 25, fontWeight: '700', textAlign: 'center' }}>{status.label}</Text>
            <Text style={{ color: p.muted, fontSize: 12 }}>Tap your pet to give it some love ♥</Text>
          </View>
          <Text style={{ color: p.text, fontSize: 14, lineHeight: 21, textAlign: 'center' }}>{status.reason}</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable accessibilityRole="button" accessibilityLabel={`Today, ${done} of 5 habits complete. View checks`} accessibilityState={{ expanded: showToday }} onPress={() => setShowToday(!showToday)} style={{ ...box, flex: 1 }}><Text style={{ color: p.muted, fontSize: 12 }}>Today</Text><Text style={{ color: p.text, fontSize: 25, fontWeight: '700' }}>{done}<Text style={{ color: p.muted, fontSize: 15 }}> / 5</Text></Text><Text style={{ color: p.muted, fontSize: 11 }}>{showToday ? "Hide checks ▴" : "View checks ▾"}</Text></Pressable>
            {status.possible > 0 ? <View style={{ ...box, flex: 1 }}><Text style={{ color: p.muted, fontSize: 12 }}>14-day consistency</Text><Text style={{ color: p.primary, fontSize: 25, fontWeight: '700' }}>{Math.floor(status.rate * 100)}%</Text><Text style={{ color: p.muted, fontSize: 11 }}>{status.completed}/{status.possible} checks · {status.assessedDays} days</Text></View> : null}
          </View>
          <View style={box}>
            <Text style={{ color: p.primary, fontSize: 14, fontWeight: '600' }}>{status.mood === 'thriving' ? 'Keep it going' : 'Your next small win'}</Text>
            <Text style={{ color: p.text, fontSize: 14, lineHeight: 21 }}>{status.isNew && target === null ? 'Set your calorie target, then start with today’s tasks.' : status.hint}</Text>
            {status.isNew && target === null ? <Button title="Set calorie target" onPress={() => openPage('/goals')} /> : null}
          </View>
          {showToday ? <View style={{ gap: 8 }}>
            <Text style={{ color: p.text, fontSize: 14, fontWeight: '600' }}>Today’s habits</Text>
            {tasks.map(task => <View key={task.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}><View style={{ width: 19, height: 19, borderRadius: p.retro ? 0 : 5, borderWidth: 1.5, borderColor: task.value === true ? p.primary : p.line, backgroundColor: task.value === true ? p.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: p.bg, fontSize: 12, fontWeight: '700' }}>{task.value === true ? '✓' : ''}</Text></View><Text style={{ color: task.value === true ? p.primary : p.muted, fontSize: 13 }}>{task.label === 'Weight entered' ? 'Weight' : task.label}</Text></View>)}
          </View> : null}
          {journey.next !== null ? <View style={box}>
            <Text style={{ color: p.muted, fontSize: 12 }}>Next milestone</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}><Text style={{ color: p.text, fontSize: 22, fontWeight: '700' }}>{formatWeight(journey.next, unit)} {unit}</Text>{journey.remaining !== null ? <Text style={{ color: p.primary, fontSize: 14, fontWeight: '600' }}>{formatWeight(journey.remaining, unit)} {unit} to go</Text> : null}</View>
            <Text style={{ color: p.muted, fontSize: 11 }}>Based on your 7-day weight trend. Weight changes don’t affect your pet’s mood.</Text>
          </View> : null}
          {status.possible > 0 ? <View style={{ gap: 9 }}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: history }} onPress={() => setHistory(!history)} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={{ color: p.primary, fontSize: 14 }}>Habit history · past 14 days</Text><Text style={{ color: p.primary }}>{history ? '−' : '+'}</Text></Pressable>
            {history ? <View style={box}>{status.totals.map(t => <View key={t.label} style={{ gap: 5 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6 }}><Text style={{ color: p.muted, fontSize: 12 }}>{t.label === 'Weight entered' ? 'Weight' : t.label}</Text><Text style={{ color: p.text, fontSize: 12 }}>{t.done}/{status.assessedDays}</Text></View><View style={{ height: 4, backgroundColor: p.line, borderRadius: 2, overflow: 'hidden' }}><View style={{ width: `${t.done/status.assessedDays*100}%`, height: 4, backgroundColor: p.primary }} /></View></View>)}<Text style={{ color: p.muted, fontSize: 11, lineHeight: 16 }}>{status.todayPending ? 'Today joins this history once you finish logging calories.' : 'All five habits count equally. History starts with your first entry.'}</Text></View> : null}
          </View> : null}
          <Button title="View progress" onPress={() => openPage('/progress')} />
        </ScrollView>
      </View>
    </SafeAreaView>
  </Modal>;
}
