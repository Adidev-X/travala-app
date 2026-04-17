// ─── SearchResultsScreen ─────────────────────────────────────────────────────
// Traveler search results with vehicle-type filter chips, sort underline tabs,
// skeleton loading, error+empty states with nearby-date suggestions.

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from 'react';
import {
    Animated,
    FlatList,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import TripResultCard from '../../components/TripResultCard';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import {
    FilterOption,
    SortOption,
    useSearchResults,
} from '../../hooks/useSearchResults';
import type { SearchResultsParams } from '../../navigation/types';
import type { Trip } from '../../types';
import { formatDate } from '../../utils/formatDate';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View style={[sk.card, { opacity }]}>
      <View style={sk.badgeRow}>
        <View style={[sk.bone, { width: 72, height: 18, borderRadius: 5 }]} />
        <View style={[sk.bone, { width: 36, height: 18, borderRadius: 5 }]} />
      </View>
      <View style={sk.riderRow}>
        <View style={[sk.bone, sk.avatar]} />
        <View style={{ flex: 1, gap: 6 }}>
          <View style={[sk.bone, { width: '55%', height: 13 }]} />
          <View style={[sk.bone, { width: '30%', height: 11 }]} />
        </View>
        <View style={[sk.bone, { width: 60, height: 28, borderRadius: 8 }]} />
      </View>
      <View style={sk.routeRow}>
        <View style={[sk.bone, { flex: 1, height: 12 }]} />
        <View style={[sk.bone, { width: 24, height: 24, borderRadius: 12 }]} />
        <View style={[sk.bone, { flex: 1, height: 12 }]} />
      </View>
      <View style={sk.metaRow}>
        {[60, 72, 56, 48].map((w, i) => (
          <View key={i} style={[sk.bone, { width: w, height: 24, borderRadius: 8 }]} />
        ))}
      </View>
      <View style={[sk.bone, { height: 34, borderRadius: 9 }]} />
    </Animated.View>
  );
}

const sk = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  bone: { backgroundColor: `${colors.border}`, borderRadius: 4 },
  badgeRow: { flexDirection: 'row', gap: spacing.xs },
  avatar: { width: 38, height: 38, borderRadius: 19, flexShrink: 0 },
  riderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metaRow: { flexDirection: 'row', gap: spacing.xs },
});

// ─── Filter & Sort constants ──────────────────────────────────────────────────

const FILTERS: { key: FilterOption; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'all', label: 'All', icon: 'apps-outline' },
  { key: 'car', label: 'Car', icon: 'car-outline' },
  { key: 'bike', label: 'Bike', icon: 'bicycle-outline' },
  { key: 'van', label: 'Van', icon: 'bus-outline' },
  { key: 'bus', label: 'Bus', icon: 'bus' },
];

const SORTS: { key: SortOption; label: string }[] = [
  { key: 'soonest', label: 'Soonest' },
  { key: 'cheapest', label: 'Cheapest' },
  { key: 'rating', label: 'Top Rated' },
];

const CARD_HEIGHT = 240; // approximate for getItemLayout

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SearchResultsScreen() {
  const router = useRouter();
  const {
    from = '',
    to = '',
    date,
    seats,
    vehicleType,
  } = useLocalSearchParams<SearchResultsParams>();

  const query = useMemo(
    () => ({
      from,
      to,
      date,
      seats: seats ? parseInt(seats, 10) : undefined,
      vehicleType,
    }),
    [from, to, date, seats, vehicleType],
  );

  const {
    filteredResults,
    results,
    loading,
    error,
    retry,
    activeFilter,
    setFilter,
    activeSort,
    setSort,
  } = useSearchResults(query);

  // ── Nearby dates for empty state ──────────────────────────────────────────
  const nearbyDates = useMemo(() => {
    // Guard: date param may be undefined, a string[] or an invalid date string.
    // Fall back to today so toISOString() never throws RangeError.
    const parsed = typeof date === 'string' ? new Date(date) : null;
    const base = parsed && !isNaN(parsed.getTime()) ? parsed : new Date();
    return [-1, 1, 2, 3].map(offset => {
      const d = new Date(base);
      d.setDate(d.getDate() + offset);
      const iso = d.toISOString().slice(0, 10);
      return {
        iso,
        label:
          offset === 0
            ? 'Today'
            : offset === 1
            ? 'Tomorrow'
            : formatDate(iso, 'short'),
      };
    });
  }, [date]);

  // ── FlatList helpers ──────────────────────────────────────────────────────
  const keyExtractor = useCallback((item: Trip) => item.id, []);
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: CARD_HEIGHT,
      offset: CARD_HEIGHT * index,
      index,
    }),
    [],
  );
  const handleCardPress = useCallback(
    (trip: Trip) =>
      router.push({
        pathname: '/(tabs)/home/trip-detail' as any,
        params: { tripId: trip.id },
      }),
    [router],
  );
  const renderItem = useCallback(
    ({ item }: { item: Trip }) => (
      <TripResultCard trip={item} onPress={handleCardPress} />
    ),
    [handleCardPress],
  );

  // CLICK FIX: filter icon button had NO onPress — pressing it did nothing silently.
  // Added a defined handler (placeholder until advanced-filter modal is implemented).
  const handleAdvancedFilter = useCallback(() => {
    // TODO: open advanced filter modal (price range, rating, AC, etc.)
    // Keeping as a no-op for now so the button at least has a defined onPress.
  }, []);

  // ── Header sub-component ──────────────────────────────────────────────────
  const ListHeader = useMemo(
    () => (
      <View style={ss.listHeader}>
        <Text style={ss.resultsCount}>
          {loading
            ? 'Searching…'
            : `${filteredResults.length} ride${filteredResults.length !== 1 ? 's' : ''} found`}
          {date ? (
            <Text style={ss.resultsDate}>{` for ${formatDate(date, 'short')}`}</Text>
          ) : null}
        </Text>
      </View>
    ),
    [loading, filteredResults.length, date],
  );

  // ── Loading state ─────────────────────────────────────────────────────────
  const renderContent = () => {
    if (loading) {
      return (
        <View style={{ padding: spacing.sm }}>
          <View style={ss.listHeader}>
            <Text style={ss.resultsCount}>Searching…</Text>
          </View>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      );
    }

    if (error) {
      return (
        <View style={ss.stateWrap}>
          <Ionicons name="cloud-offline-outline" size={56} color={colors.text.hint} />
          <Text style={ss.stateTitle}>Couldn't load rides</Text>
          <Text style={ss.stateBody}>{error}</Text>
          <TouchableOpacity style={ss.retryBtn} onPress={retry} activeOpacity={0.85}>
            <Ionicons name="refresh-outline" size={16} color={colors.white} />
            <Text style={ss.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        // FIX: added ?? [] guard — undefined data prop crashes FlatList
        data={filteredResults ?? []}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={10}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={
          filteredResults.length === 0
            ? ss.listEmpty
            : { padding: spacing.sm, paddingBottom: spacing.xxl }
        }
        ListEmptyComponent={
          <View style={ss.stateWrap}>
            <Ionicons name="search-outline" size={56} color={colors.text.hint} />
            <Text style={ss.stateTitle}>No rides found</Text>
            <Text style={ss.stateBody}>
              No rides available for this route
              {date ? ` on ${formatDate(date, 'short')}` : ''}.
            </Text>
            <Text style={ss.nearbyLabel}>Try nearby dates:</Text>
            <View style={ss.nearbyRow}>
              {nearbyDates.map(nd => (
                <TouchableOpacity
                  key={nd.iso}
                  style={ss.nearbyChip}
                  onPress={() =>
                    router.replace({
                      pathname: '/(tabs)/home/search-results' as any,
                      params: { from, to, date: nd.iso, seats, vehicleType },
                    })
                  }
                  activeOpacity={0.8}
                >
                  <Text style={ss.nearbyChipText}>{nd.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={ss.flex}>
      {/* ── Header ── */}
      <View style={ss.header}>
        <TouchableOpacity
          style={ss.backBtn}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={ss.headerCenter}>
          <Text style={ss.headerTitle} numberOfLines={1}>
            {from || '?'} → {to || '?'}
          </Text>
          {date ? (
            <Text style={ss.headerSub}>{formatDate(date, 'short')}</Text>
          ) : null}
        </View>

        {/* CLICK FIX: was missing onPress — button was completely dead (no-op on tap).
            Now wired to handleAdvancedFilter; replace with modal open when ready. */}
        <TouchableOpacity
          style={ss.filterIconBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={handleAdvancedFilter}
        >
          <Ionicons name="options-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Vehicle Filter Chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={ss.chipScroll}
        contentContainerStyle={ss.chipRow}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[ss.chip, activeFilter === f.key && ss.chipActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={f.icon}
              size={14}
              color={activeFilter === f.key ? colors.white : colors.text.secondary}
            />
            <Text style={[ss.chipText, activeFilter === f.key && ss.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Sort Row ── */}
      <View style={ss.sortRow}>
        {SORTS.map(s => (
          <TouchableOpacity
            key={s.key}
            style={[ss.sortTab, activeSort === s.key && ss.sortTabActive]}
            onPress={() => setSort(s.key)}
            activeOpacity={0.8}
          >
            <Text style={[ss.sortLabel, activeSort === s.key && ss.sortLabelActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
        {!loading && (
          <Text style={ss.sortCount}>
            {filteredResults.length} of {results.length}
          </Text>
        )}
      </View>

      {/* ── Content ── */}
      <View style={ss.flex}>
        {renderContent()}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const ss = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? spacing.lg + 4 : spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  backBtn: { padding: 2 },
  filterIconBtn: { padding: 2 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  headerSub: { fontSize: fontSize.xs, color: colors.text.hint, marginTop: 1 },

  // Filter chips
  chipScroll: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    maxHeight: 50,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.text.secondary },
  chipTextActive: { color: colors.white, fontWeight: fontWeight.semiBold },

  // Sort row
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  sortTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: spacing.xs,
  },
  sortTabActive: { borderBottomColor: colors.primary },
  sortLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.text.hint },
  sortLabelActive: { color: colors.primary, fontWeight: fontWeight.semiBold },
  sortCount: { marginLeft: 'auto', fontSize: fontSize.xs, color: colors.text.hint },

  // List header
  listHeader: { paddingHorizontal: spacing.xs, paddingBottom: spacing.xs },
  resultsCount: { fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: fontWeight.medium },
  resultsDate: { color: colors.text.hint, fontWeight: fontWeight.regular },

  // Empty / error state
  listEmpty: { flex: 1 },
  stateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl + spacing.xl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  stateTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semiBold, color: colors.text.primary, textAlign: 'center' },
  stateBody: { fontSize: fontSize.sm, color: colors.text.hint, textAlign: 'center', lineHeight: 20 },

  // Retry button
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 22,
  },
  retryBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.white },

  // Nearby dates
  nearbyLabel: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: spacing.sm, fontWeight: fontWeight.medium },
  nearbyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'center' },
  nearbyChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}0d`,
  },
  nearbyChipText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.medium },
});
