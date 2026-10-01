import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useApp } from '../store/AppStore';
import type { WeightUnit } from '../domain/weightUnits';

export function WeightField({ value, onChangeText, unit, autoFocus = false, disabled = false }: { value: string; onChangeText: (value: string) => void; unit: WeightUnit; autoFocus?: boolean; disabled?: boolean }) {
  const { palette: p } = useApp();
  const [focused, setFocused] = useState(false);
  return <View style={{ minHeight: 78, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, borderRadius: p.retro ? 0 : 16, borderWidth: 1.5, borderColor: focused ? p.primary : p.line, backgroundColor: p.bg }}>
    <TextInput accessibilityLabel={`Weight in ${unit === 'kg' ? 'kilograms' : 'pounds'}`} value={value} onChangeText={onChangeText} placeholder={unit === 'kg' ? '79.5' : '175.4'} placeholderTextColor={p.muted} keyboardType="decimal-pad" autoFocus={autoFocus} selectTextOnFocus editable={!disabled} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ flex: 1, minHeight: 76, paddingVertical: 8, color: p.text, fontSize: 34, fontWeight: '600', fontVariant: ['tabular-nums'], textAlign: 'center' }} />
    <Text style={{ color: p.muted, fontSize: 18, marginLeft: 8 }}>{unit}</Text>
  </View>;
}
