import React, { memo, useCallback, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Trip } from '@/types';
import { COLORS } from '../constants/colors';
import { RADIUS } from '../constants/spacing';
import { FONTS } from '../constants/typography';
import { SHADOWS } from '../constants/shadows';
import UserAvatar from './UserAvatar';
import VerifiedBadge from './VerifiedBadge';
import TripTypeChip from './TripTypeChip';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TripCardProps {
  trip: Trip;
  onPress: (trip: Trip) => void;
  /** Optional rider info — shown in rider row if provided */
  riderName?: string;
  riderRating?: number;
  riderRCVerified?: boolean;
  riderDLVerified?: boolean;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const VEHICLE_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  car:  'car-outline',
  bike: 'bicycle-outline',
  van:  'bus-outline',
  bus:  'bus-outline',
};

// ─── Component ────────────────────────────────────────────────────────────────

const TripCard = memo(function TripCard({
  trip,
  onPress,
  riderName,
  riderRating,
  riderRCVerified,
  riderDLVerified,
}: TripCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.985,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => onPress(trip), [onPress, trip]);

  const formattedDate = new Date(trip.startDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });

  const seatsLow = trip.seatsLeft <= 2;

  const showRcDl = riderRCVerified || riderDLVerified;

  return (
    <TouchableWithoutFeedback
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessible
      accessibilityRole="button"
    >
      <Animated.View
        style={[styles.card, { transform: [{ scale: scaleAnim }] }]}
      >
        {/* ── ROW 1: Type + Cost ─────────────────────────────────────────── */}
        <View style={styles.row1}>
          <TripTypeChip type={trip.type} />
          <View style={styles.costGroup}>
            <Text style={styles.costMain}>
              ₹{trip.costPerPerson.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.costSub}>/person</Text>
          </View>
        </View>

        {/* ── ROW 2: Rider ───────────────────────────────────────────────── */}
        <View style={styles.row2}>
          <View style={styles.riderLeft}>
            <UserAvatar
              name={riderName ?? '?'}
              size="sm"
            />
            <View style={styles.riderNameGroup}>
              <Text style={styles.riderName} numberOfLines={1}>
                {riderName ?? 'Rider'}
              </Text>
              {riderRating != null && (
                <Text style={styles.riderRating}>
                  {riderRating.toFixed(1)}★
                </Text>
              )}
            </View>
          </View>

          {showRcDl && (
            <View style={styles.badgesRow}>
              {riderRCVerified && <VerifiedBadge type="rc" />}
              {riderDLVerified && <VerifiedBadge type="dl" />}
            </View>
          )}
        </View>

        {/* ── ROW 3: Route ───────────────────────────────────────────────── */}
        <View style={styles.row3}>
          {/* Route line */}
          <View style={styles.routeVisual}>
            <View style={styles.routeDotBlue} />
            <View style={styles.routeDash} />
            <View style={styles.routeDotGrey} />
          </View>
          <View style={styles.routeCities}>
            <Text style={styles.routeFrom} numberOfLines={1}>{trip.from}</Text>
            <Text style={styles.routeTo} numberOfLines={1}>{trip.to}</Text>
          </View>

          {/* Vehicle + time group */}
          <View style={styles.routeMeta}>
            <View style={styles.vehicleChip}>
              <Ionicons
                name={VEHICLE_ICONS[trip.vehicle.type] ?? 'car-outline'}
                size={12}
                color={COLORS.slate600}
              />
              <Text style={styles.vehicleText}>
                {trip.vehicle.type.charAt(0).toUpperCase() + trip.vehicle.type.slice(1)}
              </Text>
              {trip.vehicle.ac && <Text style={styles.acTag}>AC</Text>}
            </View>
            <Text style={styles.departureTime}>{trip.departureTime}</Text>
          </View>
        </View>

        {/* ── ROW 4: Date + Seats ────────────────────────────────────────── */}
        <View style={styles.divider} />
        <View style={styles.row4}>
          <View style={styles.dateGroup}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.slate400} />
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>

          <View style={[styles.seatsBadge, seatsLow ? styles.seatsBadgeLow : styles.seatsBadgeNormal]}>
            <Text style={[styles.seatsText, seatsLow ? styles.seatsTextLow : styles.seatsTextNormal]}>
              {seatsLow
                ? `${trip.seatsLeft} left ⚡`
                : `${trip.seatsLeft} seats`}
            </Text>
          </View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
});

export default TripCard;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.slate100,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    ...SHADOWS.sm,
  },

  // Row 1
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  costGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  costMain: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.slate900,
  },
  costSub: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.slate400,
  },

  // Row 2
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  riderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  riderNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  riderName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.slate800,
    flex: 1,
  },
  riderRating: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.accent,
    fontWeight: FONTS.weights.semibold,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 4,
  },

  // Row 3
  row3: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  routeVisual: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
  },
  routeDotBlue: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  routeDash: {
    width: 1.5,
    height: 18,
    borderStyle: 'dashed',
    borderLeftWidth: 1.5,
    borderLeftColor: COLORS.slate300,
  },
  routeDotGrey: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.slate400,
  },
  routeCities: {
    flex: 1,
    gap: 6,
  },
  routeFrom: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.slate900,
  },
  routeTo: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.slate500,
  },
  routeMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  vehicleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.slate100,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  vehicleText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.slate600,
    fontWeight: FONTS.weights.medium,
  },
  acTag: {
    fontSize: 9,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    backgroundColor: COLORS.primaryBg,
    borderRadius: 3,
    paddingHorizontal: 3,
  },
  departureTime: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.slate500,
  },

  // Row 4
  divider: {
    height: 1,
    backgroundColor: COLORS.slate100,
    marginBottom: 10,
  },
  row4: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.slate500,
  },
  seatsBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  seatsBadgeLow: {
    backgroundColor: COLORS.accentLight,
  },
  seatsBadgeNormal: {
    backgroundColor: COLORS.slate100,
  },
  seatsText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
  },
  seatsTextLow: {
    color: '#92400E',
  },
  seatsTextNormal: {
    color: COLORS.slate500,
  },
});
