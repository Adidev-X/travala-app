// ─── RideShare — API DTOs & Param Types ──────────────────────────────────────
// All request/response payload types and custom error classes live here.
// Import these from 'types/api' in service files.

import type { TripType, VehicleType } from './index';

// ─── Custom Error Classes ─────────────────────────────────────────────────────

export class NetworkError extends Error {
  readonly code = 'NETWORK_ERROR';
  constructor(message = 'No internet connection. Please check your network.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ServerError extends Error {
  readonly code = 'SERVER_ERROR';
  readonly status: number;
  constructor(status: number, message = 'Something went wrong on our end. Please try later.') {
    super(message);
    this.name = 'ServerError';
    this.status = status;
  }
}

export class AuthError extends Error {
  readonly code = 'AUTH_ERROR';
  constructor(message = 'Session expired. Please log in again.') {
    super(message);
    this.name = 'AuthError';
  }
}

// ─── Trip DTOs ────────────────────────────────────────────────────────────────

export interface SearchParams {
  from?: string;
  to?: string;
  date?: string;       // ISO date string
  seats?: number;
  vehicleType?: VehicleType;
  type?: TripType;
  page?: number;
  limit?: number;
}

export interface CreateTripDTO {
  type: TripType;
  title: string;
  from: string;
  to: string;
  stops: string[];
  startDate: string;
  endDate?: string;
  departureTime: string;
  seats: number;
  costPerPerson: number;
  vehicleType: VehicleType;
  vehicleModel?: string;
  ac: boolean;
  restrictions?: string;
  notes?: string;
  photos?: string[];
  luggagePolicy?: string;
  ladiesOnly?: boolean;
}

export interface UpdateTripDTO extends Partial<CreateTripDTO> {}

export interface CancelTripDTO {
  reason: string;
}

export interface TrendingRoute {
  from: string;
  to: string;
  tripCount: number;
}

// ─── User DTOs ────────────────────────────────────────────────────────────────

export interface UpdateProfileDTO {
  name?: string;
  city?: string;
  whatsapp?: string;
  bio?: string;
  photo?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface AddEmergencyContactDTO {
  name: string;
  relation: string;
  phone: string;
}

// ─── Review DTOs ──────────────────────────────────────────────────────────────

export interface SubmitReviewDTO {
  rating: number;  // 1–5
  text?: string;
}
