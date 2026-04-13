// ─── reviewService ───────────────────────────────────────────────────────────
// Submit and fetch rider reviews.

import type { ApiResponse, Review } from '../types';
import type { SubmitReviewDTO } from '../types/api';
import apiClient from './apiClient';
import { DEMO_REVIEWS, isDemoMode } from './demoData';

export const reviewService = {
  /** All reviews for a rider (public) */
  getByRider: async (riderId: string): Promise<Review[]> => {
    if (isDemoMode()) return DEMO_REVIEWS;
    const { data } = await apiClient.get<ApiResponse<Review[]>>(
      `/users/${riderId}/reviews`,
    );
    return data.data;
  },

  /** Traveler submits a review after a completed trip */
  submitReview: async (
    tripId: string,
    rating: number,
    text?: string,
  ): Promise<Review> => {
    if (isDemoMode()) {
      return {
        id: `rev-demo-${Date.now()}`,
        reviewerId: 'demo-traveler-001',
        reviewerName: 'Priya Mehra',
        rating,
        text,
        tripId,
        createdAt: new Date().toISOString(),
      };
    }
    const dto: SubmitReviewDTO = { rating, text };
    const { data } = await apiClient.post<ApiResponse<Review>>(
      `/trips/${tripId}/review`,
      dto,
    );
    return data.data;
  },
};
