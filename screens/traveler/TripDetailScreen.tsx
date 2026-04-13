// ─── TripDetailScreen ────────────────────────────────────────────────────────
// Full trip detail for traveler.  Sticky bottom bar with Contact Rider + Save.

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { memo, useMemo } from 'react';
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import type { InfoGridItem } from '../../components/InfoGrid';
import InfoGrid from '../../components/InfoGrid';
import PhotoCarousel, { CAROUSEL_HEIGHT } from '../../components/PhotoCarousel';
import RouteTimeline from '../../components/RouteTimeline';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import { useTripDetail } from '../../hooks/useTripDetail';
import type { TripDetailParams } from '../../navigation/types';
import type { Trip } from '../../types';
import { formatDate } from '../../utils/formatDate';

// ─── Sticky bottom bar height (used to pad ScrollView) ────────────────────────
const BOTTOM_BAR_H = Platform.OS === 'ios' ? 100 : 80;

// ─── Section wrapper ─────────────────────────────────────────────────────────

const Section = memo(function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={ss.section}>
      {title ? <Text style={ss.sectionTitle}>{title}</Text> : null}
      {children}
    </View>
  );
});

// ─── Tag chip ─────────────────────────────────────────────────────────────────

const TagChip = memo(function TagChip({
  label,
  variant = 'blue',
}: {
  label: string;
  variant?: 'blue' | 'orange';
}) {
  return (
    <View style={[ss.chip, variant === 'orange' ? ss.chipOrange : ss.chipBlue]}>
      <Text style={[ss.chipText, variant === 'orange' ? ss.chipTextOrange : ss.chipTextBlue]}>
        {label}
      </Text>
    </View>
  );
});

// ─── Rider card ───────────────────────────────────────────────────────────────

const RiderCard = memo(function RiderCard({
  trip,
  onPress,
}: {
  trip: Trip;
  onPress: () => void;
}) {
  function initials(name: string) {
    const p = name.trim().split(/\s+/);
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : p[0][0].toUpperCase();
  }

  // Stub rider info from trip (no dedicated riderProfile field in Trip type)
  const riderInitial = initials(trip.riderId.slice(-4));

  return (
    <TouchableOpacity style={ss.riderCard} onPress={onPress} activeOpacity={0.85}>
      {/* Avatar */}
      <View style={ss.avatar}>
        <Text style={ss.avatarText}>{riderInitial}</Text>
      </View>

      {/* Info */}
      <View style={ss.riderInfo}>
        <Text style={ss.riderName}>Rider #{trip.riderId.slice(-4)}</Text>
        <View style={ss.verRow}>
          {trip.vehicle.rcVerified && (
            <View style={ss.verBadge}>
              <Ionicons name="document-text-outline" size={11} color={colors.success} />
              <Text style={ss.verText}>RC ✓</Text>
            </View>
          )}
          {trip.vehicle.dlVerified && (
            <View style={ss.verBadge}>
              <Ionicons name="card-outline" size={11} color={colors.success} />
              <Text style={ss.verText}>DL ✓</Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.text.hint} />
    </TouchableOpacity>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TripDetailScreen() {
  const router = useRouter();
  const { tripId = '' } = useLocalSearchParams<TripDetailParams>();
  const { trip, loading, error, retry, isSaved, toggleSave } = useTripDetail(tripId);

  // ── Build InfoGrid items ──────────────────────────────────────────────────
  const infoItems = useMemo(() => {
    if (!trip) return [];
    const items: InfoGridItem[] = [
      {
        label: 'Date',
        value: formatDate(trip.startDate),
        icon: 'calendar-outline' as const,
      },
      {
        label: 'Departure',
        value: trip.departureTime,
        icon: 'time-outline' as const,
      },
    ];
    if (trip.endDate) {
      items.push({ label: 'End Date', value: formatDate(trip.endDate), icon: 'calendar-outline' as const });
    }
    if (trip.type === 'full_tour' && (trip as any).days) {
      items.push({ label: 'Duration', value: `${(trip as any).days}D / ${(trip as any).nights}N`, icon: 'moon-outline' as const });
    }
    items.push(
      {
        label: 'Vehicle',
        value: `${trip.vehicle.type.charAt(0).toUpperCase() + trip.vehicle.type.slice(1)}${trip.vehicle.model ? ' · ' + trip.vehicle.model : ''}`,
        icon: 'car-outline' as const,
      },
      {
        label: 'AC',
        value: trip.vehicle.ac ? 'Yes' : 'No',
        icon: 'snow-outline' as const,
        valueColor: trip.vehicle.ac ? colors.secondary : colors.text.hint,
      },
    );
    if (trip.luggagePolicy) {
      items.push({ label: 'Luggage', value: trip.luggagePolicy, icon: 'briefcase-outline' as const });
    }
    if (trip.ladiesOnly) {
      items.push({ label: 'Ladies Only', value: 'Yes', icon: 'people-circle-outline' as const, valueColor: colors.warning });
    }
    return items;
  }, [trip]);

  // ── Loading / Error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={ss.flex}>
        <View style={[ss.placeholderBox, { height: CAROUSEL_HEIGHT }]} />
        <View style={ss.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  if (error || !trip) {
    return (
      <View style={ss.centered}>
        <Ionicons name="alert-circle-outline" size={52} color={colors.danger} />
        <Text style={ss.errorTitle}>{error ?? 'Trip not found'}</Text>
        <TouchableOpacity style={ss.retryBtn} onPress={retry} activeOpacity={0.85}>
          <Ionicons name="refresh-outline" size={16} color={colors.white} />
          <Text style={ss.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const seatsLeft = trip.seatsLeft;
  const seatsFilled = trip.seats - seatsLeft;
  const fillPct = trip.seats > 0 ? (seatsFilled / trip.seats) * 100 : 0;
  const seatsLow = seatsLeft <= 2;

  // Destinations: for full_tour use stops (intermediate) + to; for one_way just [to]
  const destinations = trip.type === 'full_tour'
    ? [...trip.stops, trip.to].filter(Boolean)
    : [trip.to];

  // Restrictions: split on comma/newline or show as single chip
  const restrictionChips: string[] = trip.restrictions
    ? trip.restrictions.split(/[,\n]+/).map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <View style={ss.flex}>
      {/* ── Scrollable content ── */}
      <ScrollView
        style={ss.scroll}
        contentContainerStyle={{ paddingBottom: BOTTOM_BAR_H + spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Photo carousel */}
        <PhotoCarousel
          photos={trip.photos ?? []}
          vehicleType={trip.vehicle.type}
          title={trip.title}
        />

        <View style={ss.body}>
          {/* 2. Type badge + Title */}
          <View style={ss.titleRow}>
            <View style={[ss.typeBadge, trip.type === 'full_tour' ? ss.typeFull : ss.typeOneWay]}>
              <Text style={[ss.typeBadgeText, trip.type === 'full_tour' ? ss.typeFullText : ss.typeOneWayText]}>
                {trip.type === 'full_tour' ? 'Full Tour' : 'One-Way'}
              </Text>
            </View>
          </View>
          <Text style={ss.title}>{trip.title}</Text>

          {/* 3. Rider card */}
          <Section>
            <RiderCard
              trip={trip}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/home/rider-profile' as any,
                  params: { userId: trip.riderId },
                })
              }
            />
          </Section>

          {/* 4. Route section */}
          <Section title="Route">
            <RouteTimeline
              type={trip.type}
              from={trip.from}
              to={trip.to}
              stops={trip.stops}
              itinerary={trip.itinerary}
            />
          </Section>

          {/* 5. Kahan Jayenge */}
          {destinations.length > 0 && (
            <Section title="Kahan Jayenge">
              <View style={ss.chips}>
                {destinations.map((d, i) => (
                  <TagChip key={i} label={d} variant="blue" />
                ))}
              </View>
            </Section>
          )}

          {/* 6. Kahan NAHI Jayenge */}
          {restrictionChips.length > 0 && (
            <Section title="Kahan NAHI Jayenge">
              <View style={ss.chips}>
                {restrictionChips.map((r, i) => (
                  <TagChip key={i} label={r} variant="orange" />
                ))}
              </View>
            </Section>
          )}

          {/* 7. Trip Info grid */}
          <Section title="Trip Info">
            <InfoGrid items={infoItems} />
          </Section>

          {/* 8. Seats bar */}
          <Section title="Seats">
            <View style={ss.seatsRow}>
              <Text style={[ss.seatsLabel, seatsLow && ss.seatsLow]}>
                {seatsLeft} of {trip.seats} seats remaining
              </Text>
              {seatsLow && (
                <View style={ss.urgencyBadge}>
                  <Text style={ss.urgencyText}>Almost Full!</Text>
                </View>
              )}
            </View>
            <View style={ss.progressTrack}>
              <View style={[ss.progressFill, { width: `${fillPct}%` as any }]} />
            </View>
          </Section>

          {/* 9. Cost */}
          <Section title="Cost">
            <View style={ss.costRow}>
              <Text style={ss.cost}>₹{trip.costPerPerson}</Text>
              <Text style={ss.costPer}>per person</Text>
            </View>
            <Text style={ss.costNote}>Pay directly to the rider. No platform charges.</Text>
          </Section>

          {/* 10. Special Notes */}
          {trip.notes ? (
            <Section title="Special Notes">
              <Text style={ss.notes}>{trip.notes}</Text>
            </Section>
          ) : null}
        </View>
      </ScrollView>

      {/* ── Sticky bottom bar ── */}
      <View style={ss.bottomBar}>
        <View style={ss.bottomSeats}>
          <Ionicons
            name="people-outline"
            size={16}
            color={seatsLow ? colors.warning : colors.text.secondary}
          />
          <Text style={[ss.bottomSeatsText, seatsLow && ss.bottomSeatsWarn]}>
            {seatsLeft} left
          </Text>
        </View>

        <TouchableOpacity
          style={ss.contactBtn}
          onPress={() =>
            router.push({
              pathname: '/(tabs)/home/contact-rider' as any,
              params: {
                tripId: trip.id,
                riderId: trip.riderId,
                riderName: `Rider #${trip.riderId.slice(-4)}`,
              },
            })
          }
          activeOpacity={0.85}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.white} />
          <Text style={ss.contactBtnText}>Contact Rider</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={ss.saveBtn}
          onPress={toggleSave}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={isSaved ? colors.primary : colors.text.secondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const ss = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  placeholderBox: { backgroundColor: colors.border },

  body: { padding: spacing.md },

  // Title area
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  typeBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: 6 },
  typeFull: { backgroundColor: `${colors.primary}18` },
  typeOneWay: { backgroundColor: `${colors.secondary}18` },
  typeBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold },
  typeFullText: { color: colors.primary },
  typeOneWayText: { color: colors.secondary },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    lineHeight: 30,
  },

  // Section
  section: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Rider card
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}1a`,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary },
  riderInfo: { flex: 1, gap: 4 },
  riderName: { fontSize: fontSize.md, fontWeight: fontWeight.semiBold, color: colors.text.primary },
  verRow: { flexDirection: 'row', gap: spacing.xs },
  verBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  verText: { fontSize: fontSize.xs, color: colors.success, fontWeight: fontWeight.semiBold },

  // Tag chips
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 16, borderWidth: 1 },
  chipBlue: { backgroundColor: `${colors.primary}0d`, borderColor: `${colors.primary}44` },
  chipOrange: { backgroundColor: `${colors.warning}0d`, borderColor: `${colors.warning}44` },
  chipText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  chipTextBlue: { color: colors.primary },
  chipTextOrange: { color: colors.warning },

  // Seats
  seatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  seatsLabel: { fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: fontWeight.medium },
  seatsLow: { color: colors.warning },
  urgencyBadge: { backgroundColor: `${colors.warning}20`, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  urgencyText: { fontSize: fontSize.xs, color: colors.warning, fontWeight: fontWeight.semiBold },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: colors.primary },

  // Cost
  costRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  cost: { fontSize: fontSize.xxxl, fontWeight: fontWeight.bold, color: colors.primary },
  costPer: { fontSize: fontSize.sm, color: colors.text.secondary },
  costNote: { fontSize: fontSize.xs, color: colors.text.hint, marginTop: spacing.xs, lineHeight: 16 },

  // Notes
  notes: { fontSize: fontSize.sm, color: colors.text.secondary, lineHeight: 20 },

  // Error
  errorTitle: { fontSize: fontSize.md, color: colors.danger, textAlign: 'center', paddingHorizontal: spacing.xl },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 22,
    marginTop: spacing.sm,
  },
  retryText: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.white },

  // ── Sticky bottom bar ──────────────────────────────────────────────────────
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bottomSeats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 52,
  },
  bottomSeatsText: { fontSize: fontSize.xs, color: colors.text.secondary, fontWeight: fontWeight.medium },
  bottomSeatsWarn: { color: colors.warning },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    borderRadius: 12,
  },
  contactBtnText: { fontSize: fontSize.md, fontWeight: fontWeight.semiBold, color: colors.white },
  saveBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
