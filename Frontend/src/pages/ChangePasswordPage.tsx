import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import type { ChangePasswordRequest } from '../types/api';
import { getErrorMessage } from '../utils/errors';
import { PasswordField } from '../components/PasswordField';
import { useTranslation } from 'react-i18next';

export function ChangePasswordPage() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const schema: yup.ObjectSchema<ChangePasswordRequest> = yup.object({
    currentPassword: yup.string().required(t('validationRequired')),
    newPassword: yup.string().min(8, t('validationMinPassword')).required(t('validationRequired')),
  });
  const { register, handleSubmit, formState } = useForm<ChangePasswordRequest>({
    resolver: yupResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const auth = await authApi.changePassword(values);
      setAuth(auth);
      toast.success(t('passwordChanged'));
      navigate(auth.user.role === 'Admin' ? '/admin' : auth.user.role === 'Instructor' ? '/instructor' : '/student', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return (
    <Card sx={{ maxWidth: 620 }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Typography variant="h5">{t('changePassword')}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          {t('passwordChangeRequired')}
        </Typography>
        <Stack component="form" spacing={2.5} onSubmit={onSubmit}>
          <PasswordField label={t('currentPassword')} autoComplete="current-password" {...register('currentPassword')} error={!!formState.errors.currentPassword} helperText={formState.errors.currentPassword?.message} />
          <PasswordField label={t('newPassword')} autoComplete="new-password" {...register('newPassword')} error={!!formState.errors.newPassword} helperText={formState.errors.newPassword?.message} />
          <Button type="submit" variant="contained" disabled={formState.isSubmitting} sx={{ minHeight: 46 }}>
            {t('savePassword')}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
