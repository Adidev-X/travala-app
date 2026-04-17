import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Countdown timer hook for OTP resend.
 *
 * @param initial - seconds to count down from (default 60)
 * @returns { timeLeft, isExpired, restart }
 */
export function useOTPTimer(initial = 60) {
  const [timeLeft, setTimeLeft] = useState(initial);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // FIX: clear was defined as a plain function inside hook — not stable across renders.
  // Using useCallback+useRef ensures restart and useEffect cleanup always reference same fn.
  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const restart = useCallback(() => {
    clear();
    setTimeLeft(initial);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [initial, clear]);

  // Start on mount; clear interval on unmount to prevent memory leak
  useEffect(() => {
    restart();
    return clear; // FIX: explicit cleanup prevents interval leaking on unmount
  }, [restart, clear]);

  return {
    timeLeft,
    isExpired: timeLeft === 0,
    restart,
  };
}

export default useOTPTimer;
