// ─── uiStore ─────────────────────────────────────────────────────────────────
// Lightweight UI counters: badge counts for tab bar icons.
// Kept separate so badge re-renders don't touch trip or auth data.

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UIState {
  pendingRequestCount: number;
  unreadNotifCount: number;

  setPendingCount: (count: number) => void;
  setUnreadCount: (count: number) => void;
  decrementPending: () => void;
  decrementUnread: () => void;
  resetCounts: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      pendingRequestCount: 0,
      unreadNotifCount:    0,

      setPendingCount: (count: number) =>
        set({ pendingRequestCount: count }, false, 'ui/setPendingCount'),

      setUnreadCount: (count: number) =>
        set({ unreadNotifCount: count }, false, 'ui/setUnreadCount'),

      decrementPending: () =>
        set(
          { pendingRequestCount: Math.max(0, get().pendingRequestCount - 1) },
          false,
          'ui/decrementPending',
        ),

      decrementUnread: () =>
        set(
          { unreadNotifCount: Math.max(0, get().unreadNotifCount - 1) },
          false,
          'ui/decrementUnread',
        ),

      resetCounts: () =>
        set({ pendingRequestCount: 0, unreadNotifCount: 0 }, false, 'ui/resetCounts'),
    }),
    { name: 'UIStore', enabled: __DEV__ },
  ),
);
