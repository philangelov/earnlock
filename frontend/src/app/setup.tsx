import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { SectionHeader } from '@/components/List';
import { Screen } from '@/components/Screen';
import { StepHeader } from '@/components/StepHeader';
import { Sym } from '@/components/Sym';
import { haptic } from '@/lib/haptics';
import { SUBJECT_DEFS } from '@/store/content';
import { useEarnLock } from '@/store/useEarnLock';
import { Radius, Space } from '@/theme/tokens';
import { Type } from '@/theme/type';
import { useTokens } from '@/theme/theme';

export default function SetupScreen() {
  const t = useTokens();
  const router = useRouter();

  const grade = useEarnLock((s) => s.grade);
  const gradeUp = useEarnLock((s) => s.gradeUp);
  const gradeDown = useEarnLock((s) => s.gradeDown);
  const subj = useEarnLock((s) => s.subj);
  const toggleSubj = useEarnLock((s) => s.toggleSubj);
  const onboarded = useEarnLock((s) => s.onboarded);

  const chosen = SUBJECT_DEFS.filter((s) => subj[s.key]).length;
  const canContinue = chosen > 0;

  return (
    <Screen scroll bottomInset contentStyle={styles.content}>
      <StepHeader
        step={0}
        total={3}
        title={onboarded ? 'Grade & subjects' : undefined}
        onBack={() => router.back()}
      />

      <Text style={[Type.title1, { color: t.text, marginTop: Space.lg }]}>A bit about you</Text>
      <Text style={[Type.body, { color: t.text2, marginTop: 6 }]}>
        This tunes the questions to the right level and topics.
      </Text>

      {/* Grade stepper */}
      <SectionHeader title="Grade level" style={styles.sectionHeader} />
      <Card style={styles.gradeCard}>
        <View>
          <Text style={[Type.headline, { color: t.text }]}>Grade {grade}</Text>
          <Text style={[Type.footnote, { color: t.text3 }]}>
            Ages roughly {grade + 5}–{grade + 6}
          </Text>
        </View>
        <View style={styles.stepper}>
          <StepBtn icon="minus" label="Decrease grade" disabled={grade <= 1} onPress={gradeDown} />
          <Text style={[Type.title3, styles.gradeValue, { color: t.text }]}>{grade}</Text>
          <StepBtn icon="plus" label="Increase grade" disabled={grade >= 12} onPress={gradeUp} />
        </View>
      </Card>

      {/* Subjects */}
      <SectionHeader title={`Subjects · ${chosen} chosen`} style={styles.sectionHeader} />
      <View style={styles.chips}>
        {SUBJECT_DEFS.map((s) => {
          const on = subj[s.key];
          return (
            <Pressable
              key={s.key}
              accessibilityRole="button"
              accessibilityLabel={s.key}
              accessibilityState={{ selected: on }}
              hitSlop={{ top: 6, bottom: 6 }}
              onPress={() => {
                haptic.select();
                toggleSubj(s.key);
              }}
              style={[
                styles.chip,
                on
                  ? { backgroundColor: t.accent, borderColor: t.accent }
                  : { backgroundColor: t.surface, borderColor: t.separator },
              ]}
            >
              <Sym name={s.icon} size={15} color={on ? t.onAccent : t.text2} />
              <Text style={[Type.subheadStrong, { color: on ? t.onAccent : t.text }]}>{s.key}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.spacer} />
      <Button
        label={onboarded ? 'Save' : 'Continue'}
        disabled={!canContinue}
        onPress={() => (onboarded ? router.back() : router.push('/material'))}
      />
    </Screen>
  );
}

function StepBtn({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: 'plus' | 'minus';
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const t = useTokens();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
      disabled={disabled}
      onPress={() => {
        haptic.select();
        onPress();
      }}
      style={({ pressed }) => [
        styles.stepBtn,
        { backgroundColor: t.fill },
        pressed && !disabled && { opacity: 0.6 },
        disabled && { opacity: 0.4 },
      ]}
    >
      <Sym name={icon} size={16} color={t.text} weight="bold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Space.xl, paddingTop: Space.sm, paddingBottom: Space.sm },
  sectionHeader: { marginTop: Space.xxl, marginBottom: Space.sm },

  gradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Space.lg,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  gradeValue: { minWidth: 26, textAlign: 'center', fontVariant: ['tabular-nums'] },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },

  spacer: { height: Space.xxxl },
});
