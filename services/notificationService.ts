// ─── notificationService ─────────────────────────────────────────────────────
// Fetch and manage in-app notifications.

import { useAuthStore } from '../store/authStore';
import type { ApiResponse, Notification } from '../types';
import apiClient from './apiClient';
import {
    DEMO_NOTIFICATIONS,
    DEMO_TRAVELER_NOTIFICATIONS,
    DEMO_TRAVELER_PHONE,
    isDemoMode,
} from './demoData';

// local mutable copies so mark-read persists within the demo session
let _demoRiderNotifs: Notification[] = DEMO_NOTIFICATIONS.map(n => ({ ...n }));
let _demoTravelerNotifs: Notification[] = DEMO_TRAVELER_NOTIFICATIONS.map(n => ({ ...n }));

function getDemoNotifs(): Notification[] {
  const phone = useAuthStore.getState().user?.phone;
  return phone === DEMO_TRAVELER_PHONE ? _demoTravelerNotifs : _demoRiderNotifs;
}

function setDemoNotifs(notifs: Notification[]): void {
  const phone = useAuthStore.getState().user?.phone;
  if (phone === DEMO_TRAVELER_PHONE) _demoTravelerNotifs = notifs;
  else _demoRiderNotifs = notifs;
}

export const notificationService = {
  /** All notifications for the authenticated user (newest first) */
  getAll: async (): Promise<Notification[]> => {
    if (isDemoMode()) return [...getDemoNotifs()];
    const { data } = await apiClient.get<ApiResponse<Notification[]>>(
      '/notifications',
    );
    return data.data;
  },

  /** Mark a single notification as read */
  markRead: async (id: string): Promise<void> => {
    if (isDemoMode()) {
      setDemoNotifs(getDemoNotifs().map(n => n.id === id ? { ...n, read: true } : n));
      return;
    }
    await apiClient.patch(`/notifications/${id}/read`);
  },

  /** Bulk-mark all notifications as read */
  markAllRead: async (): Promise<void> => {
    if (isDemoMode()) {
      setDemoNotifs(getDemoNotifs().map(n => ({ ...n, read: true })));
      return;
    }
    await apiClient.patch('/notifications/read-all');
  },
};
