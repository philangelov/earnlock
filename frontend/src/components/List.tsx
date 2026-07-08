/**
 * Grouped list primitives — the iOS "inset grouped" table look, built from tokens.
 *
 *   <ListGroup header="Locked apps">
 *     <ListRow icon="lock.fill" title="TikTok" subtitle="Short video" trailing={<Switch/>} />
 *     <ListRow title="Instagram" onPress={...} showChevron />
 *   </ListGroup>
 *
 * ListGroup draws the enclosing card + hairline separators between rows (inset to clear the
 * leading icon). ListRow renders leading icon well, title/subtitle, and a trailing slot
 * (value text, chevron, switch, or any element).
 */
import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Type } from '@/theme/type';
import { useTokens } from '@/theme/theme';

import { Card } from './Card';
import { Sym, type SymName } from './Sym';

export function SectionHeader({
  title,
  trailing,
  style,
}: {
  title: string;
  trailing?: ReactNode;
  style?: ViewStyle;
}) {
  const t = useTokens();
  return (
    <View style={[styles.sectionHeader, style]}>
      <Text style={[Type.overline, { color: t.text3, textTransform: 'uppercase' }]}>{title}</Text>
      {trailing}
    </View>
  );
}

export function ListGroup({
  header,
  footer,
  children,
  inset = 54,
  style,
}: {
  header?: string;
  footer?: string;
  children: ReactNode;
  /** Left inset of the between-row separators (clears the leading icon well). */
  inset?: number;
  style?: ViewStyle;
}) {
  const t = useTokens();
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <View style={style}>
      {header && <SectionHeader title={header} />}
      <Card padding={0} style={styles.groupCard}>
        {items.map((child, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <View
                style={{
                  height: StyleSheet.hairlineWidth,
                  backgroundColor: t.separator,
                  marginLeft: inset,
                }}
              />
            )}
            {child}
          </Fragment>
        ))}
      </Card>
      {footer && <Text style={[Type.footnote, styles.footer, { color: t.text3 }]}>{footer}</Text>}
    </View>
  );
}

export type ListRowProps = {
  icon?: SymName;
  iconColor?: string;
  iconBg?: string;
  /** Provide a fully custom leading element instead of the icon well. */
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  /** Right-aligned value text (secondary color). */
  value?: string;
  /** Custom trailing element (switch, badge, etc.). Overrides `value`. */
  trailing?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
};

export function ListRow({
  icon,
  iconColor,
  iconBg,
  leading,
  title,
  subtitle,
  value,
  trailing,
  onPress,
  showChevron,
  destructive,
}: ListRowProps) {
  const t = useTokens();
  const titleColor = destructive ? t.danger : t.text;

  const body = (
    <View style={styles.row}>
      {leading ??
        (icon && (
          <View style={[styles.iconWell, { backgroundColor: iconBg ?? t.fill }]}>
            <Sym name={icon} size={17} color={iconColor ?? t.text} weight="semibold" />
          </View>
        ))}
      <View style={styles.rowCenter}>
        <Text style={[Type.body, { color: titleColor }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[Type.footnote, { color: t.text3, marginTop: 1 }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {value != null && (
        <Text style={[Type.body, { color: t.text2 }]} numberOfLines={1}>
          {value}
        </Text>
      )}
      {trailing}
      {showChevron && <Sym name="chevron.right" size={14} color={t.text3} weight="semibold" />}
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => pressed && { backgroundColor: t.fill }}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  groupCard: { overflow: 'hidden' },
  footer: { paddingHorizontal: 4, marginTop: 7, lineHeight: 17 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  iconWell: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCenter: { flex: 1 },
});
