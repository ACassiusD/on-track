import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useApp } from '../store/AppStore';
import { Button, Label } from './UI';

// Keep the stored HH:MM format; display and select time in 12-hour form.
export function TimePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { palette: p } = useApp();
  const [open, setOpen] = useState<'hour' | 'minute' | 'period' | null>(null);
  const [hour24, minute] = value.split(':').map(Number);
  const hour = hour24 % 12 || 12;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const options = open === 'hour' ? Array.from({ length: 12 }, (_, i) => String(i + 1)) : open === 'minute' ? Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')) : ['AM', 'PM'];
  const selected = open === 'hour' ? String(hour) : open === 'minute' ? String(minute).padStart(2, '0') : period;
  const choose = (option: string) => {
    const h = open === 'hour' ? Number(option) : hour;
    const m = open === 'minute' ? Number(option) : minute;
    const ampm = open === 'period' ? option : period;
    onChange(`${String(h % 12 + (ampm === 'PM' ? 12 : 0)).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    setOpen(null);
  };
  return <>
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      {(['hour', 'minute', 'period'] as const).map(part => <Pressable key={part} accessibilityRole="button" accessibilityLabel={`Weigh-in ${part}: ${part === 'hour' ? hour : part === 'minute' ? String(minute).padStart(2, '0') : period}`} accessibilityState={{ expanded: open === part }} onPress={() => setOpen(part)} style={{ flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderWidth: 1, borderColor: p.line, borderRadius: p.retro ? 0 : 12, backgroundColor: p.bg }}><Text style={{ color: p.text, fontSize: 18 }}>{part === 'hour' ? hour : part === 'minute' ? String(minute).padStart(2, '0') : period}</Text><Text style={{ color: p.primary }}>▾</Text></Pressable>)}
    </View>
    <Modal visible={open !== null} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#000000bb' }}>
        <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 380, maxHeight: '80%', alignSelf: 'center', padding: 14, gap: 9, backgroundColor: p.tile, borderWidth: 1, borderColor: p.line, borderRadius: p.radius }}>
            <Label>{open === 'hour' ? 'Hour' : open === 'minute' ? 'Minute' : 'AM / PM'}</Label>
            <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ gap: 4 }}>
              {options.map(option => <Pressable key={option} accessibilityRole="radio" accessibilityState={{ checked: selected === option }} onPress={() => choose(option)} style={{ minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', borderRadius: p.retro ? 0 : 8, backgroundColor: selected === option ? p.primary : p.bg }}><Text style={{ color: selected === option ? p.bg : p.text, fontSize: 18 }}>{option}{selected === option ? '  ✓' : ''}</Text></Pressable>)}
            </ScrollView>
            <Button title="Cancel" onPress={() => setOpen(null)} />
        </View>
      </View>
    </Modal>
  </>;
}
