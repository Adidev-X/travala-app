// ─── services/index.ts ───────────────────────────────────────────────────────
// Central barrel for all RideShare services.
//
// Default export: apiClient (Axios instance with JWT + interceptors).
// Old code that does `import api from './index'` keeps working.
// New code should `import apiClient from './apiClient'` directly.
// ─────────────────────────────────────────────────────────────────────────────

export { default as apiClient, default } from './apiClient'; // backward compat default export

// ─── Named service exports ────────────────────────────────────────────────────
export { authService } from './auth';
export { locationService } from './locationService';
export { notificationService } from './notificationService';
export { requestService } from './requestService';
export { reviewService } from './reviewService';
export { tripService } from './tripService';
export { userService } from './userService';
export { verificationService } from './verificationService';

// ─── Legacy trips service (kept for backward compat) ─────────────────────────
// New code should use tripService from './tripService'.
export { tripService as legacyTripService } from './trips';
