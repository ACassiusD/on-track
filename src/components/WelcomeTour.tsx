import React, { useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useApp } from '../store/AppStore';
import type { ExampleMood } from '../domain/petExamples';
import { TourNavigation } from '../domain/tourNavigation';
import { MoodExampleCalendar } from './MoodExampleCalendar';
import { BuddyArtwork } from './BuddyArtwork';
import { ProgressBuddy } from './ProgressBuddy';
import { Button } from './UI';

const moods: { mood: ExampleMood; label: string; copy: string }[] = [
  { mood: 'thriving', label: 'Thriving', copy: 'Thriving: 90%+ checks over at least 12 days.' },
  { mood: 'good', label: 'Happy', copy: 'Happy: 80%+ checks over at least 10 days.' },
  { mood: 'normal', label: 'Doing okay', copy: 'Doing okay: 50%+ checks while building toward Happy.' },
  { mood: 'low', label: 'Needs care', copy: 'Needs care: 35–49% of checks complete.' },
  { mood: 'bad', label: 'Needs a boost', copy: 'Needs a boost: fewer than 35% complete.' },
];
const titles = ['Meet your habit buddy', 'Five small daily wins', 'Watch your pet thrive', 'Missed days happen', 'Make it your routine'];
const tasks = [
  ['Workout', 'Check off after your workout.'],
  ['Creatine', 'Check off after taking it.'],
  ['Calories logged', 'Enter your total + mark done logging.'],
  ['Weight', 'Add today’s weigh-in.'],
  ['Calories within target', 'Automatic when your finished total is within target.'],
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
  const navigation = useRef(new TourNavigation(titles.length));
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const [page, setPage] = useState(0);
  const [moving, setMoving] = useState(false);
  const [mood, setMood] = useState<ExampleMood>('thriving');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const lesson = moods.find(m => m.mood === mood)!;
  const size = height < 700 ? 132 : 172;
  useEffect(() => {
    if (transitionTimer.current !== null) clearTimeout(transitionTimer.current);
    const frame = requestAnimationFrame(() => {
      navigation.current.settle(); setMoving(false);
      pager.current?.scrollTo({ x: navigation.current.page * width, animated: false });
    });
    return () => { cancelAnimationFrame(frame); if (transitionTimer.current !== null) clearTimeout(transitionTimer.current); };
  }, [width, navigation]);
  const go = (next: number) => {
    if (savingRef.current) return;
    navigation.current.goTo(next); setPage(navigation.current.page); setMoving(navigation.current.transitioning);
    if (transitionTimer.current !== null) clearTimeout(transitionTimer.current);
    pager.current?.scrollTo({ x: navigation.current.page * width, animated: true });
    if (navigation.current.transitioning) {
      // Recover if a platform skips the final scroll event (e.g. reduced motion
      // or an interrupted animation), so the last slide never stays disabled.
      transitionTimer.current = setTimeout(() => {
        pager.current?.scrollTo({ x: navigation.current.page * width, animated: false });
        navigation.current.settle(); setMoving(false);
      }, 1000);
    }
  };
  const finish = async (setup = false) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true); setError('');
    try {
      if (!replay) await commit(s => ({ ...s, onboardingCompleted: true }));
      onClose?.();
      if (setup) router.push('/goals');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save. Please try again.'); }
    finally { savingRef.current = false; setSaving(false); }
  };
  const text = (content: string) => <Text style={{ color: p.muted, fontSize: 16, lineHeight: 24, textAlign: 'center' }}>{content}</Text>;
  const box = { padding: 14, borderWidth: 1, borderColor: p.line, borderRadius: p.retro ? 0 : 14, backgroundColor: p.tile, gap: 6 };
  return <Modal visible animationType="fade" onRequestClose={() => { void finish(); }}>
    <SafeAreaView style={{ flex: 1, backgroundColor: p.bg }}>
      <View pointerEvents="none" style={{ position: 'absolute', inset: 0 }}><Svg width="100%" height="100%"><Defs><RadialGradient id="welcomeGlow" cx="50%" cy="28%" r="65%"><Stop offset="0" stopColor={p.primary} stopOpacity={.13} /><Stop offset=".55" stopColor={p.accent} stopOpacity={.04} /><Stop offset="1" stopColor={p.bg} stopOpacity={0} /></RadialGradient></Defs><Rect width="100%" height="100%" fill="url(#welcomeGlow)" /></Svg></View>
      <View style={{ paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 52 }}>
        <Text style={{ color: p.primary, fontSize: 12, letterSpacing: 2, fontWeight: '700' }}>ON TRACK</Text>
        <Pressable accessibilityRole="button" disabled={saving} onPress={() => { void finish(); }} style={({ pressed }) => ({ minHeight: 44, minWidth: 64, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12, borderRadius: p.retro ? 0 : 12, borderWidth: 1, borderColor: 'transparent', backgroundColor: pressed ? p.tile : 'transparent', opacity: saving ? .5 : 1, ...(Platform.OS === 'web' ? { outlineWidth: 0 } : {}) })}><Text selectable={false} style={{ color: p.muted, fontSize: 15 }}>{replay ? 'Close' : 'Skip'}</Text></Pressable>
      </View>
      <ScrollView ref={pager} horizontal pagingEnabled showsHorizontalScrollIndicator={false} scrollEventThrottle={32} onScrollBeginDrag={event => {
        if (transitionTimer.current !== null) clearTimeout(transitionTimer.current);
        navigation.current.beginDrag(event.nativeEvent.contentOffset.x, width); setPage(navigation.current.page); setMoving(false);
      }} onScroll={event => {
        navigation.current.observePosition(event.nativeEvent.contentOffset.x, width); setPage(navigation.current.page);
        if (!navigation.current.transitioning) {
          if (transitionTimer.current !== null) clearTimeout(transitionTimer.current);
          setMoving(false);
        }
      }} style={{ flex: 1 }}>
        {titles.map((title, i) => {
          const previewMood = i === 0 ? 'normal' : i === 1 ? 'good' : i === 2 ? mood : i === 3 ? 'low' : 'good';
          return <View key={title} style={{ width, height: '100%', flexShrink: 0 }} accessibilityElementsHidden={page !== i} importantForAccessibility={page === i ? 'auto' : 'no-hide-descendants'}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 16, gap: 14, maxWidth: 500, width: '100%', alignSelf: 'center' }}>
              <View style={{ alignItems: 'center' }}>{page === i ? <ProgressBuddy artworkOnly previewMood={previewMood} sizeOverride={i === 2 ? Math.min(size, 132) : size} /> : <BuddyArtwork palette={p} mood={previewMood} size={i === 2 ? Math.min(size, 132) : size} />}</View>
              <Text style={{ color: p.primary, fontSize: 12, textAlign: 'center', marginTop: -10 }}>Tap to pet ♥</Text>
              <Text accessibilityRole="header" style={{ color: p.text, fontSize: 28, fontWeight: '700', textAlign: 'center', lineHeight: 34 }}>{title}</Text>
              {i === 0 ? <>
                {text('Small daily habits help your pet feel happy.')}
                <View style={box}>{text('Your pet’s happiness reflects your habits over the past 2 weeks, not day-to-day weight changes.')}</View>
              </> : null}
              {i === 1 ? <>
                <View style={{ gap: 11 }}>{tasks.map(([label, copy]) => <View key={label} style={{ flexDirection: 'row', gap: 12 }}><View style={{ width: 22, height: 22, borderWidth: 1.5, borderColor: p.primary, borderRadius: p.retro ? 0 : 5, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: p.primary }}>✓</Text></View><View style={{ flex: 1, gap: 2 }}><Text style={{ color: p.text, fontSize: 15, fontWeight: '600' }}>{label}</Text><Text style={{ color: p.muted, fontSize: 13, lineHeight: 18 }}>{copy}</Text></View></View>)}</View>
                {text('Logging still counts if you’re over target.')}
              </> : null}
              {i === 2 ? <>
                {text('Choose a mood. See the habits behind it.')}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>{moods.map(m => <Button key={m.mood} title={m.label} selected={mood === m.mood} onPress={() => setMood(m.mood)} />)}</View>
                <MoodExampleCalendar mood={mood} rule={lesson.copy} />
                <Text style={{ color: p.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' }}>Preview only · Your pet learns your first 7 days.</Text>
              </> : null}
              {i === 3 ? <>
                {text('One rough day doesn’t undo your progress.')}
                <View style={box}>{['Follow your pet’s tip for a small win.', 'Tap a calendar date to fix a past log.'].map((copy,i)=><View key={copy} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 3 }}><Text style={{ color: p.primary, fontSize: 20 }}>{i === 0 ? '↗' : '↶'}</Text><Text style={{ flex: 1, color: p.text, fontSize: 14, lineHeight: 20 }}>{copy}</Text></View>)}</View>
                {text('Only add missed weights you actually recorded.')}
              </> : null}
              {i === 4 ? <>
                {text('Set your goals. Start today.')}
                <View style={box}><Text style={{ color: p.text, fontSize: 15, lineHeight: 23 }}>Change themes, units and reminders in Settings.</Text></View>
                <Button title="Set your goals" onPress={() => { if (!navigation.current.transitioning) void finish(true); }} disabled={saving || moving} />
                <Text style={{ color: p.muted, fontSize: 12, textAlign: 'center' }}>No account needed.</Text>
              </> : null}
            </ScrollView>
          </View>;
        })}
      </ScrollView>
      <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16, gap: 12, borderTopWidth: 1, borderColor: p.line }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>{titles.map((title, i) => <Pressable key={title} accessibilityRole="button" accessibilityLabel={`Slide ${i+1}: ${title}`} accessibilityState={{ selected: page === i }} disabled={saving} onPress={() => go(i)} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: page === i ? 22 : 7, height: 7, borderRadius: 4, backgroundColor: page === i ? p.primary : p.line }} /></Pressable>)}</View>
        {error ? <Text accessibilityRole="alert" style={{ color: p.red }}>{error}</Text> : null}
        <View style={{ flexDirection: 'row', gap: 10 }}>{page > 0 ? <Button title="Back" disabled={saving} onPress={() => go(navigation.current.page - 1)} /> : null}<View style={{ flex: 1 }}><Button title={saving ? 'Saving…' : page === titles.length - 1 ? replay ? 'Done' : 'Start tracking' : 'Next'} primary disabled={saving || (page === titles.length - 1 && moving)} onPress={() => {
          if (navigation.current.page === titles.length - 1) { if (!navigation.current.transitioning) void finish(); }
          else go(navigation.current.page + 1);
        }} /></View></View>
      </View>
    </SafeAreaView>
  </Modal>;
}
