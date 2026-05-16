import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import type { AuthResponse } from '../types/api';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5265/api';

export const api = axios.create({ baseURL });
export const rawApi = axios.create({ baseURL });

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<AuthResponse> | null = null;

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequest | undefined;
    const refreshToken = useAuthStore.getState().refreshToken;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || !refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= rawApi
        .post<AuthResponse>('/Auth/refresh', { refreshToken })
        .then((response) => response.data)
        .finally(() => {
          refreshPromise = null;
        });

      const auth = await refreshPromise;
      useAuthStore.getState().setAuth(auth);
      originalRequest.headers.Authorization = `Bearer ${auth.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearAuth();
      window.location.assign('/login');
      return Promise.reject(refreshError);
    }
  },
);
