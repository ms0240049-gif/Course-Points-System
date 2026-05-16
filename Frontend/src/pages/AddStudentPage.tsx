import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Card, CardContent, FormControlLabel, Stack, Switch, TextField, Typography } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { studentsApi } from '../api/students';
import type { CreateStudentRequest } from '../types/api';
import { getErrorMessage } from '../utils/errors';
import { PasswordField } from '../components/PasswordField';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';

export function AddStudentPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const schema: yup.ObjectSchema<CreateStudentRequest> = yup.object({
    fullName: yup.string().max(160).required(t('validationRequired')),
    email: yup.string().email(t('validationEmail')).max(256).required(t('validationRequired')),
    password: yup.string().min(8, t('validationMinPassword')).max(100).required(t('validationRequired')),
    mustChangePassword: yup.boolean().required(),
  });
  const { register, control, handleSubmit, formState } = useForm<CreateStudentRequest>({
    resolver: yupResolver(schema),
    defaultValues: { fullName: '', email: '', password: '', mustChangePassword: true },
  });
  const create = useMutation({
    mutationFn: studentsApi.create,
    onSuccess: () => {
      toast.success(t('studentAccountCreated'));
      queryClient.invalidateQueries({ queryKey: ['students'] });
      navigate(user?.role === 'Instructor' ? '/instructor/students' : '/admin/students');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <Card sx={{ maxWidth: 680 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5">{t('addStudent')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>{t('studentLoginHint')}</Typography>
        <Stack component="form" spacing={2.5} onSubmit={handleSubmit((values) => create.mutate(values))}>
          <TextField label={t('fullName')} {...register('fullName')} error={!!formState.errors.fullName} helperText={formState.errors.fullName?.message} />
          <TextField label={t('email')} {...register('email')} error={!!formState.errors.email} helperText={formState.errors.email?.message} />
          <PasswordField label={t('password')} autoComplete="new-password" {...register('password')} error={!!formState.errors.password} helperText={formState.errors.password?.message} />
          <Controller name="mustChangePassword" control={control} render={({ field }) => <FormControlLabel control={<Switch checked={field.value} onChange={(_, value) => field.onChange(value)} />} label={t('requirePasswordChangeFirstLogin')} />} />
          <Button type="submit" variant="contained" startIcon={<PersonAddIcon />} disabled={create.isPending}>{t('createStudent')}</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
