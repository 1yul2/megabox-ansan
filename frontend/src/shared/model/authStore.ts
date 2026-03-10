import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// eslint-disable-next-line fsd-import/layer-imports
import type { User } from '@/entities/user/model/user';

interface AuthState {
  accessToken: string | null;
  refreshToken?: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setAuth: () => void;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setAccessToken: (token) =>
        set({
          accessToken: token,
        }),

      setRefreshToken: (token) =>
        set({
          refreshToken: token,
        }),

      setAuth: () =>
        set({
          isAuthenticated: true,
        }),

      setUser: (user) =>
        set({
          user: user,
        }),

      clearAuth: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    },
  ),
);
