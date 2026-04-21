import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../src/components/Card';
import { moneyExact } from '../../src/format';
import { actions, useStore } from '../../src/store';
import { theme } from '../../src/theme';

type Method = 'card_link' | 'tap_to_pay' | 'check' | 'cash';

export default function InvoiceModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const job = useStore((s) => s.jobs.find((j) => j.id === id));
  const customer = useStore((s) => s.customers.find((c) => c.id === job?.customerId));

  const [method, setMethod] = useState<Method>('card_link');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!job || !customer) return null;

  const subtotal = job.lineItems.reduce((a, li) => a + li.unitPrice * li.quantity, 0);
  const tax = job.lineItems.filter((li) => li.taxable).reduce((a, li) => a + li.unitPrice * li.quantity, 0) * 0.0825;
  const total = subtotal + tax;

  const onSend = () => {
    if (job.lineItems.length === 0) {
      Alert.alert('No line items', 'Add at least one line item before invoicing.');
      return;
    }
    setSending(true);
    setTimeout(() => {
      actions.updateJobStatus(job.id, 'invoiced');
      setSending(false);
      setSent(true);
    }, 1200);
  };

  const onMarkPaid = () => {
    actions.markPaid(job.id);
    Alert.alert('Payment recorded', `${moneyExact(total)} marked as paid.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  if (sent) {
    return (
      <View style={styles.successWrap}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.successTitle}>Invoice sent</Text>
        <Text style={styles.successSub}>
          {customer.name} will receive a text and email with a secure payment link for{' '}
          <Text style={{ fontWeight: '700' }}>{moneyExact(total)}</Text>.
        </Text>
        <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.xl }}>
          <Pressable
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => router.back()}
          >
            <Text style={styles.btnSecondaryText}>Done</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onMarkPaid}>
            <Text style={styles.btnPrimaryText}>Mark paid now</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Send invoice</Text>
        <Text style={styles.headerSub}>To {customer.name}</Text>
      </View>

      <Card style={styles.summaryCard}>
        {job.lineItems.map((li) => (
          <View key={li.id} style={styles.lineRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.lineDesc}>{li.description}</Text>
              <Text style={styles.lineQty}>
                {li.quantity} × {moneyExact(li.unitPrice)}
              </Text>
            </View>
            <Text style={styles.linePrice}>{moneyExact(li.unitPrice * li.quantity)}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <SummaryRow label="Subtotal" value={moneyExact(subtotal)} />
        <SummaryRow label="Sales tax (8.25%)" value={moneyExact(tax)} />
        <View style={styles.divider} />
        <SummaryRow label="Amount due" value={moneyExact(total)} bold />
      </Card>

      <Text style={styles.sectionLabel}>Payment method</Text>
      <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm }}>
        <MethodOption
          method="card_link"
          selected={method}
          onSelect={setMethod}
          icon="link"
          title="Text payment link"
          sub="Customer pays from their phone — 2.9% + 30¢"
        />
        <MethodOption
          method="tap_to_pay"
          selected={method}
          onSelect={setMethod}
          icon="phone-portrait"
          title="Tap to pay on phone"
          sub="Take card now in person — 2.6% + 10¢"
        />
        <MethodOption
          method="check"
          selected={method}
          onSelect={setMethod}
          icon="document-text"
          title="Check"
          sub="Mark as expecting check"
        />
        <MethodOption
          method="cash"
          selected={method}
          onSelect={setMethod}
          icon="cash"
          title="Cash"
          sub="Record cash collected"
        />
      </View>

      <View style={{ padding: theme.spacing.lg, marginTop: theme.spacing.md }}>
        <Pressable
          onPress={onSend}
          disabled={sending}
          style={({ pressed }) => [
            styles.cta,
            sending && { opacity: 0.7 },
            pressed && { opacity: 0.85 },
          ]}
        >
          {sending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#FFFFFF" />
              <Text style={styles.ctaText}>
                {method === 'card_link' ? 'Send invoice' : method === 'tap_to_pay' ? 'Charge card' : 'Record payment'}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && { fontWeight: '700', color: theme.colors.text, fontSize: theme.font.lg }]}>
        {label}
      </Text>
      <Text style={[styles.summaryValue, bold && { fontWeight: '800', fontSize: theme.font.xl }]}>{value}</Text>
    </View>
  );
}

function MethodOption({
  method,
  selected,
  onSelect,
  icon,
  title,
  sub,
}: {
  method: Method;
  selected: Method;
  onSelect: (m: Method) => void;
  icon: any;
  title: string;
  sub: string;
}) {
  const isSelected = selected === method;
  return (
    <Pressable
      onPress={() => onSelect(method)}
      style={[
        styles.methodOption,
        isSelected && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
      ]}
    >
      <Ionicons name={icon} size={20} color={isSelected ? theme.colors.primary : theme.colors.textMuted} />
      <View style={{ flex: 1 }}>
        <Text style={styles.methodTitle}>{title}</Text>
        <Text style={styles.methodSub}>{sub}</Text>
      </View>
      <View style={[styles.radio, isSelected && styles.radioSelected]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { padding: theme.spacing.lg },
  headerTitle: { fontSize: theme.font.xxl, fontWeight: '800', color: theme.colors.text },
  headerSub: { fontSize: theme.font.md, color: theme.colors.textMuted, marginTop: 4 },
  summaryCard: { marginHorizontal: theme.spacing.lg, gap: 6 },
  lineRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  lineDesc: { fontSize: theme.font.md, color: theme.colors.text },
  lineQty: { fontSize: theme.font.sm, color: theme.colors.textMuted, marginTop: 2 },
  linePrice: { fontSize: theme.font.md, fontWeight: '600', color: theme.colors.text },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: theme.font.sm, color: theme.colors.textMuted },
  summaryValue: { fontSize: theme.font.sm, color: theme.colors.text },
  sectionLabel: {
    fontSize: theme.font.sm,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  methodTitle: { fontSize: theme.font.md, fontWeight: '600', color: theme.colors.text },
  methodSub: { fontSize: theme.font.sm, color: theme.colors.textMuted, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: theme.colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary },
  cta: {
    height: 54,
    backgroundColor: theme.colors.dark,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: { color: '#FFFFFF', fontSize: theme.font.md, fontWeight: '700' },
  successWrap: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  successTitle: { fontSize: theme.font.xxl, fontWeight: '800', color: theme.colors.text, marginBottom: theme.spacing.sm },
  successSub: {
    fontSize: theme.font.md,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: theme.spacing.lg,
  },
  btn: { paddingHorizontal: theme.spacing.xl, height: 48, borderRadius: theme.radius.lg, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: theme.colors.success },
  btnPrimaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: theme.font.md },
  btnSecondary: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  btnSecondaryText: { color: theme.colors.text, fontWeight: '700', fontSize: theme.font.md },
});
