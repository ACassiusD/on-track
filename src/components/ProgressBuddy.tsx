import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, Pressable, Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { router } from 'expo-router';
import { useApp } from '../store/AppStore';
import { buddyStatus } from '../domain/buddy';
import { BuddyArtwork } from './BuddyArtwork';

export function ProgressBuddy({ featured = false, compact = false }: { featured?: boolean; compact?: boolean }) {
  const { data, today, palette: p } = useApp();
  const status = buddyStatus(data, today);
  const [bob] = useState(() => new Animated.Value(0));
  const [breath] = useState(() => new Animated.Value(0));
  const [reaction] = useState(() => new Animated.Value(0));
  const [reduceMotion, setReduceMotion] = useState(true);
  const [blink, setBlink] = useState(false);
  const [delighted, setDelighted] = useState(false);
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const native = Platform.OS !== 'web';
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReduceMotion(value); }).catch(() => {});
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { mounted = false; listener.remove(); clearTimeout(reactionTimer.current); reaction.stopAnimation(); };
  }, [reaction]);
  useEffect(() => {
    bob.setValue(0); breath.setValue(0);
    if (reduceMotion) return;
    const speed = status.mood === 'good' ? 1050 : status.mood === 'bad' ? 1800 : 1400;
    const float = Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: 1, duration: speed, useNativeDriver: native, isInteraction: false }),
      Animated.timing(bob, { toValue: 0, duration: speed, useNativeDriver: native, isInteraction: false }),
    ]));
    const breathe = Animated.loop(Animated.sequence([
      Animated.timing(breath, { toValue: 1, duration: 1700, useNativeDriver: native, isInteraction: false }),
      Animated.timing(breath, { toValue: 0, duration: 1700, useNativeDriver: native, isInteraction: false }),
    ]));
    let timer: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => { timer = setTimeout(() => { setBlink(true); timer = setTimeout(() => { setBlink(false); scheduleBlink(); }, 130); }, 3000 + Math.random() * 1800); };
    timer = setTimeout(() => { setBlink(false); scheduleBlink(); }, 130); float.start(); breathe.start();
    return () => { clearTimeout(timer); float.stop(); breathe.stop(); bob.setValue(0); breath.setValue(0); };
  }, [bob, breath, reduceMotion, status.mood, native]);
  const pet = () => {
    clearTimeout(reactionTimer.current); reaction.stopAnimation(); reaction.setValue(0); setDelighted(true);
    Animated.sequence([
      Animated.timing(reaction, { toValue: 1, duration: reduceMotion ? 0 : 180, useNativeDriver: native }),
      Animated.delay(400),
      Animated.timing(reaction, { toValue: 0, duration: 700, useNativeDriver: native }),
    ]).start();
    reactionTimer.current = setTimeout(() => setDelighted(false), 1300);
  };
  const color = status.mood === 'good' ? p.green : status.mood === 'bad' ? p.red : status.mood === 'normal' ? p.yellow : p.accent;
  const hint = status.mood === 'good' ? 'Your routine is on track.' : status.mood === 'bad' ? 'Let’s build a steadier routine.' : status.mood === 'normal' ? 'Small steps keep me growing.' : 'Log your days to help me grow.';
  const size = featured ? 86 : 48;
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: featured ? 12 : 5, minHeight: featured ? compact ? 94 : 98 : 48, ...(featured ? { paddingHorizontal: 8, ...(p.fantasy ? { backgroundColor: p.tile, borderRadius: 16, borderWidth: 1, borderColor: p.line, paddingVertical: 4 } : { borderBottomWidth: 1, borderBottomColor: p.line }) } : {}) }}>
    <Pressable accessibilityRole="button" accessibilityLabel="Pet your buddy" accessibilityHint="Shows a playful reaction. Your progress score stays the same." onPress={pet} style={{ minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' }}>
      {p.realm === 'heaven' ? <View pointerEvents="none" style={{ position: 'absolute', inset: -6 }}><Svg width="100%" height="100%"><Defs><RadialGradient id="petHeavenGlow"><Stop stopColor="#ffe6a3" stopOpacity=".32" /><Stop offset="1" stopColor="#ffe6a3" stopOpacity="0" /></RadialGradient></Defs><Rect width="100%" height="100%" fill="url(#petHeavenGlow)" /></Svg></View> : null}
      <Animated.View style={{ transform: [{ translateY: reduceMotion ? 0 : Animated.add(bob.interpolate({ inputRange: [0, 1], outputRange: [0, status.mood === 'good' ? -4 : -2] }), reaction.interpolate({ inputRange: [0, 1], outputRange: [0, -9] })) }, { rotate: reduceMotion ? '0deg' : bob.interpolate({ inputRange: [0, 1], outputRange: ['-1.5deg', '1.5deg'] }) }, { scaleX: reduceMotion ? 1 : breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] }) }, { scaleY: reduceMotion ? 1 : breath.interpolate({ inputRange: [0, 1], outputRange: [1, .975] }) }] }}><BuddyArtwork palette={p} mood={status.mood} blink={blink && !reduceMotion} delighted={delighted} size={size} /></Animated.View>
      <Animated.Text pointerEvents="none" style={{ position: 'absolute', top: 0, right: 0, color: p.accent, fontSize: 18, opacity: reaction, transform: [{ translateY: reduceMotion ? 0 : reaction.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }] }}>♥</Animated.Text>
    </Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel={`${status.label}. Last 14 days: ${status.logged} food logs, ${status.within} within target. View details.`} onPress={() => router.push('/progress')} style={{ flex: featured ? 1 : undefined, flexShrink: 1, gap: featured ? 3 : 0, minHeight: 44, justifyContent: 'center' }}>
      <Text style={{ color, fontSize: featured ? 23 : 13, fontWeight: '700' }}>{status.label}</Text>
      <Text style={{ color: p.muted, fontSize: featured ? 12 : 10 }}>{featured ? hint : '14 days'}</Text>
    </Pressable>
  </View>;
}
