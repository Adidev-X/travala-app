// ─── useRiderProfile ─────────────────────────────────────────────────────────
// Fetches: rider public profile, active trips, and reviews in parallel.

import { useCallback, useEffect, useRef, useState } from 'react';
import { reviewService } from '../services/reviewService';
import { userService } from '../services/userService';
import type { Review, RiderProfile, Trip } from '../types';

// ─── Return type ─────────────────────────────────────────────────────────────

export interface UseRiderProfileReturn {
  profile: RiderProfile | null;
  trips: Trip[];
  reviews: Review[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useRiderProfile(riderId: string): UseRiderProfileReturn {
  const isMounted = useRef(true);

  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const retry = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    isMounted.current = true;
    setLoading(true);
    setError(null);

    let cancelled = false;

    (async () => {
      try {
        // Fire all three requests in parallel
        const [profileData, tripsData, reviewsData] = await Promise.all([
          userService.getRiderProfile(riderId),
          userService.getRiderActiveTrips(riderId),
          reviewService.getByRider(riderId),
        ]);

        if (!cancelled && isMounted.current) {
          setProfile(profileData);
          // CRASH FIX: Array.isArray guards — API may return null/undefined on partial failures
          setTrips(Array.isArray(tripsData) ? tripsData : []);
          setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        }
      } catch (err: unknown) {
        if (!cancelled && isMounted.current) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load rider profile. Please try again.',
          );
        }
      } finally {
        if (!cancelled && isMounted.current) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      isMounted.current = false;
    };
  }, [riderId, tick]);

  return { profile, trips, reviews, loading, error, retry };
}
