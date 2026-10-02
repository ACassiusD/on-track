import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useApp } from '../store/AppStore';

const iconPaths = {
  goal: 'M12 3a9 9 0 1 0 9 9 M12 7a5 5 0 1 0 5 5 M12 12l8-8 M16 3h5v5',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',
  weight: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2 M8 8a5 5 0 0 1 8 0 M12 6v4',
  theme: 'M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-4 2 2 0 0 1 1-4h3a3 3 0 0 0 3-3c0-4-4-7-9-7 M7 10h.01 M10 7h.01 M15 7h.01 M17 10h.01',
  cloud: 'M6 18a5 5 0 0 1-1-10 7 7 0 0 1 13 0 5 5 0 0 1 0 10 M12 12v9 M9 15l3-3 3 3',
  phone: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2 M10 5h4 M11 19h2',
  chart: 'M4 3v17h17 M7 14l4-5 4 3 6-7',
  chat: 'M5 3h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9l-6 3V5a2 2 0 0 1 2-2 M7 8h10 M7 12h7',
  photo: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2 M4 17l5-5 4 4 3-7 5 9 M8 7h.01',
  guide: 'M12 6C9 3 5 3 3 4v15c3-1 6-1 9 2 3-3 6-3 9-2V4c-2-1-6-1-9 2v15',
  demo: 'M8 3h8 M10 3v6l-6 10a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2L14 9V3 M7 15h10',
  profile: 'M8 6a4 4 0 1 0 8 0 4 4 0 1 0-8 0 M4 21v-2a8 8 0 0 1 16 0v2',
  reset: 'M3 11a9 9 0 1 1 2 7 M3 4v7h7',
  download: 'M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5',
} as const;

export function SettingsSection({ title, children, footer }: { title: string; children: React.ReactNode; footer?: string }) {
  const { palette: p } = useApp();
  return <View style={{ gap: 7 }}>
    <Text accessibilityRole="header" style={{ color: p.muted, fontSize: 12, fontWeight: '600', letterSpacing: 1, paddingHorizontal: 4 }}>{title.toUpperCase()}</Text>
    <View style={{ backgroundColor: p.tile, borderColor: p.line, borderWidth: 1, borderRadius: p.radius, overflow: 'hidden' }}>
      {React.Children.toArray(children).map((child, index) => <View key={React.isValidElement(child) ? child.key ?? index : index} style={index ? { borderTopWidth: 1, borderTopColor: p.line } : undefined}>{child}</View>)}
    </View>
    {footer ? <Text style={{ color: p.muted, fontSize: 12, lineHeight: 17, paddingHorizontal: 4 }}>{footer}</Text> : null}
  </View>;
}

export function SettingsItem({ title, icon, detail, onPress, trailing, danger = false, disabled = false }: {
  title: string; icon: keyof typeof iconPaths; detail?: string; onPress?: () => void; trailing?: React.ReactNode; danger?: boolean; disabled?: boolean;
}) {
  const { palette: p } = useApp();
  const content = <>
    <View accessibilityElementsHidden aria-hidden importantForAccessibility="no-hide-descendants" style={{ width: 32, height: 32, borderRadius: p.retro ? 0 : 9, backgroundColor: p.grey, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={danger ? p.red : p.primary} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><Path d={iconPaths[icon]} /></Svg>
    </View>
    <View style={{ flex: 1, gap: 3 }}>
      <Text style={{ color: danger ? p.red : p.text, fontSize: 15, fontWeight: '500', fontFamily: p.retro ? Platform.OS === 'ios' ? 'Menlo' : 'monospace' : undefined }}>{title}</Text>
      {detail ? <Text style={{ color: p.muted, fontSize: 12, lineHeight: 16 }}>{detail}</Text> : null}
    </View>
    {trailing ?? (onPress ? <Svg aria-hidden width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={p.muted} strokeWidth={1.8}><Path d="m9 5 7 7-7 7" /></Svg> : null)}
  </>;
  const style = { minHeight: 58, paddingHorizontal: 12, paddingVertical: 11, gap: 12, flexDirection: 'row' as const, alignItems: 'center' as const };
  return onPress ? <Pressable accessibilityRole="button" accessibilityLabel={detail ? `${title}, ${detail}` : title} accessibilityState={{ disabled }} aria-disabled={disabled} disabled={disabled} onPress={onPress} style={({ pressed }) => ({ ...style, backgroundColor: pressed ? p.grey : undefined, opacity: disabled ? .5 : 1 })}>{content}</Pressable> : <View style={style}>{content}</View>;
}
