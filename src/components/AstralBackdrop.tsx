import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

// Deterministic star positions avoid flickering whenever the dashboard rerenders.
function Stars({ layer }: { layer: number }) {
  return <Svg width="100%" height="100%" viewBox="0 0 400 900" preserveAspectRatio="xMidYMin slice">
    {Array.from({ length: layer === 0 ? 110 : 45 }, (_, i) => {
      const x = (i * 89 + 19 + layer * 43) % 400;
      const y = (i * 163 + 31 + layer * 97) % 900;
      const color = ['#e9f7ff', '#86e9f0', '#dfb9ff', '#f5aedb'][i % 4];
      return <Circle key={i} cx={x} cy={y} r={i % 8 ? .7 : 1.4} fill={color} opacity={.3 + (i % 4) * .15} />;
    })}
    {Array.from({ length: 12 }, (_, i) => {
      const x = (i * 137 + 24 + layer * 53) % 400;
      const y = (i * 211 + 80 + layer * 61) % 900;
      return <React.Fragment key={`sparkle-${i}`}><Circle cx={x} cy={y} r={5} fill={i % 2 ? '#92e8ff' : '#d8b3ff'} opacity={.08} /><Path d={`M${x} ${y - 3.5}q.6 3 3.5 3.5-3 .6-3.5 3.5-.6-3-3.5-3.5 3-.6 3.5-3.5Z`} fill={i % 2 ? '#cbfaff' : '#efdaff'} opacity={.8} /></React.Fragment>;
    })}
  </Svg>;
}

export function AstralBackdrop() {
  const [drift] = useState(() => new Animated.Value(0));
  const [twinkle] = useState(() => new Animated.Value(0));
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReduceMotion(value); }).catch(() => {});
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { mounted = false; listener.remove(); };
  }, []);
  useEffect(() => {
    if (reduceMotion) return;
    const native = Platform.OS !== 'web';
    const float = Animated.loop(Animated.sequence([
      Animated.timing(drift, { toValue: 1, duration: 18000, easing: Easing.inOut(Easing.sin), useNativeDriver: native, isInteraction: false }),
      Animated.timing(drift, { toValue: 0, duration: 18000, easing: Easing.inOut(Easing.sin), useNativeDriver: native, isInteraction: false }),
    ]));
    const shimmer = Animated.loop(Animated.sequence([
      Animated.timing(twinkle, { toValue: 1, duration: 2600, useNativeDriver: native, isInteraction: false }),
      Animated.timing(twinkle, { toValue: 0, duration: 3400, useNativeDriver: native, isInteraction: false }),
    ]));
    float.start(); shimmer.start();
    return () => { float.stop(); shimmer.stop(); drift.setValue(0); twinkle.setValue(0); };
  }, [drift, twinkle, reduceMotion]);
  return <View pointerEvents="none" accessible={false} style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
    <Svg width="100%" height="100%" viewBox="0 0 400 900" preserveAspectRatio="xMidYMin slice">
      <Defs>
        <LinearGradient id="astralSky" x1="0%" y1="0%" x2="80%" y2="100%"><Stop stopColor="#101d3b" /><Stop offset=".42" stopColor="#29204b" /><Stop offset="1" stopColor="#0b142e" /></LinearGradient>
        <RadialGradient id="astralTeal"><Stop stopColor="#26c8d9" stopOpacity=".36" /><Stop offset=".45" stopColor="#2795bc" stopOpacity=".16" /><Stop offset="1" stopColor="#2795bc" stopOpacity="0" /></RadialGradient>
        <RadialGradient id="astralViolet"><Stop stopColor="#a860e6" stopOpacity=".4" /><Stop offset=".5" stopColor="#8263cf" stopOpacity=".15" /><Stop offset="1" stopColor="#8263cf" stopOpacity="0" /></RadialGradient>
        <RadialGradient id="astralRose"><Stop stopColor="#e870c3" stopOpacity=".23" /><Stop offset="1" stopColor="#e870c3" stopOpacity="0" /></RadialGradient>
      </Defs>
      <Rect width={400} height={900} fill="url(#astralSky)" />
      <Ellipse cx={365} cy={160} rx={240} ry={310} fill="url(#astralTeal)" /><Ellipse cx={-30} cy={370} rx={260} ry={400} fill="url(#astralViolet)" /><Ellipse cx={310} cy={710} rx={240} ry={300} fill="url(#astralRose)" />
      <Path d="M-80 650Q80 520 160 240T440-30" fill="none" stroke="#c4b2fa" strokeWidth={35} opacity={.04} />
      <Path d="M18 156 67 189 102 141 159 172m128 349 37-31 38 18m-349 195 50 35 44-13" fill="none" stroke="#abcdf5" strokeWidth={.6} opacity={.28} />
      {[[18,156],[67,189],[102,141],[159,172],[287,521],[324,490],[362,508],[13,703],[63,738],[107,725]].map(([x,y],i)=><Circle key={i} cx={x} cy={y} r={1.6} fill="#d3ebff" opacity={.65} />)}
    </Svg>
    <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX: reduceMotion ? 0 : drift.interpolate({ inputRange: [0, 1], outputRange: [-3, 5] }) }, { translateY: reduceMotion ? 0 : drift.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) }] }]}><Stars layer={0} /></Animated.View>
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: reduceMotion ? .85 : twinkle.interpolate({ inputRange: [0, 1], outputRange: [.4, .95] }), transform: [{ translateX: reduceMotion ? 0 : drift.interpolate({ inputRange: [0, 1], outputRange: [4, -6] }) }, { translateY: reduceMotion ? 0 : drift.interpolate({ inputRange: [0, 1], outputRange: [-5, 8] }) }] }]}><Stars layer={1} /></Animated.View>
  </View>;
}
