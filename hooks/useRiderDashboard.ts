// ─── useRiderDashboard ────────────────────────────────────────────────────────
// Aggregates verification status, active trips, and rider stats in a single
// parallel fetch so the dashboard renders with one loading state.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  // FIX: isMounted ref prevents setState on unmounted component (memory leak warning)
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

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
      // FIX: guard all setStates behind isMounted to avoid memory leak
      if (!isMounted.current) return;
      setVerificationStatus(verStatus);
      // FIX: Array.isArray guard — API might return non-array on error
      setAllTrips(Array.isArray(trips) ? trips : []);
      setStats(riderStats);
    } catch (err: unknown) {
      if (!isMounted.current) return;
      const message =
        err instanceof Error ? err.message : 'Failed to load dashboard.';
      setError(message);
    } finally {
      if (isMounted.current) setLoading(false);
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
