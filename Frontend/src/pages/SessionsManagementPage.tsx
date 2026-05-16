import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { coursesApi } from '../api/courses';
import { CoursePicker } from '../components/CoursePicker';
import { PageLoader } from '../components/StateViews';
import { useCourses } from '../hooks/useAppData';
import type { CreateCourseSessionRequest } from '../types/api';
import { getErrorMessage } from '../utils/errors';
import { useTranslation } from 'react-i18next';

export function SessionsManagementPage({ embeddedCourseId }: { embeddedCourseId?: string }) {
  const courses = useCourses();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const routeState = location.state as { returnTo?: string; selectedCourseId?: string } | null;
  const [courseId, setCourseId] = useState(embeddedCourseId ?? '');
  const schema: yup.ObjectSchema<CreateCourseSessionRequest> = yup.object({
    title: yup.string().max(160).required(t('validationRequired')),
    sessionDate: yup.string().required(t('validationRequired')),
  });
  const { register, handleSubmit, reset, formState } = useForm<CreateCourseSessionRequest>({
    resolver: yupResolver(schema),
    defaultValues: { title: '', sessionDate: new Date().toISOString().slice(0, 10) },
  });
  const create = useMutation({
    mutationFn: (values: CreateCourseSessionRequest) => coursesApi.createSession(embeddedCourseId ?? courseId, values),
    onSuccess: (session) => {
      toast.success(t('sessionCreated', { title: session.title }));
      queryClient.invalidateQueries({ queryKey: ['course-sessions', embeddedCourseId ?? courseId] });
      reset({ title: '', sessionDate: new Date().toISOString().slice(0, 10) });
      if (embeddedCourseId && routeState?.returnTo) {
        navigate(routeState.returnTo, {
          state: { selectedCourseId: embeddedCourseId, selectedSessionId: session.id },
          replace: true,
        });
      }
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (courses.isLoading) return <PageLoader />;

  return (
    <Card id="sessions" sx={{ scrollMarginTop: 110 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>{t('sessionsManagement')}</Typography>
        <Stack component="form" spacing={2} onSubmit={handleSubmit((values) => create.mutate(values))}>
          {!embeddedCourseId && <CoursePicker courses={courses.data ?? []} value={courseId} onChange={setCourseId} />}
          <TextField label={t('sessionTitle')} {...register('title')} error={!!formState.errors.title} helperText={formState.errors.title?.message} />
          <TextField label={t('sessionDate')} type="date" slotProps={{ inputLabel: { shrink: true } }} {...register('sessionDate')} error={!!formState.errors.sessionDate} helperText={formState.errors.sessionDate?.message} />
          <Button type="submit" variant="contained" startIcon={<EventAvailableIcon />} disabled={!(embeddedCourseId ?? courseId) || create.isPending}>{t('createSession')}</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
