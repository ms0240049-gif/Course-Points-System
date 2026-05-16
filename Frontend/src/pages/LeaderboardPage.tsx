import { Button, Card, CardContent, Chip, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DownloadIcon from '@mui/icons-material/Download';
import { useState } from 'react';
import { CoursePicker } from '../components/CoursePicker';
import { EmptyState, PageLoader } from '../components/StateViews';
import { useCourses, useLeaderboard } from '../hooks/useAppData';
import type { LeaderboardEntryDto } from '../types/api';
import { useAuthStore } from '../store/authStore';
import { exportCsv } from '../utils/exportCsv';
import { useTranslation } from 'react-i18next';

export function LeaderboardTable({
  rows,
  loading,
  hideEmail = false,
  currentStudentId,
}: {
  rows: LeaderboardEntryDto[];
  loading?: boolean;
  hideEmail?: boolean;
  currentStudentId?: string;
}) {
  const { t } = useTranslation();
  if (loading) return <PageLoader label={t('loadingLeaderboard')} />;
  if (!rows.length) return <EmptyState title={t('noLeaderboardEntries')} description={t('leaderboardEmptyDescription')} />;
  const topThree = rows.slice(0, 3);
  const remaining = rows.slice(3);
  const podium = [
    { label: t('gold'), color: '#f59e0b', bg: '#fffbeb' },
    { label: t('silver'), color: '#64748b', bg: '#f8fafc' },
    { label: t('bronze'), color: '#b45309', bg: '#fff7ed' },
  ];
  return (
    <>
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {topThree.map((row, index) => {
        const isCurrentStudent = row.studentId === currentStudentId;
        const style = podium[index];
        return (
          <Grid key={row.studentId} size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: isCurrentStudent ? 'rgba(29, 78, 216, 0.1)' : style.bg, borderColor: style.color }}>
              <CardContent>
                <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
                  <EmojiEventsIcon sx={{ color: style.color, fontSize: 42 }} />
                  <Chip label={`#${index + 1} ${style.label}`} sx={{ bgcolor: style.color, color: '#fff', fontWeight: 800 }} />
                  <Typography variant="h6">{row.studentName}</Typography>
                  {isCurrentStudent && <Chip size="small" color="primary" label={t('you')} />}
                  {!hideEmail && <Typography variant="body2" color="text.secondary">{row.email}</Typography>}
                  <Typography variant="h4">{row.totalPoints}</Typography>
                  <Typography variant="body2" color="text.secondary">{t('points')}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
    {remaining.length > 0 && <Table sx={{ mt: 2 }}>
      <TableHead><TableRow><TableCell>{t('rank')}</TableCell><TableCell>{t('student')}</TableCell>{!hideEmail && <TableCell>{t('email')}</TableCell>}<TableCell align="right">{t('total')}</TableCell></TableRow></TableHead>
      <TableBody>
        {remaining.map((row, index) => {
          const isCurrentStudent = row.studentId === currentStudentId;
          const rank = index + 4;

          return (
            <TableRow
              key={row.studentId}
              hover
              sx={{
                bgcolor: isCurrentStudent ? 'rgba(29, 78, 216, 0.1)' : undefined,
                '&:hover': { bgcolor: isCurrentStudent ? 'rgba(29, 78, 216, 0.16)' : undefined },
                '& td': { borderColor: isCurrentStudent ? 'rgba(29, 78, 216, 0.24)' : undefined },
              }}
            >
              <TableCell>
                <Typography sx={{ fontWeight: isCurrentStudent ? 800 : 500 }}>#{rank}</Typography>
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: isCurrentStudent ? 800 : 500 }}>{row.studentName}</Typography>
                  {isCurrentStudent && <Chip size="small" color="primary" label={t('you')} />}
                </Stack>
              </TableCell>
              {!hideEmail && <TableCell>{row.email}</TableCell>}
              <TableCell align="right">
                <Typography sx={{ fontWeight: isCurrentStudent ? 900 : 700 }}>{row.totalPoints}</Typography>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>}
    </>
  );
}

export function LeaderboardPage({ studentView = false }: { studentView?: boolean }) {
  const user = useAuthStore((state) => state.user);
  const courses = useCourses();
  const [courseId, setCourseId] = useState('');
  const selectedCourseId = courseId || courses.data?.[0]?.id || '';
  const leaderboard = useLeaderboard(selectedCourseId);
  const { t } = useTranslation();
  const selectedCourse = courses.data?.find((course) => course.id === selectedCourseId);

  if (courses.isLoading) return <PageLoader />;

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">{studentView ? t('courseLeaderboard') : t('leaderboard')}</Typography>
        <Typography color="text.secondary">{t('leaderboardSubtitle')}</Typography>
      </div>
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
            <CoursePicker courses={courses.data ?? []} value={selectedCourseId} onChange={setCourseId} />
            {!studentView && (
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                disabled={!leaderboard.data?.length}
                onClick={() => exportCsv(`Course_Leaderboard_${selectedCourse?.code ?? 'course'}`, (leaderboard.data ?? []).map((row, index) => ({
                  Rank: index + 1,
                  Student: row.studentName,
                  Email: row.email,
                  TotalPoints: row.totalPoints,
                })))}
              >
                {t('exportLeaderboard')}
              </Button>
            )}
          </Stack>
          <LeaderboardTable
            rows={leaderboard.data ?? []}
            loading={leaderboard.isLoading}
            hideEmail={studentView}
            currentStudentId={studentView ? user?.id : undefined}
          />
        </CardContent>
      </Card>
    </Stack>
  );
}
