import colors from '@/constants/colors';
import spacing from '@/constants/spacing';
import { fontSize, fontWeight } from '@/constants/typography';
import type { Trip } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface TripCardProps {
  trip: Trip;
  onPress: (trip: Trip) => void;
}

const VEHICLE_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  car:  'car-outline',
  bike: 'bicycle-outline',
  van:  'bus-outline',
  bus:  'bus-outline',
};

const TYPE_LABELS: Record<string, string> = {
  one_way:   'One-Way',
  full_tour: 'Full Tour',
};

const TripCard = memo(function TripCard({ trip, onPress }: TripCardProps) {
  const seatsColor = trip.seatsLeft <= 2 ? colors.danger : colors.success;

  const formattedDate = new Date(trip.startDate).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(trip)} activeOpacity={0.85}>
      {/* Top row: type badge + seats */}
      <View style={styles.topRow}>
        <View style={[styles.typeBadge, trip.type === 'full_tour' && styles.typeBadgeTour]}>
          <Text style={styles.typeBadgeText}>{TYPE_LABELS[trip.type]}</Text>
        </View>
        <View style={[styles.seatsBadge, { backgroundColor: `${seatsColor}1A` }]}>
          <Ionicons name="people-outline" size={12} color={seatsColor} />
          <Text style={[styles.seatsText, { color: seatsColor }]}>
            {trip.seatsLeft} {trip.seatsLeft === 1 ? 'seat' : 'seats'} left
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={1}>{trip.title}</Text>

      {/* Route */}
      <View style={styles.routeRow}>
        <Text style={styles.city}>{trip.from}</Text>
        <View style={styles.routeLine}>
          <View style={styles.dot} />
          <View style={styles.line} />
          <Ionicons name="arrow-forward" size={12} color={colors.text.hint} />
        </View>
        <Text style={styles.city}>{trip.to}</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom row: date | vehicle | cost */}
      <View style={styles.bottomRow}>
        <View style={styles.metaChip}>
          <Ionicons name="calendar-outline" size={13} color={colors.text.hint} />
          <Text style={styles.metaText}>{formattedDate}</Text>
        </View>
        <View style={styles.metaChip}>
          <Ionicons name={VEHICLE_ICONS[trip.vehicle.type] ?? 'car-outline'} size={13} color={colors.text.hint} />
          <Text style={styles.metaText}>{trip.vehicle.type.toUpperCase()}</Text>
          {trip.vehicle.ac && <Text style={styles.acTag}>AC</Text>}
        </View>
        <Text style={styles.cost}>₹{trip.costPerPerson.toLocaleString('en-IN')}</Text>
      </View>
    </TouchableOpacity>
  );
});

export default TripCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios:     { shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  topRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  typeBadge:       { borderRadius: 6, paddingHorizontal: spacing.sm, paddingVertical: 3, backgroundColor: `${colors.primary}18` },
  typeBadgeTour:   { backgroundColor: `${colors.secondary}18` },
  typeBadgeText:   { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold, color: colors.primary },
  seatsBadge:      { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 6, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  seatsText:       { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold },
  title:           { fontSize: fontSize.md, fontWeight: fontWeight.semiBold, color: colors.text.primary, marginBottom: spacing.sm },
  routeRow:        { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  city:            { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text.primary, flex: 1 },
  routeLine:       { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
  dot:             { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  line:            { flex: 1, height: 1, backgroundColor: colors.border, marginHorizontal: 2 },
  divider:         { height: 1, backgroundColor: colors.border, marginBottom: spacing.sm },
  bottomRow:       { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metaChip:        { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:        { fontSize: fontSize.xs, color: colors.text.hint },
  acTag:           { fontSize: fontSize.xs - 1, color: colors.secondary, fontWeight: fontWeight.semiBold, backgroundColor: `${colors.secondary}15`, borderRadius: 4, paddingHorizontal: 4 },
  cost:            { marginLeft: 'auto', fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary },
});
