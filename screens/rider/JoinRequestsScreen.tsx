// ─── JoinRequestsScreen ──────────────────────────────────────────────────────
// Rider-facing screen to manage join requests for a single trip.
// Tabs: Pending | Accepted | Declined.  Optimistic accept/decline via hook.

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { memo, useCallback } from 'react';
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
import { useJoinRequests } from '../../hooks/useJoinRequests';
import type { JoinRequest, JoinRequestStatus } from '../../types';
import type { JoinRequestsParams } from '../../navigation/types';

// ─── "Time ago" helper ────────────────────────────────────────────────────────

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Avatar initials ──────────────────────────────────────────────────────────

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0][0] ?? '?').toUpperCase();
}

// ─── Tab config ───────────────────────────────────────────────────────────────

interface TabConfig {
  status: JoinRequestStatus;
  label: string;
  count: number;
}

// ─── JoinRequestCard ──────────────────────────────────────────────────────────

interface JoinRequestCardProps {
  item: JoinRequest;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onRemove: (id: string) => void;
  processing: boolean;
}

const CARD_HEIGHT = 100; // used for getItemLayout

const JoinRequestCard = memo(function JoinRequestCard({
  item,
  onAccept,
  onDecline,
  onRemove,
  processing,
}: JoinRequestCardProps) {
  const initials = initialsOf(item.userName);
  const ago = timeAgo(item.createdAt);
  const ratingStr = item.userRating > 0 ? item.userRating.toFixed(1) : '—';

  return (
    <View style={cs.card}>
      {/* ── Header row: avatar + info + status chip ── */}
      <View style={cs.headerRow}>
        {/* Avatar */}
        <View style={cs.avatar}>
          <Text style={cs.avatarText}>{initials}</Text>
        </View>

        {/* Name + meta */}
        <View style={cs.info}>
          <View style={cs.nameRow}>
            <Text style={cs.name} numberOfLines={1}>{item.userName}</Text>
            <Text style={cs.rating}>
              {ratingStr}
              <Text style={cs.ratingStar}>★</Text>
            </Text>
          </View>
          <Text style={cs.ago}>Requested {ago}</Text>
        </View>

        {/* Status chip for accepted / declined */}
        {item.status === 'accepted' && (
          <View style={[cs.chip, cs.chipAccepted]}>
            <Text style={[cs.chipText, cs.chipTextAccepted]}>Accepted</Text>
          </View>
        )}
        {item.status === 'declined' && (
          <View style={[cs.chip, cs.chipDeclined]}>
            <Text style={[cs.chipText, cs.chipTextDeclined]}>Declined</Text>
          </View>
        )}
      </View>

      {/* ── Actions for pending ── */}
      {item.status === 'pending' && (
        <View style={cs.actions}>
          <TouchableOpacity
            style={[cs.btn, cs.btnAccept, processing && cs.btnDisabled]}
            onPress={() => onAccept(item.id)}
            disabled={processing}
            activeOpacity={0.8}
          >
            {processing ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark" size={15} color={colors.white} />
                <Text style={cs.btnTextLight}>Accept</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[cs.btn, cs.btnDecline, processing && cs.btnDisabled]}
            onPress={() => onDecline(item.id)}
            disabled={processing}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={15} color={colors.danger} />
            <Text style={[cs.btnTextLight, { color: colors.danger }]}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Remove link for accepted ── */}
      {item.status === 'accepted' && (
        <TouchableOpacity style={cs.removeLink} onPress={() => onRemove(item.id)} activeOpacity={0.7}>
          <Text style={cs.removeLinkText}>Remove</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function JoinRequestsScreen() {
  const { tripId = '', tripTitle = 'Trip' } =
    useLocalSearchParams<JoinRequestsParams>();

  const {
    filteredRequests,
    loading,
    refreshing,
    activeTab,
    setTab,
    accept,
    decline,
    refresh,
    pendingCount,
    acceptedCount,
    declinedCount,
  } = useJoinRequests(tripId);

  // ── Processing map: requestId → boolean ──────────────────────────────────
  const [processingIds, setProcessingIds] = React.useState<Set<string>>(
    new Set(),
  );

  const markProcessing = (id: string, on: boolean) =>
    setProcessingIds(prev => {
      const next = new Set(prev);
      on ? next.add(id) : next.delete(id);
      return next;
    });

  // ── Accept ────────────────────────────────────────────────────────────────
  const handleAccept = useCallback(
    async (requestId: string) => {
      markProcessing(requestId, true);
      try {
        await accept(requestId);
      } catch {
        Alert.alert('Error', 'Could not accept request. Please try again.');
      } finally {
        markProcessing(requestId, false);
      }
    },
    [accept],
  );

  // ── Decline ───────────────────────────────────────────────────────────────
  const handleDecline = useCallback(
    async (requestId: string) => {
      Alert.alert('Decline Request', 'Are you sure you want to decline?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            markProcessing(requestId, true);
            try {
              await decline(requestId);
            } catch {
              Alert.alert('Error', 'Could not decline request. Please try again.');
            } finally {
              markProcessing(requestId, false);
            }
          },
        },
      ]);
    },
    [decline],
  );

  // ── Remove (re-decline accepted) ──────────────────────────────────────────
  const handleRemove = useCallback(
    async (requestId: string) => {
      Alert.alert('Remove Traveler', 'Remove this accepted traveler?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            markProcessing(requestId, true);
            try {
              await decline(requestId);
            } catch {
              Alert.alert('Error', 'Could not remove traveler.');
            } finally {
              markProcessing(requestId, false);
            }
          },
        },
      ]);
    },
    [decline],
  );

  // ── Tab config ────────────────────────────────────────────────────────────
  const TABS: TabConfig[] = [
    { status: 'pending', label: 'Pending', count: pendingCount },
    { status: 'accepted', label: 'Accepted', count: acceptedCount },
    { status: 'declined', label: 'Declined', count: declinedCount },
  ];

  // ── FlatList helpers ──────────────────────────────────────────────────────
  const keyExtractor = useCallback((item: JoinRequest) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: CARD_HEIGHT,
      offset: CARD_HEIGHT * index,
      index,
    }),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: JoinRequest }) => (
      <JoinRequestCard
        item={item}
        onAccept={handleAccept}
        onDecline={handleDecline}
        onRemove={handleRemove}
        processing={processingIds.has(item.id)}
      />
    ),
    [handleAccept, handleDecline, handleRemove, processingIds],
  );

  const EMPTY_CONFIG: Record<JoinRequestStatus, { icon: keyof typeof Ionicons.glyphMap; message: string }> = {
    pending: { icon: 'hourglass-outline', message: 'No pending requests.' },
    accepted: { icon: 'people-circle-outline', message: 'No accepted travelers yet.' },
    declined: { icon: 'person-remove-outline', message: 'No declined requests.' },
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={ss.flex}>
        <View style={ss.header}>
          <Text style={ss.headerTitle} numberOfLines={1}>
            {tripTitle} — Requests
          </Text>
        </View>
        <View style={ss.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={ss.flex}>
      {/* ── Header ── */}
      <View style={ss.header}>
        <Text style={ss.headerTitle} numberOfLines={1} adjustsFontSizeToFit>
          {tripTitle} — Requests
        </Text>
      </View>

      {/* ── Tab Row ── */}
      <View style={ss.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.status}
            style={[ss.tab, activeTab === tab.status && ss.tabActive]}
            onPress={() => setTab(tab.status)}
            activeOpacity={0.8}
          >
            <Text style={[ss.tabLabel, activeTab === tab.status && ss.tabLabelActive]}>
              {tab.label}
              {tab.count > 0 ? (
                <Text style={ss.tabCount}> {tab.count}</Text>
              ) : null}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── List ── */}
      <FlatList
        data={filteredRequests}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={
          filteredRequests.length === 0
            ? ss.listEmpty
            : { padding: spacing.sm, paddingBottom: spacing.xxl }
        }
        ListEmptyComponent={
          <View style={ss.emptyWrap}>
            <Ionicons
              name={EMPTY_CONFIG[activeTab].icon}
              size={52}
              color={colors.text.hint}
            />
            <Text style={ss.emptyText}>{EMPTY_CONFIG[activeTab].message}</Text>
          </View>
        }
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
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },

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
  tabLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text.hint },
  tabLabelActive: { color: colors.primary, fontWeight: fontWeight.semiBold },
  tabCount: { fontSize: fontSize.xs, color: colors.warning, fontWeight: fontWeight.bold },

  listEmpty: { flex: 1 },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl + spacing.xl,
    gap: spacing.sm,
  },
  emptyText: { fontSize: fontSize.md, color: colors.text.hint, textAlign: 'center' },
});

// ─── Card styles ──────────────────────────────────────────────────────────────

const cs = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    minHeight: CARD_HEIGHT,
  },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: `${colors.primary}1a`,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary },

  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  name: { flex: 1, fontSize: fontSize.md, fontWeight: fontWeight.semiBold, color: colors.text.primary },
  rating: { fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: fontWeight.medium },
  ratingStar: { color: '#F5A623' },
  ago: { fontSize: fontSize.xs, color: colors.text.hint, marginTop: 2 },

  // Status chips
  chip: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: 8 },
  chipAccepted: { backgroundColor: colors.statusAccepted },
  chipTextAccepted: { color: colors.statusAcceptedText },
  chipDeclined: { backgroundColor: `${colors.text.hint}22` },
  chipTextDeclined: { color: colors.text.hint },
  chipText: { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold },

  // Pending actions
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: spacing.xs + 2,
    borderRadius: 9,
  },
  btnAccept: { backgroundColor: colors.success },
  btnDecline: {
    backgroundColor: `${colors.danger}12`,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  btnDisabled: { opacity: 0.5 },
  btnTextLight: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.white },

  // Remove link
  removeLink: { marginTop: spacing.xs, alignSelf: 'flex-end' },
  removeLinkText: { fontSize: fontSize.xs, color: colors.danger, fontWeight: fontWeight.medium },
});
