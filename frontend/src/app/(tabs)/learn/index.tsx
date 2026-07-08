import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ListGroup, ListRow, SectionHeader } from '@/components/List';
import { Sym } from '@/components/Sym';
import { TabScreen } from '@/components/TabScreen';
import { COURSE, STREAK_DAYS, SUBJECT_DEFS, type Lesson } from '@/store/content';
import { useEarnLock } from '@/store/useEarnLock';
import { Radius, Space } from '@/theme/tokens';
import { Type } from '@/theme/type';
import { useTokens } from '@/theme/theme';

export default function LearnScreen() {
  const t = useTokens();
  const router = useRouter();
  const streak = useEarnLock((s) => s.streak);
  const subj = useEarnLock((s) => s.subj);
  const resetQuizFlow = useEarnLock((s) => s.resetQuizFlow);

  const startQuiz = () => {
    resetQuizFlow();
    router.push('/quiz');
  };

  const focus = SUBJECT_DEFS.filter((s) => subj[s.key]);
  const doneCount = COURSE.lessons.filter((l) => l.state === 'done').length;
  const activeIndex = COURSE.lessons.findIndex((l) => l.state === 'active');

  const lessonMeta = (l: Lesson) => {
    if (l.state === 'done')
      return { icon: 'checkmark' as const, color: t.accentText, bg: t.accentSoft };
    if (l.state === 'active')
      return { icon: 'play.fill' as const, color: t.onAccent, bg: t.accent };
    return { icon: 'lock.fill' as const, color: t.text3, bg: t.fill };
  };

  return (
    <TabScreen contentStyle={styles.content}>
      {/* Streak */}
      <Card style={styles.streakCard}>
        <View style={styles.streakHead}>
          <View style={[styles.flame, { backgroundColor: t.accentSoft }]}>
            <Sym name="flame.fill" size={18} color={t.accentText} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[Type.headline, { color: t.text }]}>{streak}-day streak</Text>
            <Text style={[Type.footnote, { color: t.text2 }]}>Learn today to keep it alive</Text>
          </View>
        </View>
        <View style={styles.days}>
          {STREAK_DAYS.map((d, i) => (
            <View key={i} style={styles.dayCol}>
              <View
                style={[
                  styles.dayDot,
                  d.done
                    ? { backgroundColor: t.accent }
                    : {
                        backgroundColor: t.fillStrong,
                        borderWidth: d.today ? 2 : 0,
                        borderColor: t.accent,
                      },
                ]}
              >
                {d.done && <Sym name="checkmark" size={12} color={t.onAccent} weight="bold" />}
              </View>
              <Text style={[Type.caption, { color: d.today ? t.text : t.text3 }]}>{d.d}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Continue course */}
      <View style={styles.section}>
        <SectionHeader title="Continue learning" />
        <Card style={styles.courseCard}>
          <Text style={[Type.overline, { color: t.accentText, textTransform: 'uppercase' }]}>
            {COURSE.subject}
          </Text>
          <Text style={[Type.title2, { color: t.text, marginTop: 4 }]}>{COURSE.title}</Text>
          <Text style={[Type.footnote, { color: t.text2, marginTop: 4 }]}>
            Lesson {activeIndex + 1} of {COURSE.lessons.length} · about 6 min to earn 15
          </Text>
          <View style={[styles.track, { backgroundColor: t.fill }]}>
            <View
              style={[
                styles.trackFill,
                { width: `${COURSE.progress * 100}%`, backgroundColor: t.accent },
              ]}
            />
          </View>
          <Button
            label="Continue lesson"
            icon={<Sym name="play.fill" size={15} color={t.onAccent} />}
            onPress={startQuiz}
            style={{ marginTop: Space.lg }}
          />
        </Card>
      </View>

      {/* Lessons */}
      <ListGroup header={`Lessons · ${doneCount}/${COURSE.lessons.length}`} style={styles.section}>
        {COURSE.lessons.map((l, i) => {
          const m = lessonMeta(l);
          return (
            <ListRow
              key={i}
              icon={m.icon}
              iconColor={m.color}
              iconBg={m.bg}
              title={l.title}
              subtitle={`${l.minutes} min`}
              value={l.state === 'done' ? 'Done' : l.state === 'locked' ? undefined : 'Now'}
              onPress={l.state === 'active' ? startQuiz : undefined}
              showChevron={l.state === 'active'}
            />
          );
        })}
      </ListGroup>

      {/* Focus subjects */}
      <View style={styles.section}>
        <SectionHeader title="Your subjects" />
        <View style={styles.chips}>
          {focus.map((s) => (
            <View
              key={s.key}
              style={[styles.chip, { backgroundColor: t.surface, borderColor: t.separator }]}
            >
              <Sym name={s.icon} size={15} color={t.text2} />
              <Text style={[Type.subheadStrong, { color: t.text }]}>{s.key}</Text>
            </View>
          ))}
        </View>
      </View>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Space.xl,
    paddingTop: Space.xs,
    paddingBottom: Space.xxxl,
    gap: Space.lg,
  },

  streakCard: { padding: Space.lg },
  streakHead: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  flame: {
    width: 38,
    height: 38,
    borderRadius: Radius.control,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  days: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Space.lg },
  dayCol: { alignItems: 'center', gap: 6 },
  dayDot: {
    width: 30,
    height: 30,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  section: { gap: 0 },
  courseCard: { padding: Space.xl },
  track: { height: 8, borderRadius: Radius.pill, marginTop: Space.lg, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: Radius.pill },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
