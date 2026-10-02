import React, { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import type { BuddyMood } from '../domain/buddy';

// Shared expressions keep both companions responsive to mood, blinking and petting.
function Face({ x, y, mood, blink, delighted, astral }: { x: number; y: number; mood: BuddyMood; blink: boolean; delighted: boolean; astral: boolean }) {
  const joyful = delighted || mood === 'thriving';
  const happy = joyful || mood === 'good';
  const sleepy = mood === 'low' && !delighted;
  const ink = astral ? '#24335a' : '#493b32';
  return <G transform={`translate(${x} ${y})`}>
    <Ellipse cx={-19} cy={8} rx={5.5} ry={3} fill={astral ? '#efb4e0' : '#edb4a1'} opacity={.75} />
    <Ellipse cx={19} cy={8} rx={5.5} ry={3} fill={astral ? '#efb4e0' : '#edb4a1'} opacity={.75} />
    {[-12, 12].map(cx => <G key={cx}>
      {blink || joyful ? <Path d={joyful && !blink ? `M${cx-4} 1q4-5 8 0` : `M${cx-4} 1q4 3 8 0`} stroke={ink} strokeWidth={2.2} strokeLinecap="round" fill="none" /> : <>
        <Ellipse cx={cx} cy={0} rx={4.4} ry={sleepy ? 2.5 : 5.7} fill={ink} />
        <Circle cx={cx-1.4} cy={sleepy ? -.4 : -2} r={sleepy ? .9 : 1.6} fill="#fffdf8" />
        {!sleepy ? <Circle cx={cx+1.3} cy={2.4} r={.8} fill={astral ? '#b1eff7' : '#d8ba8b'} /> : null}
      </>}
    </G>)}
    {mood === 'bad' && !delighted ? <Path d="M-17-8q4 1 8-2m18 0q4 3 8 2" stroke={ink} strokeWidth={1.3} strokeLinecap="round" fill="none" opacity={.65} /> : null}
    {!astral ? <Path d="M-2.2 6q2.2-1.7 4.4 0L0 8Z" fill="#aa7865" /> : null}
    <Path d={joyful ? 'M-4 10q4 1 8 0c0 7-8 7-8 0Z' : happy ? 'M-5 10q5 6 10 0' : mood === 'bad' ? 'M-3 13q3-3 6 0' : sleepy || mood === 'unknown' ? 'M-2 12h4' : 'M-3 11q3 2 6 0'} stroke={ink} strokeWidth={1.6} strokeLinecap="round" fill={joyful ? ink : 'none'} />
    {joyful ? <Ellipse cx={0} cy={14} rx={2.4} ry={1.2} fill="#efb4bc" /> : null}
  </G>;
}

export function RefinedBuddyArtwork({ astral, mood, blink, delighted, size }: { astral: boolean; mood: BuddyMood; blink: boolean; delighted: boolean; size: number }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const fur = `${id}Fur`, ear = `${id}Ear`, leaf = `${id}Leaf`, glow = `${id}Glow`, fin = `${id}Fin`;
  const joyful = delighted || mood === 'thriving';
  return <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <RadialGradient id={fur} cx="32%" cy="25%" rx="75%" ry="75%">
        <Stop stopColor={astral ? '#ddf8ff' : '#fff3d6'} /><Stop offset=".45" stopColor={astral ? '#b5caef' : '#ecd09b'} /><Stop offset="1" stopColor={astral ? '#9785cc' : '#cfaa76'} />
      </RadialGradient>
      <LinearGradient id={ear} x1="0%" y1="0%" x2="80%" y2="100%"><Stop stopColor="#f6d5c1" /><Stop offset="1" stopColor="#e7b2a0" /></LinearGradient>
      <LinearGradient id={leaf} x1="0%" y1="0%" x2="100%" y2="100%"><Stop stopColor="#b3dca5" /><Stop offset="1" stopColor="#579b83" /></LinearGradient>
      <LinearGradient id={fin} x1="0%" y1="0%" x2="70%" y2="100%"><Stop stopColor="#d1e9fb" /><Stop offset="1" stopColor="#8b81c6" /></LinearGradient>
      <RadialGradient id={glow}><Stop stopColor={astral ? '#b9d0ff' : '#ffdda3'} stopOpacity=".18" /><Stop offset="1" stopColor={astral ? '#b9d0ff' : '#ffdda3'} stopOpacity="0" /></RadialGradient>
    </Defs>
    <Ellipse cx={50} cy={51} rx={46} ry={43} fill={`url(#${glow})`} />
    <Ellipse cx={astral ? 45 : 50} cy={88} rx={astral ? 28 : 24} ry={3} fill={astral ? '#080d27' : '#101b24'} opacity={.2} />
    {astral ? <>
      <Path d="M64 63C80 62 85 53 83 40c-12-2-17-9-17-19 10 1 17 6 20 14 3-8 7-12 11-13 2 16-1 28-10 37-6 6-13 9-23 10Z" fill={`url(#${fin})`} stroke="#8e94cc" strokeWidth={1.2} strokeLinejoin="round" />
      <Path d="M71 27q9 5 13 14m10-12q-7 14-9 21" fill="none" stroke="#eef5ff" strokeWidth={1.2} opacity={.5} strokeLinecap="round" />
      <Path d="M12 50C12 33 25 23 43 24c21 0 33 13 32 31-1 18-15 28-34 26C23 80 11 69 12 50Z" fill={`url(#${fur})`} stroke="#9babd8" strokeWidth={1.2} />
      <Path d="M15 62c17 10 39 11 57-1-4 13-17 19-31 17C28 77 19 71 15 62Z" fill="#f0f2ff" opacity={.9} />
      <Path d="M50 64c5 1 13 7 15 15-12 6-21 0-24-9" fill={`url(#${fin})`} stroke="#919ed0" strokeWidth={1.1} strokeLinecap="round" />
      <Path d="M46 69q5 6 12 8" stroke="#e2f3ff" strokeWidth={1.3} opacity={.65} strokeLinecap="round" fill="none" />
      <Path d="M21 39q8-10 19-10" fill="none" stroke="#f4fdff" strokeWidth={3} opacity={.55} strokeLinecap="round" />
      <Path d="m49 33 6 4 8-3" fill="none" stroke="#f9edff" strokeWidth={.8} opacity={.8} />
      {[[49,33],[55,37],[63,34]].map(([x,y],i)=><Circle key={i} cx={x} cy={y} r={i===1 ? 1.4 : 1} fill="#fff1ff" />)}
      <Face x={42} y={49} mood={mood} blink={blink} delighted={delighted} astral />
      <Path d="M36 19q-4-7-3-12m9 12q1-8 6-11" fill="none" stroke="#b7eaf5" strokeWidth={1.6} opacity={.8} strokeLinecap="round" />
      <Path d="m32 3 1 3 3 1-3 1-1 3-1-3-3-1 3-1Zm18 0 .8 2.4 2.4.8-2.4.8L50 9l-.8-3-2.4-.8 2.4-.8Z" fill="#e7d6ff" />
      <Path d="M9 27Q46 9 79 22" fill="none" stroke="#c9b1ea" strokeWidth={.8} opacity={.4} />
      <Path d="m78 16 1.5 4.5L84 22l-4.5 1.5L78 28l-1.5-4.5L72 22l4.5-1.5Z" fill="#f4d9f8" />
      <Circle cx={9} cy={28} r={1.7} fill="#b5eef3" /><Circle cx={17} cy={18} r={.8} fill="#ddd9ff" /><Circle cx={84} cy={74} r={1.1} fill="#b5eef3" />
    </> : <>
      <Circle cx={73} cy={69} r={8} fill="#fff0d0" stroke="#d1b084" strokeWidth={1} />
      <Path d="M28 41C17 25 17 8 24 7c9-1 17 19 17 31m18 0C61 18 68 7 75 10c8 4 3 23-5 34" fill={`url(#${fur})`} stroke="#d6b88c" strokeWidth={1.2} strokeLinecap="round" />
      <Path d="M29 33C24 22 23 13 25 13c4 0 10 13 11 22m27 0c3-12 8-21 11-20 3 2-1 13-6 21" fill={`url(#${ear})`} />
      <Ellipse cx={33} cy={81} rx={11} ry={6} fill={`url(#${fur})`} stroke="#d0ae7c" strokeWidth={1} />
      <Ellipse cx={64} cy={81} rx={11} ry={6} fill={`url(#${fur})`} stroke="#d0ae7c" strokeWidth={1} />
      <Path d="M20 56c0-19 12-29 29-29 18 0 31 10 31 29 0 20-12 28-30 28S20 76 20 56Z" fill={`url(#${fur})`} stroke="#d4b284" strokeWidth={1.2} />
      <Path d="M34 71c0-8 7-13 16-13s16 5 16 13c0 8-7 12-16 12S34 79 34 71Z" fill="#fff2d7" opacity={.85} />
      <Path d="M23 63q-3 12 6 13 6 0 5-9m42-4q3 12-6 13-6 0-5-9" fill={`url(#${fur})`} stroke="#c5a170" strokeWidth={1.2} strokeLinecap="round" />
      <Path d="M31 80v2m4-2v2m27-2v2m4-2v2" stroke="#b58d65" strokeWidth={.8} strokeLinecap="round" opacity={.5} />
      <Path d="M50 29C42 18 32 18 30 20c1 10 10 15 20 9 3-9 13-14 20-10-1 10-10 15-20 10Z" fill={`url(#${leaf})`} stroke="#6ea58b" strokeWidth={.8} />
      <Path d="m36 23 14 6 13-6m-13 6v6" fill="none" stroke="#d9efc3" opacity={.65} strokeWidth={.9} strokeLinecap="round" />
      <Path d="M29 41q4-5 10-6" fill="none" stroke="#fff7e5" strokeWidth={3} opacity={.55} strokeLinecap="round" />
      <Face x={50} y={53} mood={mood} blink={blink} delighted={delighted} astral={false} />
    </>}
    {joyful ? <><Path d="m10 49 1.3 3.7L15 54l-3.7 1.3L10 59l-1.3-3.7L5 54l3.7-1.3Z" fill={astral ? '#ddd5ff' : '#b4d9af'} /><Path d="M84 44v6m-3-3h6" stroke={astral ? '#c7f4fa' : '#f7e0ad'} strokeWidth={1.5} strokeLinecap="round" /></> : null}
  </Svg>;
}
