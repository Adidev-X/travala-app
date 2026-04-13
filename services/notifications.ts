import type { ApiResponse, Notification } from '../types';
import api from './index';

export const notificationService = {
  /** Fetch all notifications for the current user */
  getAll: async (): Promise<Notification[]> => {
    const { data } = await api.get<ApiResponse<Notification[]>>('/notifications');
    return data.data;
  },

  /** Mark a single notification as read */
  markRead: async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  /** Mark all notifications as read */
  markAllRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },
};
