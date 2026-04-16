// ─── requestService ──────────────────────────────────────────────────────────
// All join-request API calls (rider accept/decline + traveler sendRequest).

import type { ApiResponse, JoinRequest } from '../types';
import api from './apiClient';
import { DEMO_JOIN_REQUESTS, DEMO_TRAVELER_REQUESTS, isDemoMode } from './demoData';

// local mutable copy so accept/decline persists within the demo session
let _demoRequests: JoinRequest[] = DEMO_JOIN_REQUESTS.map(r => ({ ...r }));

export const requestService = {
  /** Get ALL requests across all of the rider's trips */
  getAllForRider: async (): Promise<JoinRequest[]> => {
    if (isDemoMode()) return [..._demoRequests];
    const { data } = await api.get<ApiResponse<JoinRequest[]>>('/requests/all');
    return data.data;
  },

  /** Get all join requests for a trip (rider view) */
  getByTrip: async (tripId: string): Promise<JoinRequest[]> => {
    if (isDemoMode()) return _demoRequests.filter(r => r.tripId === tripId);
    const { data } = await api.get<ApiResponse<JoinRequest[]>>(
      `/trips/${tripId}/requests`,
    );
    return data.data;
  },

  /** Rider accepts a join request */
  accept: async (requestId: string): Promise<JoinRequest> => {
    if (isDemoMode()) {
      _demoRequests = _demoRequests.map(r =>
        r.id === requestId ? { ...r, status: 'accepted' as const } : r,
      );
      return _demoRequests.find(r => r.id === requestId)!;
    }
    const { data } = await api.patch<ApiResponse<JoinRequest>>(
      `/requests/${requestId}/accept`,
    );
    return data.data;
  },

  /** Rider declines a join request */
  decline: async (requestId: string): Promise<JoinRequest> => {
    if (isDemoMode()) {
      _demoRequests = _demoRequests.map(r =>
        r.id === requestId ? { ...r, status: 'declined' as const } : r,
      );
      return _demoRequests.find(r => r.id === requestId)!;
    }
    const { data } = await api.patch<ApiResponse<JoinRequest>>(
      `/requests/${requestId}/decline`,
    );
    return data.data;
  },

  /** Traveler sends a join request for a trip */
  sendRequest: async (tripId: string, message?: string): Promise<JoinRequest> => {
    if (isDemoMode()) {
      const newReq: JoinRequest = {
        id: `req-demo-${Date.now()}`,
        tripId,
        userId: 'demo-user-001',
        userName: 'Arjun Sharma',
        userRating: 4.7,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      _demoRequests.push(newReq);
      return newReq;
    }
    const { data } = await api.post<ApiResponse<JoinRequest>>(
      `/trips/${tripId}/join`,
      message ? { message } : undefined,
    );
    return data.data;
  },

  /** Check if the current user already has a pending/accepted request for a trip */
  hasRequest: async (tripId: string): Promise<boolean> => {
    if (isDemoMode()) return _demoRequests.some(r => r.tripId === tripId && r.status !== 'declined');
    const { data } = await api.get<ApiResponse<{ exists: boolean }>>(
      `/trips/${tripId}/my-request`,
    );
    return data.data.exists;
  },

  /** Traveler fetches all their own join requests across all trips */
  getMyRequests: async (): Promise<JoinRequest[]> => {
    if (isDemoMode()) return [...DEMO_TRAVELER_REQUESTS];
    const { data } = await api.get<ApiResponse<JoinRequest[]>>('/requests/mine');
    return data.data;
  },
};
