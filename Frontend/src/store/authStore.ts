import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse, UserDto } from '../types/api';

type AuthState = {
  user: UserDto | null;
  accessToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshToken: string | null;
  refreshTokenExpiresAt: string | null;
  setAuth: (auth: AuthResponse) => void;
  updateUser: (user: UserDto) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      accessTokenExpiresAt: null,
      refreshToken: null,
      refreshTokenExpiresAt: null,
      setAuth: (auth) =>
        set({
          user: auth.user,
          accessToken: auth.accessToken,
          accessTokenExpiresAt: auth.accessTokenExpiresAt,
          refreshToken: auth.refreshToken,
          refreshTokenExpiresAt: auth.refreshTokenExpiresAt,
        }),
      updateUser: (user) => set({ user }),
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          accessTokenExpiresAt: null,
          refreshToken: null,
          refreshTokenExpiresAt: null,
        }),
    }),
    { name: 'course-points-auth' },
  ),
);
