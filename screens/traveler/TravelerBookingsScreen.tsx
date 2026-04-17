import colors from '@/constants/colors';
import spacing from '@/constants/spacing';
import { fontSize, fontWeight } from '@/constants/typography';
import useFetch from '@/hooks/useFetch';
import { requestService } from '@/services/requestService';
import type { JoinRequest } from '@/types';
import { formatDate } from '@/utils/formatDate';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

type Filter = 'all' | 'accepted' | 'pending' | 'declined';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'pending',  label: 'Pending' },
  { key: 'declined', label: 'Declined' },
];

const STATUS_COLOR: Record<string, string> = {
  accepted: colors.success,
  pending:  colors.warning,
  declined: colors.danger,
};

const STATUS_ICON: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  accepted: 'checkmark-circle',
  pending:  'time',
  declined: 'close-circle',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TravelerBookingsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');

  const fetchRequests = useCallback(() => requestService.getMyRequests(), []);
  const { data: requests, loading, error, refetch } = useFetch<JoinRequest[]>(fetchRequests);

  const filtered = (requests ?? []).filter(
    (r: JoinRequest) => filter === 'all' || r.status === filter,
  );

  const handleTripPress = (tripId: string) => {
    router.push(`/(tabs)/home/trip-detail?tripId=${tripId}` as never);
  };

  const renderItem = ({ item }: { item: JoinRequest }) => {
    const statusColor = STATUS_COLOR[item.status] ?? colors.secondary;
    const statusIcon  = STATUS_ICON[item.status]  ?? 'help-circle';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => handleTripPress(item.tripId)}
      >
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={styles.routeRow}>
            <Ionicons name="location-outline" size={13} color={colors.text.secondary} />
            <Text style={styles.routeText} numberOfLines={1}>
              {item.trip?.from ?? 'Origin'} → {item.trip?.to ?? 'Destination'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
            <Ionicons name={statusIcon} size={12} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Trip title */}
        <Text style={styles.tripTitle} numberOfLines={1}>
          {item.trip?.title ?? `Trip #${item.tripId}`}
        </Text>

        {/* Meta row */}
        <View style={styles.metaRow}>
          {item.trip?.startDate ? (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={13} color={colors.text.hint} />
              <Text style={styles.metaText}>
                {formatDate(item.trip.startDate)}
              </Text>
            </View>
          ) : null}
          {item.trip?.costPerPerson != null ? (
            <View style={styles.metaItem}>
              <Ionicons name="wallet-outline" size={13} color={colors.text.hint} />
              <Text style={styles.metaText}>₹{item.trip.costPerPerson}/seat</Text>
            </View>
          ) : null}
          {item.seats != null ? (
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={13} color={colors.text.hint} />
              <Text style={styles.metaText}>
                {item.seats} seat{item.seats !== 1 ? 's' : ''}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Optional note */}
        {item.message ? (
          <Text style={styles.noteText} numberOfLines={2}>
            Note: {item.message}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>My Bookings</Text>
        {filtered.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filtered.length}</Text>
          </View>
        )}
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, filter === f.key && styles.chipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.chipLabel, filter === f.key && styles.chipLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.danger} />
          <Text style={styles.emptyTitle}>Couldn't load bookings</Text>
          <Text style={styles.emptySubtitle}>Pull down to try again</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="ticket-outline" size={48} color={colors.text.hint} />
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'all' ? 'Search for trips and join one!' : `No ${filter} bookings`}
          </Text>
        </View>
      ) : (
        <FlatList
          // FIX: added ?? [] guard — undefined data crashes FlatList
          data={filtered ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              colors={[colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  screenTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  countBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  countText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  chipLabelActive: {
    color: colors.white,
    fontWeight: fontWeight.semiBold,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  routeText: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: fontWeight.semiBold,
  },
  tripTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.text.hint,
  },
  noteText: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    fontStyle: 'italic',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.hint,
    textAlign: 'center',
  },
});
