export type Role = 'Admin' | 'Instructor' | 'Student';

export type UserDto = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  mustChangePassword: boolean;
};

export type AuthResponse = {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: UserDto;
};

export type LoginRequest = { email: string; password: string };
export type RefreshTokenRequest = { refreshToken: string };
export type LogoutRequest = { refreshToken: string };
export type ChangePasswordRequest = { currentPassword: string; newPassword: string };
export type ResetUserPasswordRequest = { newPassword: string; mustChangePassword: boolean };

export type CreateStudentRequest = {
  fullName: string;
  email: string;
  password: string;
  mustChangePassword: boolean;
};

export type CreateInstructorRequest = {
  fullName: string;
  email: string;
  password: string;
  mustChangePassword: boolean;
};

export type StudentDto = {
  id: string;
  email: string;
  fullName: string;
  mustChangePassword: boolean;
  isActive: boolean;
  createdAt: string;
};

export type InstructorDto = StudentDto;

export type CreateCourseRequest = { name: string; code: string; description: string };
export type CreateCourseSessionRequest = { title: string; sessionDate: string };
export type AssignStudentRequest = { studentId: string };
export type AssignInstructorRequest = { instructorId: string };

export type CourseDto = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
};

export type CourseSessionDto = {
  id: string;
  courseId: string;
  title: string;
  sessionDate: string;
};

export type CourseStudentSummaryDto = {
  studentId: string;
  fullName: string;
  email: string;
  totalPoints: number;
  attendanceCount: number;
  absenceCount: number;
  excusedAbsenceCount: number;
};

export type CourseInstructorDto = {
  id: string;
  instructorId: string;
  fullName: string;
  email: string;
  assignedAt: string;
  isActive: boolean;
};

export const QuestionResult = {
  None: 0,
  Correct: 1,
  Close: 2,
} as const;

export const PointLogType = {
  Attendance: 1,
  SessionQuestion: 2,
  MiniContest: 3,
  ManualAdjustment: 4,
} as const;

export type AttendancePointsRequest = {
  studentId: string;
  courseSessionId: string | null;
  isPresent: boolean;
};

export type QuestionPointsRequest = {
  studentId: string;
  courseSessionId: string | null;
  result: number;
};

export type ContestPointsRequest = { studentId: string; rank: number | null };
export type ManualPointsRequest = { studentId: string; points: number; reason: string };

export type PointsLogDto = {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseSessionId: string | null;
  type: number;
  attendanceStatus: number | null;
  points: number;
  reason: string;
  createdAt: string;
};

export type BulkAttendanceItemRequest = { studentId: string; status: number; reason?: string | null };
export type BulkAttendanceRequest = { courseSessionId: string; items: BulkAttendanceItemRequest[] };
export type BulkAttendanceSummaryDto = {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
  totalPointsAdded: number;
};

export type AttendanceSessionItemDto = { studentId: string; status: number; reason?: string | null };

export type LeaderboardEntryDto = {
  studentId: string;
  studentName: string;
  email: string;
  totalPoints: number;
};
