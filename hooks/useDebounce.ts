import { useEffect, useRef, useState } from 'react';

/**
 * useDebounce — delays updating a value until `delay` ms after the last change.
 * Uses useRef for the timeout so the timer ref is stable across renders.
 *
 * @param value  The value to debounce
 * @param delay  Delay in ms (default 400)
 * @example
 * const debouncedQuery = useDebounce(searchQuery, 500);
 */
function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedValue(value), delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
