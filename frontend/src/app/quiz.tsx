import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Sym } from '@/components/Sym';
import { haptic } from '@/lib/haptics';
import { MC_COUNT, QUESTIONS } from '@/store/content';
import { useEarnLock } from '@/store/useEarnLock';
import { Radius, Space } from '@/theme/tokens';
import { Type } from '@/theme/type';
import { useTokens } from '@/theme/theme';

export default function QuizScreen() {
  const t = useTokens();
  const router = useRouter();

  const qIndex = useEarnLock((s) => s.qIndex);
  const selected = useEarnLock((s) => s.selected);
  const checked = useEarnLock((s) => s.checked);
  const pick = useEarnLock((s) => s.pick);
  const check = useEarnLock((s) => s.check);
  const nextQuestion = useEarnLock((s) => s.nextQuestion);

  const q = QUESTIONS[Math.min(qIndex, QUESTIONS.length - 1)];
  const correct = selected === q.answer;
  // Only a *correct* answer advances progress — a wrong one shouldn't bump the bar then regress
  // after the learn-and-retry loop.
  const qProg = Math.min(1, (qIndex + (checked && correct ? 1 : 0)) / (MC_COUNT + 1));

  const onButton = () => {
    if (!checked) {
      if (correct) haptic.success();
      else haptic.error();
      check();
      return;
    }
    if (selected !== q.answer) {
      router.replace('/learning');
      return;
    }
    // Route to recap BEFORE advancing so the reset question can't flash for a frame.
    if (qIndex + 1 >= MC_COUNT) {
      router.replace('/recap');
      return;
    }
    nextQuestion();
  };

  const btnLabel = checked ? (correct ? 'Continue' : 'See why') : 'Check answer';

  const optStyle = (i: number): ViewStyle => {
    const isAnswer = i === q.answer;
    const isPicked = selected === i;
    if (!checked) {
      return isPicked
        ? { borderColor: t.accent, backgroundColor: t.accentSoft }
        : { borderColor: t.separator, backgroundColor: t.surface };
    }
    if (isAnswer) return { borderColor: t.accent, backgroundColor: t.accentSoft };
    if (isPicked) return { borderColor: t.danger, backgroundColor: t.dangerSoft };
    return { borderColor: t.separator, backgroundColor: t.surface, opacity: 0.5 };
  };

  const optBadge = (i: number) => {
    if (!checked) return null;
    if (i === q.answer) return <Sym name="checkmark.circle.fill" size={22} color={t.accentText} />;
    if (selected === i) return <Sym name="xmark.circle.fill" size={22} color={t.danger} />;
    return <View style={styles.badgeSpacer} />;
  };

  return (
    <Screen bottomInset>
      {/* Top bar */}
      <View style={styles.top}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => {
            haptic.tap();
            router.back();
          }}
          hitSlop={10}
          style={styles.iconBtn}
        >
          <Sym name="chevron.left" size={20} color={t.text2} weight="semibold" />
        </Pressable>
        <View style={[styles.track, { backgroundColor: t.fill }]}>
          <Animated.View
            layout={LinearTransition.duration(300)}
            style={[styles.trackFill, { width: `${qProg * 100}%`, backgroundColor: t.accent }]}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close quiz"
          onPress={() => {
            haptic.tap();
            router.navigate('/today');
          }}
          hitSlop={10}
          style={styles.iconBtn}
        >
          <Sym name="xmark" size={19} color={t.text2} weight="semibold" />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[Type.overline, { color: t.accentText, textTransform: 'uppercase' }]}>
          {q.tag}
        </Text>
        <Text style={[Type.title1, { color: t.text, marginTop: Space.sm }]}>{q.q}</Text>

        <View style={styles.options}>
          {q.opts.map((opt, i) => (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={opt.t}
              accessibilityState={{
                selected: selected === i,
                disabled: checked,
              }}
              accessibilityHint={
                checked
                  ? i === q.answer
                    ? 'Correct answer'
                    : selected === i
                      ? 'Your answer, incorrect'
                      : undefined
                  : undefined
              }
              onPress={() => {
                haptic.select();
                pick(i);
              }}
              style={({ pressed }) => [
                styles.opt,
                optStyle(i),
                pressed && !checked && styles.pressScale,
              ]}
            >
              <Text style={styles.emoji}>{opt.e}</Text>
              <Text style={[Type.bodyStrong, styles.optText, { color: t.text }]}>{opt.t}</Text>
              {optBadge(i)}
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {checked && (
          <Animated.View
            entering={FadeInDown.duration(200)}
            accessibilityLiveRegion="polite"
            style={[styles.fb, { backgroundColor: correct ? t.accentSoft : t.dangerSoft }]}
          >
            <Sym
              name={correct ? 'checkmark.circle.fill' : 'info.circle.fill'}
              size={17}
              color={correct ? t.accentText : t.danger}
            />
            <Text
              style={[Type.subheadStrong, { color: correct ? t.accentText : t.danger, flex: 1 }]}
            >
              {correct ? 'Correct — nice one!' : 'Not quite — let’s learn why.'}
            </Text>
          </Animated.View>
        )}
        <Button label={btnLabel} disabled={!(checked || selected != null)} onPress={onButton} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingHorizontal: Space.lg,
    paddingTop: Space.sm,
  },
  iconBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, height: 7, borderRadius: Radius.pill, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: Radius.pill },

  body: { paddingHorizontal: Space.xl, paddingTop: Space.xl, paddingBottom: Space.lg },
  options: { gap: Space.md, marginTop: Space.xxl },
  opt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingVertical: 16,
    paddingHorizontal: Space.lg,
    borderRadius: Radius.cardInner,
    borderCurve: 'continuous',
    borderWidth: 1.5,
  },
  emoji: { fontSize: 24 },
  optText: { flex: 1 },
  badgeSpacer: { width: 22, height: 22 },
  pressScale: { transform: [{ scale: 0.98 }] },

  footer: { paddingHorizontal: Space.xl, paddingTop: Space.sm, gap: Space.md },
  fb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: Radius.control,
    borderCurve: 'continuous',
  },
});
