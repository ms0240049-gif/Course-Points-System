import { Card, CardContent, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useState } from 'react';
import { CoursePicker } from '../components/CoursePicker';
import { EmptyState, PageLoader } from '../components/StateViews';
import { useCourses, useStudentPoints } from '../hooks/useAppData';
import { useAuthStore } from '../store/authStore';
import { formatDate } from '../utils/errors';
import { PointLogType } from '../types/api';
import { useTranslation } from 'react-i18next';

const pointTypeKey = (type: number) => {
  if (type === PointLogType.Attendance) return 'pointTypeAttendance';
  if (type === PointLogType.SessionQuestion) return 'pointTypeQuestion';
  if (type === PointLogType.MiniContest) return 'pointTypeContest';
  return 'pointTypeManual';
};

export function StudentMyPointsPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const courses = useCourses();
  const [courseId, setCourseId] = useState('');
  const selectedCourseId = courseId || courses.data?.[0]?.id || '';
  const points = useStudentPoints(selectedCourseId, user?.id);
  const leaderboardTotal = points.data?.reduce((sum, log) => sum + log.points, 0) ?? 0;

  if (courses.isLoading || points.isLoading) return <PageLoader />;

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">{t('myPoints')}</Typography>
        <Typography color="text.secondary">{t('totalInSelectedCourse', { total: leaderboardTotal })}</Typography>
      </div>
      <Card>
        <CardContent>
          <CoursePicker courses={courses.data ?? []} value={selectedCourseId} onChange={setCourseId} />
          {points.data?.length ? (
            <Table sx={{ mt: 2 }}>
              <TableHead><TableRow><TableCell>{t('date')}</TableCell><TableCell>{t('type')}</TableCell><TableCell>{t('reason')}</TableCell><TableCell align="right">{t('points')}</TableCell></TableRow></TableHead>
              <TableBody>
                {points.data.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>{formatDate(log.createdAt)}</TableCell>
                    <TableCell>{t(pointTypeKey(log.type))}</TableCell>
                    <TableCell>{log.reason}</TableCell>
                    <TableCell align="right">{log.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <EmptyState title={t('noPointEntries')} description={t('pointEntriesDescription')} />}
        </CardContent>
      </Card>
    </Stack>
  );
}
