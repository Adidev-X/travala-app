// ─── MyTripsScreen ───────────────────────────────────────────────────────────
// Rider's full trip management screen: 4 status tabs, pull-to-refresh,
// TripManageCard with inline action row.
//
// ── OPTIMIZATIONS APPLIED ───────────────────────────────────────────────────
//
//  1. TripCardContainer (NEW)
//     The original renderItem created 4 fresh arrow-function closures (onView,
//     onRequests, onEdit, onCancel) per item on every parent render, defeating
//     TripManageCard's React.memo entirely.  TripCardContainer is a memo'd
//     wrapper that owns those handlers with useCallback, so React.memo can do
//     shallow comparisons on stable function refs.
//
//  2. FlatList tuning
//     Added initialNumToRender, maxToRenderPerBatch, windowSize,
//     removeClippedSubviews, updateCellsBatchingPeriod.  These reduce the JS
//     work during fast scrolling and initial mount.
//
//  3. contentContainerStyle — no inline object
//     The original code created `{ padding, paddingBottom }` as a new object
//     every render.  Moved to StyleSheet so the reference is stable.
//
//  4. ListEmptyComponent — extracted as memo'd component
//     Inline JSX in ListEmptyComponent is re-evaluated each render.  Separate
//     memo'd <EmptyState /> component + stable props prevent this.
//
//  5. onRefresh — stable useCallback
//     Original: `onRefresh={() => load(true)}` — anonymous arrow recreated
//     each render.  Replaced with a dedicated callback ref.
//
//  6. getItemLayout — type-safe (no `any`)
//     _data typed as `ArrayLike<Trip> | null | undefined` per FlatList types.
//
//  7. useReducer for loading/refreshing/trips
//     Three interrelated states previously updated in sequence inside try/catch
//     causing multiple re-renders per load.  Single dispatch to atomic reducer
//     collapses those into one render.
//
//  8. Tab handlers — stable with useCallback
//     `onPress={() => setActiveTab(tab.key)}` in the tab row was recreating 4
//     closures each render.  Replaced by `TabItem` memo component that calls
//     a stable `onSelect(key)` callback.

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import { tripService } from '../../services/trips';
import type { Trip, TripStatus } from '../../types';
import { formatDate } from '../../utils/formatDate';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = 'upcoming' | 'active' | 'completed' | 'cancelled';

interface Tab {
  key: TabKey;
  label: string;
  statuses: TripStatus[];
  emptyIcon: keyof typeof Ionicons.glyphMap;
  emptyMessage: string;
}

// ─── Constants (module-level, never recreated) ────────────────────────────────

const TABS: Tab[] = [
  {
    key: 'upcoming',
    label: 'Upcoming',
    statuses: ['active'],
    emptyIcon: 'calendar-outline',
    emptyMessage: 'No upcoming trips.\nPost a new ride to get started.',
  },
  {
    key: 'active',
    label: 'Active',
    statuses: ['full'],
    emptyIcon: 'car-outline',
    emptyMessage: "No active trips.\nFull bookings will appear here.",
  },
  {
    key: 'completed',
    label: 'Completed',
    statuses: ['completed'],
    emptyIcon: 'checkmark-circle-outline',
    emptyMessage: 'No completed trips yet.',
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    statuses: ['cancelled'],
    emptyIcon: 'close-circle-outline',
    emptyMessage: 'No cancelled trips.',
  },
];

const CARD_HEIGHT = 196;

const TYPE_LABEL: Record<string, string> = {
  full_tour: 'Full Tour',
  one_way: 'One-Way',
};

const STATUS_COLORS: Record<TripStatus, { bg: string; text: string }> = {
  active:    { bg: colors.statusAccepted,   text: colors.statusAcceptedText },
  full:      { bg: colors.statusPending,    text: colors.statusPendingText  },
  completed: { bg: `${colors.primary}20`,   text: colors.primary            },
  cancelled: { bg: colors.statusDeclined,   text: colors.statusDeclinedText },
};

// ─── Reducer — avoids 3 separate setState calls triggering 3 re-renders ──────
// OPT-7: merged (loading, refreshing, trips) into a single atomic reducer so
// each load/refresh cycle costs ONE re-render instead of three.

interface ListState {
  trips: Trip[];
  loading: boolean;
  refreshing: boolean;
}

type ListAction =
  | { type: 'LOAD_START' }
  | { type: 'REFRESH_START' }
  | { type: 'SUCCESS'; trips: Trip[] }
  | { type: 'CANCEL_TRIP'; tripId: string }
  | { type: 'ERROR' };

function listReducer(state: ListState, action: ListAction): ListState {
  switch (action.type) {
    case 'LOAD_START':    return { ...state, loading: true,  refreshing: false };
    case 'REFRESH_START': return { ...state, refreshing: true, loading: false  };
    case 'SUCCESS':       return { trips: action.trips, loading: false, refreshing: false };
    case 'CANCEL_TRIP':   return {
      ...state,
      trips: state.trips.map(t =>
        t.id === action.tripId ? { ...t, status: 'cancelled' as const } : t,
      ),
    };
    case 'ERROR':         return { ...state, loading: false, refreshing: false };
    default:              return state;
  }
}

const INITIAL_STATE: ListState = { trips: [], loading: true, refreshing: false };

// ─── TripManageCard ───────────────────────────────────────────────────────────

interface TripManageCardProps {
  trip: Trip;
  pendingCount: number;
  onView: () => void;
  onRequests: () => void;
  onEdit: () => void;
  onCancel: () => void;
}

const TripManageCard = memo(function TripManageCard({
  trip,
  pendingCount,
  onView,
  onRequests,
  onEdit,
  onCancel,
}: TripManageCardProps) {
  const joined = trip.seats - trip.seatsLeft;
  const fillPct = trip.seats > 0 ? (joined / trip.seats) * 100 : 0;
  const statusStyle = STATUS_COLORS[trip.status] ?? STATUS_COLORS.active;
  const canEdit   = trip.status === 'active';
  const canCancel = trip.status === 'active' || trip.status === 'full';

  return (
    <View style={cs.card}>
      {/* Top row */}
      <View style={cs.cardTopRow}>
        <View style={cs.typeBadge}>
          <Text style={cs.typeBadgeText}>{TYPE_LABEL[trip.type] ?? trip.type}</Text>
        </View>
        <View style={[cs.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[cs.statusText, { color: statusStyle.text }]}>
            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Title + Route */}
      <Text style={cs.title} numberOfLines={1}>{trip.title}</Text>
      <View style={cs.routeRow}>
        <Ionicons name="location-outline" size={13} color={colors.text.hint} />
        <Text style={cs.route} numberOfLines={1}>
          {trip.from}{trip.to ? ` → ${trip.to}` : ''}
        </Text>
      </View>

      {/* Date + Time */}
      <View style={cs.metaRow}>
        <Ionicons name="calendar-outline" size={13} color={colors.text.hint} />
        <Text style={cs.metaText}>{formatDate(trip.startDate, 'short')}</Text>
        <Ionicons name="time-outline" size={13} color={colors.text.hint} style={cs.metaIcon} />
        <Text style={cs.metaText}>{trip.departureTime}</Text>
      </View>

      {/* Seats bar */}
      <View style={cs.seatsRow}>
        <Text style={cs.seatsLabel}>{joined}/{trip.seats} joined</Text>
        {pendingCount > 0 && (
          <View style={cs.pendingBadge}>
            <Text style={cs.pendingBadgeText}>{pendingCount} pending</Text>
          </View>
        )}
      </View>
      <View style={cs.progressTrack}>
        {/* OPT: cast to `any` used only here for the dynamic % width string */}
        <View style={[cs.progressFill, { width: `${fillPct}%` as any }]} />
      </View>

      {/* Action row */}
      <View style={cs.actions}>
        <TouchableOpacity style={cs.actionBtn} onPress={onView} activeOpacity={0.75}>
          <Ionicons name="eye-outline" size={15} color={colors.primary} />
          <Text style={cs.actionText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity style={cs.actionBtn} onPress={onRequests} activeOpacity={0.75}>
          <Ionicons name="people-outline" size={15} color={colors.secondary} />
          {/* OPT: inline string template avoids object creation */}
          <Text style={cs.actionTextSecondary}>
            Requests{pendingCount > 0 ? ` (${pendingCount})` : ''}
          </Text>
        </TouchableOpacity>

        {canEdit && (
          <TouchableOpacity style={cs.actionBtn} onPress={onEdit} activeOpacity={0.75}>
            <Ionicons name="create-outline" size={15} color={colors.text.secondary} />
            <Text style={cs.actionTextMuted}>Edit</Text>
          </TouchableOpacity>
        )}

        {canCancel && (
          <TouchableOpacity style={cs.actionBtn} onPress={onCancel} activeOpacity={0.75}>
            <Ionicons name="close-circle-outline" size={15} color={colors.danger} />
            <Text style={cs.actionTextDanger}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

// ─── TripCardContainer ────────────────────────────────────────────────────────
// OPT-1: This wrapper is the KEY optimization.  The original `renderItem`
// passed 4 inline `() => router.push(...)` lambdas directly into TripManageCard,
// producing new function objects every render and defeating React.memo.
// TripCardContainer creates stable handlers with useCallback so memo works.

interface TripCardContainerProps {
  trip: Trip;
  onCancelTrip: (trip: Trip) => void;
}

const TripCardContainer = memo(function TripCardContainer({
  trip,
  onCancelTrip,
}: TripCardContainerProps) {
  const router = useRouter();

  const onView = useCallback(() => {
    router.push({
      pathname: '/(tabs)/home/trip-detail' as any,
      params: { tripId: trip.id },
    });
  }, [router, trip.id]);

  const onRequests = useCallback(() => {
    router.push({
      pathname: '/(tabs)/trips/join-requests' as any,
      params: { tripId: trip.id, tripTitle: trip.title },
    });
  }, [router, trip.id, trip.title]);

  const onEdit = useCallback(() => {
    router.push({
      pathname: (trip.type === 'full_tour'
        ? '/(tabs)/trips/post-full-tour'
        : '/(tabs)/trips/post-one-way') as any,
      params: { draftId: trip.id },
    });
  }, [router, trip.id, trip.type]);

  const onCancel = useCallback(() => onCancelTrip(trip), [onCancelTrip, trip]);

  return (
    <TripManageCard
      trip={trip}
      pendingCount={0}
      onView={onView}
      onRequests={onRequests}
      onEdit={onEdit}
      onCancel={onCancel}
    />
  );
});

// ─── TabItem ──────────────────────────────────────────────────────────────────
// OPT-8: memo'd tab item so a tab-switch only re-renders the 2 affected tabs
// (the one being activated, the one being deactivated) instead of all 4.

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onSelect: (key: TabKey) => void;
}

const TabItem = memo(function TabItem({ tab, isActive, onSelect }: TabItemProps) {
  const handlePress = useCallback(() => onSelect(tab.key), [onSelect, tab.key]);
  return (
    <TouchableOpacity
      style={[ss.tab, isActive && ss.tabActive]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={[ss.tabLabel, isActive && ss.tabLabelActive]}>{tab.label}</Text>
    </TouchableOpacity>
  );
});

// ─── EmptyState ───────────────────────────────────────────────────────────────
// OPT-4: extracted as stable memo component so FlatList doesn't create new
// JSX for ListEmptyComponent on every render.

interface EmptyProps {
  icon: keyof typeof Ionicons.glyphMap;
  message: string;
  showPostButton: boolean;
  onPost: () => void;
}

const EmptyState = memo(function EmptyState({
  icon,
  message,
  showPostButton,
  onPost,
}: EmptyProps) {
  return (
    <View style={ss.emptyWrap}>
      <Ionicons name={icon} size={52} color={colors.text.hint} />
      <Text style={ss.emptyText}>{message}</Text>
      {showPostButton && (
        <TouchableOpacity style={ss.emptyBtn} onPress={onPost} activeOpacity={0.85}>
          <Text style={ss.emptyBtnText}>Post a Ride</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MyTripsScreen() {
  const router = useRouter();
  const isMounted = useRef(true);

  // OPT-7: single reducer replaces 3 separate useState hooks
  const [state, dispatch] = useReducer(listReducer, INITIAL_STATE);
  const { trips, loading, refreshing } = state;

  // OPT-8: stable tab state via reducer (or simple useState is fine since it's
  // a scalar); kept as useState — it only triggers a small re-render.
  const [activeTab, setActiveTab] = React.useState<TabKey>('upcoming');

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ── Load ─────────────────────────────────────────────────────────────────

  const load = useCallback(async (isRefresh: boolean) => {
    dispatch({ type: isRefresh ? 'REFRESH_START' : 'LOAD_START' });
    try {
      const data = await tripService.getMyTrips();
      if (isMounted.current) dispatch({ type: 'SUCCESS', trips: data });
    } catch {
      if (isMounted.current) {
        dispatch({ type: 'ERROR' });
        if (!isRefresh) Alert.alert('Error', 'Could not load your trips.');
      }
    }
  }, []);

  useEffect(() => { load(false); }, [load]);

  // OPT-5: dedicated onRefresh callback — avoids `() => load(true)` lambda
  // in RefreshControl's onRefresh prop being recreated each render.
  const onRefresh = useCallback(() => load(true), [load]);

  // ── Cancel handler ────────────────────────────────────────────────────────

  const handleCancel = useCallback((trip: Trip) => {
    Alert.alert(
      'Cancel Trip',
      `Cancel "${trip.title}"? This cannot be undone.`,
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Cancel Trip',
          style: 'destructive',
          onPress: async () => {
            try {
              await tripService.cancelTrip(trip.id);
              if (isMounted.current) dispatch({ type: 'CANCEL_TRIP', tripId: trip.id });
            } catch {
              Alert.alert('Error', 'Could not cancel trip. Try again.');
            }
          },
        },
      ],
    );
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────

  const currentTab = useMemo(
    () => TABS.find(t => t.key === activeTab) ?? TABS[0]!,
    [activeTab],
  );

  const filteredTrips = useMemo(
    () => trips.filter(t => (currentTab as Tab).statuses.includes(t.status)),
    [trips, currentTab],
  );

  // OPT-4: stable EmptyState node — only rebuilt when tab or navigate changes
  const onPost = useCallback(
    () => router.push('/(tabs)/trips/post-trip-type' as any),
    [router],
  );

  const listEmptyComponent = useMemo(() => (
    <EmptyState
      icon={(currentTab as Tab).emptyIcon}
      message={(currentTab as Tab).emptyMessage}
      showPostButton={activeTab === 'upcoming'}
      onPost={onPost}
    />
  ), [currentTab, activeTab, onPost]);

  // OPT-3: contentContainerStyle — no more inline object on every render.
  // The two possibilities are defined in StyleSheet below.
  const contentContainerStyle = filteredTrips.length === 0
    ? ss.listEmpty
    : ss.listContent;

  // ── FlatList callbacks ────────────────────────────────────────────────────

  // OPT-1: renderItem now returns TripCardContainer, which owns stable handlers.
  // No inline arrow functions passed as card props.
  const renderItem = useCallback(
    ({ item }: { item: Trip }) => (
      <TripCardContainer trip={item} onCancelTrip={handleCancel} />
    ),
    [handleCancel],
  );

  const keyExtractor = useCallback((item: Trip) => item.id, []);

  // OPT-6: typed properly — no more `_: any`
  const getItemLayout = useCallback(
    (_data: ArrayLike<Trip> | null | undefined, index: number) => ({
      length: CARD_HEIGHT,
      offset: CARD_HEIGHT * index,
      index,
    }),
    [],
  );

  // OPT-8: stable tab-select callback passed to each TabItem
  const handleTabSelect = useCallback((key: TabKey) => setActiveTab(key), []);

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={ss.flex}>
        <View style={ss.header}>
          <Text style={ss.headerTitle}>My Trips</Text>
        </View>
        <View style={ss.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={ss.flex}>
      {/* Header */}
      <View style={ss.header}>
        <Text style={ss.headerTitle}>My Trips</Text>
        <TouchableOpacity
          style={ss.postBtn}
          onPress={onPost}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color={colors.white} />
          <Text style={ss.postBtnText}>Post New</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Row — OPT-8: each TabItem only re-renders when its isActive changes */}
      <View style={ss.tabRow}>
        {TABS.map(tab => (
          <TabItem
            key={tab.key}
            tab={tab}
            isActive={activeTab === tab.key}
            onSelect={handleTabSelect}
          />
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredTrips}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        contentContainerStyle={contentContainerStyle}  // OPT-3
        // OPT-2: FlatList perf tuning
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}  // safe default; iOS can be buggy with this
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}           // OPT-5: stable callback
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={listEmptyComponent}  // OPT-4: stable memo node
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ─── Screen styles ────────────────────────────────────────────────────────────

const ss = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: 20,
  },
  postBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.white },

  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.primary },
  tabLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.text.hint },
  tabLabelActive: { color: colors.primary, fontWeight: fontWeight.semiBold },

  // OPT-3: these two replace the inline conditional object in contentContainerStyle
  listContent: { padding: spacing.sm, paddingBottom: spacing.xxl },
  listEmpty: { flex: 1 },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl + spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.text.hint,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 22,
  },
  emptyBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.white },
});

// ─── Card styles ──────────────────────────────────────────────────────────────

const cs = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    height: CARD_HEIGHT,
    overflow: 'hidden',
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  typeBadge: {
    backgroundColor: `${colors.secondary}18`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold, color: colors.secondary },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold },

  title: { fontSize: fontSize.md, fontWeight: fontWeight.semiBold, color: colors.text.primary },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  route: { flex: 1, fontSize: fontSize.xs, color: colors.text.secondary },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  metaText: { fontSize: fontSize.xs, color: colors.text.hint },
  metaIcon: { marginLeft: spacing.sm },

  seatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  seatsLabel: { fontSize: fontSize.xs, color: colors.text.secondary },
  pendingBadge: {
    backgroundColor: `${colors.warning}20`,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },
  pendingBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold, color: colors.warning },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: colors.primary },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },

  // OPT: replaced `[cs.actionText, { color: X }]` inline dynamic styles with
  // pre-defined StyleSheet variants — avoids new array+object every render.
  actionText:        { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.primary },
  actionTextSecondary: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.secondary },
  actionTextMuted:   { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.text.secondary },
  actionTextDanger:  { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.danger },
});
