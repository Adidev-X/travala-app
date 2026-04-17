// ─── AllRequestsScreen ───────────────────────────────────────────────────────
// Shows ALL join requests across all of the rider's trips, grouped by trip.
// Footer "Requests" tab lands here.

import colors from '@/constants/colors';
import spacing from '@/constants/spacing';
import { fontSize, fontWeight } from '@/constants/typography';
import { requestService } from '@/services/requestService';
import { tripService } from '@/services/trips';
import type { JoinRequest, Trip } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function initialsOf(name: string) {
  const p = name.trim().split(/\s+/);
  if (p.length >= 2) return (p[0]![0]! + p[1]![0]!).toUpperCase();
  return (p[0]?.[0] ?? '?').toUpperCase();
}

const STATUS: Record<string, { bg: string; fg: string; dot: string; label: string }> = {
  pending:  { bg: colors.statusPending,    fg: colors.statusPendingText,  dot: '#F59E0B', label: 'Pending'  },
  accepted: { bg: colors.statusAccepted,   fg: colors.statusAcceptedText, dot: '#10B981', label: 'Accepted' },
  declined: { bg: `${colors.text.hint}1A`, fg: colors.text.hint,          dot: '#94A3B8', label: 'Declined' },
};

// ─── Request row ─────────────────────────────────────────────────────────────

function RequestRow({ req }: { req: JoinRequest }) {
  const s = STATUS[req.status] ?? STATUS['pending']!;
  const rating = req.userRating > 0 ? req.userRating.toFixed(1) : '—';

  return (
    <View style={rs.row}>
      <View style={rs.avatar}>
        <Text style={rs.avatarTxt}>{initialsOf(req.userName)}</Text>
      </View>
      <View style={rs.info}>
        <Text style={rs.name} numberOfLines={1}>{req.userName}</Text>
        <Text style={rs.meta} numberOfLines={1}>
          <Text style={rs.star}>★</Text>{' '}{rating}{'  ·  '}{timeAgo(req.createdAt)}{' · '}{formatDate(req.createdAt)}
        </Text>
      </View>
      <View style={[rs.pill, { backgroundColor: s.bg }]}>
        <View style={[rs.dot, { backgroundColor: s.dot }]} />
        <Text style={[rs.pillTxt, { color: s.fg }]}>{s.label}</Text>
      </View>
    </View>
  );
}

// ─── Trip group card ──────────────────────────────────────────────────────────

interface TripGroup { trip: Trip; requests: JoinRequest[]; pending: number; accepted: number }

function TripGroupCard({ group, onPress }: { group: TripGroup; onPress: () => void }) {
  const { trip, requests, pending, accepted } = group;

  return (
    <View style={gc.card}>
      {/* Trip header */}
      <TouchableOpacity style={gc.header} onPress={onPress} activeOpacity={0.82}>
        <View style={gc.iconWrap}>
          <Ionicons
            name={trip.type === 'full_tour' ? 'compass-outline' : 'arrow-forward-circle-outline'}
            size={18} color={colors.primary}
          />
        </View>
        <View style={gc.titleBlock}>
          <Text style={gc.title} numberOfLines={1}>{trip.title}</Text>
          <Text style={gc.route} numberOfLines={1}>{trip.from} → {trip.to}</Text>
        </View>
        <View style={gc.rightBlock}>
          {pending > 0 && (
            <View style={gc.pendingPill}>
              <Text style={gc.pendingTxt}>{pending}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={15} color={colors.text.hint} />
        </View>
      </TouchableOpacity>

      {/* Stats */}
      <View style={gc.statsRow}>
        <View style={gc.stat}>
          <Text style={[gc.statNum, { color: '#F59E0B' }]}>{pending}</Text>
          <Text style={gc.statLbl}>Pending</Text>
        </View>
        <View style={gc.statDiv} />
        <View style={gc.stat}>
          <Text style={[gc.statNum, { color: colors.success }]}>{accepted}</Text>
          <Text style={gc.statLbl}>Accepted</Text>
        </View>
        <View style={gc.statDiv} />
        <View style={gc.stat}>
          <Text style={[gc.statNum, { color: colors.text.secondary }]}>{requests.length}</Text>
          <Text style={gc.statLbl}>Total</Text>
        </View>
      </View>

      {/* Preview (up to 3) */}
      {requests.slice(0, 3).map(req => (
        <View key={req.id}>
          <View style={gc.sep} />
          <RequestRow req={req} />
        </View>
      ))}

      {/* Footer CTA */}
      <TouchableOpacity style={gc.footer} onPress={onPress} activeOpacity={0.8}>
        <Text style={gc.footerTxt}>
          {requests.length > 3 ? `View all ${requests.length} requests` : 'View & manage requests'}
        </Text>
        <Ionicons name="arrow-forward" size={14} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AllRequestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [trips, setTrips]           = useState<Trip[]>([]);
  const [requests, setRequests]     = useState<JoinRequest[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // CRASH FIX: isMounted ref prevents setState on unmounted component
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [myTrips, allReqs] = await Promise.all([
        tripService.getMyTrips(),
        requestService.getAllForRider(),
      ]);
      // CRASH FIX: Array.isArray guards — API may return null/undefined on error states
      if (isMounted.current) {
        setTrips(Array.isArray(myTrips) ? myTrips : []);
        setRequests(Array.isArray(allReqs) ? allReqs : []);
      }
    } catch {
      // CRASH FIX: missing catch block — unhandled rejection crashed the component tree
      if (isMounted.current) {
        setTrips([]);
        setRequests([]);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => { load(false); }, [load]);

  const groups: TripGroup[] = useMemo(() => trips
    .map(trip => ({
      trip,
      requests: requests.filter(r => r.tripId === trip.id),
      pending:  requests.filter(r => r.tripId === trip.id && r.status === 'pending').length,
      accepted: requests.filter(r => r.tripId === trip.id && r.status === 'accepted').length,
    }))
    .filter(g => g.requests.length > 0)
    .sort((a, b) => b.pending - a.pending),
  [trips, requests]);

  const totalPending  = useMemo(() => requests.filter(r => r.status === 'pending').length,  [requests]);
  const totalAccepted = useMemo(() => requests.filter(r => r.status === 'accepted').length, [requests]);
  const totalDeclined = useMemo(() => requests.filter(r => r.status === 'declined').length, [requests]);

  const goTrip = useCallback((trip: Trip) => {
    router.push({ pathname: '/(tabs)/trips/join-requests' as never, params: { tripId: trip.id, tripTitle: trip.title } });
  }, [router]);

  if (loading) {
    return (
      <View style={ss.flex}>
        <View style={[ss.header, { paddingTop: insets.top + spacing.sm }]}>
          <Text style={ss.headerTitle}>All Requests</Text>
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
      <View style={[ss.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={ss.headerLeft}>
          <Text style={ss.headerTitle}>All Requests</Text>
          <Text style={ss.headerSub}>
            {groups.length} trip{groups.length !== 1 ? 's' : ''} with requests
          </Text>
        </View>
        {totalPending > 0 && (
          <View style={ss.pendingBadge}>
            <View style={ss.pendingDot} />
            <Text style={ss.pendingBadgeTxt}>{totalPending} pending</Text>
          </View>
        )}
      </View>

      {/* ── Summary row ── */}
      {requests.length > 0 && (
        <View style={ss.summaryRow}>
          <View style={ss.sumItem}>
            <Ionicons name="hourglass-outline" size={14} color="#F59E0B" />
            <Text style={[ss.sumTxt, { color: '#92400E' }]}>{totalPending} Pending</Text>
          </View>
          <View style={ss.sumDiv} />
          <View style={ss.sumItem}>
            <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} />
            <Text style={[ss.sumTxt, { color: colors.success }]}>{totalAccepted} Accepted</Text>
          </View>
          <View style={ss.sumDiv} />
          <View style={ss.sumItem}>
            <Ionicons name="close-circle-outline" size={14} color={colors.text.hint} />
            <Text style={[ss.sumTxt, { color: colors.text.hint }]}>{totalDeclined} Declined</Text>
          </View>
        </View>
      )}

      {/* ── List or Empty ── */}
      {groups.length === 0 ? (
        <View style={ss.empty}>
          <View style={ss.emptyIcon}>
            <Ionicons name="people-outline" size={40} color={colors.primary} />
          </View>
          <Text style={ss.emptyTitle}>No requests yet</Text>
          <Text style={ss.emptySub}>
            When travelers send join requests for your trips, they'll appear here grouped by trip.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={ss.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }>
          {groups.map(group => (
            <TripGroupCard key={group.trip.id} group={group} onPress={() => goTrip(group.trip)} />
          ))}
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const ss = StyleSheet.create({
  flex:    { flex: 1, backgroundColor: colors.background },
  centered:{ flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.card,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerLeft:  { flex: 1 },
  headerTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
  headerSub:   { fontSize: fontSize.xs, color: colors.text.hint, marginTop: 2 },

  pendingBadge:   { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: `${colors.danger}12`, borderWidth: 1, borderColor: `${colors.danger}30`, paddingHorizontal: spacing.sm + 2, paddingVertical: 5, borderRadius: 20 },
  pendingDot:     { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.danger },
  pendingBadgeTxt:{ fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.danger },

  summaryRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  sumItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  sumTxt:  { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold },
  sumDiv:  { width: 1, height: 16, backgroundColor: colors.border },

  listContent: { padding: spacing.md, gap: spacing.md },

  empty:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.sm },
  emptyIcon: { width: 80, height: 80, borderRadius: 20, backgroundColor: `${colors.primary}10`, justifyContent: 'center', alignItems: 'center' },
  emptyTitle:{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  emptySub:  { fontSize: fontSize.sm, color: colors.text.hint, textAlign: 'center', lineHeight: 20 },
});

const gc = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },

  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, gap: spacing.sm, backgroundColor: `${colors.primary}06`, borderBottomWidth: 1, borderBottomColor: colors.border },
  iconWrap:   { width: 36, height: 36, borderRadius: 10, backgroundColor: `${colors.primary}12`, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  titleBlock: { flex: 1, minWidth: 0 },
  title:      { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text.primary },
  route:      { fontSize: fontSize.xs, color: colors.text.hint, marginTop: 2 },
  rightBlock: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  pendingPill:{ minWidth: 22, height: 22, borderRadius: 11, backgroundColor: colors.danger, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  pendingTxt: { fontSize: 11, fontWeight: fontWeight.bold, color: colors.white },

  statsRow:  { flexDirection: 'row', backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
  stat:      { flex: 1, alignItems: 'center', paddingVertical: spacing.sm },
  statNum:   { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  statLbl:   { fontSize: 10, color: colors.text.hint, marginTop: 1, fontWeight: fontWeight.medium },
  statDiv:   { width: 1, backgroundColor: colors.border, marginVertical: spacing.sm },

  sep:    { height: 1, backgroundColor: colors.border },

  footer:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.sm + 2, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: `${colors.primary}04` },
  footerTxt: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.primary },
});

const rs = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, gap: spacing.sm },
  avatar:   { width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.primary}15`, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  avatarTxt:{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primary },
  info:     { flex: 1, minWidth: 0 },
  name:     { fontSize: fontSize.md, fontWeight: fontWeight.semiBold, color: colors.text.primary },
  meta:     { fontSize: fontSize.xs, color: colors.text.hint, marginTop: 2 },
  star:     { color: '#F5A623' },
  pill:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 20, flexShrink: 0 },
  dot:      { width: 6, height: 6, borderRadius: 3 },
  pillTxt:  { fontSize: 11, fontWeight: fontWeight.bold },
});
