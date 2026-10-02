import React, { useEffect, useState } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import type { DefaultPet } from '../domain/defaultPets';
import type { BuddyMood } from '../domain/buddy';
import type { TaskReaction } from '../domain/taskReactions';
import type { Palette } from './themes';
import { BuddyArtwork } from './BuddyArtwork';

export const taskReactionCopy: Record<TaskReaction, { title: string; caption: string }> = {
  workout: { title: 'Nice workout!', caption: 'Your buddy’s getting strong too.' },
  creatine: { title: 'Creatine done!', caption: 'A tiny scoop for your buddy.' },
  calories: { title: 'Calories logged!', caption: 'Your buddy gives it a little check.' },
  weight: { title: 'Weight logged!', caption: 'Your buddy takes a turn on the scale.' },
  target: { title: 'Within your target!', caption: 'Calories within target—another daily win.' },
  complete: { title: 'All done for today!', caption: 'Great job taking care of your pet.' },
};

// Small vector props work with every creature and don't need a 3D renderer.
export function TaskProp({ task, palette: p, size }: { task: TaskReaction; palette: Palette; size: number }) {
  const ink = '#17333d';
  return <Svg width={size} height={size} viewBox="0 0 80 80">
    {task === 'workout' ? <>
      <Rect x={17} y={58} width={46} height={4} rx={2} fill="#d8e8ef" stroke={ink} strokeWidth={1} />
      {[17, 57].map(x => <Rect key={x} x={x} y={50} width={6} height={20} rx={2} fill={p.accent} stroke={ink} strokeWidth={1.5} />)}
      {[12, 63].map(x => <Rect key={x} x={x} y={53} width={5} height={14} rx={2} fill={p.primary} stroke={ink} strokeWidth={1.5} />)}
      <Ellipse cx={29} cy={59} rx={4} ry={3} fill="#fff8e5" stroke={ink} strokeWidth={1} /><Ellipse cx={51} cy={59} rx={4} ry={3} fill="#fff8e5" stroke={ink} strokeWidth={1} />
    </> : task === 'creatine' ? <>
      <Rect x={47} y={52} width={17} height={20} rx={4} fill="#f6fbff" stroke={ink} strokeWidth={1.5} />
      <Rect x={46} y={50} width={19} height={5} rx={2} fill={p.primary} stroke={ink} strokeWidth={1} />
      <Path d="M51 60h9m-7 4h5" stroke={p.accent} strokeWidth={2} strokeLinecap="round" />
      <Path d="M23 54h10" stroke={ink} strokeWidth={2.5} strokeLinecap="round" /><Path d="M32 51h9v4q-4.5 5-9 0Z" fill="#f7fbff" stroke={ink} strokeWidth={1} />
      <Circle cx={35} cy={50} r={1.5} fill="#fff" /><Circle cx={39} cy={49} r={1.2} fill="#fff" />
    </> : task === 'calories' ? <>
      <Rect x={25} y={51} width={28} height={25} rx={3} fill="#fff8e7" stroke={ink} strokeWidth={1.5} />
      <Rect x={32} y={49} width={14} height={5} rx={2} fill={p.accent} stroke={ink} strokeWidth={1} />
      <Path d="m31 60 3 3 5-6m-8 13 3 3 5-6" fill="none" stroke="#329379" strokeWidth={2} strokeLinecap="round" /><Path d="M42 60h6m-6 10h6" stroke="#97a5ad" strokeWidth={1.5} />
      <Path d="m52 56 4 3-9 12-4 2 1-5Z" fill={p.primary} stroke={ink} strokeWidth={1} /><Ellipse cx={53} cy={61} rx={3} ry={2.5} fill="#fff8e5" stroke={ink} strokeWidth={1} />
    </> : task === 'weight' ? <>
      <Rect x={15} y={66} width={50} height={12} rx={4} fill={p.accent} stroke={ink} strokeWidth={1.5} />
      <Rect x={29} y={69} width={22} height={6} rx={2} fill="#f2ffed" /><Path d="M37 72h6" stroke={ink} strokeWidth={1.5} strokeLinecap="round" />
    </> : task === 'target' ? <>
      <Path d="M28 53q12-6 24 0v10q-1 10-12 14-11-4-12-14Z" fill={p.primary} stroke={ink} strokeWidth={1.5} />
      <Path d="m33 62 5 5 9-10" stroke={ink} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="m17 42 2 5 5 2-5 2-2 5-2-5-5-2 5-2Zm47-10 1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5Z" fill={p.accent} />
    </> : <>
      <Path d="M29 54h22v7q0 11-11 11T29 61Zm0 3h-7q0 10 9 10m20-10h7q0 10-9 10M40 72v5m-8 0h16" fill="#f4da90" stroke={ink} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="m40 57 2 4 4 .5-3 3 .7 4-3.7-2-3.7 2 .7-4-3-3 4-.5Z" fill="#fff8de" />
      <Path d="M13 31c-6-6-10 2 0 8 10-6 6-14 0-8m53-10c-6-6-10 2 0 8 10-6 6-14 0-8" fill="#f5a5b8" />
    </>}
  </Svg>;
}

export function BuddyTaskReaction({ task, pet, palette, mood, size, reduceMotion }: { task: TaskReaction; pet?: DefaultPet; palette: Palette; mood: BuddyMood; size: number; reduceMotion: boolean }) {
  const [pulse] = useState(() => new Animated.Value(0));
  useEffect(() => {
    pulse.setValue(0);
    if (reduceMotion) return;
    const motion = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: task === 'workout' ? 450 : 550, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web', isInteraction: false }),
      Animated.timing(pulse, { toValue: 0, duration: 550, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web', isInteraction: false }),
      Animated.delay(180),
    ]));
    motion.start();
    return () => { motion.stop(); pulse.setValue(0); };
  }, [pulse, task, reduceMotion]);
  const scale = size / 80;
  const bodyLift = task === 'weight' ? -4 : task === 'target' || task === 'complete' ? -7 : task === 'workout' ? 2 : -1;
  const propLift = task === 'workout' ? -12 : task === 'creatine' ? -8 : task === 'weight' ? 0 : -2;
  return <View pointerEvents="none" accessible={false} style={{ width: size, height: size }}>
    <Animated.View style={{ transform: [{ translateY: reduceMotion ? task === 'weight' ? -3 * scale : 0 : pulse.interpolate({ inputRange: [0, 1], outputRange: [task === 'weight' ? -3 * scale : 0, bodyLift * scale] }) }, { rotate: reduceMotion ? '0deg' : pulse.interpolate({ inputRange: [0, 1], outputRange: task === 'creatine' ? ['0deg', '-8deg'] : task === 'calories' ? ['-3deg', '3deg'] : ['0deg', '0deg'] }) }] }}>
      <BuddyArtwork pet={pet} palette={palette} mood={mood} delighted size={size} />
    </Animated.View>
    <Animated.View style={{ position: 'absolute', inset: 0, transform: [{ translateY: reduceMotion ? 0 : pulse.interpolate({ inputRange: [0, 1], outputRange: [0, propLift * scale] }) }, { rotate: reduceMotion ? '0deg' : pulse.interpolate({ inputRange: [0, 1], outputRange: task === 'creatine' ? ['0deg', '-12deg'] : ['0deg', '0deg'] }) }] }}><TaskProp task={task} palette={palette} size={size} /></Animated.View>
  </View>;
}
