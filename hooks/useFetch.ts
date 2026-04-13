import { useCallback, useEffect, useRef, useState } from 'react';
import apiClient from '../services/apiClient';
import type { ApiResponse } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useFetch — generic data-fetching hook.
 *
 * Accepts either:
 *   - a URL string  → GET via apiClient, expects ApiResponse<T> envelope
 *   - a fetchFn     → called directly, must resolve to T
 *
 * @example
 * const { data, loading, error, refetch } = useFetch<Trip[]>('/trips');
 * const { data } = useFetch<User>(() => userService.getProfile(), []);
 */
function useFetch<T>(
  source: string | (() => Promise<T>),
  deps: unknown[] = [],
): FetchResult<T> {
  const isMounted = useRef(true);

  const [data, setData]       = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    isMounted.current = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        let result: T;
        if (typeof source === 'string') {
          const resp = await apiClient.get<ApiResponse<T>>(source);
          result = resp.data.data;
        } else {
          result = await source();
        }
        if (isMounted.current) {
          setData(result);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted.current) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setLoading(false);
        }
      }
    })();

    return () => { isMounted.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, typeof source === 'string' ? source : null, ...deps]);

  return { data, loading, error, refetch };
}

export default useFetch;
