// ─── tripService ─────────────────────────────────────────────────────────────
// All trip-related API calls for RideShare.
// Uses the central apiClient (JWT + interceptors included).

import type { ApiResponse, Trip } from '../types';
import type {
  CancelTripDTO,
  CreateTripDTO,
  SearchParams,
  TrendingRoute,
  UpdateTripDTO,
} from '../types/api';
import apiClient from './apiClient';

export const tripService = {
  // ── Discovery / search ───────────────────────────────────────────────────

  /** Full-text search with optional filters */
  search: async (params: SearchParams): Promise<Trip[]> => {
    const { data } = await apiClient.get<ApiResponse<Trip[]>>('/trips', {
      params,
    });
    return data.data;
  },

  /** Fetch a single trip by ID */
  getById: async (tripId: string): Promise<Trip> => {
    const { data } = await apiClient.get<ApiResponse<Trip>>(`/trips/${tripId}`);
    return data.data;
  },

  /** Trending routes (most booked this week) */
  getTrending: async (): Promise<TrendingRoute[]> => {
    const { data } = await apiClient.get<ApiResponse<TrendingRoute[]>>(
      '/trips/trending',
    );
    return data.data;
  },

  /** Active trips departing from a specific city */
  getByCity: async (city: string): Promise<Trip[]> => {
    const { data } = await apiClient.get<ApiResponse<Trip[]>>('/trips', {
      params: { from: city, limit: 10 },
    });
    return data.data;
  },

  // ── Rider — my trips ────────────────────────────────────────────────────

  /** Authenticated rider's own trips, optionally filtered by status */
  getMyTrips: async (filter: { status?: string } = {}): Promise<Trip[]> => {
    const { data } = await apiClient.get<ApiResponse<Trip[]>>('/trips/my', {
      params: filter,
    });
    return data.data;
  },

  /** Create a new trip */
  createTrip: async (dto: CreateTripDTO): Promise<Trip> => {
    const { data } = await apiClient.post<ApiResponse<Trip>>('/trips', dto);
    return data.data;
  },

  /** Partially update a trip */
  updateTrip: async (
    tripId: string,
    dto: UpdateTripDTO,
  ): Promise<Trip> => {
    const { data } = await apiClient.put<ApiResponse<Trip>>(
      `/trips/${tripId}`,
      dto,
    );
    return data.data;
  },

  /** Cancel a trip with a reason */
  cancelTrip: async (tripId: string, reason: string): Promise<void> => {
    const dto: CancelTripDTO = { reason };
    await apiClient.patch(`/trips/${tripId}/cancel`, dto);
  },

  /** Mark a trip as full (no more seats) */
  markFull: async (tripId: string): Promise<Trip> => {
    const { data } = await apiClient.patch<ApiResponse<Trip>>(
      `/trips/${tripId}/mark-full`,
    );
    return data.data;
  },

  // ── Traveler — save/unsave ───────────────────────────────────────────────

  /** Save a trip to the traveler's wishlist */
  saveTrip: async (tripId: string): Promise<void> => {
    await apiClient.post(`/trips/${tripId}/save`);
  },

  /** Remove a trip from the traveler's wishlist */
  unsaveTrip: async (tripId: string): Promise<void> => {
    await apiClient.delete(`/trips/${tripId}/save`);
  },

  /** Get all trips the traveler has saved */
  getSavedTrips: async (): Promise<Trip[]> => {
    const { data } = await apiClient.get<ApiResponse<Trip[]>>('/trips/saved');
    return data.data;
  },
};
