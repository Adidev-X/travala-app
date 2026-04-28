import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: { name: string; email: string } | null;
  setAuth: (token: string, user: { name: string; email: string }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true,
  token: null,
  user: { name: 'Maninder Singh', email: 'maninder@example.com' },
  setAuth: (token, user) => set({ isAuthenticated: true, token, user }),
  clearAuth: () => set({ isAuthenticated: false, token: null, user: null }),
}));
