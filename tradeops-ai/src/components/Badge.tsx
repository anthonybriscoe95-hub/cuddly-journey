import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import type { JobPriority, JobStatus, Trade } from '../types';

const STATUS_LABEL: Record<JobStatus, string> = {
  scheduled: 'Scheduled',
  en_route: 'En route',
  in_progress: 'In progress',
  completed: 'Completed',
  invoiced: 'Invoiced',
  paid: 'Paid',
};

const STATUS_COLORS: Record<JobStatus, { bg: string; fg: string }> = {
  scheduled: { bg: theme.colors.surfaceAlt, fg: theme.colors.textMuted },
  en_route: { bg: theme.colors.primarySoft, fg: theme.colors.primary },
  in_progress: { bg: theme.colors.warningSoft, fg: theme.colors.warning },
  completed: { bg: theme.colors.successSoft, fg: theme.colors.success },
  invoiced: { bg: theme.colors.accentSoft, fg: theme.colors.accent },
  paid: { bg: theme.colors.successSoft, fg: theme.colors.success },
};

const PRIORITY_COLORS: Record<JobPriority, { bg: string; fg: string }> = {
  emergency: { bg: theme.colors.dangerSoft, fg: theme.colors.danger },
  standard: { bg: theme.colors.surfaceAlt, fg: theme.colors.textMuted },
  maintenance: { bg: theme.colors.primarySoft, fg: theme.colors.primary },
};

const TRADE_COLORS: Record<Trade, { bg: string; fg: string }> = {
  HVAC: { bg: '#E0F2FE', fg: '#0369A1' },
  Plumbing: { bg: '#DCFCE7', fg: '#15803D' },
  Electrical: { bg: '#FEF3C7', fg: '#A16207' },
};

export function StatusBadge({ status }: { status: JobStatus }) {
  const c = STATUS_COLORS[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.fg }]}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

export function PriorityBadge({ priority }: { priority: JobPriority }) {
  const c = PRIORITY_COLORS[priority];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.fg }]}>{priority.toUpperCase()}</Text>
    </View>
  );
}

export function TradeBadge({ trade }: { trade: Trade }) {
  const c = TRADE_COLORS[trade];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.fg }]}>{trade}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
