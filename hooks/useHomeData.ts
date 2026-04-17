import { tripService } from '@/services/trips';
import type { Trip } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';

const STALE_MS = 60_000; // 60 seconds — revalidate if older

type TrendingRoute = { from: string; to: string; tripCount: number };

interface HomeData {
  trending: TrendingRoute[];
  localTrips: Trip[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useHomeData(userCity?: string): HomeData {
  const [trending, setTrending] = useState<TrendingRoute[]>([]);
  const [localTrips, setLocalTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SWR-style: remember when we last successfully fetched
  const lastFetchedAt = useRef<number>(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const fetchData = useCallback(async (force = false) => {
    const age = Date.now() - lastFetchedAt.current;
    if (!force && age < STALE_MS && (trending.length > 0 || localTrips.length > 0)) {
      // Data is still fresh — skip network call (stale-while-revalidate)
      return;
    }

    if (!isMounted.current) return;
    setLoading(true);
    setError(null);

    try {
      const [trendingData, cityTrips] = await Promise.allSettled([
        tripService.getTrending(),
        userCity ? tripService.getByCity(userCity) : Promise.resolve<Trip[]>([]),
      ]);

      if (!isMounted.current) return;

      // FIX: Array.isArray guards — API returns may not be arrays if response is malformed
      if (trendingData.status === 'fulfilled') {
        setTrending(Array.isArray(trendingData.value) ? trendingData.value : []);
      }
      if (cityTrips.status === 'fulfilled') {
        setLocalTrips(Array.isArray(cityTrips.value) ? cityTrips.value : []);
      }

      if (trendingData.status === 'rejected' && cityTrips.status === 'rejected') {
        setError('Could not load trips. Pull down to retry.');
      }

      lastFetchedAt.current = Date.now();
    } catch {
      if (isMounted.current) setError('Could not load trips. Pull down to retry.');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [userCity, trending.length, localTrips.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return { trending, localTrips, loading, error, refetch };
}

export default useHomeData;
