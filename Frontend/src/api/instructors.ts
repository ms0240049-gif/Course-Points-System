import { api } from './http';
import type { CreateInstructorRequest, InstructorDto } from '../types/api';

export const instructorsApi = {
  list: async () => (await api.get<InstructorDto[]>('/Instructors')).data,
  create: async (body: CreateInstructorRequest) => (await api.post<InstructorDto>('/Instructors', body)).data,
  delete: async (instructorId: string) => api.delete(`/Instructors/${instructorId}`),
};
