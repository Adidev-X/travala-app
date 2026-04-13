// ─── RideShare — TypeScript Interfaces ─────────────────────────────────────

export type UserRole = 'rider' | 'traveler' | 'both';

export interface User {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  city: string;
  photo?: string;
  bio?: string;
  role: UserRole;
  createdAt: string; // ISO date string
}

// ─── Vehicle ────────────────────────────────────────────────────────────────

export type VehicleType = 'car' | 'bike' | 'van' | 'bus';

export interface Vehicle {
  id: string;
  type: VehicleType;
  model?: string;
  seats: number;
  ac: boolean;
  rcVerified: boolean;
  dlVerified: boolean;
}

// ─── Trip ───────────────────────────────────────────────────────────────────

export type TripType = 'full_tour' | 'one_way';
export type TripStatus = 'active' | 'completed' | 'cancelled' | 'full';

export interface TripItineraryDay {
  day: number;  // 1-based
  description: string;
}

export interface Trip {
  id: string;
  riderId: string;
  type: TripType;
  title: string;
  from: string;
  to: string;
  stops: string[];
  startDate: string;     // ISO date string
  endDate?: string;      // ISO date string — for full_tour
  departureTime: string; // e.g. "08:30 AM"
  seats: number;
  seatsLeft: number;
  costPerPerson: number;
  vehicle: Vehicle;
  restrictions?: string;
  notes?: string;
  photos?: string[];
  status: TripStatus;
  // Extended fields
  itinerary?: TripItineraryDay[];    // full_tour only
  ladiesOnly?: boolean;
  luggagePolicy?: string;
}

// ─── Join Request ────────────────────────────────────────────────────────────

export type JoinRequestStatus = 'pending' | 'accepted' | 'declined';

export interface JoinRequest {
  id: string;
  tripId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  userRating: number;
  seats?: number;
  message?: string;
  status: JoinRequestStatus;
  createdAt: string; // ISO date string
  trip?: Pick<Trip, 'id' | 'title' | 'from' | 'to' | 'startDate' | 'costPerPerson'>;
}

// ─── Verification ────────────────────────────────────────────────────────────

export type DocType = 'rc' | 'dl' | 'permit';

export type DocumentStatus =
  | 'not_uploaded'
  | 'pending'     // uploaded, awaiting admin review
  | 'approved'
  | 'rejected';

export interface VerificationDocument {
  status: DocumentStatus;
  rejectionReason?: string; // present only when status === 'rejected'
  docNumber?: string;
  expiryDate?: string;      // ISO date string
  uploadedAt?: string;      // ISO date string
}

export interface VerificationStatus {
  vehicleType: VehicleType;
  rc: VerificationDocument;
  dl: VerificationDocument;
  permit?: VerificationDocument; // required for van / bus
  /** True when all required docs are admin-approved */
  canPostTrips: boolean;
}

export interface DocumentUploadPayload {
  docType: DocType;
  vehicleType: VehicleType;
  frontImage: string;  // file URI
  backImage: string;   // file URI
  docNumber: string;
  expiryDate: string;  // ISO date string
}

// ─── API Response Wrapper ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// ─── Notification ────────────────────────────────────────────────────────────

export type NotificationType =
  | 'join_accepted'
  | 'join_declined'
  | 'trip_cancelled'
  | 'doc_approved'
  | 'doc_rejected'
  | 'trip_reminder';

export type NotificationCategory = 'trips' | 'verification' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string; // ISO date string
  meta?: {
    tripId?: string;
    userId?: string;
    docType?: 'rc' | 'dl' | 'permit';
  };
}

export interface RiderStats {
  tripsPosted: number;
  peopleHelped: number;
  avgRating: number;       // 0–5, one decimal place
  pendingRequestCount: number;
  reviewCount?: number;    // available on public profile; may be absent on self-stats
}

// ─── Rider Public Profile ────────────────────────────────────────────────────

export interface RiderProfile extends User {
  /** ISO date string of account creation */
  memberSince: string;
  stats: RiderStats;
  vehicle?: {
    type: VehicleType;
    model?: string;
    seats: number;
    ac: boolean;
  };
  rcVerified: boolean;
  dlVerified: boolean;
}

// ─── Review ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerPhoto?: string;
  rating: number;          // 1–5
  text?: string;
  tripId: string;
  createdAt: string;       // ISO date string
}

// ─── Navigation Param Lists (stub — extend in navigation/index.ts) ────────────

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  OTPLogin: undefined;
  ProfileSetup: undefined;
};

export type RiderTabParamList = {
  PostTrip: undefined;
  MyTrips: undefined;
  Requests: undefined;
};

export type TravelerTabParamList = {
  Search: undefined;
  TripDetail: { tripId: string };
  TravelerProfile: { userId: string };
};

export type CommonStackParamList = {
  Notifications: undefined;
  Settings: undefined;
  Safety: undefined;
};
