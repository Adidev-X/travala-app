// ─── useJoinRequests ─────────────────────────────────────────────────────────
// Manages join-request data for a single trip: fetch, optimistic accept/decline,
// and tab-based filtering.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { requestService } from '../services/requestService';
import type { JoinRequest, JoinRequestStatus } from '../types';

export interface UseJoinRequestsReturn {
  /** Full list (all statuses) */
  requests: JoinRequest[];
  /** Filtered by activeTab */
  filteredRequests: JoinRequest[];
  loading: boolean;
  refreshing: boolean;
  activeTab: JoinRequestStatus;
  setTab: (tab: JoinRequestStatus) => void;
  accept: (requestId: string) => Promise<void>;
  decline: (requestId: string) => Promise<void>;
  refresh: () => void;
  pendingCount: number;
  acceptedCount: number;
  declinedCount: number;
}

export function useJoinRequests(tripId: string): UseJoinRequestsReturn {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<JoinRequestStatus>('pending');

  // ── Derived counts ────────────────────────────────────────────────────────
  const pendingCount = useMemo(
    () => requests.filter(r => r.status === 'pending').length,
    [requests],
  );
  const acceptedCount = useMemo(
    () => requests.filter(r => r.status === 'accepted').length,
    [requests],
  );
  const declinedCount = useMemo(
    () => requests.filter(r => r.status === 'declined').length,
    [requests],
  );

  const filteredRequests = useMemo(
    () => requests.filter(r => r.status === activeTab),
    [requests, activeTab],
  );

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const load = useCallback(async (isRefresh = false) => {
    if (!tripId) {
      setLoading(false);
      return;
    }
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const data = await requestService.getByTrip(tripId);
      // CRASH FIX: Array.isArray guard — API may return null/undefined on error states
      if (isMounted.current) setRequests(Array.isArray(data) ? data : []);
    } catch {
      // CRASH FIX: missing catch block — unhandled rejection crashed the component tree
      if (isMounted.current) setRequests([]);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [tripId]);

  useEffect(() => { load(false); }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  // ── Optimistic accept ─────────────────────────────────────────────────────
  const accept = useCallback(async (requestId: string) => {
    // snapshot for rollback
    const prev = requests;
    setRequests(rs => rs.map(r => r.id === requestId ? { ...r, status: 'accepted' as JoinRequestStatus } : r));
    try {
      const updated = await requestService.accept(requestId);
      setRequests(rs => rs.map(r => r.id === requestId ? updated : r));
    } catch {
      // rollback
      setRequests(prev);
      throw new Error('Failed to accept request');
    }
  }, [requests]);

  // ── Optimistic decline ────────────────────────────────────────────────────
  const decline = useCallback(async (requestId: string) => {
    const prev = requests;
    setRequests(rs => rs.map(r => r.id === requestId ? { ...r, status: 'declined' as JoinRequestStatus } : r));
    try {
      const updated = await requestService.decline(requestId);
      setRequests(rs => rs.map(r => r.id === requestId ? updated : r));
    } catch {
      setRequests(prev);
      throw new Error('Failed to decline request');
    }
  }, [requests]);

  return {
    requests,
    filteredRequests,
    loading,
    refreshing,
    activeTab,
    setTab: setActiveTab,
    accept,
    decline,
    refresh,
    pendingCount,
    acceptedCount,
    declinedCount,
  };
}
