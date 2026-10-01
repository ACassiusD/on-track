import React, { useEffect, useState } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';
import type { BuddyMood } from '../domain/buddy';
import type { Palette } from './themes';

type Particle = { glyph: string; x: number; y: number; dx: number; rise: number; delay: number; rest: number; duration: number; color: string; size: number; opacity?: number };

function FloatingParticle({ particle: p, scale }: { particle: Particle; scale: number }) {
  const [progress] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.delay(p.delay),
      Animated.timing(progress, { toValue: 1, duration: p.duration, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web', isInteraction: false }),
      Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: Platform.OS !== 'web', isInteraction: false }),
      Animated.delay(p.rest),
    ]));
    loop.start();
    return () => { loop.stop(); progress.setValue(0); };
  }, [progress, p.delay, p.duration, p.rest]);
  return <Animated.Text accessible={false} style={{ position: 'absolute', left: p.x * scale, top: p.y * scale, color: p.color, fontSize: p.size * scale, fontWeight: '700', opacity: progress.interpolate({ inputRange: [0, .15, .65, 1], outputRange: [0, p.opacity ?? .9, p.opacity ?? .9, 0] }), transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -p.rise * scale] }) }, { translateX: progress.interpolate({ inputRange: [0, .5, 1], outputRange: [0, p.dx * scale * .5, p.dx * scale] }) }, { scale: progress.interpolate({ inputRange: [0, .2, .75, 1], outputRange: [.5, 1.1, 1, .7] }) }, { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['-12deg', '12deg'] }) }] }}>{p.glyph}</Animated.Text>;
}

export function BuddyEffects({ mood, palette: p, size, reduceMotion }: { mood: BuddyMood; palette: Palette; size: number; reduceMotion: boolean }) {
  if (reduceMotion || mood === 'normal' || mood === 'unknown') return null;
  const particles: Particle[] = mood === 'thriving' ? [
    { glyph: '✦', x: 0, y: 30, dx: -3, rise: 14, delay: 0, rest: 900, duration: 2300, color: p.primary, size: 13 },
    { glyph: '✧', x: 69, y: 31, dx: 3, rise: 18, delay: 850, rest: 800, duration: 2500, color: p.yellow, size: 15 },
    { glyph: '✦', x: 58, y: 6, dx: 3, rise: 8, delay: 1700, rest: 1400, duration: 2100, color: p.accent, size: 10 },
    { glyph: '♥', x: 13, y: 17, dx: -5, rise: 18, delay: 2200, rest: 4000, duration: 2600, color: '#efb2d1', size: 12 },
    { glyph: '♥', x: 59, y: 17, dx: 5, rise: 16, delay: 3100, rest: 4900, duration: 2800, color: p.accent, size: 9 },
  ] : mood === 'good' ? [
    { glyph: '♥', x: 63, y: 23, dx: 3, rise: 20, delay: 1800, rest: 6500, duration: 3000, color: '#efb2d1', size: 11 },
    { glyph: '✧', x: 4, y: 28, dx: -2, rise: 12, delay: 4200, rest: 4500, duration: 2600, color: p.accent, size: 10 },
  ] : mood === 'low' ? [
    { glyph: 'z', x: 64, y: 27, dx: 4, rise: 14, delay: 1800, rest: 7000, duration: 3500, color: p.muted, size: 10, opacity: .55 },
  ] : [
    { glyph: 'z', x: 60, y: 28, dx: 4, rise: 18, delay: 800, rest: 3300, duration: 4200, color: p.muted, size: 10, opacity: .5 },
    { glyph: 'Z', x: 66, y: 21, dx: 3, rise: 16, delay: 2200, rest: 4200, duration: 4500, color: p.muted, size: 13, opacity: .45 },
  ];
  return <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', width: size, height: size }}>
    {particles.map((particle, i) => <FloatingParticle key={`${mood}-${i}`} particle={particle} scale={size / 86} />)}
  </View>;
}
