// ─── MyTripCard ───────────────────────────────────────────────────────────────
// Compact trip card used in the Rider Dashboard active-trips list.
// Shows route pill, date, seats fill-bar, status badge, and action buttons.

import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import colors from '../constants/colors';
import spacing from '../constants/spacing';
import { fontSize, fontWeight } from '../constants/typography';
import type { Trip, TripStatus } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MyTripCardProps {
  trip: Trip;
  onPress: (trip: Trip) => void;
  onViewRequests: (trip: Trip) => void;
}

// ─── Status badge config ──────────────────────────────────────────────────────

const STATUS_CFG: Record<TripStatus, { label: string; bg: string; text: string }> = {
  active:    { label: 'Active',    bg: colors.statusAccepted,  text: colors.statusAcceptedText },
  full:      { label: 'Full',      bg: '#D1ECF1',              text: '#0C5460' },
  completed: { label: 'Completed', bg: '#E2E3E5',              text: '#383D41' },
  cancelled: { label: 'Cancelled', bg: colors.statusDeclined,  text: colors.statusDeclinedText },
};

// ─── Component ────────────────────────────────────────────────────────────────

const MyTripCard = memo<MyTripCardProps>(function MyTripCard({
  trip,
  onPress,
  onViewRequests,
}) {
  const handlePress = useCallback(() => onPress(trip), [onPress, trip]);
  const handleViewRequests = useCallback(
    () => onViewRequests(trip),
    [onViewRequests, trip],
  );

  const statusCfg = STATUS_CFG[trip.status] ?? STATUS_CFG.active;

  // seats fill bar
  const filled = trip.seats - trip.seatsLeft;
  const fillPct = trip.seats > 0 ? (filled / trip.seats) * 100 : 0;
  const seatsBarColor =
    trip.seatsLeft === 0
      ? colors.danger
      : trip.seatsLeft <= 2
      ? colors.warning
      : colors.success;

  // date formatting
  const dateLabel = new Date(trip.startDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    // CLICK FIX: outer TouchableOpacity wrapping inner TouchableOpacity buttons is a nested
    // touchable — on Android only the outer fires, making inner buttons unreachable.
    // Replaced outer touchable with View; the "View" inner button handles card navigation.
    <View
      style={styles.card}
    >
      {/* ── Top row: route + status badge ── */}
      <View style={styles.topRow}>
        <View style={styles.routePill}>
          <Ionicons name="arrow-forward" size={12} color={colors.primary} />
          <Text style={styles.routeText} numberOfLines={1}>
            {trip.from}
          </Text>
          <Ionicons name="arrow-forward" size={11} color={colors.text.hint} />
          <Text style={styles.routeText} numberOfLines={1}>
            {trip.to}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          <Text style={[styles.statusText, { color: statusCfg.text }]}>
            {statusCfg.label}
          </Text>
        </View>
      </View>

      {/* ── Meta row: date + trip type ── */}
      <View style={styles.metaRow}>
        <Ionicons name="calendar-outline" size={13} color={colors.text.hint} />
        <Text style={styles.metaText}>{dateLabel}</Text>
        <View style={styles.dot} />
        <Text style={styles.metaText}>
          {trip.type === 'full_tour' ? 'Full Tour' : 'One-Way'}
        </Text>
      </View>

      {/* ── Seats fill bar ── */}
      <View style={styles.seatsRow}>
        <Text style={styles.seatsLabel}>
          {filled}/{trip.seats} seats
        </Text>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${fillPct}%` as `${number}%`, backgroundColor: seatsBarColor },
            ]}
          />
        </View>
        <Text style={[styles.seatsLeft, { color: seatsBarColor }]}>
          {trip.seatsLeft} left
        </Text>
      </View>

      {/* ── Action buttons ── */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={handlePress}
          activeOpacity={0.75}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="eye-outline" size={14} color={colors.primary} />
          <Text style={styles.viewBtnText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.requestsBtn}
          onPress={handleViewRequests}
          activeOpacity={0.75}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="people-outline" size={14} color={colors.white} />
          <Text style={styles.requestsBtnText}>Requests</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default MyTripCard;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },

  // Top row
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  routePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    paddingRight: spacing.sm,
  },
  routeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
    flexShrink: 1,
  },
  statusBadge: {
    borderRadius: 99,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
  },

  // Meta
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.text.hint,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.text.hint,
  },

  // Seats bar
  seatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  seatsLabel: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    width: 60,
  },
  barTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: `${colors.primary}1A`,
  },
  barFill: {
    height: 5,
    borderRadius: 3,
  },
  seatsLeft: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    width: 42,
    textAlign: 'right',
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  viewBtnText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.primary,
  },
  requestsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  requestsBtnText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.white,
  },
});
