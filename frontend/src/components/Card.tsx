/**
 * Card — the standard grouped surface. A solid `surface` fill sitting on the grouped page
 * background, defined by a hairline separator and (in light mode) a whisper of shadow for
 * depth. Deliberately quiet: depth comes from the surface/background contrast and the hairline,
 * not from colored glows. This is how content is grouped throughout the app.
 */
import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { Radius } from '@/theme/tokens';
import { useThemeMode, useTokens } from '@/theme/theme';

export type CardProps = Omit<ViewProps, 'style'> & {
  children?: ReactNode;
  /** Corner radius (continuous). Default Radius.card. */
  radius?: number;
  /** Inner padding shorthand. */
  padding?: number;
  style?: ViewStyle | ViewStyle[];
};

export function Card({ children, radius = Radius.card, padding, style, ...rest }: CardProps) {
  const t = useTokens();
  const { dark } = useThemeMode();
  return (
    <View
      style={[
        {
          borderRadius: radius,
          borderCurve: 'continuous',
          backgroundColor: t.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: t.separator,
        },
        padding != null && { padding },
        !dark && { boxShadow: '0px 1px 3px rgba(12,12,20,0.04)' },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
