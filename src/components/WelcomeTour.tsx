import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useApp } from '../store/AppStore';
import type { BuddyMood } from '../domain/buddy';
import { BuddyArtwork } from './BuddyArtwork';
import { ProgressBuddy } from './ProgressBuddy';
import { Button } from './UI';

const moods: { mood: BuddyMood; label: string; copy: string }[] = [
  { mood: 'thriving', label: 'Thriving', copy: 'At least 90% of daily tasks complete, with 12 days of history. Happy hops, sparkles and little hearts.' },
  { mood: 'good', label: 'Happy', copy: 'At least 80% complete—about 4 out of 5 each day—with 10 days of history. A bright smile and a playful bounce.' },
  { mood: 'normal', label: 'Doing okay', copy: 'At least half complete while building toward Happy. A small smile and a gentle sway.' },
  { mood: 'low', label: 'Needs care', copy: '35–49% complete. Your pet looks a little sleepy. A steadier routine helps it perk up.' },
  { mood: 'bad', label: 'Needs a boost', copy: 'Below 35% complete. Your pet feels low. Start with a small daily win and build from there.' },
];
const titles = ['Meet your habit buddy', 'Five small daily wins', 'Watch your pet thrive', 'Missed days happen', 'Make it your routine'];
const tasks = [
  ['Workout', 'Check it off when you finish.'],
  ['Creatine', 'Check it off after taking it.'],
  ['Calories logged', 'Enter your full-day total and mark done logging.'],
  ['Weight', 'Add today’s weigh-in in your preferred units.'],
  ['Within target', 'Earned automatically when your finished total is within your calorie target.'],
];
export function WelcomeTour({ replay = false, onClose }: { replay?: boolean; onClose?: () => void }) {
  const { state, ready } = useApp();
  if (!ready || (!replay && state.onboardingCompleted)) return null;
  return <Tour replay={replay} onClose={onClose} />;
}
function Tour({ replay, onClose }: { replay: boolean; onClose?: () => void }) {
  const { palette: p, commit } = useApp();
  const { width, height } = useWindowDimensions();
  const pager = useRef<ScrollView>(null);
  const pageRef = useRef(0);
  const [page, setPage] = useState(0);
  const [mood, setMood] = useState<BuddyMood>('thriving');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const lesson = moods.find(m => m.mood === mood)!;
  const size = height < 700 ? 132 : 172;
  useEffect(() => { pager.current?.scrollTo({ x: pageRef.current * width, animated: false }); }, [width]);
  const go = (next: number) => { pageRef.current = next; setPage(next); pager.current?.scrollTo({ x: next * width, animated: true }); };
  const finish = async (setup = false) => {
    if (saving) return;
    setSaving(true); setError('');
    try {
      if (!replay) await commit(s => ({ ...s, onboardingCompleted: true }));
      onClose?.();
      if (setup) router.push('/goals');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save. Please try again.'); }
    finally { setSaving(false); }
  };
  const text = (content: string) => <Text style={{ color: p.muted, fontSize: 16, lineHeight: 24, textAlign: 'center' }}>{content}</Text>;
  const box = { padding: 14, borderWidth: 1, borderColor: p.line, borderRadius: p.retro ? 0 : 14, backgroundColor: p.tile, gap: 6 };
  return <Modal visible animationType="fade" onRequestClose={() => { void finish(); }}>
    <SafeAreaView style={{ flex: 1, backgroundColor: p.bg }}>
      <View pointerEvents="none" style={{ position: 'absolute', inset: 0 }}><Svg width="100%" height="100%"><Defs><RadialGradient id="welcomeGlow" cx="50%" cy="28%" r="65%"><Stop offset="0" stopColor={p.primary} stopOpacity={.13} /><Stop offset=".55" stopColor={p.accent} stopOpacity={.04} /><Stop offset="1" stopColor={p.bg} stopOpacity={0} /></RadialGradient></Defs><Rect width="100%" height="100%" fill="url(#welcomeGlow)" /></Svg></View>
      <View style={{ paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 52 }}>
        <Text style={{ color: p.primary, fontSize: 12, letterSpacing: 2, fontWeight: '700' }}>ON TRACK</Text>
        <Pressable accessibilityRole="button" disabled={saving} onPress={() => { void finish(); }} style={{ minHeight: 44, justifyContent: 'center', paddingLeft: 16 }}><Text style={{ color: p.muted, fontSize: 15 }}>{replay ? 'Close' : 'Skip'}</Text></Pressable>
      </View>
      <ScrollView ref={pager} horizontal pagingEnabled showsHorizontalScrollIndicator={false} scrollEventThrottle={32} onScroll={event => { const next = Math.max(0, Math.min(4, Math.round(event.nativeEvent.contentOffset.x / width))); pageRef.current = next; setPage(next); }} style={{ flex: 1 }}>
        {titles.map((title, i) => {
          const previewMood = i === 0 ? 'normal' : i === 1 ? 'good' : i === 2 ? mood : i === 3 ? 'low' : 'good';
          return <View key={title} style={{ width, height: '100%', flexShrink: 0 }} accessibilityElementsHidden={page !== i} importantForAccessibility={page === i ? 'auto' : 'no-hide-descendants'}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 16, gap: 14, maxWidth: 500, width: '100%', alignSelf: 'center' }}>
              <View style={{ alignItems: 'center' }}>{page === i ? <ProgressBuddy artworkOnly previewMood={previewMood} sizeOverride={i === 2 ? Math.min(size, 132) : size} /> : <BuddyArtwork palette={p} mood={previewMood} size={i === 2 ? Math.min(size, 132) : size} />}</View>
              <Text accessibilityRole="header" style={{ color: p.text, fontSize: 28, fontWeight: '700', textAlign: 'center', lineHeight: 34 }}>{title}</Text>
              {i === 0 ? <>
                {text('Build your routine. Care for your pet. A few small actions each day help you both feel on track.')}
                <View style={box}>{text('Its happiness reflects your daily habits over the past 14 days—not the number on the scale.')}<Text style={{ color: p.primary, textAlign: 'center', fontSize: 13 }}>Tap your pet to say hello ♥</Text></View>
              </> : null}
              {i === 1 ? <>
                <View style={{ gap: 11 }}>{tasks.map(([label, copy]) => <View key={label} style={{ flexDirection: 'row', gap: 12 }}><View style={{ width: 22, height: 22, borderWidth: 1.5, borderColor: p.primary, borderRadius: p.retro ? 0 : 5, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: p.primary }}>✓</Text></View><View style={{ flex: 1, gap: 2 }}><Text style={{ color: p.text, fontSize: 15, fontWeight: '600' }}>{label}</Text><Text style={{ color: p.muted, fontSize: 13, lineHeight: 18 }}>{copy}</Text></View></View>)}</View>
                {text('Over target? Logging still earns a check. Staying within target is a separate win.')}
              </> : null}
              {i === 2 ? <>
                {text('All five tasks count equally. Tap a mood to see how your pet shows your progress.')}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>{moods.map(m => <Button key={m.mood} title={m.label} selected={mood === m.mood} onPress={() => setMood(m.mood)} />)}</View>
                <View style={box}><Text accessibilityLiveRegion="polite" style={{ color: p.text, textAlign: 'center', fontSize: 14, lineHeight: 21 }}>{lesson.copy}</Text></View>
                <Text style={{ color: p.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' }}>Your pet gets to know your routine for the first 7 days. These are previews, not your current score.</Text>
              </> : null}
              {i === 3 ? <>
                {text('One rough day doesn’t undo your progress. Your pet responds to your routine over time.')}
                <View style={box}><Text style={{ color: p.text, fontSize: 15, lineHeight: 23 }}>• Missing tasks regularly makes its mood quieter.\n• Follow the tip beside your pet to find your next small win.\n• Your unfinished today won’t lower its mood while you’re still logging.</Text></View>
                {text('Need to fix yesterday? Tap its calendar date. Only add a missed weight if you actually recorded it.')}
              </> : null}
              {i === 4 ? <>
                {text('Start with your calorie target, then take today one task at a time. No account needed.')}
                <View style={box}><Text style={{ color: p.text, fontSize: 15, lineHeight: 23 }}>See your weight trend and milestones as you log. Settings has your goals, units, themes and optional reminders.</Text></View>
                <Button title="Set my calorie target" onPress={() => { void finish(true); }} disabled={saving} />
                <Text style={{ color: p.muted, fontSize: 12, textAlign: 'center' }}>You can replay this guide from Settings anytime.</Text>
              </> : null}
            </ScrollView>
          </View>;
        })}
      </ScrollView>
      <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16, gap: 12, borderTopWidth: 1, borderColor: p.line }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>{titles.map((title, i) => <Pressable key={title} accessibilityRole="button" accessibilityLabel={`Slide ${i+1}: ${title}`} accessibilityState={{ selected: page === i }} disabled={saving} onPress={() => go(i)} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: page === i ? 22 : 7, height: 7, borderRadius: 4, backgroundColor: page === i ? p.primary : p.line }} /></Pressable>)}</View>
        {error ? <Text accessibilityRole="alert" style={{ color: p.red }}>{error}</Text> : null}
        <View style={{ flexDirection: 'row', gap: 10 }}>{page > 0 ? <Button title="Back" disabled={saving} onPress={() => go(page-1)} /> : null}<View style={{ flex: 1 }}><Button title={saving ? 'Saving…' : page === 4 ? replay ? 'Done' : 'Start tracking' : 'Next'} primary disabled={saving} onPress={() => page === 4 ? void finish() : go(page+1)} /></View></View>
      </View>
    </SafeAreaView>
  </Modal>;
}
