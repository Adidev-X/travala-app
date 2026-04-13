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

  const clear = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const restart = useCallback(() => {
    clear();
    setTimeLeft(initial);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clear();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [initial]);

  // Start on mount
  useEffect(() => {
    restart();
    return clear; // cleanup on unmount
  }, [restart]);

  return {
    timeLeft,
    isExpired: timeLeft === 0,
    restart,
  };
}

export default useOTPTimer;
