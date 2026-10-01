import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { useApp } from '../../store/AppStore';
function Icon({ name, color }: { name: string; color: string }) {
  return <Svg width={23} height={23} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
    {name === 'index' ? <><Path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></> : name === 'photos' ? <><Rect x={3} y={3} width={18} height={18} rx={4} /><Circle cx={8} cy={8} r={1.5} /><Path d="m4 18 5-5 3 3 4-6 5 8" /></> : <><Circle cx={12} cy={12} r={3} /><Path d="m9 3 6 0 1 4 4 2v6l-4 2-1 4H9l-1-4-4-2V9l4-2z" /></>}
  </Svg>;
}
export default function TabLayout() {
  const { palette: p, data, today } = useApp();
  return <Tabs screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: p.primary, tabBarInactiveTintColor: p.muted, tabBarStyle: { backgroundColor: p.tile, borderTopColor: p.line }, tabBarLabelStyle: { fontSize: 12, fontWeight: '600', fontFamily: p.retro ? Platform.OS === 'ios' ? 'Menlo' : 'monospace' : p.fantasy ? Platform.OS === 'android' ? 'serif' : 'Georgia' : undefined }, tabBarIcon: ({ color }) => <Icon name={route.name} color={String(color)} /> })}>
    <Tabs.Screen name="index" options={{ title: p.retro ? 'TODAY' : 'Today' }} />
    <Tabs.Screen name="photos" options={{ title: p.retro ? 'PHOTOS' : 'Photos', tabBarBadge: data.photos.length && !data.photoReviewedDates.includes(today) ? '•' : undefined }} />
    <Tabs.Screen name="settings" options={{ title: p.retro ? 'SETTINGS' : 'Settings' }} />
  </Tabs>;
}
