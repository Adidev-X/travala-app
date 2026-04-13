// ─── demoData.ts ─────────────────────────────────────────────────────────────
// Central mock data used by every service when demo mode is active.
//
// Demo credentials:
//   Rider    → Phone: 9999999999  OTP: 123456
//   Traveler → Phone: 8888888888  OTP: 567890
//
// How it works: each service checks isDemoMode() before hitting the network.
// ─────────────────────────────────────────────────────────────────────────────

import { useAuthStore } from '../store/authStore';
import type {
    JoinRequest,
    Notification,
    Review,
    RiderProfile,
    RiderStats,
    Trip,
    User,
    VerificationStatus,
} from '../types';
import type { EmergencyContact, TrendingRoute } from '../types/api';

export const DEMO_PHONE = '9999999999';          // Rider demo phone
export const DEMO_TRAVELER_PHONE = '8888888888'; // Traveler demo phone

const DEMO_PHONES = new Set([DEMO_PHONE, DEMO_TRAVELER_PHONE]);

/** Returns true when the currently logged-in user is any demo account. */
export function isDemoMode(): boolean {
  try {
    const state = useAuthStore.getState();
    return state.user?.phone ? DEMO_PHONES.has(state.user.phone) : false;
  } catch {
    return false;
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const DEMO_USER: User = {
  id: 'demo-rider-001',
  name: 'Arjun Sharma',
  phone: DEMO_PHONE,
  whatsapp: DEMO_PHONE,
  city: 'Delhi',
  bio: 'Experienced road-tripper. Love mountains & scenic routes. 4+ years of safe riding.',
  role: 'rider',
  createdAt: '2023-06-15T08:00:00.000Z',
};

export const DEMO_TRAVELER_USER: User = {
  id: 'demo-traveler-001',
  name: 'Priya Mehra',
  phone: DEMO_TRAVELER_PHONE,
  whatsapp: DEMO_TRAVELER_PHONE,
  city: 'Mumbai',
  bio: 'Solo traveler. Always up for an adventure!',
  role: 'traveler',
  createdAt: '2024-01-10T10:00:00.000Z',
};

export const DEMO_TRAVELER: User = DEMO_TRAVELER_USER;

export const DEMO_RIDER_PROFILE: RiderProfile = {
  ...DEMO_USER,
  memberSince: '2023-06-15T08:00:00.000Z',
  rcVerified: true,
  dlVerified: true,
  vehicle: { type: 'car', model: 'Maruti Swift Dzire', seats: 4, ac: true },
  stats: {
    tripsPosted: 28,
    peopleHelped: 94,
    avgRating: 4.7,
    pendingRequestCount: 3,
    reviewCount: 21,
  },
};

// ─── Rider Stats ──────────────────────────────────────────────────────────────

export const DEMO_RIDER_STATS: RiderStats = {
  tripsPosted: 28,
  peopleHelped: 94,
  avgRating: 4.7,
  pendingRequestCount: 3,
  reviewCount: 21,
};

// ─── Vehicle ─────────────────────────────────────────────────────────────────

const DEMO_VEHICLE = {
  id: 'veh-001',
  type: 'car' as const,
  model: 'Maruti Swift Dzire',
  seats: 4,
  ac: true,
  rcVerified: true,
  dlVerified: true,
};

// ─── Trips ────────────────────────────────────────────────────────────────────

export const DEMO_TRIPS: Trip[] = [
  // ── Upcoming (status: active) ─────────────────────────────────────────────
  {
    id: 'trip-001',
    riderId: DEMO_USER.id,
    type: 'full_tour',
    title: 'Spiti Valley Adventure',
    from: 'Delhi',
    to: 'Kaza',
    stops: ['Chandigarh', 'Shimla', 'Narkanda', 'Kinnur'],
    startDate: '2026-05-10T00:00:00.000Z',
    endDate: '2026-05-17T00:00:00.000Z',
    departureTime: '05:30 AM',
    seats: 4,
    seatsLeft: 2,
    costPerPerson: 8500,
    vehicle: DEMO_VEHICLE,
    restrictions: 'No smoking. Ladies welcome.',
    notes: 'Carry warm clothes — Rohtang can be freezing even in May.',
    status: 'active',
    ladiesOnly: false,
    luggagePolicy: '1 bag per person (max 15 kg)',
    itinerary: [
      { day: 1, description: 'Delhi → Chandigarh → Shimla (overnight)' },
      { day: 2, description: 'Shimla → Narkanda → Rampur → Kinnur' },
      { day: 3, description: 'Kinnur → Kalpa → Pooh → Nako' },
      { day: 4, description: 'Nako → Tabo → Dhankar → Kaza' },
      { day: 5, description: 'Kaza sightseeing — Key Monastery, Kibber' },
      { day: 6, description: 'Kaza → Hikkim (world highest PO) → Langza' },
      { day: 7, description: 'Return: Kaza → Manali (via Kunzum Pass)' },
      { day: 8, description: 'Manali → Delhi drop' },
    ],
  },
  {
    id: 'trip-002',
    riderId: DEMO_USER.id,
    type: 'one_way',
    title: 'Delhi to Manali Express',
    from: 'Delhi',
    to: 'Manali',
    stops: ['Chandigarh', 'Bilaspur'],
    startDate: '2026-04-25T00:00:00.000Z',
    departureTime: '07:00 AM',
    seats: 4,
    seatsLeft: 1,
    costPerPerson: 2200,
    vehicle: DEMO_VEHICLE,
    status: 'active',
    ladiesOnly: false,
    luggagePolicy: '1 medium bag per person',
  },
  // ── Active (status: full) ──────────────────────────────────────────────────
  {
    id: 'trip-003',
    riderId: DEMO_USER.id,
    type: 'one_way',
    title: 'Chandigarh → Kasol Weekend',
    from: 'Chandigarh',
    to: 'Kasol',
    stops: ['Bhuntar'],
    startDate: '2026-04-20T00:00:00.000Z',
    departureTime: '06:00 AM',
    seats: 3,
    seatsLeft: 0,
    costPerPerson: 1800,
    vehicle: DEMO_VEHICLE,
    status: 'full',
    ladiesOnly: true,
  },
  // ── Completed ─────────────────────────────────────────────────────────────
  {
    id: 'trip-004',
    riderId: DEMO_USER.id,
    type: 'full_tour',
    title: 'Rajasthan Royal Tour',
    from: 'Delhi',
    to: 'Jaisalmer',
    stops: ['Alwar', 'Jaipur', 'Pushkar', 'Jodhpur'],
    startDate: '2026-02-01T00:00:00.000Z',
    endDate: '2026-02-08T00:00:00.000Z',
    departureTime: '06:30 AM',
    seats: 4,
    seatsLeft: 0,
    costPerPerson: 9200,
    vehicle: DEMO_VEHICLE,
    status: 'completed',
  },
  {
    id: 'trip-005',
    riderId: DEMO_USER.id,
    type: 'one_way',
    title: 'Delhi → Rishikesh',
    from: 'Delhi',
    to: 'Rishikesh',
    stops: ['Haridwar'],
    startDate: '2026-03-15T00:00:00.000Z',
    departureTime: '05:00 AM',
    seats: 4,
    seatsLeft: 0,
    costPerPerson: 900,
    vehicle: DEMO_VEHICLE,
    status: 'completed',
  },
  // ── Cancelled ─────────────────────────────────────────────────────────────
  {
    id: 'trip-006',
    riderId: DEMO_USER.id,
    type: 'one_way',
    title: 'Delhi → Leh via Manali',
    from: 'Delhi',
    to: 'Leh',
    stops: ['Manali', 'Jispa', 'Sarchu'],
    startDate: '2026-04-10T00:00:00.000Z',
    departureTime: '05:30 AM',
    seats: 4,
    seatsLeft: 2,
    costPerPerson: 4500,
    vehicle: DEMO_VEHICLE,
    status: 'cancelled',
    notes: 'Cancelled due to road blockage.',
  },
];

/** Searchable trips for the traveler home/search screens */
export const DEMO_SEARCH_TRIPS: Trip[] = [
  ...DEMO_TRIPS.filter(t => t.status === 'active'),
  {
    id: 'trip-007',
    riderId: 'rider-002',
    type: 'one_way',
    title: 'Amritsar → Dharamshala',
    from: 'Amritsar',
    to: 'Dharamshala',
    stops: ['Pathankot'],
    startDate: '2026-04-28T00:00:00.000Z',
    departureTime: '08:00 AM',
    seats: 3,
    seatsLeft: 2,
    costPerPerson: 1100,
    vehicle: { id: 'veh-002', type: 'car', model: 'Honda City', seats: 3, ac: true, rcVerified: true, dlVerified: true },
    status: 'active',
  },
  {
    id: 'trip-008',
    riderId: 'rider-003',
    type: 'full_tour',
    title: 'Kedarnath Yatra Package',
    from: 'Haridwar',
    to: 'Kedarnath',
    stops: ['Rishikesh', 'Devprayag', 'Rudraprayag', 'Gaurikund'],
    startDate: '2026-05-05T00:00:00.000Z',
    endDate: '2026-05-09T00:00:00.000Z',
    departureTime: '04:30 AM',
    seats: 6,
    seatsLeft: 3,
    costPerPerson: 6500,
    vehicle: { id: 'veh-003', type: 'van', model: 'Tempo Traveller', seats: 6, ac: false, rcVerified: true, dlVerified: true },
    status: 'active',
    ladiesOnly: false,
  },
  {
    id: 'trip-009',
    riderId: 'rider-004',
    type: 'one_way',
    title: 'Pune → Goa Road Trip',
    from: 'Pune',
    to: 'Goa',
    stops: ['Kolhapur'],
    startDate: '2026-04-30T00:00:00.000Z',
    departureTime: '06:00 AM',
    seats: 4,
    seatsLeft: 4,
    costPerPerson: 1600,
    vehicle: { id: 'veh-004', type: 'car', model: 'Hyundai Creta', seats: 4, ac: true, rcVerified: true, dlVerified: true },
    status: 'active',
    ladiesOnly: false,
  },
  // ── Mumbai local trips (for Traveler demo home screen) ────────────────────
  {
    id: 'trip-010',
    riderId: 'rider-005',
    type: 'one_way',
    title: 'Mumbai → Goa Beach Trip',
    from: 'Mumbai',
    to: 'Goa',
    stops: ['Chiplun', 'Ratnagiri'],
    startDate: '2026-05-01T00:00:00.000Z',
    departureTime: '06:00 AM',
    seats: 4,
    seatsLeft: 2,
    costPerPerson: 1800,
    vehicle: { id: 'veh-005', type: 'car', model: 'Toyota Innova', seats: 4, ac: true, rcVerified: true, dlVerified: true },
    status: 'active',
    ladiesOnly: false,
    notes: 'Coastal highway route. Very scenic drive.',
  },
  {
    id: 'trip-011',
    riderId: 'rider-006',
    type: 'one_way',
    title: 'Mumbai → Lonavala Weekend',
    from: 'Mumbai',
    to: 'Lonavala',
    stops: [],
    startDate: '2026-04-26T00:00:00.000Z',
    departureTime: '07:30 AM',
    seats: 3,
    seatsLeft: 2,
    costPerPerson: 600,
    vehicle: { id: 'veh-006', type: 'car', model: 'Maruti Ertiga', seats: 3, ac: true, rcVerified: true, dlVerified: true },
    status: 'active',
    ladiesOnly: false,
  },
  {
    id: 'trip-012',
    riderId: 'rider-007',
    type: 'full_tour',
    title: 'Mumbai → Mahabaleshwar Tour',
    from: 'Mumbai',
    to: 'Mahabaleshwar',
    stops: ['Pune', 'Wai'],
    startDate: '2026-05-03T00:00:00.000Z',
    endDate: '2026-05-05T00:00:00.000Z',
    departureTime: '05:30 AM',
    seats: 4,
    seatsLeft: 1,
    costPerPerson: 3200,
    vehicle: { id: 'veh-007', type: 'car', model: 'Mahindra Scorpio', seats: 4, ac: true, rcVerified: true, dlVerified: true },
    status: 'active',
    ladiesOnly: false,
    itinerary: [
      { day: 1, description: 'Mumbai → Pune → Wai → Mahabaleshwar (check-in)' },
      { day: 2, description: 'Mahabaleshwar sightseeing — Venna Lake, Pratapgarh Fort' },
      { day: 3, description: 'Return: Mahabaleshwar → Mumbai drop' },
    ],
  },
];

// ─── Trending Routes ──────────────────────────────────────────────────────────

export const DEMO_TRENDING: TrendingRoute[] = [
  { from: 'Delhi', to: 'Manali', tripCount: 42 },
  { from: 'Delhi', to: 'Rishikesh', tripCount: 38 },
  { from: 'Mumbai', to: 'Goa', tripCount: 31 },
  { from: 'Bangalore', to: 'Coorg', tripCount: 27 },
  { from: 'Delhi', to: 'Leh', tripCount: 24 },
];

// ─── Join Requests — Rider's view (requests ON the rider's trips) ─────────────

export const DEMO_JOIN_REQUESTS: JoinRequest[] = [
  {
    id: 'req-001',
    tripId: 'trip-001',
    userId: 'traveler-101',
    userName: 'Sneha Kapoor',
    userRating: 4.5,
    status: 'pending',
    createdAt: '2026-04-12T14:30:00.000Z',
  },
  {
    id: 'req-002',
    tripId: 'trip-001',
    userId: 'traveler-102',
    userName: 'Rahul Verma',
    userRating: 4.2,
    status: 'pending',
    createdAt: '2026-04-12T16:00:00.000Z',
  },
  {
    id: 'req-003',
    tripId: 'trip-001',
    userId: 'traveler-103',
    userName: 'Anjali Singh',
    userRating: 4.8,
    status: 'accepted',
    createdAt: '2026-04-11T09:00:00.000Z',
  },
  {
    id: 'req-004',
    tripId: 'trip-002',
    userId: 'traveler-104',
    userName: 'Karan Malhotra',
    userRating: 3.9,
    status: 'pending',
    createdAt: '2026-04-13T08:00:00.000Z',
  },
  {
    id: 'req-005',
    tripId: 'trip-002',
    userId: 'traveler-105',
    userName: 'Neha Gupta',
    userRating: 4.6,
    status: 'declined',
    createdAt: '2026-04-10T11:30:00.000Z',
  },
];

// ─── Join Requests — Traveler's view (requests MADE BY demo-traveler-001) ─────

export const DEMO_TRAVELER_REQUESTS: JoinRequest[] = [
  {
    id: 'treq-001',
    tripId: 'trip-010',
    userId: 'demo-traveler-001',
    userName: 'Priya Mehra',
    userRating: 4.4,
    status: 'accepted',
    createdAt: '2026-04-12T11:00:00.000Z',
  },
  {
    id: 'treq-002',
    tripId: 'trip-008',
    userId: 'demo-traveler-001',
    userName: 'Priya Mehra',
    userRating: 4.4,
    status: 'pending',
    createdAt: '2026-04-13T07:00:00.000Z',
  },
  {
    id: 'treq-003',
    tripId: 'trip-012',
    userId: 'demo-traveler-001',
    userName: 'Priya Mehra',
    userRating: 4.4,
    status: 'declined',
    createdAt: '2026-04-11T14:00:00.000Z',
  },
];

// ─── Notifications — Rider ────────────────────────────────────────────────────

export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    type: 'trip_reminder' as const,
    title: 'New Join Request',
    body: 'Sneha Kapoor wants to join "Spiti Valley Adventure".',
    read: false,
    createdAt: '2026-04-13T10:00:00.000Z',
    meta: { tripId: 'trip-001', userId: 'traveler-101' },
  },
  {
    id: 'notif-002',
    type: 'trip_reminder' as const,
    title: 'New Join Request',
    body: 'Rahul Verma wants to join "Spiti Valley Adventure".',
    read: false,
    createdAt: '2026-04-12T16:00:00.000Z',
    meta: { tripId: 'trip-001', userId: 'traveler-102' },
  },
  {
    id: 'notif-003',
    type: 'join_accepted' as const,
    title: 'Request Accepted ✓',
    body: 'Your request for "Delhi to Manali Express" has been accepted.',
    read: true,
    createdAt: '2026-04-11T09:00:00.000Z',
    meta: { tripId: 'trip-002' },
  },
  {
    id: 'notif-004',
    type: 'doc_approved' as const,
    title: 'Document Approved',
    body: 'Your Driving Licence has been verified successfully.',
    read: true,
    createdAt: '2026-04-08T14:00:00.000Z',
    meta: { docType: 'dl' },
  },
  {
    id: 'notif-005',
    type: 'trip_cancelled' as const,
    title: 'Trip Cancelled',
    body: '"Delhi → Leh via Manali" has been cancelled by the rider.',
    read: true,
    createdAt: '2026-04-07T12:00:00.000Z',
    meta: { tripId: 'trip-006' },
  },
  {
    id: 'notif-006',
    type: 'trip_reminder' as const,
    title: 'New Join Request',
    body: 'Karan Malhotra wants to join "Delhi to Manali Express".',
    read: false,
    createdAt: '2026-04-13T08:00:00.000Z',
    meta: { tripId: 'trip-002', userId: 'traveler-104' },
  },
];

// ─── Notifications — Traveler ─────────────────────────────────────────────────

export const DEMO_TRAVELER_NOTIFICATIONS: Notification[] = [
  {
    id: 'tnotif-001',
    type: 'join_accepted' as const,
    title: 'Request Accepted ✓',
    body: 'Arjun Sharma accepted your request for "Mumbai → Goa Beach Trip".',
    read: false,
    createdAt: '2026-04-13T09:00:00.000Z',
    meta: { tripId: 'trip-010' },
  },
  {
    id: 'tnotif-002',
    type: 'join_declined' as const,
    title: 'Request Declined',
    body: 'Your request for "Mumbai → Mahabaleshwar Tour" was declined.',
    read: false,
    createdAt: '2026-04-12T15:00:00.000Z',
    meta: { tripId: 'trip-012' },
  },
  {
    id: 'tnotif-003',
    type: 'trip_reminder' as const,
    title: 'Trip Tomorrow!',
    body: '"Mumbai → Goa Beach Trip" departs tomorrow at 06:00 AM. Be ready!',
    read: true,
    createdAt: '2026-04-12T08:00:00.000Z',
    meta: { tripId: 'trip-010' },
  },
  {
    id: 'tnotif-004',
    type: 'trip_cancelled' as const,
    title: 'Trip Cancelled',
    body: '"Delhi → Leh via Manali" was cancelled by the rider.',
    read: true,
    createdAt: '2026-04-09T10:00:00.000Z',
    meta: { tripId: 'trip-006' },
  },
];

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const DEMO_REVIEWS: Review[] = [
  {
    id: 'rev-001',
    reviewerId: 'traveler-103',
    reviewerName: 'Anjali Singh',
    rating: 5,
    text: 'Arjun bhai is an amazing driver. Very safe and punctual. The Rajasthan trip was unforgettable!',
    tripId: 'trip-004',
    createdAt: '2026-02-10T10:00:00.000Z',
  },
  {
    id: 'rev-002',
    reviewerId: 'traveler-201',
    reviewerName: 'Mohit Agarwal',
    rating: 5,
    text: 'Best road trip experience. Clean car, great music, very cooperative.',
    tripId: 'trip-004',
    createdAt: '2026-02-11T09:30:00.000Z',
  },
  {
    id: 'rev-003',
    reviewerId: 'traveler-202',
    reviewerName: 'Riya Joshi',
    rating: 4,
    text: 'Good ride to Rishikesh. Comfortable and on time. Slight delay at Haridwar but overall great.',
    tripId: 'trip-005',
    createdAt: '2026-03-17T14:00:00.000Z',
  },
  {
    id: 'rev-004',
    reviewerId: 'traveler-203',
    reviewerName: 'Dev Tiwari',
    rating: 5,
    text: 'Highly recommended! Very experienced with mountain roads.',
    tripId: 'trip-005',
    createdAt: '2026-03-16T18:00:00.000Z',
  },
];

// ─── Verification Status ──────────────────────────────────────────────────────

export const DEMO_VERIFICATION: VerificationStatus = {
  vehicleType: 'car',
  rc: {
    status: 'approved',
    docNumber: 'DL01AB1234',
    expiryDate: '2030-06-01T00:00:00.000Z',
    uploadedAt: '2023-07-01T10:00:00.000Z',
  },
  dl: {
    status: 'approved',
    docNumber: 'DL-1420110012345',
    expiryDate: '2032-09-15T00:00:00.000Z',
    uploadedAt: '2023-07-01T10:00:00.000Z',
  },
  canPostTrips: true,
};

// ─── Emergency Contacts ───────────────────────────────────────────────────────

export const DEMO_EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: 'ec-001', name: 'Meena Sharma (Mother)', phone: '9876543210', relation: 'Mother' },
  { id: 'ec-002', name: 'Rohan Sharma (Brother)', phone: '9765432109', relation: 'Brother' },
];
