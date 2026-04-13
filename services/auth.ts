import type { ApiResponse, User } from '../types';
import api from './apiClient';

// ─── Demo / Dev credentials ───────────────────────────────────────────────────
//
//  RIDER account
//    Phone : 9999999999
//    OTP   : 123456
//
//  TRAVELER account
//    Phone : 8888888888
//    OTP   : 567890
//
// Remove or gate behind __DEV__ before releasing to production.
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_RIDER_PHONE    = '9999999999';
const DEMO_RIDER_OTP      = '123456';
const DEMO_RIDER_USER: User = {
  id:        'demo-rider-001',
  name:      'Arjun Sharma (Rider)',
  phone:     DEMO_RIDER_PHONE,
  whatsapp:  DEMO_RIDER_PHONE,
  city:      'Delhi',
  bio:       'Experienced road-tripper. Love mountains & scenic routes.',
  role:      'rider',
  createdAt: '2023-06-15T08:00:00.000Z',
};

const DEMO_TRAVELER_PHONE = '8888888888';
const DEMO_TRAVELER_OTP   = '567890';
const DEMO_TRAVELER_USER: User = {
  id:        'demo-traveler-001',
  name:      'Priya Mehra (Traveler)',
  phone:     DEMO_TRAVELER_PHONE,
  whatsapp:  DEMO_TRAVELER_PHONE,
  city:      'Mumbai',
  bio:       'Solo traveler. Always up for an adventure!',
  role:      'traveler',
  createdAt: '2024-01-10T10:00:00.000Z',
};

const DEMO_TOKENS = {
  accessToken:  'demo-access-token',
  refreshToken: 'demo-refresh-token',
};

export interface SendOTPPayload {
  phone: string;
}

export interface VerifyOTPPayload {
  phone: string;
  otp: string;
}

export interface ProfileSetupPayload {
  name: string;
  city: string;
  whatsapp?: string;
  bio?: string;
  role: 'rider' | 'traveler' | 'both';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  /**
   * Send OTP to the given phone number.
   */
  sendOTP: async (payload: SendOTPPayload): Promise<ApiResponse<null>> => {
    if (payload.phone === DEMO_RIDER_PHONE) {
      return { success: true, data: null, message: 'Rider demo OTP sent (use 1234)' };
    }
    if (payload.phone === DEMO_TRAVELER_PHONE) {
      return { success: true, data: null, message: 'Traveler demo OTP sent (use 5678)' };
    }
    const { data } = await api.post<ApiResponse<null>>('/auth/send-otp', payload);
    return data;
  },

  /**
   * Verify OTP and receive auth tokens.
   */
  verifyOTP: async (
    payload: VerifyOTPPayload,
  ): Promise<ApiResponse<{ tokens: AuthTokens; user: User; isNewUser: boolean }>> => {
    // Rider demo
    if (payload.phone === DEMO_RIDER_PHONE) {
      if (payload.otp !== DEMO_RIDER_OTP) {
        return { success: false, data: null as any, message: 'Invalid OTP. Use 123456 for Rider demo.' };
      }
      return {
        success: true,
        data: { tokens: DEMO_TOKENS, user: DEMO_RIDER_USER, isNewUser: false },
        message: 'Rider demo login successful',
      };
    }
    // Traveler demo
    if (payload.phone === DEMO_TRAVELER_PHONE) {
      if (payload.otp !== DEMO_TRAVELER_OTP) {
        return { success: false, data: null as any, message: 'Invalid OTP. Use 567890 for Traveler demo.' };
      }
      return {
        success: true,
        data: { tokens: { ...DEMO_TOKENS, accessToken: 'demo-traveler-token' }, user: DEMO_TRAVELER_USER, isNewUser: false },
        message: 'Traveler demo login successful',
      };
    }
    const { data } = await api.post<
      ApiResponse<{ tokens: AuthTokens; user: User; isNewUser: boolean }>
    >('/auth/verify-otp', payload);
    return data;
  },

  /**
   * Save or update the user profile (called after first login).
   */
  setupProfile: async (
    payload: ProfileSetupPayload,
  ): Promise<ApiResponse<User>> => {
    const { data } = await api.post<ApiResponse<User>>(
      '/auth/setup-profile',
      payload,
    );
    return data;
  },

  /**
   * Refresh auth tokens.
   */
  refreshToken: async (
    refreshToken: string,
  ): Promise<ApiResponse<AuthTokens>> => {
    const { data } = await api.post<ApiResponse<AuthTokens>>(
      '/auth/refresh',
      { refreshToken },
    );
    return data;
  },

  /**
   * Logout — invalidate server-side session.
   */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};
