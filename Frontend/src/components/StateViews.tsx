import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export function PageLoader({ label = 'Loading data...' }: { label?: string }) {
  const { t } = useTranslation();
  return (
    <Stack sx={{ minHeight: 280, alignItems: 'center', justifyContent: 'center' }} spacing={2}>
      <CircularProgress />
      <Typography color="text.secondary">{label === 'Loading data...' ? t('loadingData') : label}</Typography>
    </Stack>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useTranslation();
  return (
    <Alert
      severity="error"
      action={onRetry ? <Button onClick={onRetry}>{t('retry')}</Button> : undefined}
      sx={{ alignItems: 'center' }}
    >
      {message}
    </Alert>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <Box sx={{ py: 7, textAlign: 'center', color: 'text.secondary' }}>
      <Typography variant="h6" color="text.primary">
        {title}
      </Typography>
      {description && <Typography sx={{ mt: 1 }}>{description}</Typography>}
    </Box>
  );
}
