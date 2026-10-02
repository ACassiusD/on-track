import React, { useState } from 'react';
import { Text, View, type GestureResponderEvent } from 'react-native';
import { useApp } from '../store/AppStore';

export function PhotoOverlaySlider({ value, onChange, disabled = false }: { value: number; onChange: (value: number) => void; disabled?: boolean }) {
  const { palette: p } = useApp();
  const [width, setWidth] = useState(0);
  const bounded = Math.max(0, Math.min(1, value));
  const change = (next: number) => { if (!disabled) onChange(Math.round(Math.max(0, Math.min(1, next)) * 100) / 100); };
  const drag = (event: GestureResponderEvent) => { if (width > 24) change((event.nativeEvent.locationX - 12) / (width - 24)); };
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, opacity: disabled ? .5 : 1 }}>
    <Text style={{ color: p.text, fontSize: 14 }}>Overlay</Text>
    <View accessibilityRole="adjustable" accessibilityLabel="Reference overlay opacity" accessibilityValue={{ min: 0, max: 100, now: Math.round(bounded * 100), text: `${Math.round(bounded * 100)} percent` }} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(bounded * 100)} aria-valuetext={`${Math.round(bounded * 100)} percent`} accessibilityState={{ disabled }} accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={event => { if (event.nativeEvent.actionName === 'increment') change(bounded + .05); else if (event.nativeEvent.actionName === 'decrement') change(bounded - .05); }}
      onLayout={event => setWidth(event.nativeEvent.layout.width)} onStartShouldSetResponder={() => !disabled} onMoveShouldSetResponder={() => !disabled} onResponderGrant={drag} onResponderMove={drag} onResponderTerminationRequest={() => false}
      style={{ flex: 1, height: 44, justifyContent: 'center' }}>
      <View pointerEvents="none" style={{ marginHorizontal: 12, height: 4, backgroundColor: p.line, borderRadius: 2 }}>
        <View style={{ width: `${bounded * 100}%`, height: 4, backgroundColor: p.primary, borderRadius: 2 }} />
        <View style={{ position: 'absolute', left: `${bounded * 100}%`, marginLeft: -12, top: -10, width: 24, height: 24, borderRadius: 12, backgroundColor: p.primary, borderWidth: 2, borderColor: p.bg }} />
      </View>
    </View>
    <Text style={{ color: p.muted, fontSize: 13, width: 38, textAlign: 'right', fontVariant: ['tabular-nums'] }}>{Math.round(bounded * 100)}%</Text>
  </View>;
}
