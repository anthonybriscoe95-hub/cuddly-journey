import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Avatar } from '../../src/components/Avatar';
import { PriorityBadge, StatusBadge, TradeBadge } from '../../src/components/Badge';
import { Card } from '../../src/components/Card';
import { moneyExact, time } from '../../src/format';
import { actions, useStore } from '../../src/store';
import { theme } from '../../src/theme';
import type { JobStatus } from '../../src/types';

const NEXT_STATUS: Partial<Record<JobStatus, { next: JobStatus; label: string; color: string }>> = {
  scheduled: { next: 'en_route', label: 'Start drive', color: theme.colors.primary },
  en_route: { next: 'in_progress', label: 'Arrived — start job', color: theme.colors.warning },
  in_progress: { next: 'completed', label: 'Mark complete', color: theme.colors.success },
  completed: { next: 'invoiced', label: 'Send invoice', color: theme.colors.accent },
};

export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const job = useStore((s) => s.jobs.find((j) => j.id === id));
  const customer = useStore((s) => s.customers.find((c) => c.id === job?.customerId));
  const tech = useStore((s) => s.technicians.find((t) => t.id === job?.technicianId));

  const [noteDraft, setNoteDraft] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQty, setItemQty] = useState('1');

  if (!job || !customer) {
    return (
      <View style={styles.empty}>
        <Text>Job not found</Text>
      </View>
    );
  }

  const subtotal = job.lineItems.reduce((a, li) => a + li.unitPrice * li.quantity, 0);
  const tax = job.lineItems.filter((li) => li.taxable).reduce((a, li) => a + li.unitPrice * li.quantity, 0) * 0.0825;
  const total = subtotal + tax;
  const advance = NEXT_STATUS[job.status];

  const onAdvance = () => {
    if (!advance) return;
    if (advance.next === 'invoiced') {
      router.push(`/invoice/${job.id}`);
      return;
    }
    actions.updateJobStatus(job.id, advance.next);
  };

  const onAddLineItem = () => {
    const price = parseFloat(itemPrice);
    const qty = parseInt(itemQty, 10);
    if (!itemDesc || isNaN(price) || isNaN(qty)) {
      Alert.alert('Missing info', 'Need description, quantity, and price.');
      return;
    }
    actions.addLineItem(job.id, { description: itemDesc, unitPrice: price, quantity: qty, taxable: true });
    setItemDesc('');
    setItemPrice('');
    setItemQty('1');
  };

  const onAddNote = () => {
    if (!noteDraft.trim()) return;
    actions.addNote(job.id, noteDraft.trim());
    setNoteDraft('');
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={{ paddingBottom: 32 }}>
      <Card style={styles.headerCard}>
        <View style={styles.badgesRow}>
          <TradeBadge trade={job.trade} />
          <StatusBadge status={job.status} />
          {job.priority === 'emergency' && <PriorityBadge priority={job.priority} />}
        </View>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.desc}>{job.description}</Text>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={16} color={theme.colors.textMuted} />
          <Text style={styles.metaText}>
            {time(job.scheduledFor)} · {job.estimatedMinutes} min
          </Text>
        </View>
        {tech && (
          <View style={styles.metaRow}>
            <Avatar initials={tech.initials} color={tech.color} size={20} />
            <Text style={styles.metaText}>{tech.name}</Text>
          </View>
        )}
      </Card>

      {advance && (
        <Pressable
          onPress={onAdvance}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: advance.color },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Ionicons name="arrow-forward-circle" size={20} color="#FFFFFF" />
          <Text style={styles.ctaText}>{advance.label}</Text>
        </Pressable>
      )}

      <SectionHeader title="Customer" />
      <Card style={styles.customerCard}>
        <Pressable onPress={() => router.push(`/customer/${customer.id}`)}>
          <Text style={styles.customerName}>{customer.name}</Text>
          <Text style={styles.customerSub}>
            {customer.jobCount} jobs · {moneyExact(customer.lifetimeValue)} lifetime
          </Text>
        </Pressable>
        <View style={styles.contactRow}>
          <ContactChip
            icon="call"
            label="Call"
            onPress={() => Linking.openURL(`tel:${customer.phone.replace(/[^\d]/g, '')}`)}
          />
          <ContactChip
            icon="chatbubble"
            label="Text"
            onPress={() => Linking.openURL(`sms:${customer.phone.replace(/[^\d]/g, '')}`)}
          />
          <ContactChip
            icon="navigate"
            label="Directions"
            onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(customer.address)}`)}
          />
        </View>
        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={16} color={theme.colors.textMuted} />
          <Text style={styles.addressText}>{customer.address}</Text>
        </View>
        {customer.notes && (
          <View style={styles.customerNote}>
            <Ionicons name="information-circle" size={14} color={theme.colors.warning} />
            <Text style={styles.customerNoteText}>{customer.notes}</Text>
          </View>
        )}
      </Card>

      <SectionHeader title={`Line items (${job.lineItems.length})`} />
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {job.lineItems.length === 0 ? (
          <Text style={styles.emptyItems}>No items added yet</Text>
        ) : (
          job.lineItems.map((li, i) => (
            <View
              key={li.id}
              style={[
                styles.lineItem,
                i < job.lineItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.lineDesc}>{li.description}</Text>
                <Text style={styles.lineMeta}>
                  {li.quantity} × {moneyExact(li.unitPrice)}
                </Text>
              </View>
              <Text style={styles.linePrice}>{moneyExact(li.unitPrice * li.quantity)}</Text>
              <Pressable onPress={() => actions.removeLineItem(job.id, li.id)} hitSlop={8}>
                <Ionicons name="close-circle" size={20} color={theme.colors.textSubtle} />
              </Pressable>
            </View>
          ))
        )}
        <View style={styles.addLineItem}>
          <TextInput
            value={itemDesc}
            onChangeText={setItemDesc}
            placeholder="Description (e.g. Capacitor replacement)"
            placeholderTextColor={theme.colors.textSubtle}
            style={styles.addInput}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              value={itemQty}
              onChangeText={setItemQty}
              placeholder="Qty"
              placeholderTextColor={theme.colors.textSubtle}
              keyboardType="numeric"
              style={[styles.addInput, { flex: 1 }]}
            />
            <TextInput
              value={itemPrice}
              onChangeText={setItemPrice}
              placeholder="Unit price"
              placeholderTextColor={theme.colors.textSubtle}
              keyboardType="decimal-pad"
              style={[styles.addInput, { flex: 2 }]}
            />
            <Pressable style={styles.addBtn} onPress={onAddLineItem}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
        {job.lineItems.length > 0 && (
          <View style={styles.totals}>
            <TotalsRow label="Subtotal" value={moneyExact(subtotal)} />
            <TotalsRow label="Tax (8.25%)" value={moneyExact(tax)} />
            <TotalsRow label="Total" value={moneyExact(total)} bold />
          </View>
        )}
      </Card>

      <SectionHeader title={`Notes (${job.notes.length})`} />
      <Card>
        {job.notes.map((n, i) => (
          <View key={i} style={[styles.note, i < job.notes.length - 1 && { marginBottom: theme.spacing.sm }]}>
            <Ionicons name="document-text-outline" size={14} color={theme.colors.textMuted} />
            <Text style={styles.noteText}>{n}</Text>
          </View>
        ))}
        <View style={styles.noteInputRow}>
          <TextInput
            value={noteDraft}
            onChangeText={setNoteDraft}
            placeholder="Add a note for the team…"
            placeholderTextColor={theme.colors.textSubtle}
            style={styles.addInput}
          />
          <Pressable style={styles.addBtn} onPress={onAddNote}>
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </Card>
    </ScrollView>
  );
}

function ContactChip({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}>
      <Ionicons name={icon} size={16} color={theme.colors.primary} />
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

function TotalsRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.totalLabel, bold && { fontWeight: '800', color: theme.colors.text }]}>{label}</Text>
      <Text style={[styles.totalValue, bold && { fontWeight: '800', fontSize: theme.font.lg }]}>{value}</Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerCard: { margin: theme.spacing.lg, gap: 8 },
  badgesRow: { flexDirection: 'row', gap: 6 },
  title: { fontSize: theme.font.xl, fontWeight: '800', color: theme.colors.text, marginTop: 4 },
  desc: { fontSize: theme.font.md, color: theme.colors.textMuted, lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  metaText: { fontSize: theme.font.sm, color: theme.colors.textMuted },
  cta: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    height: 52,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: { color: '#FFFFFF', fontSize: theme.font.md, fontWeight: '700' },
  sectionHeader: {
    fontSize: theme.font.sm,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  customerCard: { marginHorizontal: theme.spacing.lg, gap: theme.spacing.md },
  customerName: { fontSize: theme.font.lg, fontWeight: '700', color: theme.colors.text },
  customerSub: { fontSize: theme.font.sm, color: theme.colors.textMuted, marginTop: 2 },
  contactRow: { flexDirection: 'row', gap: theme.spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
  },
  chipText: { fontSize: theme.font.sm, fontWeight: '600', color: theme.colors.primary },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addressText: { flex: 1, fontSize: theme.font.sm, color: theme.colors.textMuted },
  customerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: theme.colors.warningSoft,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  customerNoteText: { flex: 1, fontSize: theme.font.sm, color: theme.colors.warning },
  emptyItems: { padding: theme.spacing.lg, color: theme.colors.textMuted, fontSize: theme.font.sm, textAlign: 'center' },
  lineItem: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.lg },
  lineDesc: { fontSize: theme.font.md, color: theme.colors.text, fontWeight: '500' },
  lineMeta: { fontSize: theme.font.sm, color: theme.colors.textMuted, marginTop: 2 },
  linePrice: { fontSize: theme.font.md, fontWeight: '700', color: theme.colors.text },
  addLineItem: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
  },
  addInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    height: 42,
    fontSize: theme.font.md,
    color: theme.colors.text,
    flex: 1,
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totals: { padding: theme.spacing.lg, gap: 6, borderTopWidth: 1, borderTopColor: theme.colors.border },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: theme.font.sm, color: theme.colors.textMuted },
  totalValue: { fontSize: theme.font.sm, color: theme.colors.text },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  noteText: { flex: 1, fontSize: theme.font.sm, color: theme.colors.text, lineHeight: 19 },
  noteInputRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md },
});
