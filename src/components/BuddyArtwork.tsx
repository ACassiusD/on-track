import React, { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import type { Palette } from './themes';
import type { BuddyMood } from '../domain/buddy';

export function BuddyArtwork({ palette: p, mood, blink = false, delighted = false, size = 68 }: { palette: Palette; mood: BuddyMood; blink?: boolean; delighted?: boolean; size?: number }) {
  const id = useId().replace(/:/g, '');
  const body = `${id}Body`;
  const color = p.realm === 'astral' ? '#b5b7f3' : p.realm === 'heaven' ? '#e2cef5' : p.fantasy ? '#a4e2cd' : mood === 'good' ? p.green : mood === 'bad' ? p.red : mood === 'normal' ? p.yellow : p.primary;
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
    <Defs><LinearGradient id={body} x1="0%" y1="0%" x2="70%" y2="100%"><Stop stopColor="#dce6ff" /><Stop offset=".55" stopColor="#a7b4ef" /><Stop offset="1" stopColor="#8280c9" /></LinearGradient></Defs>
    <Ellipse cx={40} cy={70} rx={25} ry={3} fill="#000" opacity={.13} />
    <Path d="M51 47q16 6 18-13c-9 1-13-5-13-13q12 1 17 10 4-6 6-9 3 22-12 33l-16 3" fill={`url(#${body})`} stroke="#8a8ccc" strokeWidth={1} />
    <Path d="M8 43c0-18 13-24 29-22 16 1 23 13 21 27-3 13-12 18-29 15C15 61 8 55 8 43Z" fill={`url(#${body})`} stroke="#8793c6" strokeWidth={1} />
    <Path d="M10 48q16 8 46 1c-4 13-15 15-27 12-10-2-16-5-19-13" fill="#fff1e5" opacity={.75} />
    <Path d="M37 55q0 15 11 12l-2-16" fill="#aab3eb" stroke="#8793c6" strokeWidth={1} />
    {blink ? <Path d="M20 40q4 3 8 0m10 0q4 3 8 0" fill="none" stroke={ink} strokeWidth={2} strokeLinecap="round" /> : <><Ellipse cx={24} cy={39} rx={4} ry={5} fill={ink} /><Ellipse cx={42} cy={39} rx={4} ry={5} fill={ink} /><Circle cx={23} cy={37} r={1.5} fill="#fff" /><Circle cx={41} cy={37} r={1.5} fill="#fff" /></>}
    <Ellipse cx={17} cy={46} rx={4} ry={2} fill={cheek} opacity={.65} /><Ellipse cx={48} cy={46} rx={4} ry={2} fill={cheek} opacity={.65} />
    <Path d={happy?'M29 45q4 1 8 0c0 7-8 7-8 0Z':mood==='bad'?'M30 49q3-3 6 0':'M30 46q3 4 6 0'} stroke={ink} strokeWidth={1.5} fill={happy?ink:'none'} strokeLinecap="round" />
    <Path d="m27 27 6 2 10-2" stroke="#fff8d8" strokeWidth={.7} opacity={.7} />{[[27,27],[33,29],[43,27]].map(([x,y],i)=><Circle key={i} cx={x} cy={y} r={1.2} fill="#fff8d8" />)}
    <Path d="M33 16q-8-5-5-10m11 10q6-4 5-8m-2 6 3-1" stroke="#c6dafa" strokeWidth={2} opacity={.7} fill="none" strokeLinecap="round" />
    <Path d="m61 7 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" fill="#f4dfb9" />
  </Svg>;
  return <Svg width={size} height={size} viewBox="0 0 80 80">
    <Defs><LinearGradient id={body} x1="0%" y1="0%" x2="85%" y2="100%"><Stop stopColor="#f4ffe8" /><Stop offset=".35" stopColor={color} /><Stop offset="1" stopColor={p.realm === 'heaven' ? '#b89ada' : p.fantasy ? '#54bca8' : color} /></LinearGradient></Defs>
    <Ellipse cx={40} cy={73} rx={23} ry={3} fill="#000" opacity={.14} />
    {p.realm === 'heaven' ? <><Path d="M21 39C5 20 1 37 9 47c-4 3 2 9 13 9m37-17c16-19 20-2 12 8 4 3-2 9-13 9" fill="#fff8f0" stroke="#c2abdb" strokeWidth={1} /><Path d="m10 38 10 10m50-10-10 10" stroke="#e2d6ec" strokeWidth={1.2} /><Ellipse cx={40} cy={11} rx={13} ry={3.5} fill="none" stroke="#e5c88d" strokeWidth={2} /></> : p.fantasy ? <><Path d="M22 40C9 25 3 34 9 48l13 8m36-16c13-15 19-6 13 8l-13 8" fill="#bddfe4" stroke="#7babac" strokeWidth={1.2} /><Path d="m11 37 8 9m50-9-8 9" stroke="#e4fff0" strokeWidth={1.3} /><Path d="M22 30 16 10q13 0 19 17m10 0q6-17 19-17l-6 20" fill={`url(#${body})`} stroke="#72bfae" strokeWidth={1.3} /><Path d="m21 16 5 13 5-3m18 0 5 3 5-13" fill="#e0eed2" /></> : <><Ellipse cx={26} cy={23} rx={9} ry={18} transform="rotate(-18 26 23)" fill={`url(#${body})`} /><Ellipse cx={54} cy={23} rx={9} ry={18} transform="rotate(18 54 23)" fill={`url(#${body})`} /><Ellipse cx={26} cy={20} rx={4} ry={10} fill="#fff4e4" opacity={.7} /><Ellipse cx={54} cy={20} rx={4} ry={10} fill="#fff4e4" opacity={.7} /></>}
    <Ellipse cx={27} cy={66} rx={9} ry={5} fill={color} /><Ellipse cx={53} cy={66} rx={9} ry={5} fill={color} />
    <Path d="M14 45c0-18 11-25 26-25s26 7 26 25c0 17-10 24-26 24S14 62 14 45Z" fill={`url(#${body})`} stroke={p.realm === 'heaven' ? '#bda1d8' : p.fantasy ? '#6bb6a3' : color} strokeWidth={1} />
    <Ellipse cx={40} cy={59} rx={15} ry={9} fill="#f4ffe9" opacity={.6} />
    <Path d="M23 51q-7 2-5 8m39-8q7 2 5 8" fill="none" stroke={p.realm === 'heaven' ? '#a38cc4' : p.fantasy ? '#5ab3a0' : ink} opacity={.3} strokeWidth={3} strokeLinecap="round" />
    {p.fantasy ? <><Path d="m40 25 5 5-5 6-5-6Z" fill="#f8dfa4" stroke="#b89b5b" strokeWidth={.8} /><Path d="m40 27 2 3-2 3-2-3Z" fill="#fff4ce" /></> : <Path d="M40 22c-8-9-15-9-16-8 0 9 7 11 16 8 2-8 9-11 13-8-1 7-7 10-13 8" fill="#6aad83" />}
    {blink ? <Path d="M24 43q5 3 10 0m12 0q5 3 10 0" fill="none" stroke={ink} strokeWidth={2.5} strokeLinecap="round" /> : <><Ellipse cx={29} cy={43} rx={4.8} ry={6.2} fill={ink} /><Ellipse cx={51} cy={43} rx={4.8} ry={6.2} fill={ink} /><Circle cx={27.5} cy={40.5} r={1.8} fill="#fff" /><Circle cx={49.5} cy={40.5} r={1.8} fill="#fff" /><Circle cx={30.5} cy={45.5} r={.8} fill="#98d6d7" /><Circle cx={52.5} cy={45.5} r={.8} fill="#98d6d7" />{mood === 'bad' && !delighted ? <Path d="M24 37q4 0 9-3m14 0q5 3 9 3" stroke={ink} opacity={.5} strokeWidth={1.3} strokeLinecap="round" /> : null}</>}
    <Ellipse cx={22} cy={51} rx={5} ry={2.7} fill={cheek} opacity={.7} /><Ellipse cx={58} cy={51} rx={5} ry={2.7} fill={cheek} opacity={.7} />
    <Path d={happy ? 'M35 51q5 1 10 0c0 9-10 9-10 0Z' : mood === 'bad' ? 'M36 55q4-4 8 0' : 'M36 52q4 5 8 0'} fill={happy ? ink : 'none'} stroke={ink} strokeWidth={1.5} strokeLinecap="round" />
    {happy ? <Ellipse cx={40} cy={56} rx={2.8} ry={1.3} fill={cheek} /> : null}
    <Ellipse cx={25} cy={30} rx={7} ry={3} fill="#fff" opacity={.25} transform="rotate(-30 25 30)" />
    {happy ? <Path d="m69 19 1.5 4.5L75 25l-4.5 1.5L69 31l-1.5-4.5L63 25l4.5-1.5Z" fill={p.accent} /> : null}
  </Svg>;
}
