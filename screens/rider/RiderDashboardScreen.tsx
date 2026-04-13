// ─── RiderDashboardScreen ─────────────────────────────────────────────────────
// Rider home screen: verification status, stats, post-ride CTA, active trips.
//
// Layout strategy: single FlatList whose ListHeaderComponent contains all
// above-the-fold content so we never nest a ScrollView inside a ScrollView.

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MyTripCard from '../../components/MyTripCard';
import VerifiedBadge from '../../components/VerifiedBadge';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import { useRiderDashboard } from '../../hooks/useRiderDashboard';
import { useAuthStore } from '../../store/authStore';
import type { Trip } from '../../types';

// ─── Sub-components ───────────────────────────────────────────────────────────

// Stat card
interface StatCardProps { label: string; value: string; icon: React.ComponentProps<typeof Ionicons>['name'] }
const StatCard = React.memo<StatCardProps>(({ label, value, icon }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={20} color={colors.primary} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
));
StatCard.displayName = 'StatCard';

// Pending requests row
interface PendingRowProps { count: number; onPress: () => void }
const PendingRow = React.memo<PendingRowProps>(({ count, onPress }) => (
  <TouchableOpacity style={styles.pendingRow} onPress={onPress} activeOpacity={0.82}>
    <View style={styles.pendingLeft}>
      <Ionicons name="people-outline" size={18} color={colors.warning} />
      <Text style={styles.pendingText}>
        Pending Requests{count > 0 ? ` (${count})` : ''}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color={colors.warning} />
  </TouchableOpacity>
));
PendingRow.displayName = 'PendingRow';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RiderDashboardScreen() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);

  const {
    verificationStatus,
    activeTrips,
    stats,
    isVerified,
    pendingRequestCount,
    loading,
    error,
    refresh,
  } = useRiderDashboard();

  // ── Navigation helpers ────────────────────────────────────────────────────

  const goVerification = useCallback(
    () => router.push('/(tabs)/trips/verification'),
    [router],
  );

  const goPostTrip = useCallback(
    () => router.push('/(tabs)/trips/post-trip-type'),
    [router],
  );

  const goNotifications = useCallback(
    () => router.push('/notifications'),
    [router],
  );

  const handleTripPress = useCallback(
    (trip: Trip) =>
      router.push({
        pathname: '/(tabs)/trips/join-requests' as never,
        params: { tripId: trip.id, tripTitle: trip.title },
      }),
    [router],
  );

  const handleViewRequests = useCallback(
    (trip: Trip) =>
      router.push({
        pathname: '/(tabs)/trips/join-requests' as never,
        params: { tripId: trip.id, tripTitle: trip.title },
      }),
    [router],
  );

  const goPendingRequests = useCallback(() => {
    // Navigate to first active trip's requests, or the my-trips list
    if (activeTrips.length > 0) {
      router.push({
        pathname: '/(tabs)/trips/join-requests' as never,
        params: { tripId: activeTrips[0].id, tripTitle: activeTrips[0].title },
      });
    } else {
      router.push('/(tabs)/trips/my-trips');
    }
  }, [router, activeTrips]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const rcApproved = verificationStatus?.rc.status === 'approved';
  const dlApproved = verificationStatus?.dl.status === 'approved';

  const ratingLabel = useMemo(() => {
    const r = stats?.avgRating ?? 0;
    return r === 0 ? '—' : r.toFixed(1);
  }, [stats]);

  // ── Render item ───────────────────────────────────────────────────────────

  const renderTrip: ListRenderItem<Trip> = useCallback(
    ({ item }) => (
      <MyTripCard
        trip={item}
        onPress={handleTripPress}
        onViewRequests={handleViewRequests}
      />
    ),
    [handleTripPress, handleViewRequests],
  );

  const keyExtractor = useCallback((item: Trip) => item.id, []);

  // ── Header (everything above the trip list) ───────────────────────────────

  const ListHeader = useMemo(
    () => (
      <View>
        {/* ── Top header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              Hello, {user?.name?.split(' ')[0] ?? 'Rider'} 👋
            </Text>
            {/* Verified badges row */}
            <View style={styles.badgesRow}>
              {rcApproved && <VerifiedBadge type="rc" size="sm" />}
              {dlApproved && <VerifiedBadge type="dl" size="sm" />}
              {isVerified && <VerifiedBadge type="full" size="sm" />}
            </View>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={goNotifications}
            activeOpacity={0.75}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* ── Verification warning card (hidden when fully verified) ── */}
        {!isVerified && (
          <View style={styles.verifyCard}>
            <View style={styles.verifyCardLeft}>
              <Ionicons name="shield-outline" size={22} color={colors.warning} />
              <View style={styles.verifyCardText}>
                <Text style={styles.verifyCardTitle}>Verify your vehicle</Text>
                <Text style={styles.verifyCardBody}>
                  Complete verification to post trips
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.verifyBtn}
              onPress={goVerification}
              activeOpacity={0.8}
            >
              <Text style={styles.verifyBtnText}>Verify Now</Text>
              <Ionicons name="arrow-forward" size={13} color={colors.warning} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          <StatCard
            icon="car-outline"
            label="Trips Posted"
            value={String(stats?.tripsPosted ?? 0)}
          />
          <StatCard
            icon="people-outline"
            label="People Helped"
            value={String(stats?.peopleHelped ?? 0)}
          />
          <StatCard
            icon="star-outline"
            label="Avg Rating"
            value={ratingLabel === '—' ? '—' : `${ratingLabel}★`}
          />
        </View>

        {/* ── Post a New Ride CTA ── */}
        {isVerified ? (
          <TouchableOpacity
            style={styles.postCard}
            onPress={goPostTrip}
            activeOpacity={0.85}
          >
            <View style={styles.postCardIcon}>
              <Ionicons name="add-circle" size={28} color={colors.white} />
            </View>
            <View style={styles.postCardText}>
              <Text style={styles.postCardTitle}>Post a New Ride</Text>
              <Text style={styles.postCardSub}>
                Share your route and earn together
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        ) : (
          /* Locked state — verify CTA replaces the post button */
          <View style={[styles.postCard, styles.postCardLocked]}>
            <View style={[styles.postCardIcon, styles.postCardIconLocked]}>
              <Ionicons name="lock-closed" size={24} color={colors.text.hint} />
            </View>
            <View style={styles.postCardText}>
              <Text style={[styles.postCardTitle, styles.postCardTitleLocked]}>
                Post a New Ride
              </Text>
              <Text style={styles.postCardSubLocked}>
                Verify RC &amp; DL to unlock
              </Text>
            </View>
            <TouchableOpacity
              style={styles.unlockBtn}
              onPress={goVerification}
              activeOpacity={0.8}
            >
              <Text style={styles.unlockBtnText}>Unlock</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Active Trips section header ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Trips</Text>
          <Text style={styles.sectionCount}>{activeTrips.length}</Text>
        </View>
      </View>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      user,
      rcApproved,
      dlApproved,
      isVerified,
      stats,
      ratingLabel,
      activeTrips.length,
      goNotifications,
      goVerification,
      goPostTrip,
    ],
  );

  // ── Footer: pending requests row ──────────────────────────────────────────

  const ListFooter = useMemo(
    () =>
      pendingRequestCount >= 0 ? (
        <PendingRow count={pendingRequestCount} onPress={goPendingRequests} />
      ) : null,
    [pendingRequestCount, goPendingRequests],
  );

  // ── Empty trips state ─────────────────────────────────────────────────────

  const EmptyTrips = useMemo(
    () => (
      <View style={styles.emptyWrap}>
        <Ionicons name="car-outline" size={40} color={colors.text.hint} />
        <Text style={styles.emptyTitle}>No active trips</Text>
        <Text style={styles.emptyBody}>
          {isVerified
            ? 'Post your first ride to get started.'
            : 'Complete verification to post trips.'}
        </Text>
      </View>
    ),
    [isVerified],
  );

  // ── Loading / error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your dashboard…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.text.hint} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refresh} activeOpacity={0.8}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList<Trip>
      data={activeTrips}
      keyExtractor={keyExtractor}
      renderItem={renderTrip}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={ListFooter}
      ListEmptyComponent={EmptyTrips}
      contentContainerStyle={styles.listContent}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  loadingText: { fontSize: fontSize.sm, color: colors.text.hint },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: { flex: 1 },
  greeting: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  bellBtn: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },

  // Verification warning
  verifyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${colors.warning}14`,
    borderWidth: 1,
    borderColor: `${colors.warning}44`,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  verifyCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  verifyCardText: { flex: 1 },
  verifyCardTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.warning,
  },
  verifyCardBody: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.warning}22`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${colors.warning}55`,
  },
  verifyBtnText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.warning,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 9,
    color: colors.text.hint,
    textAlign: 'center',
  },

  // Post card — verified
  postCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  postCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postCardText: { flex: 1 },
  postCardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  postCardSub: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },

  // Post card — locked
  postCardLocked: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  postCardIconLocked: {
    backgroundColor: `${colors.text.hint}18`,
  },
  postCardTitleLocked: {
    color: colors.text.secondary,
  },
  postCardSubLocked: {
    fontSize: fontSize.xs,
    color: colors.text.hint,
    marginTop: 2,
  },
  unlockBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: `${colors.warning}20`,
    borderWidth: 1,
    borderColor: `${colors.warning}60`,
  },
  unlockBtnText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.warning,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
  },
  sectionCount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.white,
    backgroundColor: colors.primary,
    borderRadius: 99,
    minWidth: 22,
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    overflow: 'hidden',
  },

  // Pending requests row
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${colors.warning}14`,
    borderWidth: 1,
    borderColor: `${colors.warning}44`,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  pendingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pendingText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.warning,
  },

  // Empty state
  emptyWrap: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.text.secondary,
  },
  emptyBody: {
    fontSize: fontSize.sm,
    color: colors.text.hint,
    textAlign: 'center',
    lineHeight: 19,
  },

  // Error
  errorText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: 20,
  },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 10,
    marginTop: spacing.xs,
  },
  retryText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.white,
  },
});
