import React from 'react';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

export function RealmBackdrop({ realm }: { realm: 'heaven' | 'astral' }) {
  const heaven = realm === 'heaven';
  return <Svg width="100%" height="100%" viewBox="0 0 400 900" preserveAspectRatio="xMidYMin slice">
    <Defs>
      <LinearGradient id="realmSky" x1="0%" y1="0%" x2="70%" y2="100%">{(heaven ? [['0','#8d8057'],['.3','#b1a26c'],['.65','#6b8056'],['1','#20392d']] : [['0','#141c48'],['.4','#302c64'],['1','#0c102a']]).map(([offset,color])=><Stop key={offset} offset={offset} stopColor={color} />)}</LinearGradient>
      <RadialGradient id="realmGlow" cx="70%" cy="18%" r="65%"><Stop stopColor={heaven?'#fff3ca':'#a195ec'} stopOpacity={heaven?.35:.28} /><Stop offset="1" stopColor={heaven?'#d2c596':'#343f89'} stopOpacity="0" /></RadialGradient>
      <LinearGradient id="realmRock" x1="0%" y1="0%" x2="85%" y2="100%"><Stop stopColor="#a6a17a" /><Stop offset="1" stopColor="#666c4b" /></LinearGradient>
      <LinearGradient id="realmWhale" x1="0%" y1="0%" x2="85%" y2="100%"><Stop stopColor="#90c6ec" stopOpacity=".35" /><Stop offset=".5" stopColor="#c6a9ec" stopOpacity=".22" /><Stop offset="1" stopColor="#50578d" stopOpacity=".1" /></LinearGradient>
    </Defs>
    <Rect width={400} height={900} fill="url(#realmSky)" /><Rect width={400} height={900} fill="url(#realmGlow)" />
    {heaven ? <>
      {[[-25,129,1],[200,59,.9],[285,251,.85],[80,376,1.2],[-50,601,.85],[300,695,1]].map(([x,y,s],i)=><Path key={i} d={`M${x} ${y}q${-8*s} ${-20*s} ${24*s} ${-23*s}q${5*s} ${-28*s} ${37*s} ${-19*s}q${29*s} ${-29*s} ${58*s} ${5*s}q${29*s} ${-1*s} ${35*s} ${23*s}q${25*s} ${17*s} ${-12*s} ${28*s}h${-119*s}Z`} fill={i%2?'#fff0d3':'#fff5ee'} opacity={.45} />)}
      <Path d="M-12 357Q183 156 418 335" fill="none" stroke="#d5c3a0" strokeWidth={6} opacity={.2} /><Path d="M-12 364Q183 170 418 342" fill="none" stroke="#fff4c9" strokeWidth={5} opacity={.3} /><Path d="M-12 370Q183 178 418 349" fill="none" stroke="#b7decb" strokeWidth={5} opacity={.22} />
      <Path d="M0 470Q54 410 137 457T276 450 400 412V900H0Z" fill="#75965b" opacity={.75} />
      <Path d="M0 531Q85 449 164 512T301 508 400 477V900H0Z" fill="#4f7b48" />
      <Path d="M0 669Q87 585 183 641T319 625 400 593V900H0Z" fill="#345c3c" />
      <Path d="M0 759Q106 684 203 746T400 707V900H0Z" fill="#234633" />
      <Path d="M217 474q-105 34-31 75t-27 60q-82 34-19 78t-40 59" fill="none" stroke="#d5ce9d" strokeWidth={9} opacity={.22} />
      <Path d="M-20 487q125-21 215-4t226-28m-415 177q121-21 203-6t188-16" fill="none" stroke="#e9e4bd" strokeWidth={16} opacity={.09} />
      <Path d="M262 42 172 474h32L299 48m-16-3 43 384h16L299 48" fill="#fff2c0" opacity={.055} />
      {[[13,287,.65],[267,382,.9],[43,578,.55],[314,709,.6]].map(([x,y,s],i)=><React.Fragment key={i}><Path d={`M${x} ${y}h${97*s}l${-16*s} ${32*s}-${32*s} ${53*s}-${17*s}-${35*s}-${18*s}-${21*s}Z`} fill="url(#realmRock)" opacity={.6} /><Ellipse cx={x+48*s} cy={y} rx={50*s} ry={10*s} fill="#95b969" opacity={.85} /><Path d={`M${x+30*s} ${y}v${-55*s}l${18*s}-${26*s} ${18*s} ${26*s}v${55*s}m${-25*s} 0v${-35*s}h${15*s}v${35*s}`} fill="#e8e0bd" stroke="#929272" strokeWidth={1} /><Path d={`M${x+48*s} ${y-64*s}v${-38*s}`} stroke="#f8f7ff" strokeWidth={2} opacity={.6} /><Circle cx={x+48*s} cy={y-80*s} r={3} fill="#fff6d4" /></React.Fragment>)}
      {Array.from({length:20},(_,i)=>{const x=(i*97+17)%400;const y=550+(i*61)%330;return <React.Fragment key={`flowers-${i}`}><Circle cx={x} cy={y} r={1.4} fill="#e4deab" opacity={.4} /><Path d={`M${x} ${y+2}v4`} stroke="#abc282" strokeWidth={.6} opacity={.3} /></React.Fragment>;})}
      <Path d="M330 449q-8-52 8-63m-2 18-16-15m18 1 17-11" stroke="#85718e" strokeWidth={3} fill="none" opacity={.45} />{[[320,384],[339,376],[356,379],[332,396]].map(([x,y],i)=><Circle key={i} cx={x} cy={y} r={14} fill="#c7d59c" opacity={.55} />)}
    </> : <>
      <Path d="M-35 155Q190-16 435 386" stroke="#a298ec" strokeWidth={70} opacity={.035} fill="none" /><Path d="M-35 165Q190 8 435 396" stroke="#a9bdff" strokeWidth={24} opacity={.055} fill="none" />
      {Array.from({length:100},(_,i)=>{const x=(i*89+13)%400; const y=(i*163+29)%900;return <Circle key={i} cx={x} cy={y} r={i%9? .7 : 1.7} fill={i%3?'#e4e5ff':'#f2d7ac'} opacity={.18+(i%5)*.12} />;})}
      <Path d="M18 156 67 189 102 141 159 172m128 349 37-31 38 18m-349 195 50 35 44-13" fill="none" stroke="#b6b9f5" strokeWidth={.6} opacity={.35} />
      {[[18,156],[67,189],[102,141],[159,172],[287,521],[324,490],[362,508],[13,703],[63,738],[107,725]].map(([x,y],i)=><Circle key={i} cx={x} cy={y} r={2} fill="#d4d6ff" opacity={.65} />)}
      <Path d="M30 360c16-58 102-48 156-14 51 31 90 36 119 15 26-18 20-39 19-50 28 12 42 18 61 0-1 46-25 78-56 80-41 13-75 46-133 36-53-9-96-24-125-45-14-10-29-10-41-22Z" fill="url(#realmWhale)" stroke="#a7b8e7" strokeWidth={1} opacity={.65} />
      <Path d="M98 391q-3 55 39 64l-5-47m56-29 18-26 16 46M41 364q40 25 85 23m-79-14q32 20 67 20" stroke="#c0afe3" strokeWidth={1} opacity={.3} fill="none" />
      <Circle cx={72} cy={351} r={2.5} fill="#dae5ff" opacity={.7} />
      {Array.from({length:20},(_,i)=><Circle key={`whale-${i}`} cx={84+i*9} cy={355+Math.sin(i)*16+i*.5} r={i%3?.9:1.8} fill={i%2?'#d7d1fc':'#f2d7ac'} opacity={.5} />)}
      <Ellipse cx={175} cy={804} rx={270} ry={61} fill="#555283" opacity={.12} />
    </>}
    {[[21,81],[370,212],[26,472],[373,771]].map(([x,y],i)=><Path key={i} d={`M${x} ${y-4}v8m-4-4h8`} fill="none" stroke={heaven?'#fff9e8':'#e8d4f8'} strokeWidth={1} opacity={.6} />)}
  </Svg>;
}
