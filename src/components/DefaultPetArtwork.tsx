import React, { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Stop } from 'react-native-svg';
import type { BuddyMood } from '../domain/buddy';
import type { DefaultPet } from '../domain/defaultPets';

// Simple silhouettes and small faces follow the chosen mascot concepts.
export function DefaultPetArtwork({ pet, mood, blink, delighted, size }: { pet: DefaultPet; mood: BuddyMood; blink: boolean; delighted: boolean; size: number }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const body = `${id}Mochi`, leaf = `${id}Sprout`;
  const joyful = delighted || mood === 'thriving';
  const happy = joyful || mood === 'good';
  const sleepy = mood === 'low' && !delighted;
  const ink = '#48352e';
  const green = pet === 'sprout';
  const faceY = pet === 'mochi' ? 52 : pet === 'rice' ? 48 : 50;
  return <Svg testID={`default-pet-${pet}`} width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id={body} x1="20%" y1="0%" x2="80%" y2="100%"><Stop stopColor={green ? '#d3e8bd' : '#fff2db'} /><Stop offset="1" stopColor={green ? '#b1d19f' : '#f8e3bd'} /></LinearGradient>
      <LinearGradient id={leaf} x1="0%" y1="0%" x2="100%" y2="100%"><Stop stopColor="#aed6a0" /><Stop offset="1" stopColor="#80b49a" /></LinearGradient>
    </Defs>
    <Ellipse cx={50} cy={90} rx={32} ry={3.2} fill="#071320" opacity={.3} />
    {pet === 'mochi' ? <>
      <Path d="M35 35C15 26 20 12 29 13c8 1 12 10 13 19m17 0C61 14 65 5 74 8c11 5 1 24-7 29" fill={`url(#${body})`} />
      <Path d="M29 26q2 4 6 4" fill="none" stroke="#e7c99f" strokeWidth={1} strokeLinecap="round" />
      <Path d="M50 31v-8" stroke="#86b798" strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M50 23c-6 1-10-1-9-5 4-1 8 2 9 5 1-4 6-6 9-4 0 4-4 6-9 4Z" fill={`url(#${leaf})`} />
      <Ellipse cx={36} cy={87} rx={5} ry={4} fill="#fae8c8" /><Ellipse cx={64} cy={87} rx={5} ry={4} fill="#fae8c8" />
      <Path d="M50 29c-18 0-25 16-32 34C7 89 29 89 50 89s42 0 32-26C75 45 68 29 50 29Z" fill={`url(#${body})`} />
      <Path d="M36 65c8 0 8 10 0 11m28-11c-8 0-8 10 0 11" stroke="#d9ba91" strokeWidth={1.4} strokeLinecap="round" fill="none" />
    </> : pet === 'sprout' ? <>
      <Path d="M49 30C44 23 42 17 45 12c3-5 12-5 15 0 3 5-1 11-6 11-5 0-6-4-4-7 1-2 4-2 5-1" stroke={`url(#${body})`} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Ellipse cx={36} cy={87} rx={5} ry={4} fill="#b3d5a2" /><Ellipse cx={65} cy={87} rx={5} ry={4} fill="#b3d5a2" />
      <Path d="M50 28c-18 0-27 12-31 24L9 65c-5 8 4 12 12 5-1 15 10 19 29 19s30-4 29-19c8 7 17 3 12-5L81 52C77 40 68 28 50 28Z" fill={`url(#${body})`} />
      <Ellipse cx={50} cy={50} rx={23} ry={17} fill="#fff0d8" />
      <Path d="M18 73q3-1 4-4m56 0q1 3 4 4" stroke="#97bd8a" strokeWidth={1} fill="none" strokeLinecap="round" />
    </> : <>
      <Path d="M65 28c-8-6-9-14-5-17 5-1 8 3 8 8 4-4 10-4 12 0-1 6-7 9-15 9Z" fill={`url(#${leaf})`} />
      <Ellipse cx={36} cy={86} rx={5} ry={4} fill="#fae8c8" /><Ellipse cx={64} cy={86} rx={5} ry={4} fill="#fae8c8" />
      <Path d="M50 22c-12 0-28 19-39 43C1 87 23 88 50 88s49-1 39-23C78 41 62 22 50 22Z" fill={`url(#${body})`} />
      <Path d="M36 65q14-3 28 0l-1 22H37Z" fill="#8eaa7b" />
      <Path d="M29 65q-2 11 5 11c6 0 7-7 3-10m34-1q2 11-5 11c-6 0-7-7-3-10" fill="#ffefd5" stroke="#dfc19a" strokeWidth={1.2} strokeLinecap="round" />
    </>}
    <G transform={`translate(50 ${faceY})`}>
      <Circle cx={-18} cy={5} r={4.8} fill="#fac4a5" /><Circle cx={18} cy={5} r={4.8} fill="#fac4a5" />
      {[-11, 11].map(x => blink || sleepy || joyful ? <Path key={x} d={joyful && !blink ? `M${x-2.6} 0q2.6-4 5.2 0` : `M${x-2.6} 0q2.6 2.8 5.2 0`} stroke={ink} strokeWidth={1.7} fill="none" strokeLinecap="round" /> : <Circle key={x} cx={x} cy={0} r={2.8} fill={ink} />)}
      {mood === 'bad' && !delighted ? <Path d="M-14-6q3 1 6-1m16 0q3 2 6 1" stroke={ink} opacity={.65} strokeWidth={1} fill="none" strokeLinecap="round" /> : null}
      <Path d={joyful ? 'M-3.5 3.5q3.5 1 7 0c0 7-7 7-7 0Z' : mood === 'bad' ? 'M-2.5 5q2.5-3 5 0' : sleepy || mood === 'unknown' ? 'M-3.5 3q1.5 3 3.5 0 2 3 3.5 0' : happy ? 'M-4 3q2 4 4 0 2 4 4 0' : 'M-3.5 3q1.5 3 3.5 0 2 3 3.5 0'} stroke={ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill={joyful ? ink : 'none'} />
      {joyful ? <Ellipse cx={0} cy={7} rx={2.2} ry={1.2} fill="#ef997c" /> : null}
    </G>
    {joyful ? <Path d="M9 42l-3-2m4 10H6m84-8 3-2m-3 10h4" stroke="#f5bda0" strokeWidth={1.8} strokeLinecap="round" /> : null}
  </Svg>;
}
