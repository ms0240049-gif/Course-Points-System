import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, Switch } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { PasswordField } from './PasswordField';
import type { ResetUserPasswordRequest } from '../types/api';

export function ResetPasswordDialog({
  open,
  userName,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  userName?: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: ResetUserPasswordRequest) => void;
}) {
  const { t } = useTranslation();
  const schema: yup.ObjectSchema<ResetUserPasswordRequest> = yup.object({
    newPassword: yup.string().min(8, t('validationMinPassword')).max(100).required(t('validationRequired')),
    mustChangePassword: yup.boolean().required(),
  });
  const { register, control, handleSubmit, reset, formState } = useForm<ResetUserPasswordRequest>({
    resolver: yupResolver(schema),
    defaultValues: { newPassword: '', mustChangePassword: true },
  });

  const close = () => {
    reset({ newPassword: '', mustChangePassword: true });
    onClose();
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : close} fullWidth maxWidth="xs">
      <DialogTitle>{t('resetPasswordFor', { name: userName })}</DialogTitle>
      <DialogContent>
        <Stack component="form" spacing={2.5} sx={{ pt: 1 }} onSubmit={handleSubmit(onSubmit)}>
          <PasswordField label={t('newPasswordValue')} autoComplete="new-password" {...register('newPassword')} error={!!formState.errors.newPassword} helperText={formState.errors.newPassword?.message} />
          <Controller
            name="mustChangePassword"
            control={control}
            render={({ field }) => <FormControlLabel control={<Switch checked={field.value} onChange={(_, value) => field.onChange(value)} />} label={t('requirePasswordChange')} />}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={close} disabled={loading}>{t('cancel')}</Button>
        <Button variant="contained" disabled={loading} onClick={handleSubmit(onSubmit)}>{t('resetPassword')}</Button>
      </DialogActions>
    </Dialog>
  );
}
