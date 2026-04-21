import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../src/components/Card';
import { duration, time } from '../../src/format';
import { useStore } from '../../src/store';
import { theme } from '../../src/theme';
import type { AICall } from '../../src/types';

const OUTCOME_LABEL: Record<AICall['outcome'], string> = {
  job_booked: 'Job booked',
  quote_requested: 'Quote requested',
  transferred: 'Transferred',
  voicemail: 'Voicemail',
};

const OUTCOME_COLOR: Record<AICall['outcome'], { bg: string; fg: string }> = {
  job_booked: { bg: theme.colors.successSoft, fg: theme.colors.success },
  quote_requested: { bg: theme.colors.primarySoft, fg: theme.colors.primary },
  transferred: { bg: theme.colors.warningSoft, fg: theme.colors.warning },
  voicemail: { bg: theme.colors.surfaceAlt, fg: theme.colors.textMuted },
};

export default function AIScreen() {
  const calls = useStore((s) => s.aiCalls);
  const booked = calls.filter((c) => c.outcome === 'job_booked').length;
  const totalSeconds = calls.reduce((a, c) => a + c.durationSeconds, 0);

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={{ paddingBottom: 32 }}>
      <Card style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.avaIcon}>
            <Ionicons name="sparkles" size={22} color={theme.colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Ava — your AI receptionist</Text>
            <Text style={styles.heroSub}>Online · answering 24/7</Text>
          </View>
          <View style={styles.statusDot} />
        </View>
        <View style={styles.heroStats}>
          <Stat label="Calls today" value={calls.length} />
          <Stat label="Jobs booked" value={booked} />
          <Stat label="Talk time" value={`${Math.round(totalSeconds / 60)}m`} />
        </View>
        <View style={styles.heroFooter}>
          <Text style={styles.heroFooterText}>
            Estimated revenue captured today:{' '}
            <Text style={{ fontWeight: '800', color: theme.colors.text }}>$1,840</Text>
          </Text>
        </View>
      </Card>

      <Text style={styles.sectionHeader}>Recent calls</Text>

      <Card style={{ padding: 0, overflow: 'hidden', marginHorizontal: theme.spacing.lg }}>
        {calls.map((call, i) => {
          const oc = OUTCOME_COLOR[call.outcome];
          return (
            <Pressable
              key={call.id}
              onPress={() => router.push(`/call/${call.id}`)}
              style={({ pressed }) => [
                styles.callRow,
                i < calls.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={styles.callIcon}>
                <Ionicons name="call" size={18} color={theme.colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.callTopRow}>
                  <Text style={styles.callName}>{call.callerName}</Text>
                  <Text style={styles.callTime}>{time(call.startedAt)}</Text>
                </View>
                <Text style={styles.callPhone}>{call.callerPhone} · {duration(call.durationSeconds)}</Text>
                <Text style={styles.callSummary} numberOfLines={2}>{call.summary}</Text>
                <View style={[styles.outcomeBadge, { backgroundColor: oc.bg }]}>
                  <Text style={[styles.outcomeText, { color: oc.fg }]}>{OUTCOME_LABEL[call.outcome]}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </Card>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    margin: theme.spacing.lg,
    backgroundColor: theme.colors.dark,
    borderColor: theme.colors.dark,
    gap: theme.spacing.lg,
  },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  avaIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: theme.font.lg, fontWeight: '700', color: '#FFFFFF' },
  heroSub: { fontSize: theme.font.sm, color: '#94A3B8', marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.success },
  heroStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  stat: { flex: 1, alignItems: 'flex-start' },
  statValue: { fontSize: theme.font.xxl, fontWeight: '800', color: '#FFFFFF' },
  statLabel: { fontSize: theme.font.xs, color: '#94A3B8', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  heroFooter: { paddingTop: theme.spacing.md, borderTopWidth: 1, borderTopColor: '#1E293B' },
  heroFooterText: { fontSize: theme.font.sm, color: '#94A3B8' },
  sectionHeader: {
    fontSize: theme.font.sm,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  callRow: { flexDirection: 'row', gap: theme.spacing.md, padding: theme.spacing.lg },
  callIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  callName: { fontSize: theme.font.md, fontWeight: '700', color: theme.colors.text },
  callTime: { fontSize: theme.font.sm, color: theme.colors.textSubtle },
  callPhone: { fontSize: theme.font.xs, color: theme.colors.textMuted, marginTop: 2 },
  callSummary: { fontSize: theme.font.sm, color: theme.colors.text, marginTop: 6, lineHeight: 19 },
  outcomeBadge: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  outcomeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
});
