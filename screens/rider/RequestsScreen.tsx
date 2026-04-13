import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { tripService } from '../../services/trips';
import { useTripStore } from '../../store/tripStore';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import strings from '../../constants/strings';
import type { JoinRequest } from '../../types';

export default function RequestsScreen() {
  // In a real app you'd pick the active tripId from route params or a selector
  const { requests, setRequests, updateRequest } = useTripStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: receive tripId via navigation params
    (async () => {
      setLoading(true);
      try {
        // placeholder — replace with real tripId
        const reqs = await tripService.getTripRequests('__TRIP_ID__');
        setRequests(reqs);
      } finally {
        setLoading(false);
      }
    })();
  }, [setRequests]);

  const handleRespond = async (
    requestId: string,
    status: 'accepted' | 'declined',
  ) => {
    try {
      const updated = await tripService.respondToRequest(requestId, status);
      updateRequest(requestId, { status: updated.status });
    } catch {
      // TODO: surface error
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: JoinRequest }) => (
    <View style={styles.card}>
      <View style={styles.userRow}>
        {item.userPhoto ? (
          <Image source={{ uri: item.userPhoto }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {item.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.rating}>⭐ {item.userRating.toFixed(1)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.status === 'pending' && styles.badgePending,
            item.status === 'accepted' && styles.badgeAccepted,
            item.status === 'declined' && styles.badgeDeclined,
          ]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      {item.status === 'pending' && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.acceptBtn]}
            onPress={() => handleRespond(item.id, 'accepted')}>
            <Text style={styles.actionBtnText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.declineBtn]}
            onPress={() => handleRespond(item.id, 'declined')}>
            <Text style={styles.actionBtnText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={requests}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      contentContainerStyle={requests.length === 0 ? styles.emptyContainer : undefined}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No join requests yet.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.text.hint, fontSize: fontSize.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    margin: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  userName: { fontSize: fontSize.md, fontWeight: fontWeight.semiBold, color: colors.text.primary },
  rating: { fontSize: fontSize.sm, color: colors.text.secondary },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgePending: { backgroundColor: colors.statusPending },
  badgeAccepted: { backgroundColor: colors.statusAccepted },
  badgeDeclined: { backgroundColor: colors.statusDeclined },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.text.primary },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    alignItems: 'center',
  },
  acceptBtn: { backgroundColor: colors.success },
  declineBtn: { backgroundColor: colors.danger },
  actionBtnText: { color: colors.white, fontWeight: fontWeight.semiBold, fontSize: fontSize.sm },
});
