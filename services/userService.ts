// ─── userService ─────────────────────────────────────────────────────────────
// Profile and rider-specific API calls.

import { useAuthStore } from '../store/authStore';
import type { ApiResponse, RiderProfile, RiderStats, Trip, User } from '../types';
import type { AddEmergencyContactDTO, EmergencyContact, UpdateProfileDTO } from '../types/api';
import apiClient from './apiClient';
import {
    DEMO_RIDER_PROFILE,
    DEMO_RIDER_STATS,
    DEMO_SEARCH_TRIPS,
    DEMO_TRAVELER_PHONE,
    DEMO_TRAVELER_USER,
    DEMO_USER,
    isDemoMode
} from './demoData';

/** Returns the correct demo user based on who is logged in. */
function demoCurrentUser(): User {
  const state = useAuthStore.getState();
  return state.user?.phone === DEMO_TRAVELER_PHONE ? DEMO_TRAVELER_USER : DEMO_USER;
}

export const userService = {
  // ── Authenticated user ───────────────────────────────────────────────────

  /** Get the authenticated user's own profile */
  getProfile: async (): Promise<User> => {
    if (isDemoMode()) return demoCurrentUser();
    const { data } = await apiClient.get<ApiResponse<User>>('/users/me');
    return data.data;
  },

  /** Patch the authenticated user's profile fields */
  updateProfile: async (dto: UpdateProfileDTO): Promise<User> => {
    if (isDemoMode()) return { ...demoCurrentUser(), ...dto };
    const { data } = await apiClient.patch<ApiResponse<User>>(
      '/users/me',
      dto,
    );
    return data.data;
  },

  /** Rider stats for the authenticated rider (dashboard) */
  getRiderStats: async (): Promise<RiderStats> => {
    if (isDemoMode()) return DEMO_RIDER_STATS;
    const { data } = await apiClient.get<ApiResponse<RiderStats>>(
      '/users/me/stats',
    );
    return data.data;
  },

  /** Add an emergency contact for the authenticated user */
  addEmergencyContact: async (
    dto: AddEmergencyContactDTO,
  ): Promise<EmergencyContact> => {
    if (isDemoMode()) return { id: `ec-demo-${Date.now()}`, ...dto };
    const { data } = await apiClient.post<ApiResponse<EmergencyContact>>(
      '/users/me/emergency-contacts',
      dto,
    );
    return data.data;
  },

  /** Remove an emergency contact by ID */
  removeEmergencyContact: async (id: string): Promise<void> => {
    if (isDemoMode()) return;
    await apiClient.delete(`/users/me/emergency-contacts/${id}`);
  },

  // ── Public rider profile (traveler view) ─────────────────────────────────

  /** Public profile of any rider */
  getRiderProfile: async (riderId: string): Promise<RiderProfile> => {
    if (isDemoMode()) return { ...DEMO_RIDER_PROFILE, id: riderId };
    const { data } = await apiClient.get<ApiResponse<RiderProfile>>(
      `/users/${riderId}/profile`,
    );
    return data.data;
  },

  /** Active trips posted by a rider (shown on their public profile) */
  getRiderActiveTrips: async (riderId: string): Promise<Trip[]> => {
    if (isDemoMode()) return DEMO_SEARCH_TRIPS.filter(t => t.status === 'active').slice(0, 3);
    const { data } = await apiClient.get<ApiResponse<Trip[]>>(
      `/users/${riderId}/trips/active`,
    );
    return data.data;
  },
};
