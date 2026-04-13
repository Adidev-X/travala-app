import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import NotificationItem, { ITEM_HEIGHT } from '@/components/NotificationItem';
import colors from '@/constants/colors';
import spacing from '@/constants/spacing';
import { fontSize, fontWeight } from '@/constants/typography';
import { useNotifications } from '@/hooks/useNotifications';
import type { NotificationTab } from '@/hooks/useNotifications';
import type { Notification } from '@/types';

// ─── Tab definitions ──────────────────────────────────────────────────────────

type Tab = { id: NotificationTab; label: string };

const TABS: Tab[] = [
  { id: 'all',          label: 'All' },
  { id: 'trips',        label: 'Trips' },
  { id: 'verification', label: 'Verification' },
  { id: 'system',       label: 'System' },
];

// ─── Navigate helper ──────────────────────────────────────────────────────────

function useNotificationNav() {
  const router = useRouter();
  return useCallback(
    (n: Notification) => {
      switch (n.type) {
        case 'join_accepted':
        case 'join_declined':
        case 'trip_cancelled':
        case 'trip_reminder':
          if (n.meta?.tripId) {
            router.push({
              pathname: '/(tabs)/home/trip-detail',
              params: { tripId: n.meta.tripId },
            });
          }
          break;
        case 'doc_approved':
        case 'doc_rejected':
          router.push('/(tabs)/trips/verification');
          break;
      }
    },
    [router],
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const {
    filteredList,
    loading,
    unreadCount,
    activeTab,
    setActiveTab,
    markAsRead,
    markAllRead,
    refetch,
  } = useNotifications();

  const navigate = useNotificationNav();

  const handlePress = useCallback(
    (n: Notification) => {
      markAsRead(n.id);
      navigate(n);
    },
    [markAsRead, navigate],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => (
      <NotificationItem notification={item} onPress={handlePress} />
    ),
    [handlePress],
  );

  const keyExtractor = useCallback((item: Notification) => item.id, []);

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadCount}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn} activeOpacity={0.75}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Tab filter ── */}
      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.75}>
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── List / Loading / Empty ── */}
      {loading && filteredList.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={filteredList}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={filteredList.length === 0 ? styles.emptyContainer : undefined}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="notifications-off-outline" size={48} color={colors.text.hint} />
              </View>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptyBody}>
                {activeTab === 'all'
                  ? "You're all caught up!"
                  : `No ${activeTab} notifications`}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: colors.background },

  // Header
  header:        {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  heading:       { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
  unreadCount:   { fontSize: fontSize.xs, color: colors.secondary, marginTop: 2 },
  markAllBtn:    {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 8,
  },
  markAllText:   { fontSize: fontSize.xs, color: colors.secondary, fontWeight: fontWeight.medium },

  // Tabs
  tabRow:        {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab:           { flex: 1, paddingVertical: spacing.sm + 2, alignItems: 'center' },
  tabActive:     { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText:       { fontSize: fontSize.xs, color: colors.text.hint, fontWeight: fontWeight.medium },
  tabTextActive: { color: colors.primary, fontWeight: fontWeight.semiBold },

  // Loading
  loader:        { marginTop: spacing.xxl },

  // Empty state
  emptyContainer: { flex: 1 },
  emptyWrap:      { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIconWrap:  {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: `${colors.primary}14`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle:    { fontSize: fontSize.lg, fontWeight: fontWeight.semiBold, color: colors.text.primary, marginBottom: spacing.xs },
  emptyBody:     { fontSize: fontSize.sm, color: colors.text.hint },
});
