import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Avatar } from '../../src/components/Avatar';
import { moneyExact } from '../../src/format';
import { useStore } from '../../src/store';
import { theme } from '../../src/theme';

const COLORS = ['#2563EB', '#16A34A', '#D97706', '#7C3AED', '#DB2777', '#0891B2'];

const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function CustomersScreen() {
  const customers = useStore((s) => s.customers);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...customers]
      .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
      .filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.phone.includes(q),
      );
  }, [customers, query]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={theme.colors.textSubtle} style={{ marginRight: 8 }} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name, address, phone…"
          placeholderTextColor={theme.colors.textSubtle}
          style={styles.search}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ backgroundColor: theme.colors.surface }}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => router.push(`/customer/${item.id}`)}
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.colors.surfaceAlt }]}
          >
            <Avatar initials={initials(item.name)} color={COLORS[index % COLORS.length]} size={42} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub} numberOfLines={1}>
                {item.address.split(',')[0]} · {item.phone}
              </Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.ltv}>{moneyExact(item.lifetimeValue)}</Text>
              <Text style={styles.jobs}>{item.jobCount} jobs</Text>
            </View>
          </Pressable>
        )}
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
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.lg },
  sep: { height: 1, backgroundColor: theme.colors.border, marginLeft: 70 },
  name: { fontSize: theme.font.md, fontWeight: '600', color: theme.colors.text },
  sub: { fontSize: theme.font.sm, color: theme.colors.textMuted, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  ltv: { fontSize: theme.font.md, fontWeight: '700', color: theme.colors.text },
  jobs: { fontSize: theme.font.xs, color: theme.colors.textMuted, marginTop: 2 },
});
