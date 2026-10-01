import React from 'react';
import { Text, View } from 'react-native';
import { useApp } from '../store/AppStore';
import { petExample, type ExampleMood } from '../domain/petExamples';
export function MoodExampleCalendar({ mood, rule }: { mood: ExampleMood; rule: string }) {
  const { palette: p } = useApp();
  const { status, days } = petExample(mood);
  return <View style={{ backgroundColor: p.tile, borderWidth: 1, borderColor: p.line, borderRadius: p.retro ? 0 : 14, padding: 12, gap: 7 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}><Text style={{ color: p.muted, fontSize: 12 }}>Example · 14 days</Text><Text accessibilityLiveRegion="polite" style={{ color: p.primary, fontSize: 12, fontWeight: '600' }}>{Math.floor(status.rate*100)}% complete</Text></View>
    <View accessible accessibilityRole="image" accessibilityLabel={`${status.label} example. Daily checks out of five: ${days.map(d=>d.count).join(', ')}. ${rule}`} style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', gap: 4 }}>{['M','T','W','T','F','S','S'].map((name,i)=><View key={i} style={{ flex: 1, alignItems: 'center' }}><Text style={{ color: p.muted, fontSize: 10 }}>{name}</Text></View>)}</View>
      {[0,7].map(offset=><View key={offset} style={{ flexDirection: 'row', gap: 4 }}>{days.slice(offset,offset+7).map(day=>{
        const bg=day.tone === 'yellow' ? p.yellowSurface ?? p.yellow : p[day.tone];
        const ink=day.tone === 'grey' ? p.muted : day.tone === 'yellow' && p.yellowSurface ? p.yellow : p.bg;
        return <View key={day.date} style={{ flex: 1, minHeight: 36, justifyContent: 'center', alignItems: 'center', gap: 1, backgroundColor: bg, borderRadius: p.retro ? 0 : 6 }}><Text style={{ color: ink, fontSize: 9 }}>{day.date.slice(-2)}</Text><Text style={{ color: ink, fontSize: 12, fontWeight: '700' }}>{day.count}/5</Text></View>;
      })}</View>)}
    </View>
    <Text style={{ color: p.text, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>{rule}</Text>
  </View>;
}
