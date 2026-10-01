import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppStore, useApp } from '../store/AppStore';
import { CloudStore } from '../store/CloudStore';
import { IPhoneStore } from '../store/IPhoneStore';
import { ReminderStore } from '../store/ReminderStore';
function ThemedStatusBar() { const { palette } = useApp(); return <StatusBar style={palette.realm === 'heaven' ? 'dark' : 'light'} />; }
export default function Layout() {
  return <AppStore><CloudStore><IPhoneStore><ReminderStore>
    <ThemedStatusBar /><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(tabs)" /></Stack>
  </ReminderStore></IPhoneStore></CloudStore></AppStore>;
}
