import { useCallback } from 'react';
import { tripService } from '../services/trips';
import { useTripStore } from '../store/tripStore';
import type { Trip } from '../types';
import useFetch from './useFetch';

interface UseTripsOptions {
  from?: string;
  to?: string;
  date?: string;
}

/**
 * useTrips — fetches trip list and syncs to Zustand tripStore.
 * @example
 * const { trips, loading, error, refetch } = useTrips({ from: 'Delhi', to: 'Manali' });
 */
function useTrips(options: UseTripsOptions = {}) {
  const { trips, setTrips } = useTripStore();

  const params = new URLSearchParams();
  if (options.from) params.set('from', options.from);
  if (options.to) params.set('to', options.to);
  if (options.date) params.set('date', options.date);

  const url = `/trips?${params.toString()}`;

  const { loading, error, refetch } = useFetch<Trip[]>(url, [
    options.from,
    options.to,
    options.date,
  ]);

  const searchTrips = useCallback(
    async (query: UseTripsOptions) => {
      try {
        const result = await tripService.searchTrips(query);
        setTrips(result);
      } catch {
        // error surfaced via useFetch
      }
    },
    [setTrips],
  );

  return { trips, loading, error, refetch, searchTrips };
}

export default useTrips;
