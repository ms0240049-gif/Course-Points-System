import { Grid, Stack, Typography } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ChecklistIcon from '@mui/icons-material/Checklist';
import { StatCard } from '../components/StatCard';
import { PageLoader } from '../components/StateViews';
import { useCourses } from '../hooks/useAppData';
import { useTranslation } from 'react-i18next';

export function InstructorDashboardPage() {
  const { t } = useTranslation();
  const courses = useCourses();
  if (courses.isLoading) return <PageLoader />;
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">{t('instructorDashboard')}</Typography>
        <Typography color="text.secondary">{t('instructorDashboardSubtitle')}</Typography>
      </div>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}><StatCard title={t('assignedCourses')} value={courses.data?.length ?? 0} icon={<SchoolIcon color="primary" fontSize="large" />} /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><StatCard title={t('mainWorkflow')} value={t('attendance')} icon={<ChecklistIcon color="success" fontSize="large" />} /></Grid>
      </Grid>
    </Stack>
  );
}
