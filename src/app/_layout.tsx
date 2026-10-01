import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { WelcomeTour } from '../components/WelcomeTour';
import { AppStore } from '../store/AppStore';
import { CloudStore } from '../store/CloudStore';
import { IPhoneStore } from '../store/IPhoneStore';
import { ReminderStore } from '../store/ReminderStore';
export default function Layout() {
  return <AppStore><CloudStore><IPhoneStore><ReminderStore>
    <StatusBar style="light" /><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(tabs)" /></Stack><WelcomeTour />
  </ReminderStore></IPhoneStore></CloudStore></AppStore>;
}
