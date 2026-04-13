// ─── useCitySearch ───────────────────────────────────────────────────────────
// Debounced city autocomplete for trip origin/destination inputs.

import { useEffect, useRef, useState } from 'react';
import { locationService } from '../services/locationService';
import type { City } from '../services/locationService';
import useDebounce from './useDebounce';

export interface UseCitySearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: City[];
  loading: boolean;
}

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS      = 500;

export function useCitySearch(): UseCitySearchReturn {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const isMounted             = useRef(true);

  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    locationService
      .searchCities(debouncedQuery)
      .then(cities => {
        if (!cancelled && isMounted.current) {
          setResults(cities);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled && isMounted.current) {
          setResults([]);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  return { query, setQuery, results, loading };
}
