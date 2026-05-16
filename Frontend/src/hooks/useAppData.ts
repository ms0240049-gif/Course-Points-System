import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '../api/courses';
import { instructorsApi } from '../api/instructors';
import { studentsApi } from '../api/students';
import { pointsApi } from '../api/points';

export function useCourses() {
  return useQuery({ queryKey: ['courses'], queryFn: coursesApi.list });
}

export function useStudents(enabled = true) {
  return useQuery({ queryKey: ['students'], queryFn: studentsApi.list, enabled });
}

export function useInstructors(enabled = true) {
  return useQuery({ queryKey: ['instructors'], queryFn: instructorsApi.list, enabled });
}

export function useCourseStudents(courseId?: string) {
  return useQuery({
    queryKey: ['course-students', courseId],
    queryFn: () => coursesApi.students(courseId!),
    enabled: Boolean(courseId),
  });
}

export function useCourseAssignableStudents(courseId?: string) {
  return useQuery({
    queryKey: ['course-assignable-students', courseId],
    queryFn: () => coursesApi.assignableStudents(courseId!),
    enabled: Boolean(courseId),
  });
}

export function useCourseSessions(courseId?: string) {
  return useQuery({
    queryKey: ['course-sessions', courseId],
    queryFn: () => coursesApi.sessions(courseId!),
    enabled: Boolean(courseId),
  });
}

export function useCourseInstructors(courseId?: string, enabled = true) {
  return useQuery({
    queryKey: ['course-instructors', courseId],
    queryFn: () => coursesApi.instructors(courseId!),
    enabled: enabled && Boolean(courseId),
  });
}

export function useLeaderboard(courseId?: string) {
  return useQuery({
    queryKey: ['leaderboard', courseId],
    queryFn: () => pointsApi.leaderboard(courseId!),
    enabled: Boolean(courseId),
  });
}

export function useStudentPoints(courseId?: string, studentId?: string, enabled = true) {
  return useQuery({
    queryKey: ['student-points', courseId, studentId],
    queryFn: () => pointsApi.studentPoints(courseId!, studentId!),
    enabled: enabled && Boolean(courseId && studentId),
  });
}
