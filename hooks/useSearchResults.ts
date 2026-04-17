// ─── useSearchResults ────────────────────────────────────────────────────────
// Fetches trips for a given search query, then exposes local filter (by vehicle
// type) and sort (soonest / cheapest / top-rated) powered by useMemo.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { tripService } from '../services/trips';
import type { Trip, VehicleType } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FilterOption = 'all' | VehicleType;
export type SortOption = 'soonest' | 'cheapest' | 'rating';

export interface SearchQuery {
  from: string;
  to: string;
  date?: string;
  seats?: number;
  vehicleType?: string;
}

export interface UseSearchResultsReturn {
  /** Raw results from API */
  results: Trip[];
  /** After local filter + sort applied */
  filteredResults: Trip[];
  loading: boolean;
  error: string | null;
  retry: () => void;
  activeFilter: FilterOption;
  setFilter: (f: FilterOption) => void;
  activeSort: SortOption;
  setSort: (s: SortOption) => void;
}

// ─── Sort helpers ─────────────────────────────────────────────────────────────

/** Parse "HH:MM AM/PM" to minutes-since-midnight for comparison */
function parseTime(t: string): number {
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = m[3].toUpperCase();
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

function sortTrips(trips: Trip[], sort: SortOption): Trip[] {
  const arr = [...trips];
  switch (sort) {
    case 'soonest':
      return arr.sort((a, b) => {
        // CRASH FIX: startDate may be undefined — optional chaining + fallback prevents localeCompare crash
        const dateCmp = (a.startDate ?? '').localeCompare(b.startDate ?? '');
        if (dateCmp !== 0) return dateCmp;
        return parseTime(a.departureTime) - parseTime(b.departureTime);
      });
    case 'cheapest':
      return arr.sort((a, b) => a.costPerPerson - b.costPerPerson);
    case 'rating': {
      // Score: RC+DL verified = 2pts, seats fill ratio (fuller = popular)
      const score = (t: Trip) =>
        // CRASH FIX: vehicle may be undefined in malformed API responses
        (t.vehicle?.rcVerified ? 1 : 0) +
        (t.vehicle?.dlVerified ? 1 : 0) +
        (t.seats > 0 ? (t.seats - t.seatsLeft) / t.seats : 0);
      return arr.sort((a, b) => score(b) - score(a));
    }
    default:
      return arr;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSearchResults(query: SearchQuery): UseSearchResultsReturn {
  const [results, setResults] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setFilter] = useState<FilterOption>('all');
  const [activeSort, setSort] = useState<SortOption>('soonest');
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tripService.searchTrips({
        from: query.from,
        to: query.to,
        date: query.date,
        seats: query.seats,
        vehicleType: query.vehicleType,
      });
      // FIX: Array.isArray guard — API might return undefined/null on error states
      if (isMounted.current) setResults(Array.isArray(data) ? data : []);
    } catch {
      if (isMounted.current) setError('Could not load rides. Check your connection.');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [query.from, query.to, query.date, query.seats, query.vehicleType]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetch(); }, [fetch]);

  // ── Derived list (never computed in render) ────────────────────────────────
  const filteredResults = useMemo(() => {
    const filtered =
      activeFilter === 'all'
        ? results
        : results.filter(t => t.vehicle.type === activeFilter);
    return sortTrips(filtered, activeSort);
  }, [results, activeFilter, activeSort]);

  return {
    results,
    filteredResults,
    loading,
    error,
    retry: fetch,
    activeFilter,
    setFilter,
    activeSort,
    setSort,
  };
}
