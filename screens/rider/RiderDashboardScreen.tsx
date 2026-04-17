/**
 * RiderDashboardScreen — redesigned 2025. WHITE theme.
 * bg=#F8FAFC, white header, stats cards, hero CTA, horizontal trips FlatList.
 */
import AppButton from '@/components/AppButton';
import UserAvatar from '@/components/UserAvatar';
import { COLORS } from '@/constants/colors';
import { SHADOWS } from '@/constants/shadows';
import { useRiderDashboard } from '@/hooks/useRiderDashboard';
import { useAuthStore } from '@/store/authStore';
import type { Trip } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    FlatList,
    ListRenderItem,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Icon circle helper ────────────────────────────────────────────────────
interface IconCircleProps {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size: number;
  iconColor: string;
  bg: string;
  circleSize?: number;
}
const IconCircle = React.memo(function IconCircle({
  name, size, iconColor, bg, circleSize = 32,
}: IconCircleProps) {
  return (
    <View style={[iconCircleStyles.circle, { backgroundColor: bg, width: circleSize, height: circleSize, borderRadius: circleSize / 2 }]}>
      <Ionicons name={name} size={size} color={iconColor} />
    </View>
  );
});
const iconCircleStyles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
});

// ─── StatCard ─────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  iconBg: string;
  onPress?: () => void;
}
const StatCard = React.memo(function StatCard({ label, value, iconName, iconColor, iconBg, onPress }: StatCardProps) {
  if (onPress) {
    return (
      <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.75}>
        <IconCircle name={iconName} size={16} iconColor={iconColor} bg={iconBg} circleSize={32} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        <Ionicons name="chevron-forward" size={11} color={iconColor} style={{ position: 'absolute', top: 10, right: 10 }} />
      </TouchableOpacity>
    );
  }
  return (
    <View style={styles.statCard}>
      <IconCircle name={iconName} size={16} iconColor={iconColor} bg={iconBg} circleSize={32} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
});

// ─── VerificationBanner ──────────────────────────────────────────────────
interface VerifyBannerProps { onPress: () => void }
const VerifyBanner = React.memo(function VerifyBanner({ onPress }: VerifyBannerProps) {
  return (
    <View style={styles.verifyBanner}>
      <View style={styles.verifyLeft}>
        <IconCircle name="warning-outline" size={18} iconColor={COLORS.warning} bg={COLORS.warningLight} circleSize={36} />
        <View style={styles.verifyText}>
          <Text style={styles.verifyTitle}>Verify your vehicle</Text>
          <Text style={styles.verifySub}>RC &amp; DL upload needed to post trips</Text>
        </View>
      </View>
      <AppButton
        label="Verify →"
        variant="accent"
        size="sm"
        onPress={onPress}
        fullWidth={false}
        style={{ paddingHorizontal: 4 }}
      />
    </View>
  );
});

// ─── PostCTA card ─────────────────────────────────────────────────────────
interface PostCTAProps { isVerified: boolean; onPress: () => void; scaleAnim: Animated.Value }
const PostCTA = React.memo(function PostCTA({ isVerified, onPress, scaleAnim }: PostCTAProps) {
  if (!isVerified) {
    return (
      <View style={styles.ctaLocked}>
        <View style={styles.ctaLockedLeft}>
          <Ionicons name="lock-closed-outline" size={28} color={COLORS.slate400} />
          <View style={styles.ctaTextWrap}>
            <Text style={styles.ctaLockedTitle}>Post a New Ride</Text>
            <Text style={styles.ctaLockedSub}>Verify your vehicle first</Text>
          </View>
        </View>
        <Ionicons name="lock-closed" size={24} color={COLORS.slate400} />
      </View>
    );
  }
  return (
    <Animated.View style={[styles.ctaOuter, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.ctaInner}
        onPress={onPress}
        activeOpacity={0.95}>
        {/* Fake gradient: layered views */}
        <View style={styles.ctaGlassOverlay} />
        <View style={styles.ctaContent}>
          <View style={styles.ctaTextWrap}>
            <Text style={styles.ctaTitle}>Post a New Ride</Text>
            <Text style={styles.ctaSub}>Share your trip with travelers →</Text>
          </View>
          <View style={styles.ctaArrowCircle}>
            <Ionicons name="arrow-forward" size={24} color={COLORS.primary} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ─── ActiveTripCard (compact horizontal card) ────────────────────────────
interface ActiveTripCardProps { trip: Trip; onPress: (t: Trip) => void }
const ActiveTripCard = React.memo(function ActiveTripCard({ trip, onPress }: ActiveTripCardProps) {
  const seatsTotal = trip.seats ?? 4;
  const seatsFilled = trip.seats - trip.seatsLeft;
  const fillRatio = seatsTotal > 0 ? seatsFilled / seatsTotal : 0;

  return (
    <TouchableOpacity
      style={styles.activeTripCard}
      onPress={() => onPress(trip)}
      activeOpacity={0.85}>
      <Text style={styles.activeTripTitle} numberOfLines={1}>{trip.title}</Text>
      <Text style={styles.activeTripDate}>{trip.startDate ?? ''}</Text>
      {/* Seats fill bar */}
      <View style={styles.seatsBarBg}>
        <View style={[styles.seatsBarFill, { width: `${Math.min(fillRatio * 100, 100)}%` as `${number}%` }]} />
      </View>
      <View style={styles.activeTripBottom}>
        <Text style={styles.seatsText}>{seatsFilled}/{seatsTotal} booked</Text>
        <View style={[styles.statusPill, trip.status === 'active' ? styles.statusActive : styles.statusDraft]}>
          <Text style={[styles.statusText, trip.status === 'active' ? styles.statusTextActive : styles.statusTextDraft]}>
            {trip.status ?? 'Active'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// ─── Main screen ──────────────────────────────────────────────────────────
const RiderDashboardScreen = React.memo(function RiderDashboardScreen() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const ctaScaleAnim = useRef(new Animated.Value(1)).current;

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

  // ── Navigation helpers ─────────────────────────────────────────────────
  const goVerification = useCallback(() => router.push('/(tabs)/trips/verification'), [router]);
  const goPostTrip     = useCallback(() => {
    Animated.spring(ctaScaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 2 }).start(() => {
      Animated.spring(ctaScaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
      router.push('/(tabs)/trips/post-trip-type');
    });
  }, [router, ctaScaleAnim]);
  const goNotifications = useCallback(() => router.push('/notifications'), [router]);
  const goSettings      = useCallback(() => router.push('/settings'),      [router]);
  const goMyReviews     = useCallback(() => router.push('/(tabs)/trips/my-reviews' as never), [router]);
  const goPendingRequests = useCallback(() => {
    if (activeTrips.length > 0) {
      router.push({ pathname: '/(tabs)/trips/join-requests' as never, params: { tripId: activeTrips[0].id, tripTitle: activeTrips[0].title } });
    } else {
      router.push('/(tabs)/trips/my-trips');
    }
  }, [router, activeTrips]);

  const handleTripPress = useCallback((trip: Trip) =>
    router.push({ pathname: '/(tabs)/trips/join-requests' as never, params: { tripId: trip.id, tripTitle: trip.title } }),
  [router]);

  const keyExtractor = useCallback((item: Trip) => item.id, []);
  const renderTrip: ListRenderItem<Trip> = useCallback(
    ({ item }) => <ActiveTripCard trip={item} onPress={handleTripPress} />,
    [handleTripPress],
  );

  // ── Derived ───────────────────────────────────────────────────────────
  const ratingLabel = useMemo(() => {
    const r = stats?.avgRating ?? 0;
    return r === 0 ? '—' : `${r.toFixed(1)}★`;
  }, [stats]);
  const firstName = user?.name?.split(' ')[0] ?? 'Rider';

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* ── Header bar ─────────────────────────────────────────────── */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <UserAvatar name={user?.name ?? 'R'} size="sm" uri={user?.photo ?? undefined} />
          <View style={styles.headerGreetCol}>
            <Text style={styles.headerHello}>Hello,</Text>
            <Text style={styles.headerName}>{firstName}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={goNotifications} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.slate700} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={goSettings} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="settings-outline" size={20} color={COLORS.slate700} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={undefined}>

        {/* ── Error banner ────────────────────────────────────────── */}
        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={14} color={COLORS.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refresh}><Text style={styles.retryText}>Retry</Text></TouchableOpacity>
          </View>
        ) : null}

        {/* ── Verification banner ─────────────────────────────────── */}
        {!isVerified && <VerifyBanner onPress={goVerification} />}

        {/* ── Stats row ───────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatCard
            label="TRIPS"
            value={String(stats?.tripsPosted ?? 0)}
            iconName="car-outline"
            iconColor={COLORS.primary}
            iconBg={COLORS.primaryBg}
          />
          <StatCard
            label="HELPED"
            value={String(stats?.peopleHelped ?? 0)}
            iconName="people-outline"
            iconColor={COLORS.success}
            iconBg={COLORS.successLight}
          />
          <StatCard
            label="RATING"
            value={ratingLabel}
            iconName="star"
            iconColor={COLORS.accent}
            iconBg={COLORS.accentLight}
            onPress={goMyReviews}
          />
        </View>

        {/* ── Post Ride CTA ───────────────────────────────────────── */}
        <PostCTA isVerified={isVerified} onPress={goPostTrip} scaleAnim={ctaScaleAnim} />

        {/* ── Pending requests ────────────────────────────────────── */}
        {pendingRequestCount > 0 && (
          <View style={styles.pendingBanner}>
            <View style={styles.pendingLeft}>
              <View style={styles.pendingDot} />
              <Text style={styles.pendingText}>
                {pendingRequestCount} Join Request{pendingRequestCount > 1 ? 's' : ''} Pending
              </Text>
            </View>
            <AppButton
              label="Review →"
              variant="ghost"
              size="sm"
              onPress={goPendingRequests}
              fullWidth={false}
            />
          </View>
        )}

        {/* ── Active trips section ─────────────────────────────────── */}
        {activeTrips.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Active Trips</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/trips/my-trips')}>
                <Text style={styles.sectionAction}>View all →</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={activeTrips ?? []}
              renderItem={renderTrip}
              keyExtractor={keyExtractor}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tripsList}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            />
          </>
        )}

        {activeTrips.length === 0 && !loading && (
          <View style={styles.emptyWrap}>
            <Ionicons name="car-outline" size={40} color={COLORS.slate300} />
            <Text style={styles.emptyText}>No active trips yet</Text>
            <Text style={styles.emptySub}>Post your first ride to get started</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
});

export default RiderDashboardScreen;

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: COLORS.background },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  scroll:      { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // Header bar
  headerBar:      {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 56, paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.slate100,
    ...SHADOWS.xs,
  },
  headerLeft:     { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerGreetCol: { justifyContent: 'center' },
  headerHello:    { fontSize: 11, color: COLORS.slate400, fontWeight: '500' },
  headerName:     { fontSize: 17, color: COLORS.slate900, fontWeight: '700', marginTop: 1 },
  headerRight:    { flexDirection: 'row', gap: 8 },
  iconBtn:        {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.xs,
  },

  // Error banner
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, margin: 16, padding: 12, backgroundColor: COLORS.dangerLight, borderRadius: 10 },
  errorText:   { flex: 1, fontSize: 13, color: COLORS.danger },
  retryText:   { fontSize: 13, color: COLORS.primary, fontWeight: '600' },

  // Verification banner
  verifyBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    margin: 16, borderRadius: 16,
    borderWidth: 1.5, borderColor: COLORS.warning,
    backgroundColor: COLORS.warningLight, padding: 14,
  },
  verifyLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  verifyText:  { flex: 1 },
  verifyTitle: { fontSize: 14, fontWeight: '700', color: COLORS.slate900 },
  verifySub:   { fontSize: 12, color: COLORS.slate500, marginTop: 2 },

  // Stats row
  statsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 16 },
  statCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 16,
    padding: 14, borderWidth: 1, borderColor: COLORS.slate100,
    ...SHADOWS.sm,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: COLORS.slate900, marginTop: 8 },
  statLabel: { fontSize: 10, color: COLORS.slate400, fontWeight: '700', letterSpacing: 0.6, marginTop: 2, textTransform: 'uppercase' },

  // CTA verified
  ctaOuter: { marginHorizontal: 16, marginTop: 16, borderRadius: 20, overflow: 'hidden', ...SHADOWS.md },
  ctaInner: { backgroundColor: COLORS.primary, borderRadius: 20, padding: 20, overflow: 'hidden' },
  ctaGlassOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#1D63ED',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    height: '50%',
    opacity: 0.5,
  },
  ctaContent:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ctaTextWrap:  { flex: 1, marginRight: 12 },
  ctaTitle:     { fontSize: 20, fontWeight: '700', color: COLORS.white },
  ctaSub:       { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  ctaArrowCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },

  // CTA locked
  ctaLocked:      {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    margin: 16, borderRadius: 20, padding: 20,
    backgroundColor: COLORS.slate100,
  },
  ctaLockedLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  ctaLockedTitle: { fontSize: 17, fontWeight: '700', color: COLORS.slate400 },
  ctaLockedSub:   { fontSize: 12, color: COLORS.slate400, marginTop: 2 },

  // Pending row
  pendingBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginTop: 14,
    borderRadius: 12, padding: 12,
    backgroundColor: COLORS.warningLight,
  },
  pendingLeft:  { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  pendingDot:   { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.warning },
  pendingText:  { fontSize: 14, fontWeight: '700', color: COLORS.slate800 },

  // Section header
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginTop: 22, marginBottom: 10,
  },
  sectionTitle:  { fontSize: 16, fontWeight: '700', color: COLORS.slate900 },
  sectionAction: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },

  // Active trip cards
  tripsList:     { paddingHorizontal: 16, paddingBottom: 4 },
  activeTripCard: {
    width: 220, height: 120, backgroundColor: COLORS.white,
    borderRadius: 16, padding: 14, ...SHADOWS.sm,
  },
  activeTripTitle: { fontSize: 14, fontWeight: '700', color: COLORS.slate900, marginBottom: 2 },
  activeTripDate:  { fontSize: 11, color: COLORS.slate400, marginBottom: 8 },
  seatsBarBg:    { height: 4, backgroundColor: COLORS.slate100, borderRadius: 2, marginBottom: 8 },
  seatsBarFill:  { height: 4, backgroundColor: COLORS.primary, borderRadius: 2 },
  activeTripBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seatsText:     { fontSize: 11, color: COLORS.slate500 },
  statusPill:    { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  statusActive:  { backgroundColor: COLORS.successLight },
  statusDraft:   { backgroundColor: COLORS.slate100 },
  statusText:    { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  statusTextActive: { color: COLORS.successDark },
  statusTextDraft:  { color: COLORS.slate500 },

  // Empty state
  emptyWrap: { alignItems: 'center', paddingTop: 48, paddingBottom: 24 },
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.slate400, marginTop: 12 },
  emptySub:  { fontSize: 13, color: COLORS.slate300, marginTop: 4 },
});
