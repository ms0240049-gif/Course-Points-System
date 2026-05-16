import { Grid, Stack, Typography } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { StatCard } from '../components/StatCard';
import { PageLoader } from '../components/StateViews';
import { useCourses, useLeaderboard } from '../hooks/useAppData';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';

export function StudentDashboardPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const courses = useCourses();
  const firstCourseId = courses.data?.[0]?.id;
  const leaderboard = useLeaderboard(firstCourseId);
  const me = leaderboard.data?.find((entry) => entry.studentId === user?.id);

  if (courses.isLoading || leaderboard.isLoading) return <PageLoader />;

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">{t('studentDashboard')}</Typography>
        <Typography color="text.secondary">{t('studentDashboardSubtitle')}</Typography>
      </div>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}><StatCard title={t('assignedCourses')} value={courses.data?.length ?? 0} icon={<SchoolIcon color="primary" fontSize="large" />} /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><StatCard title={t('currentTotal')} value={me?.totalPoints ?? 0} icon={<EmojiEventsIcon color="warning" fontSize="large" />} /></Grid>
      </Grid>
    </Stack>
  );
}
