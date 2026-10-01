import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { router } from 'expo-router';
import { useApp } from '../store/AppStore';
import { PixelText } from './PixelText';
import { buddyStatus } from '../domain/buddy';
export function ProgressBuddy() {
  const { data, today, palette: p } = useApp();
  const status = buddyStatus(data, today);
  const [bob] = useState(() => new Animated.Value(0));
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => listener.remove();
  }, []);
  useEffect(() => {
    bob.setValue(0);
    if (reduceMotion) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: status.mood === 'good' ? -4 : -2, duration: status.mood === 'bad' ? 1500 : 800, useNativeDriver: true }),
      Animated.timing(bob, { toValue: 0, duration: status.mood === 'bad' ? 1500 : 800, useNativeDriver: true }),
    ]));
    loop.start();
    return () => { loop.stop(); bob.setValue(0); };
  }, [bob, reduceMotion, status.mood]);
  const color = status.mood === 'good' ? p.green : status.mood === 'bad' ? p.red : status.mood === 'normal' ? p.yellow : p.accent;
  return <Pressable accessibilityRole="button" accessibilityLabel={`${status.label}. Last 14 days: ${status.logged} food logs, ${status.within} within target. View details.`} onPress={() => router.push('/progress')} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 48 }}>
    <Animated.View style={{ transform: [{ translateY: bob }] }}>
      <Svg width={48} height={48} viewBox="0 0 64 64">
        {p.retro ? <>{['0000111111000000','0001111111100000','0011111111110000','0111111111111000','0111111111111000','1111111111111100','1111111111111100','1111111111111100','1111111111111100','1111111111111100','1111111111111100','1111111111111100','1111001100111100','0110001100011000'].flatMap((row,y) => [...row].map((bit,x) => bit === '1' ? <Rect key={`${x}-${y}`} x={8+x*3} y={7+y*3} width={3} height={3} fill={color} /> : null))}<Rect x={20} y={22} width={6} height={6} fill={p.bg} /><Rect x={38} y={22} width={6} height={6} fill={p.bg} /><Path d={status.mood === 'good' ? 'M23 34v3h3v3h12v-3h3v-3' : status.mood === 'bad' ? 'M23 40v-3h3v-3h12v3h3v3' : 'M26 37h12'} fill="none" stroke={p.bg} strokeWidth={3} /></> : <><Ellipse cx={32} cy={58} rx={19} ry={3} fill={p.bg} opacity={.5} />
        <Rect x={17} y={43} width={10} height={12} rx={3} fill={color} stroke={p.bg} strokeWidth={2} />
        <Rect x={37} y={43} width={10} height={12} rx={3} fill={color} stroke={p.bg} strokeWidth={2} />
        <Path d="M13 22 19 11h26l6 11v21l-7 8H20l-7-8z" fill={color} stroke={p.bg} strokeWidth={3} strokeLinejoin="round" />
        <Path d="M22 12 25 5h14l3 7" fill={color} stroke={p.bg} strokeWidth={2} />
        {status.mood === 'good' ? <><Path d="m21 28 4-4 4 4m6 0 4-4 4 4" fill="none" stroke={p.bg} strokeWidth={3} strokeLinecap="round" /><Path d="M24 35q8 12 16 0" fill={p.bg} /></> : <><Circle cx={25} cy={28} r={2.5} fill={p.bg} /><Circle cx={39} cy={28} r={2.5} fill={p.bg} /><Path d={status.mood === 'bad' ? 'M25 40q7-7 14 0' : status.mood === 'unknown' ? 'M28 37h8' : 'M25 36q7 6 14 0'} fill="none" stroke={p.bg} strokeWidth={2.5} strokeLinecap="round" /></>}
        {status.mood === 'good' ? <Path d="m54 7 1 4 4 1-4 1-1 4-1-4-4-1 4-1z" fill={p.primary} /> : null}
      </>}
      </Svg>
    </Animated.View>
    <View><View>{p.retro ? <PixelText text={status.label} color={color} scale={1.3} /> : <Text style={{ color, fontSize: 13, fontWeight: '700' }}>{status.label}</Text>}</View><Text style={{ color: p.muted, fontSize: 10 }}>14 days</Text></View>
  </Pressable>;
}
