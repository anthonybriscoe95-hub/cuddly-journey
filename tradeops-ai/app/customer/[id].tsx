import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../../src/components/Avatar';
import { Card } from '../../src/components/Card';
import { JobRow } from '../../src/components/JobRow';
import { moneyExact } from '../../src/format';
import { useStore } from '../../src/store';
import { theme } from '../../src/theme';

export default function CustomerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const customer = useStore((s) => s.customers.find((c) => c.id === id));
  const allJobs = useStore((s) => s.jobs);
  const customerJobs = useMemo(() => allJobs.filter((j) => j.customerId === id), [allJobs, id]);

  if (!customer) return null;

  const inits = customer.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.headerWrap}>
        <Avatar initials={inits} color={theme.colors.primary} size={64} />
        <Text style={styles.name}>{customer.name}</Text>
        <Text style={styles.address}>{customer.address}</Text>
      </View>

      <View style={styles.actionsRow}>
        <ActionBtn
          icon="call"
          label="Call"
          onPress={() => Linking.openURL(`tel:${customer.phone.replace(/[^\d]/g, '')}`)}
        />
        <ActionBtn
          icon="chatbubble"
          label="Text"
          onPress={() => Linking.openURL(`sms:${customer.phone.replace(/[^\d]/g, '')}`)}
        />
        <ActionBtn icon="mail" label="Email" onPress={() => Linking.openURL(`mailto:${customer.email}`)} />
        <ActionBtn
          icon="navigate"
          label="Map"
          onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(customer.address)}`)}
        />
      </View>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Lifetime value</Text>
          <Text style={styles.statValue}>{moneyExact(customer.lifetimeValue)}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Total jobs</Text>
          <Text style={styles.statValue}>{customer.jobCount}</Text>
        </Card>
      </View>

      {customer.notes && (
        <Card style={styles.notesCard}>
          <View style={styles.notesHeader}>
            <Ionicons name="information-circle" size={16} color={theme.colors.warning} />
            <Text style={styles.notesHeaderText}>Customer notes</Text>
          </View>
          <Text style={styles.notesText}>{customer.notes}</Text>
        </Card>
      )}

      <Text style={styles.sectionLabel}>Jobs ({customerJobs.length})</Text>
      <Card style={{ padding: 0, overflow: 'hidden', marginHorizontal: theme.spacing.lg }}>
        {customerJobs.length === 0 ? (
          <Text style={styles.empty}>No jobs yet</Text>
        ) : (
          customerJobs.map((j) => <JobRow key={j.id} job={j} onPress={() => router.push(`/job/${j.id}`)} />)
        )}
      </Card>
    </ScrollView>
  );
}

function ActionBtn({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.actionIconWrap}>
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerWrap: { alignItems: 'center', padding: theme.spacing.xl, gap: theme.spacing.sm },
  name: { fontSize: theme.font.xxl, fontWeight: '800', color: theme.colors.text, marginTop: theme.spacing.md },
  address: { fontSize: theme.font.md, color: theme.colors.textMuted, textAlign: 'center' },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  actionBtn: { alignItems: 'center', gap: 6 },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: theme.font.xs, color: theme.colors.textMuted, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg },
  statCard: { flex: 1, gap: 6 },
  statLabel: { fontSize: theme.font.sm, color: theme.colors.textMuted },
  statValue: { fontSize: theme.font.xl, fontWeight: '800', color: theme.colors.text },
  notesCard: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.warningSoft,
    borderColor: theme.colors.warningSoft,
  },
  notesHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  notesHeaderText: { fontSize: theme.font.sm, fontWeight: '700', color: theme.colors.warning },
  notesText: { fontSize: theme.font.sm, color: theme.colors.text, lineHeight: 20 },
  sectionLabel: {
    fontSize: theme.font.sm,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  empty: { padding: theme.spacing.lg, color: theme.colors.textMuted, textAlign: 'center' },
});
