// ─── RiderProfileScreen ──────────────────────────────────────────────────────
// Public rider profile — viewed by traveler after tapping a trip/rider.
// No contact buttons here; user navigates back to TripDetail to contact.

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { memo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import UserAvatar from '../../components/Avatar';
import ReviewCard from '../../components/ReviewCard';
import VerifiedBadge from '../../components/VerifiedBadge';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import { useRiderProfile } from '../../hooks/useRiderProfile';
import type { RiderProfileParams } from '../../navigation/types';
import type { Review, Trip, VehicleType } from '../../types';

// ─── Constants ───────────────────────────────────────────────────────────────

const VEHICLE_ICONS: Record<VehicleType, React.ComponentProps<typeof Ionicons>['name']> = {
  car:  'car-outline',
  bike: 'bicycle-outline',
  van:  'bus-outline',
  bus:  'bus-outline',
};

const REVIEWS_CAP = 5;

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Single stat card in the 3-column stats row */
const StatCard = memo(function StatCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <View style={ss.statCard}>
      <Text style={ss.statValue}>{value}</Text>
      <Text style={ss.statLabel}>{label}</Text>
    </View>
  );
});

/** Compact trip card in the horizontal active-trips scroll */
const ActiveTripMiniCard = memo(function ActiveTripMiniCard({
  trip,
  onView,
}: {
  trip: Trip;
  onView: (trip: Trip) => void;
}) {
  const dateLabel = new Date(trip.startDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
  const seatsColor = trip.seatsLeft <= 2 ? colors.danger : colors.success;

  return (
    <View style={ss.miniCard}>
      <Text style={ss.miniRoute} numberOfLines={1}>
        {trip.from} → {trip.to}
      </Text>
      <Text style={ss.miniDate}>{dateLabel}</Text>
      <View style={ss.miniBottom}>
        <View style={[ss.seatsBadge, { backgroundColor: `${seatsColor}18` }]}>
          <Ionicons name="people-outline" size={11} color={seatsColor} />
          <Text style={[ss.seatsText, { color: seatsColor }]}>
            {trip.seatsLeft} left
          </Text>
        </View>
        <TouchableOpacity
          style={ss.viewBtn}
          onPress={() => onView(trip)}
          activeOpacity={0.7}
        >
          <Text style={ss.viewBtnText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

/** Rating summary: big number + stars + count */
const RatingSummary = memo(function RatingSummary({
  avg,
  count,
}: {
  avg: number;
  count: number;
}) {
  return (
    <View style={ss.ratingSum}>
      <Text style={ss.ratingBig}>{avg.toFixed(1)}</Text>
      <View style={ss.ratingSub}>
        <View style={ss.starRow}>
          {[1, 2, 3, 4, 5].map(n => (
            <Ionicons
              key={n}
              name={n <= Math.round(avg) ? 'star' : 'star-outline'}
              size={18}
              color="#F59E0B"
              style={{ marginRight: 2 }}
            />
          ))}
        </View>
        <Text style={ss.ratingCountText}>Based on {count} review{count !== 1 ? 's' : ''}</Text>
      </View>
    </View>
  );
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function RiderProfileScreen() {
  const router = useRouter();
  const { riderId } = useLocalSearchParams<RiderProfileParams>();
  const { profile, trips, reviews, loading, error, retry } = useRiderProfile(riderId);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // ── Navigation ────────────────────────────────────────────────────────────
  const handleViewTrip = (trip: Trip) => {
    router.push({
      pathname: '/(tabs)/home/trip-detail',
      params: { tripId: trip.id },
    });
  };

  const handleReport = () => {
    Alert.alert(
      'Report Rider',
      'Are you sure you want to report this rider? Our team will review the report.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', style: 'destructive', onPress: () => {} },
      ],
    );
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={ss.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !profile) {
    return (
      <View style={ss.centered}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.danger} />
        <Text style={ss.errorText}>{error ?? 'Could not load profile.'}</Text>
        <TouchableOpacity style={ss.retryBtn} onPress={retry} activeOpacity={0.8}>
          <Text style={ss.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const memberYear = new Date(profile.memberSince).getFullYear();
  const displayedReviews: Review[] = showAllReviews ? reviews : reviews.slice(0, REVIEWS_CAP);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={ss.root}>
      {/* ── Header bar ───────────────────────────────────────────────────── */}
      <View style={ss.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={ss.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={ss.headerTitle}>Rider Profile</Text>
        <TouchableOpacity onPress={handleReport} hitSlop={8}>
          <Text style={ss.reportLink}>Report</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={ss.scroll}
        contentContainerStyle={ss.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Profile header ─────────────────────────────────────────── */}
        <View style={ss.profileHeader}>
          <UserAvatar uri={profile.photo} name={profile.name} size="lg" />
          <Text style={ss.profileName}>{profile.name}</Text>
          <Text style={ss.memberSince}>Member since {memberYear}</Text>

          {/* Verification badges */}
          {(profile.rcVerified || profile.dlVerified) && (
            <View style={ss.badgeRow}>
              {profile.rcVerified && (
                <View style={ss.badgeGap}>
                  <VerifiedBadge type="rc" />
                </View>
              )}
              {profile.dlVerified && (
                <VerifiedBadge type="dl" />
              )}
            </View>
          )}
        </View>

        {/* ── 2. Stats row ──────────────────────────────────────────────── */}
        <View style={ss.statsRow}>
          <StatCard
            value={String(profile.stats.tripsPosted)}
            label="Trips Posted"
          />
          <View style={ss.statDivider} />
          <StatCard
            value={String(profile.stats.peopleHelped)}
            label="People Helped"
          />
          <View style={ss.statDivider} />
          <StatCard
            value={`${profile.stats.avgRating.toFixed(1)}★`}
            label="Avg Rating"
          />
        </View>

        {/* ── 3. Vehicle info card ──────────────────────────────────────── */}
        {profile.vehicle && (
          <View style={[ss.card, ss.section]}>
            <Text style={ss.cardLabel}>VEHICLE</Text>
            <View style={ss.vehicleRow}>
              <View style={ss.vehicleIconWrap}>
                <Ionicons
                  name={VEHICLE_ICONS[profile.vehicle.type]}
                  size={28}
                  color={colors.primary}
                />
              </View>
              <View style={ss.vehicleInfo}>
                <Text style={ss.vehicleType}>
                  {profile.vehicle.type.charAt(0).toUpperCase() +
                    profile.vehicle.type.slice(1)}
                  {profile.vehicle.model ? ` · ${profile.vehicle.model}` : ''}
                </Text>
                <View style={ss.vehiclePillRow}>
                  <View style={[ss.pill, profile.vehicle.ac ? ss.pillBlue : ss.pillGrey]}>
                    <Text style={[ss.pillText, profile.vehicle.ac ? ss.pillTextBlue : ss.pillTextGrey]}>
                      {profile.vehicle.ac ? 'AC' : 'Non-AC'}
                    </Text>
                  </View>
                  <View style={[ss.pill, ss.pillGrey]}>
                    <Ionicons name="people-outline" size={11} color={colors.text.hint} />
                    <Text style={[ss.pillText, ss.pillTextGrey]}>
                      {profile.vehicle.seats} seats
                    </Text>
                  </View>
                  {profile.rcVerified && (
                    <View style={[ss.pill, ss.pillGreen]}>
                      <Ionicons name="checkmark-circle" size={11} color={colors.success} />
                      <Text style={[ss.pillText, ss.pillTextGreen]}>RC Verified</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── 4. About section ─────────────────────────────────────────── */}
        {!!profile.bio && (
          <View style={[ss.aboutCard, ss.section]}>
            <Text style={ss.cardLabel}>ABOUT</Text>
            <Text style={ss.bioText}>{profile.bio}</Text>
          </View>
        )}

        {/* ── 5. Active Trips ───────────────────────────────────────────── */}
        <View style={ss.section}>
          <Text style={ss.sectionTitle}>Active Trips</Text>
          {trips.length === 0 ? (
            <View style={ss.emptyTrips}>
              <Ionicons name="car-outline" size={28} color={colors.text.hint} />
              <Text style={ss.emptyText}>No active trips right now</Text>
            </View>
          ) : (
            <FlatList
              data={trips}
              keyExtractor={t => t.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={ss.tripsListContent}
              renderItem={({ item }) => (
                <ActiveTripMiniCard trip={item} onView={handleViewTrip} />
              )}
            />
          )}
        </View>

        {/* ── 6. Reviews ────────────────────────────────────────────────── */}
        <View style={ss.section}>
          <Text style={ss.sectionTitle}>Reviews</Text>
          {reviews.length === 0 ? (
            <View style={ss.emptyTrips}>
              <Ionicons name="star-outline" size={28} color={colors.text.hint} />
              <Text style={ss.emptyText}>No reviews yet</Text>
            </View>
          ) : (
            <>
              <RatingSummary
                avg={profile.stats.avgRating}
                count={profile.stats.reviewCount ?? reviews.length}
              />
              {displayedReviews.map(rev => (
                <ReviewCard key={rev.id} review={rev} />
              ))}
              {reviews.length > REVIEWS_CAP && !showAllReviews && (
                <TouchableOpacity
                  onPress={() => setShowAllReviews(true)}
                  style={ss.seeAllBtn}
                  activeOpacity={0.7}
                >
                  <Text style={ss.seeAllText}>
                    See all {reviews.length} reviews
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={colors.primary} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <View style={{ height: spacing.xxl }} />
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
  // ── header bar
  headerBar: {
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
  reportLink: {
    fontSize: fontSize.sm,
    color: colors.text.hint,
    textDecorationLine: 'underline',
  },
  // ── states
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryBtnText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
  },
  // ── scroll
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.md },
  // ── profile header
  profileHeader: {
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  memberSince: {
    fontSize: fontSize.sm,
    color: colors.text.hint,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  badgeGap: { marginRight: 8 },
  // ── stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginTop: spacing.xs,
    paddingVertical: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.text.hint,
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
  // ── section
  section: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  // ── card (vehicle / generic)
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
  cardLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text.hint,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  // ── vehicle
  vehicleRow: { flexDirection: 'row', alignItems: 'center' },
  vehicleIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleInfo: { flex: 1, marginLeft: spacing.sm },
  vehicleType: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: 6,
  },
  vehiclePillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 3,
  },
  pillBlue: { backgroundColor: `${colors.secondary}18` },
  pillGrey: { backgroundColor: `${colors.border}` },
  pillGreen: { backgroundColor: `${colors.success}15` },
  pillText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  pillTextBlue: { color: colors.secondary },
  pillTextGrey: { color: colors.text.hint },
  pillTextGreen: { color: colors.success },
  // ── about
  aboutCard: {
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  bioText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  // ── trips
  tripsListContent: { paddingBottom: spacing.xs },
  miniCard: {
    width: 160,
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  miniRoute: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  miniDate: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  miniBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seatsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  seatsText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  viewBtn: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  viewBtnText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.white,
  },
  emptyTrips: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 8,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.text.hint,
  },
  // ── reviews
  ratingSum: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  ratingBig: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extraBold,
    color: colors.text.primary,
  },
  ratingSub: { flex: 1 },
  starRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  ratingCountText: {
    fontSize: fontSize.sm,
    color: colors.text.hint,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: 4,
  },
  seeAllText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
});
