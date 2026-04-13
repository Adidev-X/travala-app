// ─── apiClient ───────────────────────────────────────────────────────────────
// Central Axios instance for RideShare.
//
// Features:
//  • JWT injection from Zustand authStore on every request
//  • 401 → silent token refresh → single retry → logout on second failure
//  • Network-down → NetworkError (friendly message)
//  • 5xx → ServerError (typed)
//
// Usage:
//   import apiClient from '../services/apiClient';
//   const { data } = await apiClient.get<ApiResponse<T>>('/endpoint');
// ─────────────────────────────────────────────────────────────────────────────

import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import config from '../constants/config';
import { useAuthStore } from '../store/authStore';
import type { ApiResponse } from '../types';
import type { AuthTokens } from './auth';
import { AuthError, NetworkError, ServerError } from '../types/api';

// ─── Augment AxiosRequestConfig so we can flag retry attempts ─────────────────
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _isRetry?: boolean;
}

// ─── Create instance ──────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: config.BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — inject Bearer token ────────────────────────────────

apiClient.interceptors.request.use(
  (reqConfig: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = useAuthStore.getState().tokens?.accessToken;
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  },
  (error: unknown) => Promise.reject(error),
);

// ─── Response interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalReq = error.config as RetryableRequestConfig | undefined;

    // ── No network / timeout ─────────────────────────────────────────────────
    if (!error.response) {
      return Promise.reject(new NetworkError());
    }

    const { status } = error.response;

    // ── 401 — attempt token refresh once ────────────────────────────────────
    if (status === 401 && originalReq && !originalReq._isRetry) {
      originalReq._isRetry = true;

      const refreshToken = useAuthStore.getState().tokens?.refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(new AuthError());
      }

      try {
        // Call refresh endpoint directly to avoid circular service imports
        const refreshResp = await axios.post<ApiResponse<AuthTokens>>(
          `${config.BASE_URL}/auth/refresh`,
          { refreshToken },
        );
        const newTokens = refreshResp.data.data;
        useAuthStore.getState().setTokens(newTokens);

        // Retry original request with the new access token
        originalReq.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return apiClient(originalReq as AxiosRequestConfig);
      } catch {
        useAuthStore.getState().logout();
        return Promise.reject(new AuthError());
      }
    }

    // ── 5xx server errors ────────────────────────────────────────────────────
    if (status >= 500) {
      const serverMsg =
        (error.response.data as { message?: string } | undefined)?.message;
      return Promise.reject(new ServerError(status, serverMsg));
    }

    // ── All other HTTP errors — pass through as-is ───────────────────────────
    return Promise.reject(error);
  },
);

export default apiClient;
