// ─── TripDetailScreen — 2025 redesign ────────────────────────────────────────

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AppButton from '../../components/AppButton';
import type { InfoGridItem } from '../../components/InfoGrid';
import TripTypeChip from '../../components/TripTypeChip';
import UserAvatar from '../../components/UserAvatar';
import VerifiedBadge from '../../components/VerifiedBadge';
import { COLORS } from '../../constants/colors';
import { SHADOWS } from '../../constants/shadows';
import { RADIUS } from '../../constants/spacing';
import { FONTS } from '../../constants/typography';
import { useTripDetail } from '../../hooks/useTripDetail';
import type { TripDetailParams } from '../../navigation/types';
import type { Trip, TripItineraryDay } from '../../types';
import { formatDate } from '../../utils/formatDate';

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SCREEN_W } = Dimensions.get('window');
const PHOTO_H = 240;
const BOTTOM_INSET = Platform.OS === 'ios' ? 34 : 16;
const BOTTOM_BAR_H = 72 + BOTTOM_INSET;

const VEHICLE_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  car:  'car',
  bike: 'bicycle',
  van:  'bus-outline',
  bus:  'bus',
};

// ─── PhotoArea ────────────────────────────────────────────────────────────────

const PhotoArea = memo(function PhotoArea({
  photos,
  vehicleType,
}: {
  photos: string[];
  vehicleType: string;
}) {
  const [active, setActive] = useState(0);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      setActive(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W));
    },
    []
  );

  if (photos.length === 0) {
    return (
      <View style={s.photoPlaceholder}>
        <Ionicons
          name={VEHICLE_ICONS[vehicleType] ?? 'car'}
          size={64}
          color={COLORS.primaryBorder}
        />
      </View>
    );
  }

  return (
    <View style={s.photoWrap}>
      <FlatList
        data={photos}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          // eslint-disable-next-line react-native/no-inline-styles
          <View style={{ width: SCREEN_W, height: PHOTO_H, backgroundColor: COLORS.slate100 }}>
            {/* Image would go here — using Ionicons as placeholder since no Image */}
            <View style={s.photoImageFallback}>
              <Ionicons name={VEHICLE_ICONS[vehicleType] ?? 'car'} size={48} color={COLORS.slate300} />
            </View>
          </View>
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      {photos.length > 1 && (
        <View style={s.dotRow}>
          {photos.map((_, i) => (
            <View key={i} style={[s.dot, i === active && s.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
});

// ─── RiderRow ─────────────────────────────────────────────────────────────────

const RiderRow = memo(function RiderRow({
  riderId,
  rcVerified,
  dlVerified,
  onPress,
}: {
  riderId: string;
  rcVerified: boolean;
  dlVerified: boolean;
  onPress: () => void;
}) {
  const displayName = `Rider #${riderId.slice(-4)}`;
  return (
    <TouchableOpacity style={s.riderRow} onPress={onPress} activeOpacity={0.8}>
      <UserAvatar name={displayName} size="md" />
      <View style={s.riderMeta}>
        <Text style={s.riderName}>{displayName}</Text>
        <Text style={s.riderSub}>4.8 ★  ·  24 trips</Text>
      </View>
      <View style={s.riderRight}>
        <View style={s.verBadges}>
          {rcVerified && <VerifiedBadge type="rc" />}
          {dlVerified && <VerifiedBadge type="dl" />}
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.slate300} />
      </View>
    </TouchableOpacity>
  );
});

// ─── FullTourTimeline ──────────────────────────────────────────────────────────

const FullTourTimeline = memo(function FullTourTimeline({
  from,
  to,
  itinerary = [],
}: {
  from: string;
  to: string;
  itinerary: TripItineraryDay[];
}) {
  const rows: Array<{ day: string; city: string; isLast?: boolean }> = [
    { day: 'Start', city: from },
    ...itinerary.map(d => ({ day: `Day ${d.day}`, city: d.description })),
    { day: 'End', city: to, isLast: true },
  ];

  return (
    <View style={s.timelineWrap}>
      {rows.map((row, i) => (
        <View key={i} style={s.timelineRow}>
          {/* Left: connector + dot */}
          <View style={s.timelineLeft}>
            <View style={[s.tlDot, row.isLast && s.tlDotFlag]}>
              {row.isLast ? (
                <Ionicons name="flag" size={10} color={COLORS.primary} />
              ) : null}
            </View>
            {i < rows.length - 1 && <View style={s.tlLine} />}
          </View>
          {/* Right: label + city */}
          <View style={s.timelineContent}>
            <Text style={s.tlDayLabel}>{row.day.toUpperCase()}</Text>
            <Text style={s.tlCity}>{row.city}</Text>
          </View>
        </View>
      ))}
    </View>
  );
});

// ─── OneWayRoute ──────────────────────────────────────────────────────────────

const OneWayRoute = memo(function OneWayRoute({
  from,
  to,
  stops = [],
}: {
  from: string;
  to: string;
  stops: string[];
}) {
  return (
    <View style={s.owWrap}>
      {/* Main from→to row */}
      <View style={s.owMainRow}>
        <View style={s.owFromChip}>
          <Text style={s.owFromText} numberOfLines={1}>{from}</Text>
        </View>
        <View style={s.owDashLine} />
        <View style={s.owToChip}>
          <Text style={s.owToText} numberOfLines={1}>{to}</Text>
        </View>
      </View>
      {/* Intermediate stops */}
      {stops.length > 0 && (
        <View style={s.owStops}>
          {stops.map((stop, i) => (
            <View key={i} style={s.owStopRow}>
              <View style={s.owStopDot} />
              <Text style={s.owStopText}>{stop}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

// ─── InfoTile ─────────────────────────────────────────────────────────────────

const InfoTile = memo(function InfoTile({ item }: { item: InfoGridItem }) {
  return (
    <View style={s.infoTile}>
      {item.icon && (
        <Ionicons name={item.icon} size={18} color={COLORS.primary} />
      )}
      <Text style={s.infoTileLabel}>{item.label.toUpperCase()}</Text>
      <Text
        style={[s.infoTileValue, item.valueColor ? { color: item.valueColor } : null]}
        numberOfLines={2}
      >
        {item.value}
      </Text>
    </View>
  );
});

// ─── SeatsBar ─────────────────────────────────────────────────────────────────

const SeatsBar = memo(function SeatsBar({
  seatsLeft,
  total,
}: {
  seatsLeft: number;
  total: number;
}) {
  const fillPct = total > 0 ? ((total - seatsLeft) / total) * 100 : 0;
  const low = seatsLeft <= 2;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!low) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.35, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [low, pulseAnim]);

  return (
    <View>
      <View style={s.seatsHeaderRow}>
        <Text style={s.seatsLabel}>Seats Left</Text>
        <Text style={s.seatsValue}>{seatsLeft} of {total}</Text>
      </View>
      <View style={s.progressTrack}>
        <Animated.View
          style={[
            s.progressFill,
            { width: `${fillPct}%` as `${number}%` },
            low && s.progressFillLow,
            low && { opacity: pulseAnim },
          ]}
        />
      </View>
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TripDetailScreen() {
  const router = useRouter();
  const { tripId = '' } = useLocalSearchParams<TripDetailParams>();
  const { trip, loading, error, retry, isSaved, toggleSave } = useTripDetail(tripId);

  const infoItems = useMemo<InfoGridItem[]>(() => {
    if (!trip) return [];
    const items: InfoGridItem[] = [
      { label: 'Date',      value: formatDate(trip.startDate),    icon: 'calendar-outline' },
      { label: 'Time',      value: trip.departureTime,            icon: 'time-outline' },
    ];
    if (trip.endDate) {
      items.push({ label: 'End Date', value: formatDate(trip.endDate), icon: 'calendar-outline' });
    }
    if (trip.type === 'full_tour') {
      const days = trip.itinerary?.length ?? 0;
      if (days > 0) items.push({ label: 'Duration', value: `${days} days`, icon: 'moon-outline' });
    }
    items.push({
      label: 'Vehicle',
      value: `${trip.vehicle.type.charAt(0).toUpperCase() + trip.vehicle.type.slice(1)}${trip.vehicle.model ? ' · ' + trip.vehicle.model : ''}`,
      icon: 'car-outline',
    });
    items.push({
      label: 'AC',
      value: trip.vehicle.ac ? 'Yes' : 'No',
      icon: 'snow-outline',
      valueColor: trip.vehicle.ac ? COLORS.primary : COLORS.slate400,
    });
    if (trip.luggagePolicy) {
      items.push({ label: 'Luggage', value: trip.luggagePolicy, icon: 'briefcase-outline' });
    }
    return items;
  }, [trip]);

  const handleContactRider = useCallback(() => {
    if (!trip) return;
    router.push({
      pathname: '/(tabs)/home/contact-rider' as const,
      params: {
        tripId: trip.id,
        riderId: trip.riderId,
        riderName: `Rider #${trip.riderId.slice(-4)}`,
      },
    });
  }, [trip, router]);

  const handleRiderProfile = useCallback(() => {
    if (!trip) return;
    router.push({
      pathname: '/(tabs)/home/rider-profile' as const,
      params: { userId: trip.riderId },
    });
  }, [trip, router]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !trip) {
    return (
      <View style={s.centered}>
        <Ionicons name="alert-circle-outline" size={52} color={COLORS.danger} />
        <Text style={s.errorTitle}>{error ?? 'Trip not found'}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={retry} activeOpacity={0.85}>
          <Ionicons name="refresh-outline" size={16} color={COLORS.white} />
          <Text style={s.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Data prep ─────────────────────────────────────────────────────────────
  const destinations = trip.type === 'full_tour'
    ? [...trip.stops, trip.to].filter(Boolean)
    : [trip.to];

  const restrictionChips = trip.restrictions
    ? trip.restrictions.split(/[,\n]+/).map(s => s.trim()).filter(Boolean)
    : [];

  const seatsLeft = trip.seatsLeft;
  const isFull = seatsLeft === 0;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      {/* ═══ SCROLLABLE BODY ════════════════════════════════════════════════ */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: BOTTOM_BAR_H + 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Photo area ────────────────────────────────────────────────── */}
        <PhotoArea photos={trip.photos ?? []} vehicleType={trip.vehicle.type} />

        {/* ── Floating content card ─────────────────────────────────────── */}
        <View style={s.floatingCard}>

          {/* Trip type + title */}
          <TripTypeChip type={trip.type} />
          <Text style={s.tripTitle}>{trip.title}</Text>

          {/* Rider row */}
          <RiderRow
            riderId={trip.riderId}
            rcVerified={trip.vehicle.rcVerified}
            dlVerified={trip.vehicle.dlVerified}
            onPress={handleRiderProfile}
          />

          <View style={s.divider} />

          {/* ── Route ─────────────────────────────────────────────────── */}
          <Text style={s.overline}>ROUTE</Text>
          {trip.type === 'full_tour' ? (
            <FullTourTimeline
              from={trip.from}
              to={trip.to}
              itinerary={trip.itinerary ?? []}
            />
          ) : (
            <OneWayRoute from={trip.from} to={trip.to} stops={trip.stops ?? []} />
          )}

          <View style={s.divider} />

          {/* ── Destinations ──────────────────────────────────────────── */}
          {destinations.length > 0 && (
            <>
              <Text style={s.overline}>DESTINATIONS</Text>
              <View style={s.chipWrap}>
                {destinations.map((d, i) => (
                  <View key={i} style={s.destChip}>
                    <Text style={s.destChipText}>{d}</Text>
                  </View>
                ))}
              </View>
              <View style={s.divider} />
            </>
          )}

          {/* ── Restrictions ──────────────────────────────────────────── */}
          {restrictionChips.length > 0 && (
            <>
              <View style={s.restrictionHeader}>
                <Ionicons name="warning-outline" size={14} color={COLORS.warning} />
                <Text style={[s.overline, s.overlineWarn]}>RESTRICTIONS</Text>
              </View>
              <View style={s.chipWrap}>
                {restrictionChips.map((r, i) => (
                  <View key={i} style={s.warnChip}>
                    <Text style={s.warnChipText}>{r}</Text>
                  </View>
                ))}
              </View>
              <View style={s.divider} />
            </>
          )}

          {/* ── Info grid ─────────────────────────────────────────────── */}
          <Text style={s.overline}>TRIP INFO</Text>
          <View style={s.infoGrid}>
            {infoItems.map((item, i) => (
              <InfoTile key={i} item={item} />
            ))}
          </View>

          <View style={s.divider} />

          {/* ── Seats bar ─────────────────────────────────────────────── */}
          <SeatsBar seatsLeft={trip.seatsLeft} total={trip.seats} />

          <View style={s.divider} />

          {/* ── Cost ──────────────────────────────────────────────────── */}
          <View style={s.costCard}>
            <View style={s.costPriceRow}>
              <Text style={s.costAmount}>
                ₹{trip.costPerPerson.toLocaleString('en-IN')}
              </Text>
              <Text style={s.costPer}>/person</Text>
            </View>
            <Text style={s.costNote}>
              💬 Payment directly with rider — not through app
            </Text>
          </View>

          {/* ── Notes ─────────────────────────────────────────────────── */}
          {trip.notes ? (
            <>
              <View style={s.divider} />
              <View style={s.notesBox}>
                <Ionicons
                  name="chatbox-ellipses-outline"
                  size={18}
                  color={COLORS.slate300}
                  style={s.notesIcon}
                />
                <Text style={s.notesText}>{trip.notes}</Text>
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>

      {/* ═══ HEADER OVERLAY BUTTONS ══════════════════════════════════════════ */}
      <View style={s.headerOverlay} pointerEvents="box-none">
        <TouchableOpacity style={s.headerCircleBtn} onPress={router.back} activeOpacity={0.85}>
          <Ionicons name="chevron-back" size={22} color={COLORS.slate800} />
        </TouchableOpacity>
        <TouchableOpacity style={s.headerCircleBtn} onPress={toggleSave} activeOpacity={0.85}>
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? COLORS.primary : COLORS.slate800}
          />
        </TouchableOpacity>
      </View>

      {/* ═══ STICKY BOTTOM BAR ═══════════════════════════════════════════════ */}
      <View style={s.bottomBar}>
        {/* Seats badge */}
        <View style={[s.seatsBadge, isFull && s.seatsBadgeFull]}>
          <Ionicons
            name="people-outline"
            size={14}
            color={isFull ? COLORS.dangerDark : seatsLeft <= 2 ? '#92400E' : COLORS.slate500}
          />
          <Text style={[s.seatsBadgeText, isFull && s.seatsBadgeTextFull, seatsLeft <= 2 && !isFull && s.seatsBadgeTextLow]}>
            {isFull ? 'Full' : `${seatsLeft} left`}
          </Text>
        </View>

        {/* Contact Rider button */}
        <View style={s.contactBtnWrap}>
          <AppButton
            label="Contact Rider"
            variant="primary"
            size="md"
            onPress={handleContactRider}
            disabled={isFull}
          />
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.background,
  },

  // ── Photo area ─────────────────────────────────────────────────────────────
  photoPlaceholder: {
    height: PHOTO_H,
    backgroundColor: COLORS.primaryBg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoWrap: {
    height: PHOTO_H,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  photoImageFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBg,
  },
  dotRow: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    width: 18,
    backgroundColor: COLORS.white,
  },

  // ── Header overlay ─────────────────────────────────────────────────────────
  headerOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 28,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    pointerEvents: 'box-none',
  },
  headerCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },

  // ── Floating content card ──────────────────────────────────────────────────
  floatingCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    ...SHADOWS.md,
  },
  tripTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.slate900,
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 28,
  },

  // ── Rider row ──────────────────────────────────────────────────────────────
  riderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  riderMeta: {
    flex: 1,
    gap: 3,
  },
  riderName: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.bold,
    color: COLORS.slate800,
  },
  riderSub: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.slate500,
  },
  riderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verBadges: {
    flexDirection: 'row',
    gap: 4,
  },

  // ── Shared divider ─────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: COLORS.slate100,
    marginVertical: 16,
  },

  // ── Overline label ─────────────────────────────────────────────────────────
  overline: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.slate400,
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  overlineWarn: {
    color: COLORS.warning,
  },
  restrictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
  },

  // ── Full-tour timeline ─────────────────────────────────────────────────────
  timelineWrap: {
    paddingLeft: 8,
    marginBottom: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 14,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
  },
  tlDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primaryBg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tlDotFlag: {
    backgroundColor: COLORS.primaryBg,
  },
  tlLine: {
    flex: 1,
    width: 2,
    borderStyle: 'dashed',
    borderLeftWidth: 2,
    borderLeftColor: COLORS.slate200,
    marginVertical: 2,
    minHeight: 24,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
    paddingTop: 2,
  },
  tlDayLabel: {
    fontSize: 9,
    fontWeight: FONTS.weights.bold,
    color: COLORS.slate400,
    letterSpacing: 1,
    marginBottom: 2,
  },
  tlCity: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.slate900,
  },

  // ── One-way route ──────────────────────────────────────────────────────────
  owWrap: {
    marginBottom: 4,
  },
  owMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  owFromChip: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: '35%',
  },
  owFromText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.primary,
  },
  owDashLine: {
    flex: 1,
    height: 1.5,
    borderStyle: 'dashed',
    borderTopWidth: 1.5,
    borderTopColor: COLORS.slate300,
  },
  owToChip: {
    backgroundColor: COLORS.accentLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: '35%',
  },
  owToText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.accentDark,
  },
  owStops: {
    paddingLeft: 16,
    gap: 6,
  },
  owStopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  owStopDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.slate300,
  },
  owStopText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.slate500,
  },

  // ── Chip rows ──────────────────────────────────────────────────────────────
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  destChip: {
    backgroundColor: COLORS.purpleLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  destChipText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    color: '#5B21B6',
  },
  warnChip: {
    backgroundColor: COLORS.warningLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  warnChipText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.warning,
  },

  // ── Info grid ──────────────────────────────────────────────────────────────
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },
  infoTile: {
    width: '47%',
    backgroundColor: COLORS.slate50,
    borderRadius: RADIUS.md,
    padding: 12,
    alignItems: 'center',
    gap: 5,
  },
  infoTileLabel: {
    fontSize: 9,
    fontWeight: FONTS.weights.bold,
    color: COLORS.slate400,
    letterSpacing: 1,
  },
  infoTileValue: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.slate900,
    textAlign: 'center',
  },

  // ── Seats bar ──────────────────────────────────────────────────────────────
  seatsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seatsLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.slate700,
  },
  seatsValue: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.slate900,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.slate100,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  progressFillLow: {
    backgroundColor: COLORS.danger,
  },

  // ── Cost card ──────────────────────────────────────────────────────────────
  costCard: {
    backgroundColor: COLORS.slate50,
    borderRadius: RADIUS.md,
    padding: 16,
  },
  costPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 8,
  },
  costAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  costPer: {
    fontSize: FONTS.sizes.md,
    color: COLORS.slate400,
  },
  costNote: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.slate400,
    fontStyle: 'italic',
    lineHeight: 17,
  },

  // ── Notes ──────────────────────────────────────────────────────────────────
  notesBox: {
    backgroundColor: COLORS.slate50,
    borderRadius: RADIUS.md,
    padding: 14,
    position: 'relative',
  },
  notesIcon: {
    marginBottom: 6,
  },
  notesText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.slate600,
    fontStyle: 'italic',
    lineHeight: 20,
  },

  // ── Error ──────────────────────────────────────────────────────────────────
  errorTitle: {
    fontSize: FONTS.sizes.base,
    color: COLORS.dangerDark,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    marginTop: 8,
  },
  retryText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.white,
  },

  // ── Sticky bottom bar ──────────────────────────────────────────────────────
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: BOTTOM_INSET,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
    ...SHADOWS.lg,
    // Shadow goes upward
    shadowOffset: { width: 0, height: -4 },
  },
  seatsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.slate100,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  seatsBadgeFull: {
    backgroundColor: COLORS.dangerLight,
  },
  seatsBadgeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.slate500,
  },
  seatsBadgeTextFull: {
    color: COLORS.dangerDark,
  },
  seatsBadgeTextLow: {
    color: '#92400E',
  },
  contactBtnWrap: {
    flex: 1,
    marginLeft: 12,
  },
});
