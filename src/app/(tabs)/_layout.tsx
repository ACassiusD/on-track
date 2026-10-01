import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { useApp } from '../../store/AppStore';
function Icon({ name, color }: { name: string; color: string }) {
  return <Svg width={23} height={23} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
    {name === 'index' ? <><Path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></> : name === 'photos' ? <><Rect x={3} y={3} width={18} height={18} rx={4} /><Circle cx={8} cy={8} r={1.5} /><Path d="m4 18 5-5 3 3 4-6 5 8" /></> : <><Circle cx={12} cy={12} r={3} /><Path d="m9 3 6 0 1 4 4 2v6l-4 2-1 4H9l-1-4-4-2V9l4-2z" /></>}
  </Svg>;
}

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];
function BottomBar({ state, descriptors, navigation }: TabBarProps) {
  const { palette: p } = useApp();
  const insets = useSafeAreaInsets();
  return <View style={{ flexDirection: 'row', backgroundColor: p.bg, borderTopWidth: 1, borderTopColor: p.line, paddingBottom: Math.max(insets.bottom, 6), paddingTop: 5 }}>
    {state.routes.map((route, index) => {
      const focused = state.index === index;
      const color = focused ? p.primary : p.muted;
      const options = descriptors[route.key].options;
      const title = options.title ?? route.name;
      return <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={options.tabBarAccessibilityLabel ?? title} onPress={() => { const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true }); if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params); }} onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })} style={({ pressed }) => ({ flex: 1, minHeight: 52, paddingVertical: 4, gap: 3, alignItems: 'center', justifyContent: 'center', opacity: pressed ? .7 : 1 })}>
        <View><Icon name={route.name} color={color} />{options.tabBarBadge ? <View style={{ position: 'absolute', right: -5, top: -2, width: 6, height: 6, borderRadius: 3, backgroundColor: p.accent }} /> : null}</View>
        <Text style={{ color, fontSize: 12, lineHeight: 18, fontWeight: '600', fontFamily: p.retro ? Platform.OS === 'ios' ? 'Menlo' : 'monospace' : undefined }}>{title}</Text>
      </Pressable>;
    })}
  </View>;
}
export default function TabLayout() {
  const { palette: p, data, today } = useApp();
  return <Tabs tabBar={props => <BottomBar {...props} />} screenOptions={{ headerShown: false }}>
    <Tabs.Screen name="index" options={{ title: p.retro ? 'TODAY' : 'Today' }} />
    <Tabs.Screen name="photos" options={{ title: p.retro ? 'PHOTOS' : 'Photos', tabBarBadge: data.photos.length && !data.photoReviewedDates.includes(today) ? '•' : undefined }} />
    <Tabs.Screen name="settings" options={{ title: p.retro ? 'SETTINGS' : 'Settings' }} />
  </Tabs>;
}
