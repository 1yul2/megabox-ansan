import { create } from 'zustand';

// eslint-disable-next-line fsd-import/layer-imports
import type { User } from '@/entities/user/model/user';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  expiresAt: number | null; // Unix ms — Access Token 만료 시각

  setAuth: (accessToken: string, user: User, expiresIn: number) => void;
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
  isTokenExpired: () => boolean;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  expiresAt: null,

  /** 로그인 성공 / Silent Refresh 성공 시 호출 */
  setAuth: (accessToken, user, expiresIn) =>
    set({
      accessToken,
      user,
      isAuthenticated: true,
      expiresAt: Date.now() + expiresIn * 1000,
    }),

  /** Interceptor에서 Token Refresh 후 Access Token만 갱신 */
  setAccessToken: (token) =>
    set({
      accessToken: token,
      isAuthenticated: token !== null,
      expiresAt: token
        ? Date.now() + 15 * 60 * 1000 // 15분 (백엔드 설정과 일치)
        : null,
    }),

  setUser: (user) => set({ user }),

  clearAuth: () =>
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      expiresAt: null,
    }),

  /** Access Token이 만료 1분 이내이면 true */
  isTokenExpired: () => {
    const { expiresAt } = get();
    if (!expiresAt) return true;
    return Date.now() > expiresAt - 60_000;
  },
}));
