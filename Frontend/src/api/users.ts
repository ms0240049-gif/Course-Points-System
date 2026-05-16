import { api } from './http';
import type { ResetUserPasswordRequest } from '../types/api';

export const usersApi = {
  resetPassword: async (userId: string, body: ResetUserPasswordRequest) =>
    api.put(`/Users/${userId}/password`, body),
};
