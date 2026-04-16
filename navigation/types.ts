// ─── RideShare — Navigation Type Definitions ─────────────────────────────────
//
// Expo-router uses file-based routing. These types are used for:
//  1. useLocalSearchParams<T>() — typed route params
//  2. NavigationService.navigate() — type-safe calls outside components
//  3. router.push<T>() — typed href params
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── Auth Stack ───────────────────────────────────────────────────────────────

export type AuthRoute =
  | '/(auth)/enter-phone'
  | '/(auth)/otp'
  | '/(auth)/profile-setup';

export type OTPParams = {
  phone: string; // passed from EnterPhone → OTP screen
};

export type ProfileSetupParams = {
  phone: string;
  isNewUser: '1' | '0'; // route params are always strings
  fromEdit?: 'true' | 'false';
};

// ─── Traveler Stack (Home Tab) ────────────────────────────────────────────────

export type TravelerRoute =
  | '/(tabs)/home'
  | '/(tabs)/home/search-results'
  | '/(tabs)/home/trip-detail'
  | '/(tabs)/home/rider-profile'
  | '/(tabs)/home/contact-rider';

export type SearchResultsParams = {
  from: string;
  to: string;
  date?: string;
  seats?: string;        // route params are always strings
  vehicleType?: string;  // 'car' | 'bike' | 'van' | 'bus'
};

export type TripDetailParams = {
  tripId: string;
};

export type RiderProfileParams = {
  riderId: string;
};

export type ContactRiderParams = {
  tripId: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  riderWhatsapp?: string;
  tripTitle: string;
  tripFrom: string;
  tripTo: string;
  tripDate: string;
  // rider rating + verification passed as strings (route params)
  riderRating?: string;     // e.g. '4.8'
  riderPhoto?: string;
  isRcVerified?: string;    // '1' | '0'
  isDlVerified?: string;    // '1' | '0'
};

// ─── Rider Stack (Trips Tab) ──────────────────────────────────────────────────

export type RiderRoute =
  | '/(tabs)/trips'
  | '/(tabs)/trips/post-trip-type'
  | '/(tabs)/trips/post-full-tour'
  | '/(tabs)/trips/post-one-way'
  | '/(tabs)/trips/my-trips'
  | '/(tabs)/trips/join-requests'
  | '/(tabs)/trips/verification'
  | '/(tabs)/trips/document-upload';

export type PostTripTypeParams = undefined;

export type PostFullTourParams = {
  draftId?: string; // optional — for editing an existing draft
};

export type PostOneWayParams = {
  draftId?: string;
};

export type JoinRequestsParams = {
  tripId: string;
  tripTitle: string;
};

export type VerificationParams = {
  docType?: 'rc' | 'dl' | 'permit';
};

export type DocumentUploadParams = {
  docType: 'rc' | 'dl' | 'permit';
  vehicleType: 'car' | 'bike' | 'van' | 'bus';
};

// ─── Profile Tab ──────────────────────────────────────────────────────────────

export type ProfileRoute = '/(tabs)/profile';

// ─── Shared / Modal Screens ───────────────────────────────────────────────────

export type SharedRoute =
  | '/notifications'
  | '/settings'
  | '/safety';

// ─── Union of all app routes ──────────────────────────────────────────────────

export type AppRoute =
  | AuthRoute
  | TravelerRoute
  | RiderRoute
  | ProfileRoute
  | SharedRoute;

// ─── NavigationService helper types ──────────────────────────────────────────

export type RouteParams = {
  '/(auth)/otp': OTPParams;
  '/(auth)/profile-setup': ProfileSetupParams;
  '/(tabs)/home/search-results': SearchResultsParams;
  '/(tabs)/home/trip-detail': TripDetailParams;
  '/(tabs)/home/rider-profile': RiderProfileParams;
  '/(tabs)/home/contact-rider': ContactRiderParams;
  '/(tabs)/trips/post-full-tour': PostFullTourParams;
  '/(tabs)/trips/post-one-way': PostOneWayParams;
  '/(tabs)/trips/join-requests': JoinRequestsParams;
  '/(tabs)/trips/verification': VerificationParams;
  '/(tabs)/trips/document-upload': DocumentUploadParams;
};

// Routes that require params
export type RoutesWithParams = keyof RouteParams;

// Routes that need no params
export type RoutesWithoutParams = Exclude<AppRoute, RoutesWithParams>;
