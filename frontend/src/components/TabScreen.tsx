/**
 * TabScreen — the scroll container for a tab under a native large-title header + native tab bar.
 *
 * The ScrollView is the screen's DIRECT first child (no wrapper View) — this is what lets the
 * native header track the scroll, so the large title collapses into the transparent
 * systemChromeMaterial blur bar on scroll (exactly like Settings). Wrapping it in a View breaks
 * that. `contentInsetAdjustmentBehavior="automatic"` insets content past the header and tab bar.
 */
import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, type ViewStyle } from 'react-native';

import { useTokens } from '@/theme/theme';

export function TabScreen({
  children,
  contentStyle,
  refreshing,
  onRefresh,
}: {
  children: ReactNode;
  contentStyle?: ViewStyle | ViewStyle[];
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const t = useTokens();
  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: t.bg }]}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={contentStyle}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={t.text3} />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
});
