import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import type { LoginRequest } from '../types/api';
import { getErrorMessage } from '../utils/errors';
import { PasswordField } from '../components/PasswordField';
import { useTranslation } from 'react-i18next';

export function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const schema: yup.ObjectSchema<LoginRequest> = yup.object({
    email: yup.string().email(t('validationEmail')).required(t('validationRequired')),
    password: yup.string().min(8, t('validationMinPassword')).required(t('validationRequired')),
  });
  const { register, handleSubmit, formState } = useForm<LoginRequest>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const auth = await authApi.login(values);
      setAuth(auth);
      toast.success(t('welcome', { name: auth.user.fullName }));
      navigate(auth.user.mustChangePassword ? '/change-password' : auth.user.role === 'Admin' ? '/admin' : auth.user.role === 'Instructor' ? '/instructor' : '/student', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, bgcolor: 'background.default' }}>
      <Card sx={{ width: '100%', maxWidth: 440 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Box>
              <LockOutlinedIcon color="primary" fontSize="large" />
              <Typography variant="h4" sx={{ mt: 1 }}>
                {t('signIn')}
              </Typography>
              <Typography color="text.secondary">{t('loginHint')}</Typography>
            </Box>
            <Stack component="form" spacing={2.5} onSubmit={onSubmit}>
              <TextField label={t('email')} autoComplete="email" {...register('email')} error={!!formState.errors.email} helperText={formState.errors.email?.message} />
              <PasswordField label={t('password')} autoComplete="current-password" {...register('password')} error={!!formState.errors.password} helperText={formState.errors.password?.message} />
              <Button size="large" type="submit" variant="contained" disabled={formState.isSubmitting}>
                {t('login')}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
