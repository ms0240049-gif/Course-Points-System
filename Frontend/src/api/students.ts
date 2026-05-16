import { api } from './http';
import type { CreateStudentRequest, StudentDto } from '../types/api';

export const studentsApi = {
  list: async () => (await api.get<StudentDto[]>('/Students')).data,
  create: async (body: CreateStudentRequest) => (await api.post<StudentDto>('/Students', body)).data,
  delete: async (studentId: string) => api.delete(`/Students/${studentId}`),
};
