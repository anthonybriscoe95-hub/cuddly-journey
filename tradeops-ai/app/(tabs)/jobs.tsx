import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { JobRow } from '../../src/components/JobRow';
import { useStore } from '../../src/store';
import { theme } from '../../src/theme';
import type { JobStatus } from '../../src/types';

const FILTERS: { key: 'all' | JobStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'en_route', label: 'En route' },
  { key: 'in_progress', label: 'Active' },
  { key: 'completed', label: 'Done' },
  { key: 'invoiced', label: 'Invoiced' },
];

export default function JobsScreen() {
  const jobs = useStore((s) => s.jobs);
  const customers = useStore((s) => s.customers);
  const [filter, setFilter] = useState<'all' | JobStatus>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs
      .filter((j) => (filter === 'all' ? true : j.status === filter))
      .filter((j) => {
        if (!q) return true;
        const cust = customers.find((c) => c.id === j.customerId);
        return (
          j.title.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          cust?.name.toLowerCase().includes(q) ||
          cust?.address.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
  }, [jobs, customers, filter, query]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={theme.colors.textSubtle} style={{ marginRight: 8 }} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search jobs, customers, addresses…"
          placeholderTextColor={theme.colors.textSubtle}
          style={styles.search}
        />
      </View>

      <View style={styles.filters}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(f) => f.key}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm }}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setFilter(item.key)}
              style={[styles.chip, filter === item.key && styles.chipActive]}
            >
              <Text style={[styles.chipText, filter === item.key && styles.chipTextActive]}>{item.label}</Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(j) => j.id}
        renderItem={({ item }) => (
          <JobRow job={item} onPress={() => router.push(`/job/${item.id}`)} />
        )}
        ItemSeparatorComponent={null}
        contentContainerStyle={{ backgroundColor: theme.colors.surface }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={32} color={theme.colors.textSubtle} />
            <Text style={styles.emptyText}>No jobs match your filters</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    height: 44,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  search: { flex: 1, color: theme.colors.text, fontSize: theme.font.md },
  filters: { paddingBottom: theme.spacing.md },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: { backgroundColor: theme.colors.dark, borderColor: theme.colors.dark },
  chipText: { fontSize: theme.font.sm, color: theme.colors.text, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },
  empty: { padding: theme.spacing.xxl, alignItems: 'center', gap: theme.spacing.sm },
  emptyText: { color: theme.colors.textMuted, fontSize: theme.font.md },
});
