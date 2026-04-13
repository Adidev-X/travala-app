import TripCard from '@/components/TripCard';
import UserAvatar from '@/components/UserAvatar';
import { COLORS } from '@/constants/colors';
import { SHADOWS } from '@/constants/shadows';
import { RADIUS } from '@/constants/spacing';
import { FONTS } from '@/constants/typography';
import { useHomeData } from '@/hooks/useHomeData';
import type { SearchResultsParams, TripDetailParams } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import type { Trip, VehicleType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

type VehicleFilter = 'all' | VehicleType;

interface VehicleChip {
  id: VehicleFilter;
  label: string;
  emoji: string;
}

type TrendingRoute = { from: string; to: string; tripCount: number };

// ─── Config ───────────────────────────────────────────────────────────────────

const VEHICLE_CHIPS: VehicleChip[] = [
  { id: 'all',  label: 'All',  emoji: '🗺' },
  { id: 'car',  label: 'Car',  emoji: '🚗' },
  { id: 'bike', label: 'Bike', emoji: '🏍' },
  { id: 'van',  label: 'Van',  emoji: '🚐' },
  { id: 'bus',  label: 'Bus',  emoji: '🚌' },
];

const ACCENT_PALETTE = [
  COLORS.primary,
  COLORS.success,
  COLORS.accent,
  COLORS.purple,
  COLORS.danger,
  '#06B6D4',
];

const STATUS_BAR_HEIGHT =
  Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight ?? 24);

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const user   = useAuthStore(s => s.user);

  const { trending, localTrips, loading, refetch } = useHomeData(user?.city);

  const [from,          setFrom]    = useState('');
  const [to,            setTo]      = useState('');
  const [date,          setDate]    = useState('');
  const [seats,         setSeats]   = useState(1);
  const [vehicleFilter, setVehicle] = useState<VehicleFilter>('all');

  // Memoised filtered trips
  const filteredTrips = useMemo<Trip[]>(() => {
    if (vehicleFilter === 'all') return localTrips.slice(0, 5);
    return localTrips.filter(t => t.vehicle.type === vehicleFilter).slice(0, 5);
  }, [localTrips, vehicleFilter]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    if (!from.trim() || !to.trim()) return;
    const params: SearchResultsParams = {
      from:  from.trim(),
      to:    to.trim(),
      date:  date.trim() || undefined,
      seats: String(seats),
    };
    router.push({ pathname: '/(tabs)/home/search-results', params });
  }, [from, to, date, seats, router]);

  const handleSwap = useCallback(() => {
    const prevFrom = from;
    setFrom(to);
    setTo(prevFrom);
  }, [from, to]);

  const handleTripPress = useCallback((trip: Trip) => {
    const params: TripDetailParams = { tripId: trip.id };
    router.push({ pathname: '/(tabs)/home/trip-detail', params });
  }, [router]);

  const handleSeeAll = useCallback(() => {
    const params: SearchResultsParams = { from: user?.city ?? '', to: '' };
    router.push({ pathname: '/(tabs)/home/search-results', params });
  }, [user?.city, router]);

  const decSeats = useCallback(() => setSeats(s => Math.max(1, s - 1)), []);
  const incSeats = useCallback(() => setSeats(s => Math.min(8, s + 1)), []);

  // ── Sub-renderers ────────────────────────────────────────────────────────
  const renderVehicleChip = useCallback(
    ({ item }: { item: VehicleChip }) => {
      const active = vehicleFilter === item.id;
      return (
        <TouchableOpacity
          style={[styles.vChip, active && styles.vChipActive]}
          onPress={() => setVehicle(item.id)}
          activeOpacity={0.75}
        >
          <Text style={styles.vChipEmoji}>{item.emoji}</Text>
          <Text style={[styles.vChipLabel, active && styles.vChipLabelActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    },
    [vehicleFilter]
  );

  const renderTrending = useCallback(
    ({ item, index }: { item: TrendingRoute; index: number }) => {
      const accentColor = ACCENT_PALETTE[index % ACCENT_PALETTE.length];
      return (
        <TouchableOpacity
          style={[styles.trendCard, { borderLeftColor: accentColor }]}
          onPress={() =>
            router.push({
              pathname: '/(tabs)/home/search-results',
              params: { from: item.from, to: item.to },
            })
          }
          activeOpacity={0.8}
        >
          <Text style={styles.trendRoute} numberOfLines={1}>
            {item.from} → {item.to}
          </Text>
          <View style={styles.trendBottom}>
            <View style={styles.trendCountBadge}>
              <Text style={styles.trendCountText}>{item.tripCount} trips</Text>
            </View>
            <Ionicons name="arrow-forward" size={13} color={COLORS.slate400} />
          </View>
        </TouchableOpacity>
      );
    },
    [router]
  );

  const renderTripCard = useCallback(
    ({ item }: { item: Trip }) => (
      <TripCard trip={item} onPress={handleTripPress} />
    ),
    [handleTripPress]
  );

  const firstName = user?.name?.split(' ')[0] ?? 'Traveler';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refetch}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — Header
      ═══════════════════════════════════════════════════════════════════ */}
      <View style={styles.header}>
        {/* Left: avatar + greeting */}
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.8}
        >
          <UserAvatar name={user?.name} size="sm" />
          <View style={styles.greetingGroup}>
            <Text style={styles.greetingSmall}>{getGreeting()},</Text>
            <Text style={styles.greetingName}>{firstName}</Text>
          </View>
        </TouchableOpacity>

        {/* Right: notification bell */}
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => router.push('/notifications')}
          activeOpacity={0.75}
        >
          <Ionicons name="notifications-outline" size={24} color={COLORS.slate600} />
          {/* Unread dot — always show for demo; in production: conditional */}
          <View style={styles.bellDot} />
        </TouchableOpacity>
      </View>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2 — Search Hero Card
      ═══════════════════════════════════════════════════════════════════ */}
      <View style={styles.searchCard}>
        {/* FROM row */}
        <View style={styles.inputRow}>
          <View style={styles.fromIconBg}>
            <Ionicons name="location" size={16} color={COLORS.primary} />
          </View>
          <TextInput
            style={styles.cityInput}
            placeholder="From city..."
            placeholderTextColor={COLORS.slate400}
            value={from}
            onChangeText={setFrom}
            returnKeyType="next"
          />
        </View>

        {/* Connector + swap button */}
        <View style={styles.connectorRow}>
          <View style={styles.connectorLine} />
          <TouchableOpacity
            style={styles.swapBtn}
            onPress={handleSwap}
            activeOpacity={0.7}
          >
            <Ionicons name="swap-vertical" size={18} color={COLORS.slate600} />
          </TouchableOpacity>
        </View>

        {/* TO row */}
        <View style={styles.inputRow}>
          <View style={styles.toIconBg}>
            <Ionicons name="flag" size={16} color={COLORS.accent} />
          </View>
          <TextInput
            style={styles.cityInput}
            placeholder="To city..."
            placeholderTextColor={COLORS.slate400}
            value={to}
            onChangeText={setTo}
            returnKeyType="next"
          />
        </View>

        {/* Divider */}
        <View style={styles.hDivider} />

        {/* Date + Seats row */}
        <View style={styles.dateSeatsRow}>
          {/* Date */}
          <TouchableOpacity style={styles.dateTrigger} activeOpacity={0.75}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.slate400} />
            <TextInput
              style={styles.dateInput}
              placeholder="Select date"
              placeholderTextColor={COLORS.slate400}
              value={date}
              onChangeText={setDate}
              keyboardType="numbers-and-punctuation"
            />
          </TouchableOpacity>

          {/* Vertical divider */}
          <View style={styles.vDivider} />

          {/* Seats stepper */}
          <View style={styles.seatsStepper}>
            <Ionicons name="person-outline" size={15} color={COLORS.slate400} />
            <TouchableOpacity
              onPress={decSeats}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="remove-circle-outline"
                size={22}
                color={seats <= 1 ? COLORS.slate300 : COLORS.primary}
              />
            </TouchableOpacity>
            <Text style={styles.seatsNum}>{seats}</Text>
            <TouchableOpacity
              onPress={incSeats}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="add-circle-outline"
                size={22}
                color={seats >= 8 ? COLORS.slate300 : COLORS.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search button */}
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={handleSearch}
          activeOpacity={0.88}
        >
          <Text style={styles.searchBtnText}>Search Rides →</Text>
        </TouchableOpacity>
      </View>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3 — Vehicle Filter
      ═══════════════════════════════════════════════════════════════════ */}
      <Text style={styles.overline}>I NEED A</Text>
      <FlatList
        data={VEHICLE_CHIPS}
        keyExtractor={item => item.id}
        renderItem={renderVehicleChip}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.vChipList}
        style={styles.vChipScroll}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4 — Trending Routes
      ═══════════════════════════════════════════════════════════════════ */}
      {trending.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Routes</Text>
            <TouchableOpacity onPress={handleSeeAll} activeOpacity={0.7}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={trending}
            keyExtractor={item => `${item.from}-${item.to}`}
            renderItem={renderTrending}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendList}
          />
        </View>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5 — Trips Near You
      ═══════════════════════════════════════════════════════════════════ */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {user?.city ? `Trips from ${user.city}` : 'Available Trips'}
          </Text>
          <TouchableOpacity onPress={handleSeeAll} activeOpacity={0.7}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        {loading && filteredTrips.length === 0 ? (
          <ActivityIndicator
            color={COLORS.primary}
            style={styles.loader}
          />
        ) : filteredTrips.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="car-outline" size={36} color={COLORS.slate300} />
            <Text style={styles.emptyText}>No trips found near you</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTrips}
            keyExtractor={item => item.id}
            renderItem={renderTripCard}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 48,
  },

  // ── Section 1: Header ────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: STATUS_BAR_HEIGHT + 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: COLORS.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  greetingGroup: {
    gap: 1,
  },
  greetingSmall: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.slate500,
  },
  greetingName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.slate900,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.xs,
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },

  // ── Section 2: Search Card ──────────────────────────────────────────────
  searchCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    ...SHADOWS.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fromIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityInput: {
    flex: 1,
    fontSize: FONTS.sizes.base,
    color: COLORS.slate900,
    paddingVertical: Platform.OS === 'ios' ? 4 : 0,
  },
  connectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    height: 28,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    borderLeftWidth: 1.5,
    borderStyle: 'dashed',
    borderLeftColor: COLORS.slate200,
  },
  swapBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
    position: 'absolute',
    right: 0,
  },
  hDivider: {
    height: 1,
    backgroundColor: COLORS.slate100,
    marginVertical: 14,
  },
  dateSeatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    marginBottom: 14,
  },
  dateTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInput: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.slate700,
    paddingVertical: Platform.OS === 'ios' ? 4 : 0,
  },
  vDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.slate100,
    marginHorizontal: 12,
  },
  seatsStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seatsNum: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.slate900,
    minWidth: 20,
    textAlign: 'center',
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    // subtle inner shadow via platform shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  searchBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 0.2,
  },

  // ── Section 3: Vehicle Filter ────────────────────────────────────────────
  overline: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.slate400,
    letterSpacing: 1.2,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  vChipScroll: {
    marginBottom: 20,
  },
  vChipList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  vChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.white,
  },
  vChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryBg,
  },
  vChipEmoji: {
    fontSize: 14,
  },
  vChipLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.slate600,
  },
  vChipLabelActive: {
    color: COLORS.primary,
  },

  // ── Sections ─────────────────────────────────────────────────────────────
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.slate900,
  },
  seeAll: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },

  // ── Section 4: Trending ──────────────────────────────────────────────────
  trendList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  trendCard: {
    width: 160,
    height: 90,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate100,
    borderLeftWidth: 4,
    padding: 12,
    justifyContent: 'space-between',
    ...SHADOWS.sm,
  },
  trendRoute: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.slate900,
  },
  trendBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendCountBadge: {
    backgroundColor: COLORS.slate100,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  trendCountText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.slate500,
    fontWeight: FONTS.weights.medium,
  },

  // ── Empty / loading ──────────────────────────────────────────────────────
  loader: {
    marginTop: 32,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.slate400,
  },
});
