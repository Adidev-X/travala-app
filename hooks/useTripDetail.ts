// ─── useTripDetail ───────────────────────────────────────────────────────────
// Fetches one trip and manages save/unsave state.

import { useCallback, useEffect, useRef, useState } from 'react';
import { tripService } from '../services/trips';
import type { Trip } from '../types';

export interface UseTripDetailReturn {
  trip: Trip | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
  isSaved: boolean;
  toggleSave: () => void;
}

export function useTripDetail(tripId: string): UseTripDetailReturn {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const load = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await tripService.getTripById(tripId);
      if (isMounted.current) setTrip(data);
    } catch {
      if (isMounted.current) setError('Could not load trip details.');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [tripId]);

  useEffect(() => { load(); }, [load]);

  const toggleSave = useCallback(() => {
    setIsSaved(prev => !prev);
    // TODO: persist via user-saves API endpoint when available
  }, []);

  return { trip, loading, error, retry: load, isSaved, toggleSave };
}
