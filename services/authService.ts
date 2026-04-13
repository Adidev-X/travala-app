/**
 * authService.ts
 * Thin re-export of the canonical auth service located at services/auth.ts.
 * The axios instance and interceptors live in services/index.ts.
 *
 * Import from here or from '@/services/auth' — both are identical.
 */
export {
    authService,
    authService as default
} from './auth';

export type {
    AuthTokens, ProfileSetupPayload, SendOTPPayload,
    VerifyOTPPayload
} from './auth';

