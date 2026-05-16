import { api, rawApi } from './http';
import type { AuthResponse, ChangePasswordRequest, LoginRequest, LogoutRequest } from '../types/api';

export const authApi = {
  login: async (body: LoginRequest) => (await rawApi.post<AuthResponse>('/Auth/login', body)).data,
  refresh: async (refreshToken: string) => (await rawApi.post<AuthResponse>('/Auth/refresh', { refreshToken })).data,
  logout: async (body: LogoutRequest) => api.post('/Auth/logout', body),
  changePassword: async (body: ChangePasswordRequest) => (await api.post<AuthResponse>('/Auth/change-password', body)).data,
};
