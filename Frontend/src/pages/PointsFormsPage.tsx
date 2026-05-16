import { Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { pointsApi } from '../api/points';
import { CoursePicker } from '../components/CoursePicker';
import { StudentPicker } from '../components/StudentPicker';
import { EmptyState, PageLoader } from '../components/StateViews';
import { useCourseStudents, useCourses } from '../hooks/useAppData';
import { QuestionResult } from '../types/api';
import { getErrorMessage } from '../utils/errors';
import { useTranslation } from 'react-i18next';

type Mode = 'attendance' | 'question' | 'contest' | 'manual';

export function PointsFormsPage({ mode }: { mode: Mode }) {
  const { t } = useTranslation();
  const courses = useCourses();
  const [courseId, setCourseId] = useState('');
  const courseStudents = useCourseStudents(courseId);
  const [studentId, setStudentId] = useState('');
  const [isPresent, setIsPresent] = useState(true);
  const [result, setResult] = useState<number>(QuestionResult.Correct);
  const [rank, setRank] = useState<string>('');
  const [points, setPoints] = useState(0);
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();
  const titles: Record<Mode, string> = {
    attendance: t('attendancePoints'),
    question: t('questionPoints'),
    contest: t('contestPoints'),
    manual: t('manualPoints'),
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (mode === 'attendance') return pointsApi.attendance(courseId, { studentId, courseSessionId: null, isPresent });
      if (mode === 'question') return pointsApi.question(courseId, { studentId, courseSessionId: null, result });
      if (mode === 'contest') return pointsApi.contest(courseId, { studentId, rank: rank ? Number(rank) : null });
      return pointsApi.manual(courseId, { studentId, points, reason });
    },
    onSuccess: (log) => {
      toast.success(t('pointsSaved', { points: log.points }));
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['student-points'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (courses.isLoading || courseStudents.isLoading) return <PageLoader />;

  return (
    <Card sx={{ maxWidth: 760 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5">{titles[mode]}</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>{t('pointsLogSubtitle')}</Typography>
        <Stack spacing={2.5}>
          <CoursePicker courses={courses.data ?? []} value={courseId} onChange={(value) => { setCourseId(value); setStudentId(''); }} label={t('course')} />
          {!courseId ? (
            <EmptyState title={t('selectCourseFirst')} description={t('studentsAfterCourse')} />
          ) : !courseStudents.data?.length ? (
            <EmptyState title={t('noStudentsInCourse')} description={t('assignStudentsToCourseFirst')} />
          ) : (
            <StudentPicker
              students={courseStudents.data.map((student) => ({
                id: student.studentId,
                fullName: student.fullName,
                email: student.email,
                mustChangePassword: false,
                isActive: true,
                createdAt: '',
              }))}
              value={studentId}
              onChange={setStudentId}
              label={t('student')}
            />
          )}
          {mode === 'attendance' && (
            <FormControl fullWidth><InputLabel>{t('status')}</InputLabel><Select label={t('status')} value={isPresent ? 'present' : 'absent'} onChange={(event) => setIsPresent(event.target.value === 'present')}><MenuItem value="present">{t('presentPoints')}</MenuItem><MenuItem value="absent">{t('absentPoints')}</MenuItem></Select></FormControl>
          )}
          {mode === 'question' && (
            <FormControl fullWidth><InputLabel>{t('result')}</InputLabel><Select label={t('result')} value={result} onChange={(event) => setResult(Number(event.target.value))}><MenuItem value={QuestionResult.Correct}>{t('correctPoints')}</MenuItem><MenuItem value={QuestionResult.Close}>{t('closePoints')}</MenuItem><MenuItem value={QuestionResult.None}>{t('nonePoints')}</MenuItem></Select></FormControl>
          )}
          {mode === 'contest' && (
            <FormControl fullWidth><InputLabel>{t('rank')}</InputLabel><Select label={t('rank')} value={rank} onChange={(event) => setRank(event.target.value)}><MenuItem value="1">{t('rank1Points')}</MenuItem><MenuItem value="2">{t('rank2Points')}</MenuItem><MenuItem value="3">{t('rank3Points')}</MenuItem><MenuItem value="4">{t('otherRankPoints')}</MenuItem></Select></FormControl>
          )}
          {mode === 'manual' && (
            <>
              <TextField label={t('points')} type="number" value={points} onChange={(event) => setPoints(Number(event.target.value))} />
              <TextField label={t('reason')} value={reason} onChange={(event) => setReason(event.target.value)} multiline minRows={3} />
            </>
          )}
          <Button variant="contained" startIcon={<SaveIcon />} disabled={!courseId || !studentId || mutation.isPending || (mode === 'contest' && !rank) || (mode === 'manual' && !reason)} onClick={() => mutation.mutate()}>
            {t('savePoints')}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
