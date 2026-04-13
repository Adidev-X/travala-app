import TripCard from '@/components/TripCard';
import colors from '@/constants/colors';
import spacing from '@/constants/spacing';
import { fontSize, fontWeight } from '@/constants/typography';
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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

type VehicleFilter = 'all' | VehicleType;

interface VehicleChip { id: VehicleFilter; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }

const VEHICLE_CHIPS: VehicleChip[] = [
  { id: 'all',  label: 'All',  icon: 'apps-outline' },
  { id: 'car',  label: 'Car',  icon: 'car-outline' },
  { id: 'bike', label: 'Bike', icon: 'bicycle-outline' },
  { id: 'van',  label: 'Van',  icon: 'bus-outline' },
  { id: 'bus',  label: 'Bus',  icon: 'bus-outline' },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router   = useRouter();
  const user     = useAuthStore(s => s.user);

  const { trending, localTrips, loading, refetch } = useHomeData(user?.city);

  const [from,        setFrom]        = useState('');
  const [to,          setTo]          = useState('');
  const [date,        setDate]        = useState('');
  const [seats,       setSeats]       = useState(1);
  const [vehicleFilter, setVehicle]   = useState<VehicleFilter>('all');

  // ── Filtered trips (memoized) ─────────────────────────────────────────────
  const filteredTrips = useMemo<Trip[]>(() => {
    if (vehicleFilter === 'all') return localTrips.slice(0, 3);
    return localTrips.filter(t => t.vehicle.type === vehicleFilter).slice(0, 3);
  }, [localTrips, vehicleFilter]);

  // ── Handlers (memoized) ───────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    if (!from.trim() || !to.trim()) return;
    const params: SearchResultsParams = {
      from: from.trim(),
      to:   to.trim(),
      date: date.trim() || undefined,
    };
    router.push({ pathname: '/(tabs)/home/search-results', params });
  }, [from, to, date, router]);

  const handleSwap = useCallback(() => {
    setFrom(to);
    setTo(from);
  }, [from, to]);

  const handleTripPress = useCallback((trip: Trip) => {
    const params: TripDetailParams = { tripId: trip.id };
    router.push({ pathname: '/(tabs)/home/trip-detail', params });
  }, [router]);

  const handleSeeAll = useCallback(() => {
    const params: SearchResultsParams = { from: user?.city ?? '', to: '' };
    router.push({ pathname: '/(tabs)/home/search-results', params });
  }, [user?.city, router]);

  const handleVehicleChip = useCallback((id: VehicleFilter) => setVehicle(id), []);

  const decSeats = useCallback(() => setSeats(s => Math.max(1, s - 1)), []);
  const incSeats = useCallback(() => setSeats(s => Math.min(8, s + 1)), []);

  // ── Sub-renderers ─────────────────────────────────────────────────────────
  const renderVehicleChip = useCallback(({ item }: { item: VehicleChip }) => (
    <TouchableOpacity
      style={[styles.chip, vehicleFilter === item.id && styles.chipActive]}
      onPress={() => handleVehicleChip(item.id)}
      activeOpacity={0.8}>
      <Ionicons name={item.icon} size={14} color={vehicleFilter === item.id ? colors.primary : colors.text.hint} />
      <Text style={[styles.chipText, vehicleFilter === item.id && styles.chipTextActive]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  ), [vehicleFilter, handleVehicleChip]);

  const renderTrending = useCallback(({ item }: { item: { from: string; to: string; tripCount: number } }) => (
    <TouchableOpacity
      style={styles.trendCard}
      onPress={() => router.push({ pathname: '/(tabs)/home/search-results', params: { from: item.from, to: item.to } })}
      activeOpacity={0.8}>
      <Text style={styles.trendRoute}>{item.from} → {item.to}</Text>
      <Text style={styles.trendCount}>{item.tripCount} trips</Text>
      <Ionicons name="arrow-forward" size={14} color={colors.text.hint} style={styles.trendArrow} />
    </TouchableOpacity>
  ), [router]);

  const renderTripCard = useCallback(({ item }: { item: Trip }) => (
    <TripCard trip={item} onPress={handleTripPress} />
  ), [handleTripPress]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} colors={[colors.primary]} />}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{user?.name?.split(' ')[0] ?? 'Traveler'} 👋</Text>
        </View>
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.85}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Search card ── */}
      <View style={styles.searchCard}>
        {/* From */}
        <View style={styles.inputRow}>
          <Ionicons name="location-outline" size={18} color={colors.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="From city"
            placeholderTextColor={colors.text.hint}
            value={from}
            onChangeText={setFrom}
          />
        </View>

        {/* Swap button */}
        <TouchableOpacity style={styles.swapBtn} onPress={handleSwap} activeOpacity={0.75}>
          <Ionicons name="swap-vertical" size={18} color={colors.primary} />
        </TouchableOpacity>

        {/* To */}
        <View style={styles.inputRow}>
          <Ionicons name="navigate-outline" size={18} color={colors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="To city"
            placeholderTextColor={colors.text.hint}
            value={to}
            onChangeText={setTo}
          />
        </View>

        <View style={styles.searchRow}>
          {/* Date */}
          <View style={[styles.inputRow, styles.inputRowHalf]}>
            <Ionicons name="calendar-outline" size={16} color={colors.text.hint} />
            <TextInput
              style={styles.searchInput}
              placeholder="Date (DD-MM-YY)"
              placeholderTextColor={colors.text.hint}
              value={date}
              onChangeText={setDate}
              keyboardType="numbers-and-punctuation"
            />
          </View>

          {/* Seats stepper */}
          <View style={[styles.inputRow, styles.seatsRow]}>
            <Ionicons name="person-outline" size={16} color={colors.text.hint} />
            <TouchableOpacity onPress={decSeats} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="remove-circle-outline" size={22} color={seats <= 1 ? colors.border : colors.primary} />
            </TouchableOpacity>
            <Text style={styles.seatsNum}>{seats}</Text>
            <TouchableOpacity onPress={incSeats} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="add-circle-outline" size={22} color={seats >= 8 ? colors.border : colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
          <Ionicons name="search" size={18} color={colors.white} />
          <Text style={styles.searchBtnText}>Search Rides</Text>
        </TouchableOpacity>
      </View>

      {/* ── Vehicle filter ── */}
      <FlatList
        data={VEHICLE_CHIPS}
        keyExtractor={item => item.id}
        renderItem={renderVehicleChip}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipList}
        style={styles.chipScroll}
      />

      {/* ── Trending routes ── */}
      {trending.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Routes</Text>
          <FlatList
            data={trending}
            keyExtractor={item => `${item.from}-${item.to}`}
            renderItem={renderTrending}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.md }}
          />
        </View>
      )}

      {/* ── Trips from your city ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {user?.city ? `Trips from ${user.city}` : 'Available Trips'}
          </Text>
          <TouchableOpacity onPress={handleSeeAll}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {loading && filteredTrips.length === 0 ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
        ) : filteredTrips.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="car-outline" size={36} color={colors.text.hint} />
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
  container:        { flex: 1, backgroundColor: colors.background },
  content:          { padding: spacing.md, paddingBottom: spacing.xxl },

  // Header
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  greeting:         { fontSize: fontSize.sm, color: colors.text.secondary },
  userName:         { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
  avatarBtn:        {},
  avatar:           { width: 44, height: 44, borderRadius: 22, backgroundColor: `${colors.primary}20`, justifyContent: 'center', alignItems: 'center' },
  avatarText:       { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary },

  // Search card
  searchCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios:     { shadowColor: colors.black, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  inputRow:         { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.sm, backgroundColor: colors.background, gap: spacing.sm, marginBottom: spacing.sm },
  inputRowHalf:     { flex: 1, marginBottom: 0 },
  searchInput:      { flex: 1, paddingVertical: Platform.OS === 'ios' ? 12 : 8, fontSize: fontSize.md, color: colors.text.primary },
  swapBtn:          { alignSelf: 'center', marginBottom: spacing.sm, width: 36, height: 36, borderRadius: 18, backgroundColor: `${colors.primary}12`, justifyContent: 'center', alignItems: 'center' },
  searchRow:        { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  seatsRow:         { justifyContent: 'space-between', flex: 1, marginBottom: 0 },
  seatsNum:         { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary, minWidth: 24, textAlign: 'center' },
  searchBtn:        { flexDirection: 'row', backgroundColor: colors.primary, borderRadius: 10, paddingVertical: spacing.md - 2, alignItems: 'center', justifyContent: 'center', gap: spacing.xs + 2 },
  searchBtnText:    { color: colors.white, fontWeight: fontWeight.semiBold, fontSize: fontSize.md },

  // Vehicle chips
  chipScroll:       { marginBottom: spacing.md },
  chipList:         { gap: spacing.sm, paddingHorizontal: 2 },
  chip:             { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs + 1, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  chipActive:       { borderColor: colors.primary, backgroundColor: `${colors.primary}12` },
  chipText:         { fontSize: fontSize.xs, color: colors.text.hint, fontWeight: fontWeight.medium },
  chipTextActive:   { color: colors.primary, fontWeight: fontWeight.semiBold },

  // Sections
  section:          { marginBottom: spacing.lg },
  sectionHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle:     { fontSize: fontSize.lg, fontWeight: fontWeight.semiBold, color: colors.text.primary, marginBottom: spacing.sm },
  seeAll:           { fontSize: fontSize.sm, color: colors.secondary, fontWeight: fontWeight.medium },

  // Trending
  trendCard: {
    minWidth: 160,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trendRoute:       { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.text.primary, marginBottom: 4 },
  trendCount:       { fontSize: fontSize.xs, color: colors.text.hint },
  trendArrow:       { marginTop: spacing.sm },

  // Empty
  emptyWrap:        { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  emptyText:        { fontSize: fontSize.sm, color: colors.text.hint },
});
