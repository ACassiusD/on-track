import React from 'react';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

// A quiet coastal world behind the HUD. No network assets or extra image loading.
export function FantasyBackdrop() {
  return <Svg width="100%" height="100%" viewBox="0 0 400 900" preserveAspectRatio="xMidYMin slice">
    <Defs>
      <LinearGradient id="questSky" x1="0%" y1="0%" x2="0%" y2="100%"><Stop stopColor="#177ba3" /><Stop offset=".45" stopColor="#82cbc7" /><Stop offset="1" stopColor="#143b32" /></LinearGradient>
      <LinearGradient id="questSea" x1="0%" y1="0%" x2="0%" y2="100%"><Stop stopColor="#20b6ad" /><Stop offset="1" stopColor="#082e38" /></LinearGradient>
      <LinearGradient id="questStone" x1="0%" y1="0%" x2="100%" y2="30%"><Stop stopColor="#244b42" /><Stop offset=".55" stopColor="#73926b" /><Stop offset="1" stopColor="#1c4237" /></LinearGradient>
      <LinearGradient id="questShade" x1="0%" y1="0%" x2="0%" y2="100%"><Stop stopColor="#051d29" stopOpacity=".2" /><Stop offset=".3" stopColor="#041d25" stopOpacity=".48" /><Stop offset="1" stopColor="#04161b" stopOpacity=".78" /></LinearGradient>
    </Defs>
    <Rect width={400} height={900} fill="url(#questSky)" />
    <Ellipse cx={290} cy={66} rx={100} ry={15} fill="#dcf0c8" opacity={.24} /><Ellipse cx={105} cy={114} rx={110} ry={10} fill="#e0f5dd" opacity={.18} />
    <Path d="M0 290 45 214 78 253 134 181 181 261 223 209 277 277 333 197 400 247V470H0Z" fill="#326a61" opacity={.55} />
    <Rect y={333} width={400} height={567} fill="url(#questSea)" />
    <Path d="M0 335Q102 300 189 374T400 404M0 408Q93 381 218 431T400 470M0 492Q146 443 270 503T400 527" stroke="#b5f4de" strokeWidth={2} fill="none" opacity={.3} />
    <Path d="M0 236 24 199 37 131 65 118 83 145 92 205 133 230 159 329 124 400 0 433Z" fill="url(#questStone)" />
    <Path d="m0 236 37-29 52 12 21 54 41 31-12 49-51 13-52 31H0Z" fill="#2e6d43" />
    <Path d="m38 134 18-9 12 14-4 76-22-7Zm31 85 13 8 18 104-19 18Z" fill="#a2af7b" opacity={.35} />
    <Path d="M291 347 300 259 322 238 328 153 346 123 361 151 360 245 379 209 400 218V430Z" fill="url(#questStone)" />
    <Path d="m293 347 15-35 24 8 15-14 33 20 20-11v115l-58-12Z" fill="#3b7949" />
    <Path d="m331 167 16-27 10 17-2 86-18 5ZM308 275l13-17-1 64-14 9Z" fill="#a8b387" opacity={.3} />
    <Path d="M135 384q35 3 48-2l13-36h25l18 57q-51 29-104 10Z" fill="#9dbe82" /><Path d="m180 380 16-34h25l10 32" fill="#517759" /><Path d="M195 346v-49h26v49m-26-36h26m-26 20h26" fill="#668576" stroke="#354f49" strokeWidth={2} />
    <Path d="M0 651Q48 618 102 645L62 728 0 760ZM400 580Q348 579 313 637L350 723 400 736Z" fill="#194f36" />
    {[[-8,75,1.15],[375,50,1.3],[21,565,.8],[358,516,.7]].map(([x,y,s],i) => <React.Fragment key={i}><Path d={`M${x+22*s} ${y+190*s}q${-14*s} ${-86*s} ${5*s} ${-154*s}`} stroke="#314b32" strokeWidth={13*s} fill="none" />{[-25,8,38].map((v,j) => <Ellipse key={j} cx={x+(v+22)*s} cy={y+(j%2?30:55)*s} rx={48*s} ry={35*s} fill={j===1?'#50843e':'#245b39'} />)}</React.Fragment>)}
    <Rect width={400} height={900} fill="url(#questShade)" />
    {[ [38,192],[370,295],[29,481],[363,741] ].map(([x,y],i) => <Circle key={i} cx={x} cy={y} r={2} fill="#c3ee7d" opacity={.65} />)}
  </Svg>;
}
