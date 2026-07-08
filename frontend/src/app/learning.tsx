import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Sym } from '@/components/Sym';
import { haptic } from '@/lib/haptics';
import { QUESTIONS } from '@/store/content';
import { useEarnLock } from '@/store/useEarnLock';
import { Radius, Space } from '@/theme/tokens';
import { Type } from '@/theme/type';
import { useTokens } from '@/theme/theme';

export default function LearningScreen() {
  const t = useTokens();
  const router = useRouter();

  const qIndex = useEarnLock((s) => s.qIndex);
  const retryQuestion = useEarnLock((s) => s.retryQuestion);
  const q = QUESTIONS[Math.min(qIndex, QUESTIONS.length - 1)];
  const answer = q.opts[q.answer];

  const tryAgain = () => {
    retryQuestion();
    router.replace('/quiz');
  };

  return (
    <Screen bottomInset>
      <View style={styles.top}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={12}
          onPress={() => {
            haptic.tap();
            router.navigate('/today');
          }}
          style={({ pressed }) => [
            styles.close,
            { backgroundColor: t.fill },
            pressed && { opacity: 0.6 },
          ]}
        >
          <Sym name="xmark" size={16} color={t.text2} weight="semibold" />
        </Pressable>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.icon, { backgroundColor: t.accentSoft }]}>
          <Sym name="lightbulb.fill" size={26} color={t.accentText} />
        </View>
        <Text style={[Type.title1, { color: t.text, marginTop: Space.lg }]}>
          Let’s learn this one
        </Text>
        <Text style={[Type.body, { color: t.text2, marginTop: 6 }]}>
          No penalty — read it through, then try again.
        </Text>

        <Card style={styles.qCard}>
          <Text style={[Type.overline, { color: t.text3, textTransform: 'uppercase' }]}>
            {q.tag}
          </Text>
          <Text style={[Type.title3, { color: t.text, marginTop: 6 }]}>{q.q}</Text>

          <View style={[styles.answer, { backgroundColor: t.accentSoft }]}>
            <Sym name="checkmark.circle.fill" size={20} color={t.accentText} />
            <Text style={[Type.bodyStrong, { color: t.text, flex: 1 }]}>
              {answer.e} {answer.t}
            </Text>
          </View>

          <Text style={[Type.callout, { color: t.text2, marginTop: Space.lg, lineHeight: 23 }]}>
            {q.explain}
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Try again" onPress={tryAgain} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Space.lg,
    paddingTop: Space.sm,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: Space.xl, paddingTop: Space.md, paddingBottom: Space.lg },
  icon: {
    width: 56,
    height: 56,
    borderRadius: Radius.card,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qCard: { padding: Space.xl, marginTop: Space.xxl },
  answer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: Space.md,
    borderRadius: Radius.control,
    borderCurve: 'continuous',
    marginTop: Space.lg,
  },
  footer: { paddingHorizontal: Space.xl, paddingTop: Space.sm },
});
