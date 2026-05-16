import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Card, CardContent, FormControlLabel, Grid, Stack, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import PasswordIcon from '@mui/icons-material/Password';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { instructorsApi } from '../api/instructors';
import { PasswordField } from '../components/PasswordField';
import { EmptyState, PageLoader } from '../components/StateViews';
import { useInstructors } from '../hooks/useAppData';
import type { CreateInstructorRequest } from '../types/api';
import { getErrorMessage } from '../utils/errors';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { InstructorDto } from '../types/api';
import { ResetPasswordDialog } from '../components/ResetPasswordDialog';
import { usersApi } from '../api/users';

export function InstructorsPage() {
  const instructors = useInstructors();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [instructorToDelete, setInstructorToDelete] = useState<InstructorDto | null>(null);
  const [instructorToReset, setInstructorToReset] = useState<InstructorDto | null>(null);
  const queryClient = useQueryClient();
  const schema: yup.ObjectSchema<CreateInstructorRequest> = yup.object({
    fullName: yup.string().max(160).required(t('validationRequired')),
    email: yup.string().email(t('validationEmail')).max(256).required(t('validationRequired')),
    password: yup.string().min(8, t('validationMinPassword')).max(100).required(t('validationRequired')),
    mustChangePassword: yup.boolean().required(),
  });
  const { register, control, handleSubmit, reset, formState } = useForm<CreateInstructorRequest>({
    resolver: yupResolver(schema),
    defaultValues: { fullName: '', email: '', password: '', mustChangePassword: true },
  });
  const create = useMutation({
    mutationFn: instructorsApi.create,
    onSuccess: () => {
      toast.success(t('instructorCreated'));
      reset();
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: instructorsApi.delete,
    onSuccess: () => {
      toast.success(t('instructorDeleted'));
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      queryClient.invalidateQueries({ queryKey: ['course-instructors'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const resetPassword = useMutation({
    mutationFn: ({ userId, newPassword, mustChangePassword }: { userId: string; newPassword: string; mustChangePassword: boolean }) =>
      usersApi.resetPassword(userId, { newPassword, mustChangePassword }),
    onSuccess: () => {
      toast.success(t('passwordResetDone'));
      setInstructorToReset(null);
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (instructors.isLoading) return <PageLoader />;

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">{t('instructors')}</Typography>
        <Typography color="text.secondary">{t('instructorsSubtitle')}</Typography>
      </div>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card><CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>{t('newInstructor')}</Typography>
            <Stack component="form" spacing={2} onSubmit={handleSubmit((values) => create.mutate(values))}>
              <TextField label={t('fullName')} {...register('fullName')} error={!!formState.errors.fullName} helperText={formState.errors.fullName?.message} />
              <TextField label={t('email')} {...register('email')} error={!!formState.errors.email} helperText={formState.errors.email?.message} />
              <PasswordField label={t('password')} {...register('password')} error={!!formState.errors.password} helperText={formState.errors.password?.message} />
              <Controller name="mustChangePassword" control={control} render={({ field }) => <FormControlLabel control={<Switch checked={field.value} onChange={(_, value) => field.onChange(value)} />} label={t('requirePasswordChange')} />} />
              <Button type="submit" variant="contained" startIcon={<PersonAddAltIcon />} disabled={create.isPending}>{t('createInstructor')}</Button>
            </Stack>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card><CardContent>
            {instructors.data?.length ? (
              <Table>
                <TableHead><TableRow><TableCell>{t('name')}</TableCell><TableCell>{t('email')}</TableCell><TableCell>{t('status')}</TableCell><TableCell align="right">{t('actions')}</TableCell></TableRow></TableHead>
                <TableBody>{instructors.data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.fullName}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.isActive ? t('active') : t('inactive')}</TableCell>
                    <TableCell align="right">
                      {user?.role === 'Admin' && (
                        <Button
                          size="small"
                          startIcon={<PasswordIcon />}
                          disabled={!item.isActive || resetPassword.isPending}
                          onClick={() => setInstructorToReset(item)}
                        >
                          {t('resetPassword')}
                        </Button>
                      )}
                      {item.id !== user?.id && (
                        <Button
                          color="error"
                          size="small"
                          startIcon={<DeleteIcon />}
                          disabled={!item.isActive || remove.isPending}
                          onClick={() => setInstructorToDelete(item)}
                        >
                          {t('delete')}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            ) : <EmptyState title={t('noInstructorsYet')} description={t('createInstructorsFirst')} />}
          </CardContent></Card>
        </Grid>
      </Grid>
      <ConfirmDialog
        open={Boolean(instructorToDelete)}
        title={t('confirmAction')}
        message={t('deleteInstructorConfirm', { name: instructorToDelete?.fullName })}
        loading={remove.isPending}
        onClose={() => setInstructorToDelete(null)}
        onConfirm={() => instructorToDelete && remove.mutate(instructorToDelete.id, { onSuccess: () => setInstructorToDelete(null) })}
      />
      <ResetPasswordDialog
        open={Boolean(instructorToReset)}
        userName={instructorToReset?.fullName}
        loading={resetPassword.isPending}
        onClose={() => setInstructorToReset(null)}
        onSubmit={(values) => instructorToReset && resetPassword.mutate({ userId: instructorToReset.id, ...values })}
      />
    </Stack>
  );
}
