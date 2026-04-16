/**
 * RiderReviewsScreen — All ratings & reviews for the logged-in rider.
 * Route: /(tabs)/trips/my-reviews
 */
import ReviewCard from '@/components/ReviewCard';
import { COLORS } from '@/constants/colors';
import { SHADOWS } from '@/constants/shadows';
import { reviewService } from '@/services/reviewService';
import { useAuthStore } from '@/store/authStore';
import type { Review } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ListRenderItem,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Star summary ────────────────────────────────────────────────────────────
function StarSummary({ avg, total }: { avg: number; total: number }) {
  return (
    <View style={ss.summaryCard}>
      <Text style={ss.avgNumber}>{avg > 0 ? avg.toFixed(1) : '—'}</Text>
      <View style={ss.starRow}>
        {[1, 2, 3, 4, 5].map(n => (
          <Ionicons
            key={n}
            name={n <= Math.round(avg) ? 'star' : 'star-outline'}
            size={22}
            color="#F59E0B"
            style={{ marginRight: 3 }}
          />
        ))}
      </View>
      <Text style={ss.totalText}>
        {total} {total === 1 ? 'rating' : 'ratings'}
      </Text>

      {/* Per-star bar chart */}
      {[5, 4, 3, 2, 1].map(star => <StarBar key={star} star={star} avg={avg} />)}
    </View>
  );
}

function StarBar({ star, avg }: { star: number; avg: number }) {
  // Simple visual: fill width proportional to how close avg is to this star
  const fill = avg > 0 ? Math.max(0, Math.min(1, 1 - Math.abs(avg - star) / 5)) : 0;
  return (
    <View style={ss.barRow}>
      <Text style={ss.barLabel}>{star}</Text>
      <Ionicons name="star" size={10} color="#F59E0B" />
      <View style={ss.barBg}>
        <View style={[ss.barFill, { width: `${Math.round(fill * 100)}%` as `${number}%` }]} />
      </View>
    </View>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyReviews() {
  return (
    <View style={ss.emptyWrap}>
      <Ionicons name="star-outline" size={48} color={COLORS.slate300} />
      <Text style={ss.emptyTitle}>No reviews yet</Text>
      <Text style={ss.emptySub}>Complete trips to start receiving ratings from travelers</Text>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function RiderReviewsScreen() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    reviewService
      .getByRider(user.id)
      .then(data => setReviews(data))
      .catch(() => setError('Could not load reviews. Please try again.'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const avg = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  const keyExtractor = useCallback((item: Review) => item.id, []);
  const renderItem: ListRenderItem<Review> = useCallback(
    ({ item }) => <ReviewCard review={item} />,
    [],
  );

  return (
    <View style={ss.root}>
      {/* Header */}
      <View style={ss.headerBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={ss.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color={COLORS.slate800} />
        </TouchableOpacity>
        <Text style={ss.headerTitle}>My Ratings</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={ss.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={ss.loadingWrap}>
          <Ionicons name="alert-circle-outline" size={32} color={COLORS.danger} />
          <Text style={ss.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={<StarSummary avg={avg} total={reviews.length} />}
          ListEmptyComponent={<EmptyReviews />}
          contentContainerStyle={ss.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const ss = StyleSheet.create({
  root:        { flex: 1, backgroundColor: COLORS.background },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText:   { fontSize: 14, color: COLORS.danger, textAlign: 'center', paddingHorizontal: 32 },

  // Header
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.slate100,
    ...SHADOWS.xs,
  },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.slate900 },

  listContent: { padding: 16, paddingBottom: 40 },

  // Summary card
  summaryCard: {
    backgroundColor: COLORS.white, borderRadius: 20, padding: 20,
    alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: COLORS.slate100,
    ...SHADOWS.sm,
  },
  avgNumber:  { fontSize: 52, fontWeight: '800', color: COLORS.slate900, lineHeight: 60 },
  starRow:    { flexDirection: 'row', marginTop: 6, marginBottom: 4 },
  totalText:  { fontSize: 13, color: COLORS.slate400, fontWeight: '500', marginBottom: 16 },

  // Bar chart
  barRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, width: '100%', marginTop: 6 },
  barLabel: { fontSize: 11, color: COLORS.slate500, width: 10, textAlign: 'right' },
  barBg:    { flex: 1, height: 6, backgroundColor: COLORS.slate100, borderRadius: 3 },
  barFill:  { height: 6, backgroundColor: '#F59E0B', borderRadius: 3 },

  // Empty
  emptyWrap:  { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.slate400 },
  emptySub:   { fontSize: 13, color: COLORS.slate300, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },
});
