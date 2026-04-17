// ─── TripResultCard ──────────────────────────────────────────────────────────
// Search-result card used in SearchResultsScreen.
// Fully self-contained — no external state.

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
import type { Trip, VehicleType } from '../types';
import { formatDate } from '../utils/formatDate';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TripResultCardProps {
  trip: Trip;
  onPress: (trip: Trip) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  full_tour: 'Full Tour',
  one_way: 'One-Way',
};

const VEHICLE_ICON: Record<VehicleType, keyof typeof Ionicons.glyphMap> = {
  car: 'car-outline',
  bike: 'bicycle-outline',
  van: 'bus-outline',
  bus: 'bus',
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0][0] ?? '?').toUpperCase();
}

// Approximate duration label between two times (best-effort)
function durationLabel(departure: string): string {
  // We only have departure time — show it plainly; duration needs server data
  return departure;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const TripResultCard = memo(function TripResultCard({
  trip,
  onPress,
}: TripResultCardProps) {
  const seatsLow = trip.seatsLeft <= 2;
  // FIX: optional chaining — vehicle may be undefined in malformed API responses
  const verifiedRC = trip.vehicle?.rcVerified ?? false;
  const verifiedDL = trip.vehicle?.dlVerified ?? false;
  const vehicleIcon = VEHICLE_ICON[trip.vehicle?.type ?? 'car'] ?? 'car-outline';

  // CLICK FIX: memoize handler to avoid new function reference on every render
  const handlePress = useCallback(() => onPress(trip), [onPress, trip]);

  return (
    <TouchableOpacity
      style={cs.card}
      activeOpacity={0.82}
      onPress={handlePress}
    >
      {/* ── Type badge ── */}
      <View style={cs.topRow}>
        <View style={[cs.typeBadge, trip.type === 'full_tour' ? cs.typeFull : cs.typeOneWay]}>
          <Text style={[cs.typeBadgeText, trip.type === 'full_tour' ? cs.typeFullText : cs.typeOneWayText]}>
            {TYPE_LABEL[trip.type] ?? trip.type}
          </Text>
        </View>
        {/* FIX: optional chaining on vehicle.ac — vehicle may be undefined */}
        {trip.vehicle?.ac && (
          <View style={cs.acBadge}>
            <Ionicons name="snow-outline" size={11} color={colors.secondary} />
            <Text style={cs.acText}>AC</Text>
          </View>
        )}
      </View>

      {/* ── Rider row ── */}
      <View style={cs.riderRow}>
        {/* Avatar */}
        <View style={cs.avatar}>
          <Text style={cs.avatarText}>{initialsOf(trip.title)}</Text>
        </View>

        <View style={cs.riderInfo}>
          {/* Placeholder rider name — Trip doesn't carry riderName, use riderId stub */}
          <Text style={cs.riderName} numberOfLines={1}>
            Rider·{trip.riderId.slice(-4)}
          </Text>
          {/* Verification badges */}
          <View style={cs.verBadges}>
            {verifiedRC && (
              <View style={cs.verBadge}>
                <Ionicons name="document-text-outline" size={10} color={colors.success} />
                <Text style={cs.verText}>RC</Text>
              </View>
            )}
            {verifiedDL && (
              <View style={cs.verBadge}>
                <Ionicons name="card-outline" size={10} color={colors.success} />
                <Text style={cs.verText}>DL</Text>
              </View>
            )}
          </View>
        </View>

        {/* Cost — top right */}
        <View style={cs.costWrap}>
          <Text style={cs.cost}>₹{trip.costPerPerson}</Text>
          <Text style={cs.costLabel}>/person</Text>
        </View>
      </View>

      {/* ── Route row ── */}
      <View style={cs.routeRow}>
        <Text style={cs.city} numberOfLines={1}>{trip.from}</Text>
        <View style={cs.routeLine}>
          <View style={cs.line} />
          <Ionicons name={vehicleIcon} size={16} color={colors.secondary} />
          <View style={cs.line} />
        </View>
        <Text style={cs.city} numberOfLines={1}>{trip.to}</Text>
      </View>

      {/* ── Meta row: time · stops · seats ── */}
      <View style={cs.metaRow}>
        {/* Time */}
        <View style={cs.metaChip}>
          <Ionicons name="time-outline" size={12} color={colors.text.hint} />
          <Text style={cs.metaText}>{durationLabel(trip.departureTime)}</Text>
        </View>

        {/* Date */}
        <View style={cs.metaChip}>
          <Ionicons name="calendar-outline" size={12} color={colors.text.hint} />
          <Text style={cs.metaText}>{formatDate(trip.startDate, 'short')}</Text>
        </View>

        {/* Stops */}
        {/* CRASH FIX: stops may be undefined/null from API — optional chaining prevents length crash */}
        {(trip.stops?.length ?? 0) > 0 && (
          <View style={cs.metaChip}>
            <Ionicons name="location-outline" size={12} color={colors.text.hint} />
            <Text style={cs.metaText}>{trip.stops?.length} stop{(trip.stops?.length ?? 0) > 1 ? 's' : ''}</Text>
          </View>
        )}

        {/* Seats */}
        <View style={[cs.metaChip, seatsLow && cs.metaChipWarn]}>
          <Ionicons name="people-outline" size={12} color={seatsLow ? colors.warning : colors.text.hint} />
          <Text style={[cs.metaText, seatsLow && cs.metaTextWarn]}>
            {trip.seatsLeft} left
          </Text>
        </View>
      </View>

      {/* ── View Details button ── */}
      {/* CLICK FIX: was TouchableOpacity nested inside outer TouchableOpacity card — nested
          touchables break on Android (only outer fires). Replace with View since the outer
          card already handles the press. */}
      <View style={cs.viewBtn}>
        <Text style={cs.viewBtnText}>View Details</Text>
        <Ionicons name="arrow-forward" size={14} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );
});

export default TripResultCard;

// ─── Styles ───────────────────────────────────────────────────────────────────

const cs = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },

  // Top badge row
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  typeBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 6 },
  typeFull: { backgroundColor: `${colors.primary}18` },
  typeOneWay: { backgroundColor: `${colors.secondary}18` },
  typeBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold },
  typeFullText: { color: colors.primary },
  typeOneWayText: { color: colors.secondary },
  acBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: `${colors.secondary}12`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  acText: { fontSize: fontSize.xs, color: colors.secondary, fontWeight: fontWeight.medium },

  // Rider row
  riderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: `${colors.primary}1a`,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primary },
  riderInfo: { flex: 1 },
  riderName: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.text.primary },
  verBadges: { flexDirection: 'row', gap: spacing.xs, marginTop: 2 },
  verBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  verText: { fontSize: fontSize.xs, color: colors.success, fontWeight: fontWeight.semiBold },
  costWrap: { alignItems: 'flex-end' },
  cost: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary },
  costLabel: { fontSize: fontSize.xs, color: colors.text.hint },

  // Route row
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  city: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.text.primary, flex: 1, textAlign: 'center' },
  routeLine: { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 2 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },

  // Meta row
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaChipWarn: { borderColor: `${colors.warning}44`, backgroundColor: `${colors.warning}0d` },
  metaText: { fontSize: fontSize.xs, color: colors.text.secondary },
  metaTextWarn: { color: colors.warning, fontWeight: fontWeight.semiBold },

  // View button
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: spacing.xs + 2,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  viewBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.primary },
});
