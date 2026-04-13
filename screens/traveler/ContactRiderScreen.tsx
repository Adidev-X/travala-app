// ─── ContactRiderScreen ──────────────────────────────────────────────────────
// Traveler taps "Contact Rider" from TripDetail → lands here.
// Options: phone dialer, WhatsApp, or send a Join Request.

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { memo } from 'react';
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import UserAvatar from '../../components/Avatar';
import VerifiedBadge from '../../components/VerifiedBadge';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import { useContactRider } from '../../hooks/useContactRider';
import type { ContactRiderParams } from '../../navigation/types';

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionCard = memo(function SectionCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return <View style={[ss.card, style]}>{children}</View>;
});

const ContactOptionCard = memo(function ContactOptionCard({
  icon,
  title,
  subtitle,
  borderColor,
  onPress,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  borderColor: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[ss.contactCard, { borderColor }, disabled && ss.disabledCard]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={[ss.contactIconWrap, { backgroundColor: `${borderColor}18` }]}>
        {icon}
      </View>
      <View style={ss.contactText}>
        <Text style={ss.contactTitle}>{title}</Text>
        <Text style={ss.contactSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text.hint} />
    </TouchableOpacity>
  );
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ContactRiderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<ContactRiderParams>();

  const {
    tripId,
    riderId,
    riderName,
    riderPhone,
    riderWhatsapp,
    tripTitle,
    tripFrom,
    tripTo,
    tripDate,
    riderRating,
    riderPhoto,
    isRcVerified,
    isDlVerified,
  } = params;

  const {
    checkingRequest,
    message,
    setMessage,
    requestState,
    requestError,
    sendRequest,
    openPhone,
    openWhatsApp,
  } = useContactRider({
    tripId,
    tripFrom,
    tripTo,
    tripDate,
    riderName,
    riderPhone,
    riderWhatsapp,
  });

  const rating = riderRating ? parseFloat(riderRating) : undefined;
  const rcVerified = isRcVerified === '1';
  const dlVerified = isDlVerified === '1';

  const isSent = requestState === 'sent';
  const isDuplicate = requestState === 'duplicate';
  const isSendDisabled = isSent || isDuplicate || requestState === 'loading' || checkingRequest;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={ss.root}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={ss.header}>
        <TouchableOpacity onPress={() => router.back()} style={ss.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={ss.headerTitle}>Contact Rider</Text>
        <View style={ss.backBtn} />
      </View>

      <ScrollView
        style={ss.scroll}
        contentContainerStyle={ss.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── 1. Rider Info Card ──────────────────────────────────────────── */}
        <SectionCard>
          <View style={ss.riderRow}>
            <UserAvatar
              size="lg"
              uri={riderPhoto}
              name={riderName}
            />
            <View style={ss.riderInfo}>
              <Text style={ss.riderName}>{riderName}</Text>
              {rating !== undefined && (
                <View style={ss.ratingRow}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={ss.ratingText}>{rating.toFixed(1)}</Text>
                </View>
              )}
              <View style={ss.badgeRow}>
                {rcVerified && (
                  <View style={ss.badgeGap}>
                    <VerifiedBadge type="rc" />
                  </View>
                )}
                {dlVerified && (
                  <VerifiedBadge type="dl" />
                )}
              </View>
            </View>
          </View>
        </SectionCard>

        {/* ── 2. Trip Summary Card ────────────────────────────────────────── */}
        <SectionCard style={ss.cardGap}>
          <View style={ss.routeRow}>
            <View style={ss.routeDot} />
            <Text style={ss.routeFrom}>{tripFrom}</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.text.hint} style={ss.routeArrow} />
            <View style={[ss.routeDot, { backgroundColor: colors.success }]} />
            <Text style={ss.routeTo}>{tripTo}</Text>
          </View>
          <Text style={ss.tripDateText}>{tripDate}</Text>
          <Text style={ss.tripTitleText} numberOfLines={1}>{tripTitle}</Text>
        </SectionCard>

        {/* ── 3. Contact Options ──────────────────────────────────────────── */}
        <View style={ss.cardGap}>
          <Text style={ss.sectionLabel}>REACH OUT DIRECTLY</Text>

          <ContactOptionCard
            icon={<Ionicons name="call" size={24} color={colors.success} />}
            title={`Call ${riderName}`}
            subtitle="Opens phone dialer"
            borderColor={colors.success}
            onPress={openPhone}
          />

          <View style={{ marginTop: spacing.sm }}>
            <ContactOptionCard
              icon={<Ionicons name="logo-whatsapp" size={24} color="#25D366" />}
              title={`WhatsApp ${riderName}`}
              subtitle="Opens WhatsApp chat"
              borderColor="#25D366"
              onPress={openWhatsApp}
            />
          </View>
        </View>

        {/* ── 4. Divider ──────────────────────────────────────────────────── */}
        <View style={ss.dividerRow}>
          <View style={ss.dividerLine} />
          <Text style={ss.dividerText}>or</Text>
          <View style={ss.dividerLine} />
        </View>

        {/* ── 5. Send Join Request ────────────────────────────────────────── */}
        <SectionCard>
          <Text style={ss.sectionLabel}>SEND A JOIN REQUEST</Text>
          <Text style={ss.joinHint}>
            Want to officially show interest? Send a request and the rider will be notified.
          </Text>

          {/* Success state */}
          {(isSent || isDuplicate) ? (
            <View style={ss.successBox}>
              <Ionicons name="checkmark-circle" size={32} color={colors.success} />
              <Text style={ss.successTitle}>
                {isSent ? 'Request Sent!' : 'Already Requested'}
              </Text>
              <Text style={ss.successSub}>
                {isSent
                  ? `${riderName} will review your request shortly.`
                  : 'You have already sent a join request for this trip.'}
              </Text>
            </View>
          ) : (
            <>
              <TextInput
                style={ss.textarea}
                placeholder={`Hi, I am interested in joining your trip from ${tripFrom} to ${tripTo} on ${tripDate}...`}
                placeholderTextColor={colors.text.hint}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                maxLength={300}
                textAlignVertical="top"
                editable={!isSendDisabled}
              />
              <Text style={ss.charCount}>{message.length}/300</Text>

              {requestError !== null && (
                <View style={ss.errorBox}>
                  <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
                  <Text style={ss.errorText}>{requestError}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[ss.sendBtn, isSendDisabled && ss.sendBtnDisabled]}
                onPress={sendRequest}
                disabled={isSendDisabled}
                activeOpacity={0.8}
              >
                {requestState === 'loading' ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <>
                    <Ionicons name="paper-plane-outline" size={18} color={colors.primary} />
                    <Text style={ss.sendBtnText}>Send Join Request</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </SectionCard>

        {/* ── 6. Safety Reminder ──────────────────────────────────────────── */}
        <View style={ss.safetyCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.secondary} />
          <Text style={ss.safetyText}>
            Always meet in public places and never share financial information with riders.
          </Text>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const ss = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // ── header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
  },
  // ── scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  // ── card
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardGap: { marginTop: spacing.md },
  // ── rider
  riderRow: { flexDirection: 'row', alignItems: 'center' },
  riderInfo: { flex: 1, marginLeft: spacing.md },
  riderName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  ratingText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center' },
  badgeGap: { marginRight: 6 },
  // ── trip summary
  routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  routeFrom: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
    marginLeft: 6,
  },
  routeArrow: { marginHorizontal: 6 },
  routeTo: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
    marginLeft: 6,
  },
  tripDateText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  tripTitleText: {
    fontSize: fontSize.sm,
    color: colors.text.hint,
    fontStyle: 'italic',
  },
  // ── section label
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text.hint,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  // ── contact card
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  disabledCard: { opacity: 0.5 },
  contactIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: { flex: 1, marginLeft: spacing.sm },
  contactTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  // ── divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    marginHorizontal: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text.hint,
  },
  // ── join request section
  joinHint: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  textarea: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text.primary,
    minHeight: 88,
    marginBottom: 4,
  },
  charCount: {
    fontSize: fontSize.xs,
    color: colors.text.hint,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.danger}12`,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginLeft: 6,
    flex: 1,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    gap: 8,
  },
  sendBtnDisabled: { borderColor: colors.border, opacity: 0.6 },
  sendBtnText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.primary,
  },
  // ── success
  successBox: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  successTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.success,
    marginTop: spacing.sm,
  },
  successSub: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  // ── safety card
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${colors.secondary}10`,
    borderRadius: 10,
    padding: spacing.sm,
    marginTop: spacing.md,
    gap: 8,
  },
  safetyText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.secondary,
    lineHeight: 18,
  },
});
