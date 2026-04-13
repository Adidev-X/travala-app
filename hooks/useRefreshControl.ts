// ─── useRefreshControl ───────────────────────────────────────────────────────
// Encapsulates the isRefreshing flag so FlatList pull-to-refresh is one-liner.
//
// @example
// const { isRefreshing, onRefresh } = useRefreshControl();
// <FlatList refreshControl={
//   <RefreshControl refreshing={isRefreshing} onRefresh={() => onRefresh(fetchData)} />
// } />

import { useCallback, useState } from 'react';

export interface UseRefreshControlReturn {
  isRefreshing: boolean;
  onRefresh: (callback: () => Promise<void>) => Promise<void>;
}

export function useRefreshControl(): UseRefreshControlReturn {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(
    async (callback: () => Promise<void>): Promise<void> => {
      setIsRefreshing(true);
      try {
        await callback();
      } finally {
        setIsRefreshing(false);
      }
    },
    [],
  );

  return { isRefreshing, onRefresh };
}
