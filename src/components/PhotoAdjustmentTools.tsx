import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { normalizeFraming, zoomFraming, type PhotoFraming } from '../domain/photoFraming';
import { useApp } from '../store/AppStore';
import { Button } from './UI';

export function PhotoAdjustmentTools({ target, frame, hasReference, fine, busy, error, onTarget, onFine, onChange, onSave, onCancel, onReset }: {
  target: 'reference' | 'photo'; frame: PhotoFraming; hasReference: boolean; fine: boolean; busy: boolean; error: string;
  onTarget: (target: 'reference' | 'photo') => void; onFine: () => void; onChange: (frame: PhotoFraming) => void; onSave: () => void; onCancel: () => void; onReset: () => void;
}) {
  const { palette: p } = useApp();
  const step = fine ? .0025 : .01;
  return <View style={{ gap: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: p.line }}>
    <View style={{ flexDirection: 'row', gap: 8 }}>{(['reference', 'photo'] as const).filter(t => t !== 'reference' || hasReference).map(t => <Pressable key={t} accessibilityRole="button" accessibilityLabel={`Adjust ${t}`} accessibilityState={{ selected: target === t, disabled: busy }} disabled={busy} onPress={() => onTarget(t)} style={{ flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderColor: target === t ? p.primary : p.line }}><Text style={{ color: target === t ? p.primary : p.muted, fontSize: 14, fontWeight: '600' }}>{t === 'reference' ? 'Reference' : 'Photo'}</Text></Pressable>)}</View>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ flex: 1 }}><Button title="−" accessibilityLabel="Make photo smaller" disabled={busy} onPress={() => onChange(zoomFraming(frame, frame.zoom - (fine ? .01 : .05)))} /></View><Text style={{ color: p.text, minWidth: 48, textAlign: 'center', fontSize: 13 }}>{Math.round(frame.zoom * 100)}%</Text><View style={{ flex: 1 }}><Button title="+" accessibilityLabel="Make photo larger" disabled={busy} onPress={() => onChange(zoomFraming(frame, frame.zoom + (fine ? .01 : .05)))} /></View><Button title={fine ? 'Fine ✓' : 'Fine'} accessibilityLabel="Toggle fine adjustments" selected={fine} disabled={busy} onPress={onFine} /></View>
    <View style={{ flexDirection: 'row', gap: 8 }}>{([['←', 'left', -step, 0], ['→', 'right', step, 0], ['↑', 'up', 0, -step], ['↓', 'down', 0, step]] as const).map(([title, direction, x, y]) => <View key={title} style={{ flex: 1 }}><Button title={title} accessibilityLabel={`Move photo ${direction}`} disabled={busy} onPress={() => onChange(normalizeFraming({ ...frame, x: frame.x + x, y: frame.y + y }))} /></View>)}</View>
    <View style={{ flexDirection: 'row', gap: 8 }}><View style={{ flex: 1 }}><Button title="Reset" accessibilityLabel={`Reset ${target} framing`} disabled={busy} onPress={onReset} /></View><View style={{ flex: 1 }}><Button title="Cancel" disabled={busy} onPress={onCancel} /></View><View style={{ flex: 1 }}><Button title={busy ? 'Saving…' : 'Done'} primary disabled={busy} onPress={onSave} /></View></View>
    {error ? <Text accessibilityRole="alert" style={{ color: p.red, fontSize: 13 }}>{error}</Text> : null}
  </View>;
}
