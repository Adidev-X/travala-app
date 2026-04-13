import type { ApiResponse, JoinRequest, Trip } from '../types';
import api from './apiClient';
import {
  DEMO_JOIN_REQUESTS,
  DEMO_SEARCH_TRIPS,
  DEMO_TRENDING,
  DEMO_TRIPS,
  isDemoMode,
} from './demoData';

export interface SearchTripsQuery {
  from?: string;
  to?: string;
  date?: string;
  seats?: number;
  vehicleType?: string;
  page?: number;
  limit?: number;
}

export interface CreateTripPayload
  extends Omit<Trip, 'id' | 'riderId' | 'seatsLeft' | 'status'> {}

export const tripService = {
  /** Search / list available trips */
  searchTrips: async (query: SearchTripsQuery): Promise<Trip[]> => {
    if (isDemoMode()) {
      let results = DEMO_SEARCH_TRIPS.filter(t => t.status === 'active');
      if (query.from) results = results.filter(t => t.from.toLowerCase().includes(query.from!.toLowerCase()));
      if (query.to)   results = results.filter(t => t.to?.toLowerCase().includes(query.to!.toLowerCase()));
      if (query.seats) results = results.filter(t => t.seatsLeft >= (query.seats ?? 1));
      return results;
    }
    const { data } = await api.get<ApiResponse<Trip[]>>('/trips', {
      params: query,
    });
    return data.data;
  },

  /** Get a single trip by ID */
  getTripById: async (tripId: string): Promise<Trip> => {
    if (isDemoMode()) {
      const all = [...DEMO_TRIPS, ...DEMO_SEARCH_TRIPS];
      return all.find(t => t.id === tripId) ?? all[0]!;
    }
    const { data } = await api.get<ApiResponse<Trip>>(`/trips/${tripId}`);
    return data.data;
  },

  /** Get trips posted by the current authenticated rider */
  getMyTrips: async (): Promise<Trip[]> => {
    if (isDemoMode()) return DEMO_TRIPS;
    const { data } = await api.get<ApiResponse<Trip[]>>('/trips/my');
    return data.data;
  },

  /** Create a new trip */
  createTrip: async (payload: CreateTripPayload): Promise<Trip> => {
    if (isDemoMode()) {
      return {
        ...payload,
        id: `trip-demo-${Date.now()}`,
        riderId: 'demo-user-001',
        seatsLeft: payload.seats,
        status: 'active',
      };
    }
    const { data } = await api.post<ApiResponse<Trip>>('/trips', payload);
    return data.data;
  },

  /** Update an existing trip */
  updateTrip: async (
    tripId: string,
    payload: Partial<CreateTripPayload>,
  ): Promise<Trip> => {
    if (isDemoMode()) {
      const base = DEMO_TRIPS.find(t => t.id === tripId) ?? DEMO_TRIPS[0]!;
      return { ...base, ...payload };
    }
    const { data } = await api.put<ApiResponse<Trip>>(
      `/trips/${tripId}`,
      payload,
    );
    return data.data;
  },

  /** Cancel / delete a trip */
  cancelTrip: async (tripId: string): Promise<void> => {
    if (isDemoMode()) return;
    await api.delete(`/trips/${tripId}`);
  },

  // ─── Join Requests ────────────────────────────────────────────────────────

  /** Traveler sends a join request */
  sendJoinRequest: async (tripId: string): Promise<JoinRequest> => {
    if (isDemoMode()) {
      return {
        id: `req-demo-${Date.now()}`,
        tripId,
        userId: 'demo-user-001',
        userName: 'Arjun Sharma',
        userRating: 4.7,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
    }
    const { data } = await api.post<ApiResponse<JoinRequest>>(
      `/trips/${tripId}/requests`,
    );
    return data.data;
  },

  /** Rider fetches all requests for a trip */
  getTripRequests: async (tripId: string): Promise<JoinRequest[]> => {
    if (isDemoMode()) return DEMO_JOIN_REQUESTS.filter(r => r.tripId === tripId);
    const { data } = await api.get<ApiResponse<JoinRequest[]>>(
      `/trips/${tripId}/requests`,
    );
    return data.data;
  },

  /** Rider accepts or declines a request */
  respondToRequest: async (
    requestId: string,
    status: 'accepted' | 'declined',
  ): Promise<JoinRequest> => {
    if (isDemoMode()) {
      const req = DEMO_JOIN_REQUESTS.find(r => r.id === requestId);
      return { ...(req ?? DEMO_JOIN_REQUESTS[0]!), status };
    }
    const { data } = await api.patch<ApiResponse<JoinRequest>>(
      `/requests/${requestId}`,
      { status },
    );
    return data.data;
  },

  // ─── Discovery ────────────────────────────────────────────────────────────

  /** Trending routes (most booked this week) */
  getTrending: async (): Promise<{ from: string; to: string; tripCount: number }[]> => {
    if (isDemoMode()) return DEMO_TRENDING;
    const { data } = await api.get<ApiResponse<{ from: string; to: string; tripCount: number }[]>>(
      '/trips/trending',
    );
    return data.data;
  },

  /** Trips departing from a specific city */
  getByCity: async (city: string): Promise<Trip[]> => {
    if (isDemoMode()) return DEMO_SEARCH_TRIPS.filter(t =>
      t.from.toLowerCase() === city.toLowerCase() && t.status === 'active',
    );
    const { data } = await api.get<ApiResponse<Trip[]>>('/trips', {
      params: { from: city, limit: 10 },
    });
    return data.data;
  },
};
