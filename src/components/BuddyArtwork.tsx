import React, { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import type { Palette } from './themes';
import type { BuddyMood } from '../domain/buddy';

export function BuddyArtwork({ palette: p, mood, blink = false, delighted = false, size = 68 }: { palette: Palette; mood: BuddyMood; blink?: boolean; delighted?: boolean; size?: number }) {
  const id = useId().replace(/:/g, '');
  const body = `${id}Body`;
  const color = p.realm === 'astral' ? '#b5b7f3' : p.realm === 'heaven' ? '#fffdf7' : p.fantasy ? '#a4e2cd' : mood === 'good' ? p.green : mood === 'bad' ? p.red : mood === 'normal' ? p.yellow : p.primary;
  const happy = delighted || mood === 'good';
  const ink = '#17333d';
  const cheek = '#f5a5b8';
  if (p.retro) return <Svg width={size} height={size} viewBox="0 0 64 64">
    {['0000111111000000','0001111111100000','0011111111110000','0111111111111000','0111111111111000','1111111111111100','1111111111111100','1111111111111100','1111111111111100','1111111111111100','1111111111111100','1111111111111100','1111001100111100','0110001100011000'].flatMap((row,y) => [...row].map((bit,x) => bit === '1' ? <Rect key={`${x}-${y}`} x={8+x*3} y={7+y*3} width={3} height={3} fill={color} /> : null))}
    {blink || happy ? <Path d="M20 26v-3h6v3m12 0v-3h6v3" stroke={ink} strokeWidth={3} fill="none" /> : <><Rect x={20} y={22} width={6} height={9} fill={ink} /><Rect x={38} y={22} width={6} height={9} fill={ink} /><Rect x={20} y={22} width={3} height={3} fill="#fff" /><Rect x={38} y={22} width={3} height={3} fill="#fff" /></>}
    <Rect x={14} y={32} width={6} height={3} fill={cheek} /><Rect x={44} y={32} width={6} height={3} fill={cheek} />
    <Path d={happy ? 'M26 34v3h3v3h6v-3h3v-3' : mood === 'bad' ? 'M26 40v-3h12v3' : 'M29 37h6'} fill="none" stroke={ink} strokeWidth={3} />
    <Rect x={23} y={43} width={18} height={5} fill="#fff" opacity={.24} />
    {happy ? <Path d="M52 8v9m-4-5h8" stroke={p.accent} strokeWidth={3} /> : null}
  </Svg>;
  if (p.realm === 'astral') return <Svg width={size} height={size} viewBox="0 0 80 80">
    <Defs><LinearGradient id={body} x1="15%" y1="0%" x2="80%" y2="100%"><Stop stopColor="#e0fbff" /><Stop offset=".38" stopColor="#a0e3ed" /><Stop offset=".75" stopColor="#a4b8f2" /><Stop offset="1" stopColor="#b69be9" /></LinearGradient></Defs>
    <Ellipse cx={39} cy={71} rx={25} ry={2.5} fill="#080d27" opacity={.22} />
    <Path d="M48 50c13 1 20-5 20-16-8-1-12-6-11-14 8 0 13 4 16 10 1-7 3-10 6-11 2 15-2 30-15 36l-14 5Z" fill={`url(#${body})`} stroke="#828fd1" strokeWidth={1} strokeLinejoin="round" />
    <Path d="M6 44c0-16 10-25 26-25 18 0 29 11 29 25 0 15-12 23-29 21C16 64 6 57 6 44Z" fill={`url(#${body})`} stroke="#87acd5" strokeWidth={1} />
    <Path d="M8 49c14 8 34 8 50 0-3 11-14 16-26 14C19 62 11 58 8 49Z" fill="#f1faff" opacity={.86} />
    <Path d="M40 51c3 2 11 6 14 13-9 5-16 0-18-7" fill="#9bc9eb" stroke="#849dd4" strokeWidth={1} strokeLinecap="round" />
    <Path d="M14 31q5-7 13-7" fill="none" stroke="#fff" strokeWidth={3} opacity={.55} strokeLinecap="round" />
    {blink ? <Path d="M17 42q4 3 8 0m12 0q4 3 8 0" fill="none" stroke={ink} strokeWidth={2} strokeLinecap="round" /> : <><Ellipse cx={21} cy={40} rx={4.5} ry={5.6} fill={ink} /><Ellipse cx={41} cy={40} rx={4.5} ry={5.6} fill={ink} /><Circle cx={19.5} cy={38} r={1.7} fill="#fff" /><Circle cx={39.5} cy={38} r={1.7} fill="#fff" /><Circle cx={22.5} cy={42.5} r={.8} fill="#80e8ef" /><Circle cx={42.5} cy={42.5} r={.8} fill="#80e8ef" /></>}
    <Ellipse cx={14} cy={47} rx={4.5} ry={2.3} fill="#efa9d7" opacity={.8} /><Ellipse cx={48} cy={47} rx={4.5} ry={2.3} fill="#efa9d7" opacity={.8} />
    <Path d={happy?'M27 46q4 1 8 0c0 7-8 7-8 0Z':mood==='bad'?'M28 50q3-3 6 0':'M28 47q3 4 6 0'} stroke={ink} strokeWidth={1.5} fill={happy?ink:'none'} strokeLinecap="round" />
    {happy ? <Ellipse cx={31} cy={50} rx={2} ry={1} fill={cheek} /> : null}
    <Path d="m34 27 8 2 8-3" stroke="#fff" strokeWidth={.7} opacity={.7} />{[[34,27],[42,29],[50,26]].map(([x,y],i)=><Circle key={i} cx={x} cy={y} r={1.1} fill="#f6f2ff" />)}
    <Path d="M29 16q-2-7-6-6m9 6q2-9 6-7" stroke="#bceef9" strokeWidth={2} fill="none" strokeLinecap="round" />
    <Circle cx={22} cy={7} r={1.6} fill="#bceef9" /><Circle cx={39} cy={6} r={1.2} fill="#e2c6ff" />
    <Path d="m58 10 1.3 3.7L63 15l-3.7 1.3L58 20l-1.3-3.7L53 15l3.7-1.3Z" fill="#e8d1ff" /><Circle cx={9} cy={25} r={1.2} fill="#a4e8ee" />
  </Svg>;
  return <Svg width={size} height={size} viewBox="0 0 80 80">
    <Defs><LinearGradient id={body} x1="0%" y1="0%" x2="85%" y2="100%"><Stop stopColor="#f4ffe8" /><Stop offset=".35" stopColor={color} /><Stop offset="1" stopColor={p.realm === 'heaven' ? '#dce2e3' : p.fantasy ? '#54bca8' : color} /></LinearGradient></Defs>
    <Ellipse cx={40} cy={73} rx={23} ry={3} fill="#000" opacity={.14} />
    {p.realm === 'heaven' ? <><Path d="M21 39C5 20 1 37 9 47c-4 3 2 9 13 9m37-17c16-19 20-2 12 8 4 3-2 9-13 9" fill="#ffffff" stroke="#d1cec4" strokeWidth={1} /><Path d="m10 38 10 10m50-10-10 10" stroke="#e9e8e2" strokeWidth={1.2} /><Ellipse cx={40} cy={11} rx={13} ry={3.5} fill="none" stroke="#e5c88d" strokeWidth={2} /></> : p.fantasy ? <><Path d="M22 40C9 25 3 34 9 48l13 8m36-16c13-15 19-6 13 8l-13 8" fill="#bddfe4" stroke="#7babac" strokeWidth={1.2} /><Path d="m11 37 8 9m50-9-8 9" stroke="#e4fff0" strokeWidth={1.3} /><Path d="M22 30 16 10q13 0 19 17m10 0q6-17 19-17l-6 20" fill={`url(#${body})`} stroke="#72bfae" strokeWidth={1.3} /><Path d="m21 16 5 13 5-3m18 0 5 3 5-13" fill="#e0eed2" /></> : <><Ellipse cx={26} cy={23} rx={9} ry={18} transform="rotate(-18 26 23)" fill={`url(#${body})`} /><Ellipse cx={54} cy={23} rx={9} ry={18} transform="rotate(18 54 23)" fill={`url(#${body})`} /><Ellipse cx={26} cy={20} rx={4} ry={10} fill="#fff4e4" opacity={.7} /><Ellipse cx={54} cy={20} rx={4} ry={10} fill="#fff4e4" opacity={.7} /></>}
    <Ellipse cx={27} cy={66} rx={9} ry={5} fill={color} /><Ellipse cx={53} cy={66} rx={9} ry={5} fill={color} />
    <Path d="M14 45c0-18 11-25 26-25s26 7 26 25c0 17-10 24-26 24S14 62 14 45Z" fill={`url(#${body})`} stroke={p.realm === 'heaven' ? '#c5c9c7' : p.fantasy ? '#6bb6a3' : color} strokeWidth={1} />
    <Ellipse cx={40} cy={59} rx={15} ry={9} fill="#f4ffe9" opacity={.6} />
    <Path d="M23 51q-7 2-5 8m39-8q7 2 5 8" fill="none" stroke={p.realm === 'heaven' ? '#b8c5c8' : p.fantasy ? '#5ab3a0' : ink} opacity={.3} strokeWidth={3} strokeLinecap="round" />
    {p.fantasy ? <><Path d="m40 25 5 5-5 6-5-6Z" fill="#f8dfa4" stroke="#b89b5b" strokeWidth={.8} /><Path d="m40 27 2 3-2 3-2-3Z" fill="#fff4ce" /></> : <Path d="M40 22c-8-9-15-9-16-8 0 9 7 11 16 8 2-8 9-11 13-8-1 7-7 10-13 8" fill="#6aad83" />}
    {blink ? <Path d="M24 43q5 3 10 0m12 0q5 3 10 0" fill="none" stroke={ink} strokeWidth={2.5} strokeLinecap="round" /> : <><Ellipse cx={29} cy={43} rx={4.8} ry={6.2} fill={ink} /><Ellipse cx={51} cy={43} rx={4.8} ry={6.2} fill={ink} /><Circle cx={27.5} cy={40.5} r={1.8} fill="#fff" /><Circle cx={49.5} cy={40.5} r={1.8} fill="#fff" /><Circle cx={30.5} cy={45.5} r={.8} fill="#98d6d7" /><Circle cx={52.5} cy={45.5} r={.8} fill="#98d6d7" />{mood === 'bad' && !delighted ? <Path d="M24 37q4 0 9-3m14 0q5 3 9 3" stroke={ink} opacity={.5} strokeWidth={1.3} strokeLinecap="round" /> : null}</>}
    <Ellipse cx={22} cy={51} rx={5} ry={2.7} fill={cheek} opacity={.7} /><Ellipse cx={58} cy={51} rx={5} ry={2.7} fill={cheek} opacity={.7} />
    <Path d={happy ? 'M35 51q5 1 10 0c0 9-10 9-10 0Z' : mood === 'bad' ? 'M36 55q4-4 8 0' : 'M36 52q4 5 8 0'} fill={happy ? ink : 'none'} stroke={ink} strokeWidth={1.5} strokeLinecap="round" />
    {happy ? <Ellipse cx={40} cy={56} rx={2.8} ry={1.3} fill={cheek} /> : null}
    <Ellipse cx={25} cy={30} rx={7} ry={3} fill="#fff" opacity={.25} transform="rotate(-30 25 30)" />
    {happy ? <Path d="m69 19 1.5 4.5L75 25l-4.5 1.5L69 31l-1.5-4.5L63 25l4.5-1.5Z" fill={p.accent} /> : null}
  </Svg>;
}
