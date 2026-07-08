import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { SectionHeader } from '@/components/List';
import { Sym } from '@/components/Sym';
import { TabScreen } from '@/components/TabScreen';
import {
  INSIGHT_TOTALS,
  SUBJECT_MASTERY,
  TIME_LEDGER,
  WEEK_MINUTES,
  WEEK_TODAY_INDEX,
} from '@/store/content';
import { Radius, Space } from '@/theme/tokens';
import { Type } from '@/theme/type';
import { useTokens } from '@/theme/theme';

const fmt = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export default function InsightsScreen() {
  const t = useTokens();

  const weekTotal = WEEK_MINUTES.reduce((sum, d) => sum + d.min, 0);
  const maxMin = Math.max(...WEEK_MINUTES.map((d) => d.min));
  const ledgerMax = Math.max(TIME_LEDGER.earned, TIME_LEDGER.spent);

  return (
    <TabScreen contentStyle={styles.content}>
      {/* Weekly learning */}
      <Card style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={[Type.headline, { color: t.text }]}>Time learned</Text>
          <Text style={[Type.subheadStrong, { color: t.text2 }]}>{fmt(weekTotal)} this week</Text>
        </View>
        <View style={styles.bars}>
          {WEEK_MINUTES.map((d, i) => {
            const today = i === WEEK_TODAY_INDEX;
            return (
              <View
                key={i}
                style={styles.barCol}
                accessible
                accessibilityLabel={`${d.d}, ${d.min} minutes learned${today ? ', today' : ''}`}
              >
                <View
                  style={[
                    styles.bar,
                    {
                      height: 14 + (d.min / maxMin) * 96,
                      backgroundColor: today ? t.accent : t.text3,
                    },
                  ]}
                />
                <Text style={[Type.caption, { color: today ? t.text : t.text3 }]}>{d.d}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Screen time earned vs spent */}
      <Card style={styles.card}>
        <Text style={[Type.headline, { color: t.text, marginBottom: Space.lg }]}>
          Screen time balance
        </Text>
        <LedgerRow
          label="Earned"
          value={fmt(TIME_LEDGER.earned)}
          frac={TIME_LEDGER.earned / ledgerMax}
          color={t.accent}
          track={t.fill}
          textColor={t.text}
          sub={t.text2}
        />
        <View style={{ height: Space.md }} />
        <LedgerRow
          label="Spent"
          value={fmt(TIME_LEDGER.spent)}
          frac={TIME_LEDGER.spent / ledgerMax}
          color={t.text3}
          track={t.fill}
          textColor={t.text}
          sub={t.text2}
        />
        <Text style={[Type.footnote, { color: t.text3, marginTop: Space.lg }]}>
          You earned {fmt(TIME_LEDGER.earned - TIME_LEDGER.spent)} more than you spent. Nice
          balance.
        </Text>
      </Card>

      {/* Subject mastery */}
      <View style={styles.section}>
        <SectionHeader title="Subject mastery" />
        <Card style={styles.card}>
          {SUBJECT_MASTERY.map((s, i) => (
            <View key={s.name} style={[styles.masteryRow, i > 0 && { marginTop: Space.lg }]}>
              <Text style={[Type.subheadStrong, styles.masteryName, { color: t.text }]}>
                {s.name}
              </Text>
              <View style={[styles.masteryTrack, { backgroundColor: t.fill }]}>
                <View
                  style={[styles.masteryFill, { width: `${s.pct}%`, backgroundColor: t.accent }]}
                />
              </View>
              <Text style={[Type.footnoteStrong, styles.masteryPct, { color: t.text2 }]}>
                {s.pct}%
              </Text>
            </View>
          ))}
        </Card>
      </View>

      {/* Totals grid */}
      <View style={styles.grid}>
        {INSIGHT_TOTALS.map((s) => (
          <Card key={s.label} style={styles.tile}>
            <Sym name={s.icon} size={17} color={t.text2} />
            <Text style={[Type.numberLg, { color: t.text, marginTop: Space.sm }]}>{s.value}</Text>
            <Text style={[Type.caption, { color: t.text3 }]}>{s.label}</Text>
          </Card>
        ))}
      </View>
    </TabScreen>
  );
}

function LedgerRow({
  label,
  value,
  frac,
  color,
  track,
  textColor,
  sub,
}: {
  label: string;
  value: string;
  frac: number;
  color: string;
  track: string;
  textColor: string;
  sub: string;
}) {
  return (
    <View>
      <View style={styles.ledgerHead}>
        <Text style={[Type.subhead, { color: sub }]}>{label}</Text>
        <Text style={[Type.subheadStrong, { color: textColor }]}>{value}</Text>
      </View>
      <View style={[styles.ledgerTrack, { backgroundColor: track }]}>
        <View
          style={[
            styles.ledgerFill,
            { width: `${Math.max(frac * 100, 3)}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Space.xl,
    paddingTop: Space.xs,
    paddingBottom: Space.xxxl,
    gap: Space.lg,
  },

  card: { padding: Space.xl },
  section: { gap: 0 },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Space.lg,
  },

  bars: { flexDirection: 'row', gap: Space.sm, alignItems: 'flex-end', height: 128 },
  barCol: { flex: 1, alignItems: 'center', gap: 8, justifyContent: 'flex-end', height: '100%' },
  bar: { width: '86%', borderRadius: 7, borderCurve: 'continuous' },

  ledgerHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  ledgerTrack: { height: 10, borderRadius: Radius.pill, overflow: 'hidden' },
  ledgerFill: { height: '100%', borderRadius: Radius.pill },

  masteryRow: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  masteryName: { width: 68 },
  masteryTrack: { flex: 1, height: 10, borderRadius: Radius.pill, overflow: 'hidden' },
  masteryFill: { height: '100%', borderRadius: Radius.pill },
  masteryPct: { width: 38, textAlign: 'right' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.md },
  tile: { width: '47.8%', flexGrow: 1, padding: Space.lg, gap: 0 },
});
