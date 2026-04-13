// ─── HelpScreen ──────────────────────────────────────────────────────────────
// FAQ + Contact section for both Rider and Traveler.

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'How do I post a trip?',
    a: 'Go to the Trips tab → Post a Trip. Fill in your route, date, seats and fare. Your vehicle must be verified (RC + DL) before posting.',
  },
  {
    q: 'How does payment work?',
    a: 'Payment is settled directly between the rider and traveler. The app shows the cost per person — you can pay via UPI, cash, or any method agreed upon.',
  },
  {
    q: 'How do I join a trip?',
    a: 'Search for a trip from Home, tap on it, and press "Request to Join". The rider will accept or decline your request.',
  },
  {
    q: 'Can I cancel my trip?',
    a: 'Yes. Go to My Trips, open the trip and tap Cancel. Please inform co-travelers in advance.',
  },
  {
    q: 'How is my safety ensured?',
    a: 'All riders must verify their RC and DL before posting trips. You can also share your live location with emergency contacts from the Safety tab.',
  },
  {
    q: 'How do I get verified as a rider?',
    a: 'Go to Trips → Verification. Upload your RC (Registration Certificate), DL (Driving Licence), and Permit (if required). Documents are reviewed within 24 hours.',
  },
  {
    q: 'What if a rider does not show up?',
    a: 'Contact the rider directly via the contact details in the trip. If unresolved, report the issue to us at support@rideshare.app.',
  },
  {
    q: 'How do I report a problem?',
    a: 'Email us at support@rideshare.app or WhatsApp us at +91 98765 43210. We respond within 24 hours.',
  },
];

// ─── FaqItem ──────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={styles.faqCard}
      onPress={() => setOpen(o => !o)}
      activeOpacity={0.8}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQ}>{q}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.text.hint}
        />
      </View>
      {open && <Text style={styles.faqA}>{a}</Text>}
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HelpScreen() {
  const openEmail = () =>
    Linking.openURL('mailto:support@rideshare.app').catch(() =>
      Alert.alert('Error', 'Could not open mail app.'),
    );

  const openWhatsApp = () =>
    Linking.openURL('https://wa.me/919876543210').catch(() =>
      Alert.alert('Error', 'Could not open WhatsApp.'),
    );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Contact cards */}
      <Text style={styles.sectionTitle}>Contact Us</Text>
      <View style={styles.contactRow}>
        <TouchableOpacity style={styles.contactCard} onPress={openEmail} activeOpacity={0.85}>
          <View style={[styles.contactIcon, { backgroundColor: `${colors.primary}18` }]}>
            <Ionicons name="mail-outline" size={22} color={colors.primary} />
          </View>
          <Text style={styles.contactLabel}>Email</Text>
          <Text style={styles.contactValue}>support@{'\n'}rideshare.app</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={openWhatsApp} activeOpacity={0.85}>
          <View style={[styles.contactIcon, { backgroundColor: `${colors.success}18` }]}>
            <Ionicons name="logo-whatsapp" size={22} color={colors.success} />
          </View>
          <Text style={styles.contactLabel}>WhatsApp</Text>
          <Text style={styles.contactValue}>+91 98765{'\n'}43210</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="time-outline" size={16} color={colors.text.hint} />
        <Text style={styles.infoText}>Support hours: Mon–Sat, 9 AM – 7 PM IST</Text>
      </View>

      {/* FAQ */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>
        Frequently Asked Questions
      </Text>
      {FAQS.map(item => (
        <FaqItem key={item.q} q={item.q} a={item.a} />
      ))}

      {/* Version */}
      <Text style={styles.version}>RideShare v1.0.0 · Made in India 🇮🇳</Text>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },

  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  contactRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  contactCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  contactLabel: {
    fontSize: fontSize.xs,
    color: colors.text.hint,
    fontWeight: fontWeight.medium,
  },
  contactValue: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    fontWeight: fontWeight.semiBold,
    textAlign: 'center',
    lineHeight: 18,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: `${colors.primary}0D`,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    flex: 1,
  },

  faqCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  faqQ: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
    lineHeight: 20,
  },
  faqA: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    lineHeight: 20,
  },

  version: {
    fontSize: fontSize.xs,
    color: colors.text.hint,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
