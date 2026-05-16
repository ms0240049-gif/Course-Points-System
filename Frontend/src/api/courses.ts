import { api } from './http';
import type {
  AssignStudentRequest,
  AssignInstructorRequest,
  CourseInstructorDto,
  CourseDto,
  CourseSessionDto,
  CourseStudentSummaryDto,
  CreateCourseRequest,
  CreateCourseSessionRequest,
  StudentDto,
} from '../types/api';

export const coursesApi = {
  list: async () => (await api.get<CourseDto[]>('/Courses')).data,
  create: async (body: CreateCourseRequest) => (await api.post<CourseDto>('/Courses', body)).data,
  update: async (courseId: string, body: CreateCourseRequest) => (await api.put<CourseDto>(`/Courses/${courseId}`, body)).data,
  delete: async (courseId: string) => api.delete(`/Courses/${courseId}`),
  students: async (courseId: string) => (await api.get<CourseStudentSummaryDto[]>(`/Courses/${courseId}/students`)).data,
  assignableStudents: async (courseId: string) => (await api.get<StudentDto[]>(`/Courses/${courseId}/students/assignable`)).data,
  sessions: async (courseId: string) => (await api.get<CourseSessionDto[]>(`/Courses/${courseId}/sessions`)).data,
  instructors: async (courseId: string) => (await api.get<CourseInstructorDto[]>(`/Courses/${courseId}/instructors`)).data,
  createSession: async (courseId: string, body: CreateCourseSessionRequest) =>
    (await api.post<CourseSessionDto>(`/Courses/${courseId}/sessions`, body)).data,
  assignStudent: async (courseId: string, body: AssignStudentRequest) => api.post(`/Courses/${courseId}/students`, body),
  removeStudent: async (courseId: string, studentId: string) => api.delete(`/Courses/${courseId}/students/${studentId}`),
  assignInstructor: async (courseId: string, body: AssignInstructorRequest) => api.post(`/Courses/${courseId}/instructors`, body),
  removeInstructor: async (courseId: string, instructorId: string) => api.delete(`/Courses/${courseId}/instructors/${instructorId}`),
};
