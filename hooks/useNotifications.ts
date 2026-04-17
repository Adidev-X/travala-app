import { notificationService } from '@/services/notifications';
import type { Notification, NotificationCategory } from '@/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type NotificationTab = 'all' | NotificationCategory;

const TAB_TYPES: Record<NotificationCategory, string[]> = {
  trips:        ['join_accepted', 'join_declined', 'trip_cancelled', 'trip_reminder'],
  verification: ['doc_approved', 'doc_rejected'],
  system:       [],
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(false);
  const [activeTab, setActiveTab]         = useState<NotificationTab>('all');

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.getAll();
      // FIX: Array.isArray guard — API might return non-array on error
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      // silently fail — offline / no notifications
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Filtered list (memoized) ───────────────────────────────────────────────
  const filteredList = useMemo<Notification[]>(() => {
    if (activeTab === 'all') return notifications;
    const typeSet = new Set(TAB_TYPES[activeTab]);
    if (typeSet.size === 0) {
      // system = everything NOT in trips or verification
      const allCategorised = new Set([
        ...TAB_TYPES.trips,
        ...TAB_TYPES.verification,
      ]);
      return notifications.filter(n => !allCategorised.has(n.type));
    }
    return notifications.filter(n => typeSet.has(n.type));
  }, [notifications, activeTab]);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications],
  );

  // ── Mark single read ───────────────────────────────────────────────────────
  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n)),
    );
    try {
      await notificationService.markRead(id);
    } catch {
      // Revert optimistic update on failure
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: false } : n)),
      );
    }
  }, []);

  // ── Mark all read ──────────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await notificationService.markAllRead();
    } catch {
      // Revert optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, read: false })));
    }
  }, []);

  return {
    notifications,
    filteredList,
    loading,
    unreadCount,
    activeTab,
    setActiveTab,
    markAsRead,
    markAllRead,
    refetch: load,
  };
}

export default useNotifications;
