import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { WelcomeTour } from '../components/WelcomeTour';
import { WebFocusStyles } from '../components/WebFocusStyles';
import { AppStore } from '../store/AppStore';
import { CloudStore } from '../store/CloudStore';
import { IPhoneStore } from '../store/IPhoneStore';
import { ReminderStore } from '../store/ReminderStore';
export default function Layout() {
  return <AppStore><CloudStore><IPhoneStore><ReminderStore>
    <WebFocusStyles /><StatusBar style="light" /><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(tabs)" /></Stack><WelcomeTour />
  </ReminderStore></IPhoneStore></CloudStore></AppStore>;
}
