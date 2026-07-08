/**
 * StepHeader — the minimal top bar for the onboarding flow: a back chevron plus a row of step
 * dots (the current step filled with lime). When a screen is reused as an EDIT screen (opened
 * from Profile rather than the linear first-run flow), pass `title` instead — the dots are
 * replaced by a centered title, so we don't imply a 3-step wizard that isn't happening.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { haptic } from '@/lib/haptics';
import { Radius } from '@/theme/tokens';
import { Type } from '@/theme/type';
import { useTokens } from '@/theme/theme';

import { Sym } from './Sym';

export function StepHeader({
  step,
  total,
  title,
  onBack,
}: {
  step: number;
  total: number;
  /** Edit-mode title — when set, replaces the progress dots. */
  title?: string;
  onBack: () => void;
}) {
  const t = useTokens();
  return (
    <View style={styles.root}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={12}
        onPress={() => {
          haptic.tap();
          onBack();
        }}
        style={({ pressed }) => [
          styles.back,
          { backgroundColor: t.fill },
          pressed && { opacity: 0.6 },
        ]}
      >
        <Sym name="chevron.left" size={17} color={t.text} weight="semibold" />
      </Pressable>

      {title ? (
        <Text style={[Type.headline, styles.title, { color: t.text }]} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <View
          style={styles.dots}
          accessibilityRole="progressbar"
          accessibilityLabel={`Step ${step + 1} of ${total}`}
        >
          {Array.from({ length: total }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === step
                  ? { width: 22, backgroundColor: t.accent }
                  : { width: 7, backgroundColor: t.fillStrong },
              ]}
            />
          ))}
        </View>
      )}

      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center' },
  back: {
    width: 34,
    height: 34,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  dot: { height: 7, borderRadius: Radius.pill },
  title: { flex: 1, textAlign: 'center' },
  spacer: { width: 34 },
});
