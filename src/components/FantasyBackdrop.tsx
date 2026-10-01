import React from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

export function FantasyBackdrop() {
  return <Svg width="100%" height="100%" viewBox="0 0 400 900" preserveAspectRatio="xMidYMin slice">
    <Defs>
      <LinearGradient id="questSky" x1="0%" y1="0%" x2="0%" y2="100%"><Stop stopColor="#344965" /><Stop offset=".42" stopColor="#1c3d40" /><Stop offset="1" stopColor="#0b1c23" /></LinearGradient>
      <RadialGradient id="questLight" cx="72%" cy="15%" r="60%"><Stop stopColor="#b8d5b8" stopOpacity=".3" /><Stop offset="1" stopColor="#254646" stopOpacity="0" /></RadialGradient>
      <LinearGradient id="questWater" x1="0%" y1="0%" x2="0%" y2="100%"><Stop stopColor="#558a82" stopOpacity=".45" /><Stop offset="1" stopColor="#0b1c23" /></LinearGradient>
      <LinearGradient id="questFade" x1="0%" y1="0%" x2="0%" y2="100%"><Stop stopColor="#0b1c23" stopOpacity=".05" /><Stop offset=".65" stopColor="#0b1c23" stopOpacity=".62" /><Stop offset="1" stopColor="#0b1c23" stopOpacity=".95" /></LinearGradient>
    </Defs>
    <Rect width={400} height={900} fill="url(#questSky)" /><Rect width={400} height={900} fill="url(#questLight)" />
    <Circle cx={296} cy={91} r={28} fill="#d5dec1" opacity={.12} /><Circle cx={296} cy={91} r={21} fill="#e9ebce" opacity={.3} />
    <Path d="M0 174q50-25 112-9t122-10 166 5M0 193q73-13 149-2t251-18" fill="none" stroke="#b7d0bc" strokeWidth={9} opacity={.045} />
    <Path d="M0 267q28-32 58-21t76-43q33-38 55-3t76 13q50-28 72-4t63-14V415H0Z" fill="#426c66" opacity={.4} />
    <Path d="M0 317q63-18 94-49t69 16q38 23 78-12t81 14q45 23 78-11V443H0Z" fill="#29564e" />
    <Path d="M0 370q55-8 117 18t153-16 130-3V900H0Z" fill="url(#questWater)" />
    <Path d="M0 437q74-20 156-6t244-12m-345 55q109-8 230-5m-217 39q63-5 128-3" stroke="#a8cec1" strokeWidth={1} opacity={.12} fill="none" />
    <Path d="m273 292 7-70 14-9 12 9 6 70m-29-63 7-10 9 9m-15 9h15m-17 17h19m-13-20v-15" fill="#799589" stroke="#3e645b" strokeWidth={1} opacity={.55} />
    <Path d="M0 382q24-21 46-5t39-15l-7 40-78 18Zm330-6q24-23 70-21v80l-61-22Z" fill="#183e35" />
    {[[-22,185,1.2],[378,155,1.05],[8,586,.7],[382,523,.75]].map(([x,y,s],i) => <React.Fragment key={i}>
      <Path d={`M${x+21*s} ${y+178*s}q${-6*s} ${-65*s} ${9*s} ${-132*s}m${-3*s} ${38*s}q${-16*s} ${-10*s} ${-22*s} ${-30*s}m${21*s} ${24*s}q${20*s} ${-12*s} ${25*s} ${-30*s}`} stroke={i<2?'#15382f':'#102d28'} strokeWidth={9*s} strokeLinecap="round" fill="none" />
      <Path d={`M${x-34*s} ${y+56*s}q${-16*s} ${-31*s} ${12*s} ${-47*s}q${-8*s} ${-22*s} ${25*s} ${-27*s}q${28*s} ${-23*s} ${51*s} ${4*s}q${35*s} ${-2*s} ${39*s} ${28*s}q${27*s} ${25*s} ${-8*s} ${47*s}q${-20*s} ${22*s} ${-54*s} ${9*s}q${-37*s} ${18*s} ${-65*s} ${-14*s}Z`} fill={i<2?'#244d3c':'#12362e'} />
      <Path d={`M${x-25*s} ${y+19*s}q${10*s} ${-22*s} ${37*s} ${-16*s}q${28*s} ${-17*s} ${47*s} ${8*s}`} stroke="#759e68" strokeWidth={6*s} opacity={.14} strokeLinecap="round" fill="none" />
    </React.Fragment>)}
    <Path d="M-10 205Q130 121 208 221T410 190" fill="none" stroke="#a98de2" strokeWidth={28} opacity={.06} /><Path d="M-10 217Q131 132 208 225T410 196" fill="none" stroke="#a0e4cd" strokeWidth={7} opacity={.08} />
    <Rect width={400} height={900} fill="url(#questFade)" />
    {Array.from({length:24},(_,i)=>{const x=12+((Math.sin(i*12.9898)*43758.5453%1+1)%1)*376; const y=90+((Math.sin(i*78.233+4)*21435.73%1+1)%1)*690; return <React.Fragment key={`magic-${i}`}><Circle cx={x} cy={y} r={4} fill={i%3?'#c8edc7':'#cab5fb'} opacity={.06} /><Circle cx={x} cy={y} r={i%4?1:1.7} fill={i%3?'#c8edc7':'#cab5fb'} opacity={.65} /></React.Fragment>;})}
    <Path d="M17 537q-2-18 9-18t9 18m-17 1h18m347-94q-1-17 9-17t9 17m-17 1h18" fill="#b4a5de" stroke="#d6c8f3" strokeWidth={1} opacity={.4} />
    {[[30,166],[365,251],[20,439],[377,610],[43,747]].map(([x,y],i) => <React.Fragment key={i}><Circle cx={x} cy={y} r={5} fill="#d1dca2" opacity={.035} /><Circle cx={x} cy={y} r={1.2} fill="#d1dca2" opacity={.5} /></React.Fragment>)}
  </Svg>;
}
