/**
 * Bridges the app's token theme onto React Navigation so native Stack headers and the native
 * tab bar adopt the EarnLock palette and follow the in-app light/dark toggle. Headers use the
 * system font (no override) for a true first-party large-title look; the lime shows only in the
 * interactive tint (back chevrons, bar buttons) via the contrast-safe `accentText`.
 */
import { DarkTheme, DefaultTheme } from 'expo-router';

import type { Tokens } from './tokens';

export function makeNavTheme(dark: boolean, t: Tokens) {
  const base = dark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    dark,
    colors: {
      ...base.colors,
      primary: t.accentText,
      background: t.bg,
      card: t.surface,
      text: t.text,
      border: t.separator,
      notification: t.danger,
    },
  };
}

export function tabStackOptions(t: Tokens) {
  return {
    headerLargeTitle: true,
    // Transparent header so the screen background shows through; on scroll the bar collapses to
    // the native frosted-glass (chrome material) strip — the only place glass belongs.
    headerTransparent: true,
    // Keep the collapsed bar's hairline separator (Settings-style) but no shadow under the
    // expanded large title.
    headerShadowVisible: true,
    headerLargeTitleShadowVisible: false,
    headerStyle: { backgroundColor: 'transparent' },
    headerLargeStyle: { backgroundColor: 'transparent' },
    headerBlurEffect: 'systemChromeMaterial' as const,
    headerTintColor: t.accentText,
    headerTitleStyle: { color: t.text },
    headerLargeTitleStyle: { color: t.text },
    contentStyle: { backgroundColor: 'transparent' },
  };
}
