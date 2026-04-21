import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { time } from '../format';
import { selectors } from '../store';
import { theme } from '../theme';
import type { Job } from '../types';
import { Avatar } from './Avatar';
import { PriorityBadge, StatusBadge, TradeBadge } from './Badge';

export function JobRow({ job, onPress }: { job: Job; onPress?: () => void }) {
  const customer = selectors.customerById(job.customerId);
  const tech = selectors.technicianById(job.technicianId);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.timeCol}>
        <Text style={styles.time}>{time(job.scheduledFor)}</Text>
        <Text style={styles.dur}>{job.estimatedMinutes}m</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.badgesRow}>
          <TradeBadge trade={job.trade} />
          {job.priority === 'emergency' && <PriorityBadge priority={job.priority} />}
          {job.createdVia === 'ai_voice' && (
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={10} color={theme.colors.accent} />
              <Text style={styles.aiText}>AI booked</Text>
            </View>
          )}
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {job.title}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {customer?.name} · {customer?.address.split(',')[0]}
        </Text>
        <View style={styles.footer}>
          {tech && (
            <View style={styles.techRow}>
              <Avatar initials={tech.initials} color={tech.color} size={20} />
              <Text style={styles.techName}>{tech.name}</Text>
            </View>
          )}
          <StatusBadge status={job.status} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  timeCol: { width: 56, alignItems: 'flex-start' },
  time: { fontSize: theme.font.lg, fontWeight: '700', color: theme.colors.text },
  dur: { fontSize: theme.font.xs, color: theme.colors.textMuted, marginTop: 2 },
  body: { flex: 1, gap: 6 },
  badgesRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  title: { fontSize: theme.font.md, fontWeight: '600', color: theme.colors.text },
  sub: { fontSize: theme.font.sm, color: theme.colors.textMuted },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  techRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  techName: { fontSize: theme.font.sm, color: theme.colors.textMuted },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accentSoft,
  },
  aiText: { fontSize: 10, fontWeight: '700', color: theme.colors.accent, letterSpacing: 0.3 },
});
