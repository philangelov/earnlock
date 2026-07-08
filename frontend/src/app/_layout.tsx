/**
 * Root layout — providers + the native Stack. Uses the system font throughout (no custom font
 * gate), so the first frame is instant. On mount it hydrates the Screen Time facade and mounts
 * the lock-enforcement bridge (store clock → shield/unshield). The splash hides once the
 * persisted theme is ready so the app opens in the user's chosen appearance.
 */
import { Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useLockEnforcement } from '@/lib/screenTime/enforcement';
import { useScreenTime } from '@/lib/screenTime/store';
import { makeNavTheme } from '@/theme/navTheme';
import { ThemeProvider, useThemeMode, useTokens } from '@/theme/theme';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const t = useTokens();
  const { dark, ready } = useThemeMode();
  const navTheme = useMemo(() => makeNavTheme(dark, t), [dark, t]);

  // Re-read Screen Time on launch and whenever the app returns to the foreground, so status +
  // selection count stay fresh after the system authorization sheet, the app picker, or changes
  // made in iOS Settings.
  const refreshScreenTime = useScreenTime((s) => s.refresh);
  useEffect(() => {
    refreshScreenTime();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshScreenTime();
    });
    return () => sub.remove();
  }, [refreshScreenTime]);

  // Keep the OS shield in sync with the earn clock for the whole app lifetime.
  useLockEnforcement();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  return (
    <NavigationThemeProvider value={navTheme}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }}>
        <Stack.Screen
          name="sos"
          options={{
            presentation: 'formSheet',
            sheetGrabberVisible: true,
            sheetAllowedDetents: 'fitToContents',
            sheetCornerRadius: 28,
            contentStyle: { backgroundColor: t.surface },
          }}
        />
        <Stack.Screen
          name="locked"
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
