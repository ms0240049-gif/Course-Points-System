import { Button, Card, CardContent, Chip, FormControl, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EventIcon from '@mui/icons-material/Event';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { pointsApi } from '../api/points';
import { CoursePicker } from '../components/CoursePicker';
import { EmptyState, ErrorState, PageLoader } from '../components/StateViews';
import { useCourseSessions, useCourseStudents, useCourses } from '../hooks/useAppData';
import { getErrorMessage } from '../utils/errors';
import { useTranslation } from 'react-i18next';

const attendanceStatuses = [
  { value: 0, labelKey: 'absent', color: 'error' as const },
  { value: 1, labelKey: 'present', color: 'success' as const },
  { value: 2, labelKey: 'excused', color: 'warning' as const },
];

export function BulkAttendancePage() {
  const courses = useCourses();
  const location = useLocation();
  const routeState = location.state as { selectedCourseId?: string; selectedSessionId?: string } | null;
  const { t } = useTranslation();
  const [courseId, setCourseId] = useState(routeState?.selectedCourseId ?? '');
  const selectedCourseId = courseId || courses.data?.[0]?.id || '';
  const sessions = useCourseSessions(selectedCourseId);
  const students = useCourseStudents(selectedCourseId);
  const [sessionId, setSessionId] = useState(routeState?.selectedSessionId ?? '');
  const [statuses, setStatuses] = useState<Record<string, number>>({});
  const [excuseReasons, setExcuseReasons] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const selectedSessionId = sessionId || sessions.data?.[0]?.id || '';
  const savedAttendance = useQuery({
    queryKey: ['session-attendance', selectedCourseId, selectedSessionId],
    queryFn: () => pointsApi.sessionAttendance(selectedCourseId, selectedSessionId),
    enabled: Boolean(selectedCourseId && selectedSessionId),
  });

  useEffect(() => {
    if (!students.data || !selectedSessionId) return;

    const saved = new Map((savedAttendance.data ?? []).map((item) => [item.studentId, item.status]));
    const savedReasons = new Map((savedAttendance.data ?? []).map((item) => [item.studentId, item.reason?.replace(/^Attendance: excused\s*-\s*/i, '') ?? '']));
    setStatuses(Object.fromEntries(students.data.map((student) => [student.studentId, saved.get(student.studentId) ?? 0])));
    setExcuseReasons(Object.fromEntries(students.data.map((student) => [student.studentId, savedReasons.get(student.studentId) ?? ''])));
  }, [students.data, savedAttendance.data, selectedSessionId]);

  const items = useMemo(() => students.data?.map((student) => {
    const status = statuses[student.studentId] ?? 0;
    return {
      studentId: student.studentId,
      status,
      reason: status === 2 ? (excuseReasons[student.studentId]?.trim() || null) : null,
    };
  }) ?? [], [students.data, statuses, excuseReasons]);
  const submit = useMutation({
    mutationFn: () => pointsApi.bulkAttendance(selectedCourseId, { courseSessionId: selectedSessionId, items }),
    onSuccess: (summary) => {
      toast.success(t('attendanceSaved', { points: summary.totalPointsAdded }));
      queryClient.invalidateQueries({ queryKey: ['course-students'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['session-attendance', selectedCourseId, selectedSessionId] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (courses.isLoading || sessions.isLoading || students.isLoading || savedAttendance.isLoading) return <PageLoader />;
  if (!courses.data?.length) {
    return (
      <EmptyState
        title={t('noCoursesAvailable')}
        description={t('noCoursesDescription')}
      />
    );
  }
  if (sessions.isError) return <ErrorState message={getErrorMessage(sessions.error)} onRetry={() => sessions.refetch()} />;
  if (students.isError) return <ErrorState message={getErrorMessage(students.error)} onRetry={() => students.refetch()} />;
  if (savedAttendance.isError) return <ErrorState message={getErrorMessage(savedAttendance.error)} onRetry={() => savedAttendance.refetch()} />;

  const sessionsPath = selectedCourseId ? `../courses/${selectedCourseId}#sessions` : '../courses';
  const studentsPath = selectedCourseId ? `../courses/${selectedCourseId}#students` : '../courses';

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">{t('bulkAttendance')}</Typography>
        <Typography color="text.secondary">{t('attendanceSubtitle')}</Typography>
      </div>
      <Card><CardContent>
        <Stack spacing={2}>
          <CoursePicker courses={courses.data ?? []} value={selectedCourseId} onChange={(value) => { setCourseId(value); setSessionId(''); setStatuses({}); setExcuseReasons({}); }} label={t('course')} />
          {!sessions.data?.length ? (
            <Stack spacing={2} sx={{ py: 4, alignItems: 'center', textAlign: 'center' }}>
              <EmptyState title={t('noSessionsCourse')} description={t('createSessionFirst')} />
              <Button
                component={RouterLink}
                to={sessionsPath}
                state={{ returnTo: location.pathname, selectedCourseId }}
                variant="contained"
                startIcon={<EventIcon />}
              >
                {t('createSession')}
              </Button>
            </Stack>
          ) : (
            <FormControl fullWidth>
              <InputLabel>{t('session')}</InputLabel>
              <Select label={t('session')} value={selectedSessionId} onChange={(event) => setSessionId(event.target.value)}>
                {sessions.data.map((session) => <MenuItem key={session.id} value={session.id}>{session.title} - {session.sessionDate}</MenuItem>)}
              </Select>
            </FormControl>
          )}
          {!students.data?.length ? (
            <Stack spacing={2} sx={{ py: 4, alignItems: 'center', textAlign: 'center' }}>
              <EmptyState title={t('noStudentsCourse')} description={t('assignStudentsFirst')} />
              <Button component={RouterLink} to={studentsPath} state={{ selectedCourseId }} variant="contained" startIcon={<PersonAddIcon />}>{t('assignStudents')}</Button>
            </Stack>
          ) : (
            <Table>
              <TableHead><TableRow><TableCell>{t('student')}</TableCell><TableCell>{t('email')}</TableCell><TableCell>{t('totalPoints')}</TableCell><TableCell>{t('status')}</TableCell><TableCell>{t('excuseReason')}</TableCell></TableRow></TableHead>
              <TableBody>{students.data.map((student) => {
                const status = statuses[student.studentId] ?? 0;
                const meta = attendanceStatuses.find((item) => item.value === status)!;
                return (
                  <TableRow key={student.studentId}>
                    <TableCell>{student.fullName}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.totalPoints}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Chip label={t(meta.labelKey)} color={meta.color} size="small" />
                        <Select size="small" value={status} onChange={(event) => setStatuses((current) => ({ ...current, [student.studentId]: Number(event.target.value) }))}>
                          {attendanceStatuses.map((item) => <MenuItem key={item.value} value={item.value}>{t(item.labelKey)}</MenuItem>)}
                        </Select>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ minWidth: 220 }}>
                      {status === 2 && (
                        <TextField
                          size="small"
                          label={t('excuseReason')}
                          value={excuseReasons[student.studentId] ?? ''}
                          onChange={(event) => setExcuseReasons((current) => ({ ...current, [student.studentId]: event.target.value }))}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}</TableBody>
            </Table>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {attendanceStatuses.map((item) => (
              <Chip
                key={item.value}
                color={item.color}
                label={`${t(item.labelKey)}: ${items.filter((attendance) => attendance.status === item.value).length}`}
              />
            ))}
            <Chip color="primary" label={`${t('totalPoints')}: ${items.filter((attendance) => attendance.status === 1).length * 5}`} />
          </Stack>
          <Button variant="contained" startIcon={<SaveIcon />} disabled={!selectedCourseId || !selectedSessionId || !items.length || !sessions.data?.length || submit.isPending} onClick={() => submit.mutate()}>{t('submitAttendance')}</Button>
        </Stack>
      </CardContent></Card>
    </Stack>
  );
}
