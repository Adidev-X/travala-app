// ─── useRiderDashboard ────────────────────────────────────────────────────────
// Aggregates verification status, active trips, and rider stats in a single
// parallel fetch so the dashboard renders with one loading state.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { tripService } from '../services/trips';
import { userService } from '../services/userService';
import { verificationService } from '../services/verificationService';
import type { RiderStats, Trip, VerificationStatus } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseRiderDashboardReturn {
  // Data
  verificationStatus: VerificationStatus | null;
  activeTrips: Trip[];
  stats: RiderStats | null;
  // Derived
  isVerified: boolean;
  pendingRequestCount: number;
  // Async state
  loading: boolean;
  error: string | null;
  // Actions
  refresh: () => void;
}

// ─── Default empty stats ──────────────────────────────────────────────────────

const DEFAULT_STATS: RiderStats = {
  tripsPosted: 0,
  peopleHelped: 0,
  avgRating: 0,
  pendingRequestCount: 0,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRiderDashboard(): UseRiderDashboardReturn {
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus | null>(null);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState<RiderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch all in parallel ──────────────────────────────────────────────────

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [verStatus, trips, riderStats] = await Promise.all([
        verificationService.getVerificationStatus(),
        tripService.getMyTrips(),
        userService.getRiderStats(),
      ]);
      setVerificationStatus(verStatus);
      setAllTrips(trips);
      setStats(riderStats);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load dashboard.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // ── Derived values ─────────────────────────────────────────────────────────

  const activeTrips = useMemo(
    () => allTrips.filter(t => t.status === 'active' || t.status === 'full'),
    [allTrips],
  );

  /** Hard gate: both RC and DL must be admin-approved. */
  const isVerified = useMemo(
    () =>
      verificationStatus !== null &&
      verificationStatus.rc.status === 'approved' &&
      verificationStatus.dl.status === 'approved',
    [verificationStatus],
  );

  const pendingRequestCount = useMemo(
    () => stats?.pendingRequestCount ?? 0,
    [stats],
  );

  return {
    verificationStatus,
    activeTrips,
    stats: stats ?? DEFAULT_STATS,
    isVerified,
    pendingRequestCount,
    loading,
    error,
    refresh: fetch,
  };
}
