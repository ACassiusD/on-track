import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppStore } from '../store/AppStore';
import { ReminderStore } from '../store/ReminderStore';
export default function Layout() { return <AppStore><ReminderStore><StatusBar style="light" /><Stack screenOptions={{ headerShown: false }} /></ReminderStore></AppStore>; }
