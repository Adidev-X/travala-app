// ─── verificationStore ───────────────────────────────────────────────────────
// Rider verification status cache.
// Calls verificationService.getVerificationStatus() on demand.

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { verificationService } from '../services/verificationService';
import type { VerificationStatus } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VerificationState {
  status: VerificationStatus | null;
  loading: boolean;
  error: string | null;

  setStatus: (status: VerificationStatus) => void;
  /** Fetch fresh status from the API */
  refresh: () => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useVerificationStore = create<VerificationState>()(
  devtools(
    (set) => ({
      status:  null,
      loading: false,
      error:   null,

      setStatus: (status: VerificationStatus) =>
        set({ status }, false, 'verification/setStatus'),

      refresh: async () => {
        set({ loading: true, error: null }, false, 'verification/refresh/start');
        try {
          const status = await verificationService.getVerificationStatus();
          set({ status, loading: false }, false, 'verification/refresh/done');
        } catch (err: unknown) {
          set(
            {
              loading: false,
              error: err instanceof Error ? err.message : 'Failed to load verification status.',
            },
            false,
            'verification/refresh/error',
          );
        }
      },
    }),
    { name: 'VerificationStore', enabled: __DEV__ },
  ),
);
