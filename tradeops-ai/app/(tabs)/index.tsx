import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../../src/components/Avatar';
import { Card } from '../../src/components/Card';
import { JobRow } from '../../src/components/JobRow';
import { money, time } from '../../src/format';
import { useStore } from '../../src/store';
import { theme } from '../../src/theme';

export default function Dashboard() {
  const jobs = useStore((s) => s.jobs);
  const aiCalls = useStore((s) => s.aiCalls);
  const techs = useStore((s) => s.technicians);

  const today = jobs;
  const completed = today.filter((j) => j.status === 'completed' || j.status === 'invoiced' || j.status === 'paid').length;
  const inProgress = today.filter((j) => j.status === 'in_progress' || j.status === 'en_route').length;
  const upcoming = today.filter((j) => j.status === 'scheduled').length;

  const revenueToday = today
    .filter((j) => j.status === 'invoiced' || j.status === 'paid')
    .reduce((sum, j) => sum + j.lineItems.reduce((a, li) => a + li.unitPrice * li.quantity, 0), 0);

  const aiBookedToday = aiCalls.filter((c) => c.outcome === 'job_booked').length;

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greet}>Good morning, Marcus</Text>
          <Text style={styles.sub}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>
        <Avatar initials="MR" color={theme.colors.primary} size={44} />
      </View>

      <View style={styles.kpiGrid}>
        <KpiCard label="In progress" value={inProgress} icon="time" color={theme.colors.warning} />
        <KpiCard label="Upcoming" value={upcoming} icon="calendar" color={theme.colors.primary} />
        <KpiCard label="Completed" value={completed} icon="checkmark-circle" color={theme.colors.success} />
        <KpiCard label="Revenue today" value={money(revenueToday)} icon="cash" color={theme.colors.accent} />
      </View>

      <Pressable onPress={() => router.push('/(tabs)/ai')}>
        <Card style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIconWrap}>
              <Ionicons name="sparkles" size={20} color={theme.colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiTitle}>Ava handled {aiCalls.length} calls overnight</Text>
              <Text style={styles.aiSub}>
                {aiBookedToday} jobs booked · {aiCalls.length - aiBookedToday} other outcomes
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </View>
        </Card>
      </Pressable>

      <Section title="Today's schedule" action="See all" onAction={() => router.push('/(tabs)/jobs')}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {today.slice(0, 4).map((j) => (
            <JobRow key={j.id} job={j} onPress={() => router.push(`/job/${j.id}`)} />
          ))}
        </Card>
      </Section>

      <Section title="Crew">
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {techs.map((t, i) => (
            <View
              key={t.id}
              style={[
                styles.techRow,
                i < techs.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
              ]}
            >
              <Avatar initials={t.initials} color={t.color} size={36} />
              <View style={{ flex: 1 }}>
                <Text style={styles.techName}>{t.name}</Text>
                <Text style={styles.techSub}>{t.trade}</Text>
              </View>
              <View style={styles.techCount}>
                <Text style={styles.techCountValue}>{t.jobsToday}</Text>
                <Text style={styles.techCountLabel}>jobs</Text>
              </View>
            </View>
          ))}
        </Card>
      </Section>

      <Section title="Recent AI calls" action="View all" onAction={() => router.push('/(tabs)/ai')}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {aiCalls.slice(0, 3).map((c, i) => (
            <Pressable
              key={c.id}
              onPress={() => router.push(`/call/${c.id}`)}
              style={({ pressed }) => [
                styles.callRow,
                i < 2 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={styles.callIconWrap}>
                <Ionicons name="call" size={16} color={theme.colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.callName}>{c.callerName}</Text>
                <Text style={styles.callSummary} numberOfLines={1}>{c.summary}</Text>
              </View>
              <Text style={styles.callTime}>{time(c.startedAt)}</Text>
            </Pressable>
          ))}
        </Card>
      </Section>
    </ScrollView>
  );
}

function KpiCard({ label, value, icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <Card style={styles.kpi}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </Card>
  );
}

function Section({
  title,
  action,
  onAction,
  children,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginTop: theme.spacing.xl, paddingHorizontal: theme.spacing.lg }}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {action && (
          <Pressable onPress={onAction}>
            <Text style={styles.sectionAction}>{action}</Text>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  greet: { fontSize: theme.font.xxl, fontWeight: '800', color: theme.colors.text },
  sub: { fontSize: theme.font.sm, color: theme.colors.textMuted, marginTop: 2 },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  kpi: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: 6,
  },
  kpiValue: { fontSize: theme.font.xxl, fontWeight: '800', color: theme.colors.text },
  kpiLabel: { fontSize: theme.font.sm, color: theme.colors.textMuted },
  aiCard: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderColor: theme.colors.accentSoft,
    borderWidth: 1.5,
    backgroundColor: '#FAF9FF',
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  aiIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: { fontSize: theme.font.md, fontWeight: '700', color: theme.colors.text },
  aiSub: { fontSize: theme.font.sm, color: theme.colors.textMuted, marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: { fontSize: theme.font.lg, fontWeight: '800', color: theme.colors.text },
  sectionAction: { fontSize: theme.font.sm, color: theme.colors.primary, fontWeight: '600' },
  techRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  techName: { fontSize: theme.font.md, fontWeight: '600', color: theme.colors.text },
  techSub: { fontSize: theme.font.sm, color: theme.colors.textMuted },
  techCount: { alignItems: 'flex-end' },
  techCountValue: { fontSize: theme.font.lg, fontWeight: '700', color: theme.colors.text },
  techCountLabel: { fontSize: theme.font.xs, color: theme.colors.textMuted },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  callIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callName: { fontSize: theme.font.md, fontWeight: '600', color: theme.colors.text },
  callSummary: { fontSize: theme.font.sm, color: theme.colors.textMuted, marginTop: 2 },
  callTime: { fontSize: theme.font.sm, color: theme.colors.textSubtle },
});
