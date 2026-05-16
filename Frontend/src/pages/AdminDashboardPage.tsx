import { Grid, Stack, Typography } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { StatCard } from '../components/StatCard';
import { PageLoader } from '../components/StateViews';
import { useCourses, useStudents } from '../hooks/useAppData';
import { useTranslation } from 'react-i18next';

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const courses = useCourses();
  const students = useStudents();
  if (courses.isLoading || students.isLoading) return <PageLoader />;

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">{t('adminDashboard')}</Typography>
        <Typography color="text.secondary">{t('adminDashboardSubtitle')}</Typography>
      </div>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}><StatCard title={t('courses')} value={courses.data?.length ?? 0} icon={<SchoolIcon color="primary" fontSize="large" />} /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><StatCard title={t('students')} value={students.data?.length ?? 0} icon={<PeopleIcon color="secondary" fontSize="large" />} /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><StatCard title={t('leaderboardSource')} value={t('pointsLog')} icon={<EmojiEventsIcon color="warning" fontSize="large" />} /></Grid>
      </Grid>
    </Stack>
  );
}
