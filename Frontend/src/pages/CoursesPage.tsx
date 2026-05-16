import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Card, CardContent, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { coursesApi } from '../api/courses';
import { EmptyState, ErrorState, PageLoader } from '../components/StateViews';
import { useCourses } from '../hooks/useAppData';
import type { CreateCourseRequest } from '../types/api';
import { formatDate, getErrorMessage } from '../utils/errors';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { CourseDto } from '../types/api';

export function CoursesPage() {
  const courses = useCourses();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [courseToDelete, setCourseToDelete] = useState<CourseDto | null>(null);
  const queryClient = useQueryClient();
  const schema: yup.ObjectSchema<CreateCourseRequest> = yup.object({
    name: yup.string().max(160).required(t('validationRequired')),
    code: yup.string().max(32).required(t('validationRequired')),
    description: yup.string().max(600).defined(),
  });
  const { register, handleSubmit, reset, formState } = useForm<CreateCourseRequest>({
    resolver: yupResolver(schema),
    defaultValues: { name: '', code: '', description: '' },
  });
  const create = useMutation({
    mutationFn: coursesApi.create,
    onSuccess: () => {
      toast.success(t('courseCreated'));
      reset();
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: coursesApi.delete,
    onSuccess: () => {
      toast.success(t('courseDeleted'));
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (courses.isLoading) return <PageLoader />;
  if (courses.isError) return <ErrorState message={getErrorMessage(courses.error)} onRetry={() => courses.refetch()} />;

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">{t('courses')}</Typography>
        <Typography color="text.secondary">{t('courseWorkspaceSubtitle')}</Typography>
      </div>
      <Grid container spacing={3}>
        {(user?.role === 'Admin' || user?.role === 'Instructor') && <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>{t('newCourse')}</Typography>
              <Stack component="form" spacing={2} onSubmit={handleSubmit((values) => create.mutate(values))}>
                <TextField label={t('name')} {...register('name')} error={!!formState.errors.name} helperText={formState.errors.name?.message} />
                <TextField label={t('code')} {...register('code')} error={!!formState.errors.code} helperText={formState.errors.code?.message} />
                <TextField label={t('description')} multiline minRows={3} {...register('description')} error={!!formState.errors.description} helperText={formState.errors.description?.message} />
                <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={create.isPending}>{t('createCourse')}</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>}
        <Grid size={{ xs: 12, lg: user?.role === 'Admin' || user?.role === 'Instructor' ? 8 : 12 }}>
          <Card>
            <CardContent>
              {courses.data?.length ? (
                <Table>
                  <TableHead><TableRow><TableCell>{t('code')}</TableCell><TableCell>{t('name')}</TableCell><TableCell>{t('created')}</TableCell><TableCell align="right">{t('actions')}</TableCell></TableRow></TableHead>
                  <TableBody>
                    {courses.data.map((course) => (
                      <TableRow key={course.id} hover>
                        <TableCell>{course.code}</TableCell>
                        <TableCell>{course.name}</TableCell>
                        <TableCell>{formatDate(course.createdAt)}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                            <Button component={RouterLink} to={`/${user?.role === 'Instructor' ? 'instructor' : 'admin'}/courses/${course.id}`}>{t('open')}</Button>
                            {(user?.role === 'Admin' || user?.role === 'Instructor') && (
                              <Button
                                color="error"
                                startIcon={<DeleteIcon />}
                                disabled={remove.isPending}
                                onClick={() => setCourseToDelete(course)}
                              >
                                {t('delete')}
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <EmptyState title={t('noCoursesYet')} description={t('createFirstCourse')} />}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <ConfirmDialog
        open={Boolean(courseToDelete)}
        title={t('confirmAction')}
        message={t('deleteCourseConfirm', { name: courseToDelete?.name })}
        loading={remove.isPending}
        onClose={() => setCourseToDelete(null)}
        onConfirm={() => courseToDelete && remove.mutate(courseToDelete.id, { onSuccess: () => setCourseToDelete(null) })}
      />
    </Stack>
  );
}
