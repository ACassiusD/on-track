import { FramedPhoto } from './FramedPhoto';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { localDate, parseDate, type Photo } from '../domain/model';
import { useApp } from '../store/AppStore';
import { Button, Label, Row } from './UI';

export function photoDateLabel(date: string, today: string) {
  return date === today ? 'Today' : parseDate(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', ...(date.slice(0, 4) !== today.slice(0, 4) ? { year: 'numeric' } : {}) });
}

export function PhotoPickerModal({ kind, today, date, photos, selectedId, onDate, onPhoto, onClose }: {
  kind: 'date' | 'reference' | 'comparison'; today: string; date: string; photos: Photo[]; selectedId?: string;
  onDate: (date: string) => void; onPhoto: (id: string) => void; onClose: () => void;
}) {
  const { palette: p } = useApp();
  const savedDates = new Set(photos.map(photo => photo.date));
  const [month, setMonth] = useState(() => date.slice(0, 7) + '-01');
  const monthDate = parseDate(month);
  const offset = (monthDate.getDay() + 6) % 7;
  const days = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const shift = (delta: number) => { const next = parseDate(month); next.setMonth(next.getMonth() + delta); setMonth(localDate(next)); };
  return <Modal transparent animationType="fade" visible onRequestClose={onClose}>
    <SafeAreaProvider>
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#000000bb' }}>
      <View accessibilityViewIsModal style={{ maxWidth: 430, width: '100%', maxHeight: '85%', alignSelf: 'center', backgroundColor: p.tile, borderWidth: 1, borderColor: p.line, borderRadius: p.radius, padding: 16, gap: 12 }}>
        <Row><Label>{kind === 'date' ? 'Photo date' : kind === 'reference' ? 'Reference photo' : 'Compare photo'}</Label><Button title="Close" onPress={onClose} /></Row>
        {kind === 'date' ? <>
          <Row><Button title="‹" onPress={() => shift(-1)} /><Text style={{ color: p.text, fontSize: 16, fontWeight: '600' }}>{monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</Text><Button title="›" disabled={month.slice(0, 7) >= today.slice(0, 7)} onPress={() => shift(1)} /></Row>
          <View style={{ flexDirection: 'row' }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => <Text key={i} style={{ width: `${100 / 7}%`, textAlign: 'center', color: p.muted }}>{day}</Text>)}</View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, i) => {
            const day = i - offset + 1;
            if (day < 1 || day > days) return <View key={i} style={{ width: `${100 / 7}%`, height: 44 }} />;
            const value = month.slice(0, 8) + String(day).padStart(2, '0');
            const selected = value === date;
            return <Pressable key={i} disabled={value > today} accessibilityRole="button" accessibilityLabel={`${parseDate(value).toLocaleDateString(undefined, { dateStyle: 'full' })}${savedDates.has(value) ? ', photo saved' : ''}`} accessibilityState={{ selected, disabled: value > today }} onPress={() => onDate(value)} style={{ width: `${100 / 7}%`, minHeight: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: selected ? p.primary : 'transparent', borderRadius: p.retro ? 0 : 8, opacity: value > today ? .3 : 1 }}><Text style={{ color: selected ? p.bg : p.text, fontSize: 16 }}>{day}</Text><View style={{ width: 4, height: 4, marginTop: 2, borderRadius: 2, backgroundColor: savedDates.has(value) ? selected ? p.bg : p.primary : 'transparent' }} /></Pressable>;
          })}</View>
          <Button title="Use today" onPress={() => onDate(today)} />
        </> : <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ gap: 8 }}>
          {photos.slice().reverse().map(photo => <Pressable key={photo.id} accessibilityRole="button" accessibilityState={{ selected: photo.id === selectedId }} onPress={() => onPhoto(photo.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, borderWidth: 1, borderColor: photo.id === selectedId ? p.primary : p.line, borderRadius: p.retro ? 0 : 10 }}>
            <View style={{ width: 44, height: 56, borderRadius: p.retro ? 0 : 6, overflow: 'hidden' }}><FramedPhoto photo={photo} /></View>
            <Text style={{ color: p.text, flex: 1, fontSize: 15 }}>{photoDateLabel(photo.date, today)}</Text>
            {photo.id === selectedId ? <Text style={{ color: p.primary }}>✓</Text> : null}
          </Pressable>)}
        </ScrollView>}
      </View>
    </SafeAreaView>
    </SafeAreaProvider>
  </Modal>;
}
