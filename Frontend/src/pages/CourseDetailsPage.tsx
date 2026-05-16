import { Button, Card, CardContent, Chip, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Navigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { coursesApi } from '../api/courses';
import { CoursePicker } from '../components/CoursePicker';
import { useCourseInstructors, useCourseStudents, useCourses, useInstructors, useLeaderboard } from '../hooks/useAppData';
import { EmptyState, PageLoader } from '../components/StateViews';
import { LeaderboardTable } from './LeaderboardPage';
import { SessionsManagementPage } from './SessionsManagementPage';
import { AssignStudentPage } from './AssignStudentPage';
import { useAuthStore } from '../store/authStore';
import { getErrorMessage } from '../utils/errors';
import { exportCsv } from '../utils/exportCsv';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { CourseInstructorDto, CourseStudentSummaryDto } from '../types/api';

export function CourseDetailsPage() {
  const { courseId = '' } = useParams();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const courses = useCourses();
  const students = useCourseStudents(courseId);
  const canManageInstructors = user?.role === 'Admin' || user?.role === 'Instructor';
  const instructors = useInstructors(canManageInstructors);
  const courseInstructors = useCourseInstructors(courseId, canManageInstructors);
  const [instructorId, setInstructorId] = useState('');
  const [studentToRemove, setStudentToRemove] = useState<CourseStudentSummaryDto | null>(null);
  const [instructorToRemove, setInstructorToRemove] = useState<CourseInstructorDto | null>(null);
  const queryClient = useQueryClient();
  const leaderboard = useLeaderboard(courseId);
  const course = courses.data?.find((item) => item.id === courseId);
  const assignInstructor = useMutation({
    mutationFn: () => coursesApi.assignInstructor(courseId, { instructorId }),
    onSuccess: () => {
      toast.success(t('instructorAssigned'));
      setInstructorId('');
      queryClient.invalidateQueries({ queryKey: ['course-instructors', courseId] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const removeInstructor = useMutation({
    mutationFn: (id: string) => coursesApi.removeInstructor(courseId, id),
    onSuccess: () => {
      toast.success(t('instructorRemoved'));
      queryClient.invalidateQueries({ queryKey: ['course-instructors', courseId] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const removeStudent = useMutation({
    mutationFn: (studentId: string) => coursesApi.removeStudent(courseId, studentId),
    onSuccess: () => {
      toast.success(t('studentRemoved'));
      queryClient.invalidateQueries({ queryKey: ['course-students', courseId] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  useEffect(() => {
    const sectionId = window.location.hash.replace('#', '');
    if (sectionId) {
      window.setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  }, []);

  if (courses.isLoading) return <PageLoader />;
  if (!course) return <Navigate to={user?.role === 'Instructor' ? '/instructor/courses' : '/admin/courses'} replace />;

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">{course.name}</Typography>
        <Typography color="text.secondary">{course.code} {course.description ? `- ${course.description}` : ''}</Typography>
      </div>
      <Grid container spacing={3}>
        <Grid id="students" sx={{ scrollMarginTop: 110 }} size={{ xs: 12, lg: 5 }}><AssignStudentPage embeddedCourseId={courseId} /></Grid>
        <Grid size={{ xs: 12, lg: 7 }}><SessionsManagementPage embeddedCourseId={courseId} /></Grid>
        {canManageInstructors && (
          <Grid size={{ xs: 12 }}>
            <Card><CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>{t('assignInstructor')}</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>{t('instructor')}</InputLabel>
                  <Select label={t('instructor')} value={instructorId} onChange={(event) => setInstructorId(event.target.value)}>
                    {(instructors.data ?? []).map((item) => <MenuItem key={item.id} value={item.id}>{item.fullName} - {item.email}</MenuItem>)}
                  </Select>
                </FormControl>
                <Button variant="contained" disabled={!instructorId || assignInstructor.isPending} onClick={() => assignInstructor.mutate()}>{t('assign')}</Button>
              </Stack>
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>{t('assignedInstructors')}</Typography>
              {!courseInstructors.data?.length ? <EmptyState title={t('noInstructorsCourse')} /> : (
                <Table>
                  <TableHead><TableRow><TableCell>{t('name')}</TableCell><TableCell>{t('email')}</TableCell><TableCell align="right">{t('actions')}</TableCell></TableRow></TableHead>
                  <TableBody>{courseInstructors.data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.fullName}</TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell align="right">
                        {item.instructorId !== user?.id && (
                          <Button color="error" disabled={removeInstructor.isPending} onClick={() => setInstructorToRemove(item)}>{t('remove')}</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table>
              )}
            </CardContent></Card>
          </Grid>
        )}
        <Grid size={{ xs: 12 }}>
          <Card><CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>{t('studentsManagement')}</Typography>
            {!students.data?.length ? <EmptyState title={t('noAssignedStudents')} description={t('assignStudentsToThisCourse')} /> : (
              <>
              <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => exportCsv(`Course_Students_${course.code}`, students.data.map((student) => ({
                    Name: student.fullName,
                    Email: student.email,
                    Present: student.attendanceCount,
                    Absent: student.absenceCount,
                    Excused: student.excusedAbsenceCount,
                    TotalPoints: student.totalPoints,
                  })))}
                >
                  {t('exportStudents')}
                </Button>
              </Stack>
              <Table>
                <TableHead><TableRow><TableCell>{t('name')}</TableCell><TableCell>{t('email')}</TableCell><TableCell>{t('present')}</TableCell><TableCell>{t('absent')}</TableCell><TableCell>{t('excused')}</TableCell><TableCell>{t('totalPoints')}</TableCell><TableCell align="right">{t('actions')}</TableCell></TableRow></TableHead>
                <TableBody>{students.data.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell>{student.fullName}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell><Chip color="success" size="small" label={student.attendanceCount} /></TableCell>
                    <TableCell><Chip color="error" size="small" label={student.absenceCount} /></TableCell>
                    <TableCell><Chip color="warning" size="small" label={student.excusedAbsenceCount} /></TableCell>
                    <TableCell><Typography sx={{ fontWeight: 900 }}>{student.totalPoints}</Typography></TableCell>
                    <TableCell align="right"><Button color="error" onClick={() => setStudentToRemove(student)}>{t('remove')}</Button></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
              </>
            )}
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>{t('currentLeaderboard')}</Typography>
              <CoursePicker courses={courses.data ?? []} value={courseId} onChange={() => undefined} />
              <LeaderboardTable rows={leaderboard.data ?? []} loading={leaderboard.isLoading} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <ConfirmDialog
        open={Boolean(studentToRemove)}
        title={t('confirmAction')}
        message={t('removeStudentConfirm', { name: studentToRemove?.fullName })}
        confirmLabel={t('remove')}
        loading={removeStudent.isPending}
        onClose={() => setStudentToRemove(null)}
        onConfirm={() => studentToRemove && removeStudent.mutate(studentToRemove.studentId, { onSuccess: () => setStudentToRemove(null) })}
      />
      <ConfirmDialog
        open={Boolean(instructorToRemove)}
        title={t('confirmAction')}
        message={t('removeInstructorConfirm', { name: instructorToRemove?.fullName })}
        confirmLabel={t('remove')}
        loading={removeInstructor.isPending}
        onClose={() => setInstructorToRemove(null)}
        onConfirm={() => instructorToRemove && removeInstructor.mutate(instructorToRemove.instructorId, { onSuccess: () => setInstructorToRemove(null) })}
      />
    </Stack>
  );
}
