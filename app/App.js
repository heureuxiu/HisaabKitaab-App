import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  InterTight_400Regular,
  InterTight_500Medium,
  InterTight_600SemiBold,
  InterTight_700Bold,
} from '@expo-google-fonts/inter-tight';
import { C } from './src/theme';
import { AuthProvider, useAuth } from './src/lib/auth';
import { LedgerProvider } from './src/lib/ledger';
import { SheetCtx } from './src/sheetContext';
import { navRef } from './src/navRef';
import { NotificationsProvider } from './src/lib/notify';
import TabBar from './src/components/TabBar';
import HomeScreen from './src/screens/HomeScreen';
import ActivityScreen from './src/screens/ActivityScreen';
import BudgetsScreen from './src/screens/BudgetsScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import SavingsScreen from './src/screens/SavingsScreen';
import AddSheet from './src/screens/AddSheet';
import NotificationsSheet from './src/screens/NotificationsSheet';
import AccountSheet from './src/screens/AccountSheet';
import AuthFlow from './src/screens/auth/AuthFlow';
import SplashView, { SPLASH_MS } from './src/screens/auth/SplashView';
import { FadeIn, withFocusRise } from './src/components/anim';

const Tab = createBottomTabNavigator();
const Home = withFocusRise(HomeScreen);
const Activity = withFocusRise(ActivityScreen);
const Budgets = withFocusRise(BudgetsScreen);
const Savings = withFocusRise(SavingsScreen);
const Reports = withFocusRise(ReportsScreen);
const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#FFFFFF', card: '#FFFFFF', border: '#FFFFFF', text: C.ink, primary: C.ink } };

function Shell() {
  const [sheet, setSheet] = useState({ visible: false, entry: null, type: 'expense' });
  const [account, setAccount] = useState(false);
  const api = useMemo(() => ({
    openAdd: (type = 'expense') => setSheet({ visible: true, entry: null, type }),
    openEdit: (entry) => setSheet({ visible: true, entry, type: entry.type }),
    openSettings: () => setAccount(true),
  }), []);

  return (
    <SheetCtx.Provider value={api}>
      <NavigationContainer ref={navRef} theme={navTheme}>
        <Tab.Navigator tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, animation: 'none', tabBarStyle: { position: 'absolute' } }}>
          <Tab.Screen name="Home" component={Home} />
          <Tab.Screen name="Activity" component={Activity} />
          <Tab.Screen name="Budgets" component={Budgets} />
          <Tab.Screen name="Savings" component={Savings} />
          <Tab.Screen name="Reports" component={Reports} />
        </Tab.Navigator>
      </NavigationContainer>
      <AddSheet visible={sheet.visible} entry={sheet.entry} initialType={sheet.type} onClose={() => setSheet((s) => ({ ...s, visible: false }))} />
      <NotificationsSheet />
      <AccountSheet visible={account} onClose={() => setAccount(false)} />
    </SheetCtx.Provider>
  );
}

// Splash first (at least a moment), then either the sign-in flow or the app itself.
function Gate() {
  const auth = useAuth();
  const [minDone, setMinDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMinDone(true), SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  if (auth.phase === 'loading' || !minDone) return <><StatusBar style="light" /><SplashView /></>;
  if (auth.phase === 'out') return <><StatusBar style="dark" /><FadeIn key="auth"><AuthFlow /></FadeIn></>;
  return (
    // key = user id, so switching accounts never shows the previous account's numbers
    <LedgerProvider key={auth.user.id}>
      <NotificationsProvider>
        <StatusBar style="light" />
        <FadeIn key="app"><Shell /></FadeIn>
      </NotificationsProvider>
    </LedgerProvider>
  );
}

export default function App() {
  const [loaded] = useFonts({
    InterTight_400Regular, InterTight_500Medium, InterTight_600SemiBold, InterTight_700Bold,
  });
  return (
    <SafeAreaProvider>
      {loaded ? <AuthProvider><Gate /></AuthProvider> : <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />}
    </SafeAreaProvider>
  );
}
