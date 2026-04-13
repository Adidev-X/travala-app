// ─── authStore ───────────────────────────────────────────────────────────────
// Persisted authentication state (token + user).
// Persisted to AsyncStorage via zustand/middleware persist.
// Token refresh is handled by apiClient.ts interceptor — not here.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import type { AuthTokens } from '../services/auth';
import type { User } from '../types';

// ─── State / Actions interface ────────────────────────────────────────────────

interface AuthState {
  // ── State ──────────────────────────────────────────────────────────────────
  user: User | null;
  /** Full token pair (access + refresh) */
  tokens: AuthTokens | null;
  isLoading: boolean;

  // ── Derived (computed-like) ────────────────────────────────────────────────
  /** True when user + tokens are present */
  isLoggedIn: boolean;
  /** Alias for isLoggedIn — backward compat */
  isAuthenticated: boolean;
  /** Convenience access to the raw access token string */
  get token(): string | null;

  // ── Actions ───────────────────────────────────────────────────────────────
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  /** Backward-compat: set only the access token as a string */
  setToken: (token: string) => void;
  updateUser: (partial: Partial<User>) => void;
  /** Clear session in state AND AsyncStorage */
  logout: () => Promise<void>;
  /**
   * Hydrate from persisted storage on app launch.
   * Resolves to true if a valid session was found.
   */
  hydrate: () => Promise<boolean>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        tokens: null,
        isLoading: false,
        isLoggedIn: false,
        isAuthenticated: false,

        get token() {
          return get().tokens?.accessToken ?? null;
        },

        setUser: (user: User) =>
          set({ user, isLoggedIn: true, isAuthenticated: true }, false, 'auth/setUser'),

        setTokens: (tokens: AuthTokens) =>
          set({ tokens, isLoggedIn: true, isAuthenticated: true }, false, 'auth/setTokens'),

        setToken: (token: string) => {
          const existing = get().tokens;
          set(
            {
              tokens: existing
                ? { ...existing, accessToken: token }
                : { accessToken: token, refreshToken: '' },
              isLoggedIn: true,
              isAuthenticated: true,
            },
            false,
            'auth/setToken',
          );
        },

        updateUser: (partial: Partial<User>) =>
          set(
            state => ({
              user: state.user ? { ...state.user, ...partial } : null,
            }),
            false,
            'auth/updateUser',
          ),

        logout: async () => {
          set(
            { user: null, tokens: null, isLoggedIn: false, isAuthenticated: false },
            false,
            'auth/logout',
          );
          try {
            await AsyncStorage.removeItem('auth-store');
          } catch {
            // ignore storage errors on logout
          }
        },

        hydrate: async () => {
          set({ isLoading: true }, false, 'auth/hydrate/start');
          try {
            // persist middleware already rehydrates on store creation;
            // this action re-checks whether the persisted session is valid.
            const state = get();
            const valid = !!(state.user && state.tokens?.accessToken);
            set({ isLoggedIn: valid, isAuthenticated: valid, isLoading: false }, false, 'auth/hydrate/done');
            return valid;
          } catch {
            set({ isLoading: false }, false, 'auth/hydrate/error');
            return false;
          }
        },
      }),
      {
        name: 'auth-store',
        storage: createJSONStorage(() => AsyncStorage),
        // Only persist sensitive identity data — not loading state
        partialize: state => ({
          user: state.user,
          tokens: state.tokens,
          isLoggedIn: state.isLoggedIn,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    { name: 'AuthStore', enabled: __DEV__ },
  ),
);
