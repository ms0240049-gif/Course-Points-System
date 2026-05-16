import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { coursesApi } from '../api/courses';
import { CoursePicker } from '../components/CoursePicker';
import { EmptyState, PageLoader } from '../components/StateViews';
import { StudentPicker } from '../components/StudentPicker';
import { useCourseAssignableStudents, useCourses, useStudents } from '../hooks/useAppData';
import { getErrorMessage } from '../utils/errors';
import { useTranslation } from 'react-i18next';

export function AssignStudentPage({ embeddedCourseId }: { embeddedCourseId?: string }) {
  const courses = useCourses();
  const { t } = useTranslation();
  const students = useStudents(!embeddedCourseId);
  const assignableStudents = useCourseAssignableStudents(embeddedCourseId);
  const studentOptions = embeddedCourseId ? assignableStudents.data : students.data;
  const [courseId, setCourseId] = useState(embeddedCourseId ?? '');
  const [studentId, setStudentId] = useState('');
  const queryClient = useQueryClient();

  const assign = useMutation({
    mutationFn: () => coursesApi.assignStudent(embeddedCourseId ?? courseId, { studentId }),
    onSuccess: () => {
      toast.success(t('studentAssigned'));
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['course-students', embeddedCourseId ?? courseId] });
      queryClient.invalidateQueries({ queryKey: ['course-assignable-students', embeddedCourseId ?? courseId] });
      setStudentId('');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (courses.isLoading || students.isLoading || assignableStudents.isLoading) return <PageLoader />;
  if (!courses.data?.length || !studentOptions?.length) return <EmptyState title={t('needCoursesAndStudents')} description={t('createBothBeforeAssigning')} />;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>{t('assignStudent')}</Typography>
        <Stack spacing={2}>
          {!embeddedCourseId && <CoursePicker courses={courses.data} value={courseId} onChange={setCourseId} />}
          <StudentPicker students={studentOptions} value={studentId} onChange={setStudentId} />
          <Button variant="contained" startIcon={<GroupAddIcon />} disabled={!studentId || !(embeddedCourseId ?? courseId) || assign.isPending} onClick={() => assign.mutate()}>
            {t('assign')}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
