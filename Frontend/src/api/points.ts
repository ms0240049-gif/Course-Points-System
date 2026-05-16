import { api } from './http';
import type {
  AttendancePointsRequest,
  AttendanceSessionItemDto,
  BulkAttendanceRequest,
  BulkAttendanceSummaryDto,
  ContestPointsRequest,
  LeaderboardEntryDto,
  ManualPointsRequest,
  PointsLogDto,
  QuestionPointsRequest,
} from '../types/api';

export const pointsApi = {
  leaderboard: async (courseId: string) =>
    (await api.get<LeaderboardEntryDto[]>(`/courses/${courseId}/points/leaderboard`)).data,
  studentPoints: async (courseId: string, studentId: string) =>
    (await api.get<PointsLogDto[]>(`/courses/${courseId}/points/students/${studentId}`)).data,
  attendance: async (courseId: string, body: AttendancePointsRequest) =>
    (await api.post<PointsLogDto>(`/courses/${courseId}/points/attendance`, body)).data,
  sessionAttendance: async (courseId: string, courseSessionId: string) =>
    (await api.get<AttendanceSessionItemDto[]>(`/courses/${courseId}/points/attendance/sessions/${courseSessionId}`)).data,
  bulkAttendance: async (courseId: string, body: BulkAttendanceRequest) =>
    (await api.post<BulkAttendanceSummaryDto>(`/courses/${courseId}/points/attendance/bulk`, body)).data,
  question: async (courseId: string, body: QuestionPointsRequest) =>
    (await api.post<PointsLogDto>(`/courses/${courseId}/points/question`, body)).data,
  contest: async (courseId: string, body: ContestPointsRequest) =>
    (await api.post<PointsLogDto>(`/courses/${courseId}/points/contest`, body)).data,
  manual: async (courseId: string, body: ManualPointsRequest) =>
    (await api.post<PointsLogDto>(`/courses/${courseId}/points/manual`, body)).data,
};
