import { Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, Card, CardContent, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import PasswordIcon from '@mui/icons-material/Password';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { studentsApi } from '../api/students';
import { EmptyState, ErrorState, PageLoader } from '../components/StateViews';
import { useStudents } from '../hooks/useAppData';
import { formatDate, getErrorMessage } from '../utils/errors';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { StudentDto } from '../types/api';
import { ResetPasswordDialog } from '../components/ResetPasswordDialog';
import { usersApi } from '../api/users';

export function StudentsPage() {
  const students = useStudents();
  const { t } = useTranslation();
  const [studentToDelete, setStudentToDelete] = useState<StudentDto | null>(null);
  const [studentToReset, setStudentToReset] = useState<StudentDto | null>(null);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: studentsApi.delete,
    onSuccess: () => {
      toast.success(t('studentDeleted'));
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['course-students'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const resetPassword = useMutation({
    mutationFn: ({ userId, newPassword, mustChangePassword }: { userId: string; newPassword: string; mustChangePassword: boolean }) =>
      usersApi.resetPassword(userId, { newPassword, mustChangePassword }),
    onSuccess: () => {
      toast.success(t('passwordResetDone'));
      setStudentToReset(null);
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  if (students.isLoading) return <PageLoader />;
  if (students.isError) return <ErrorState message={getErrorMessage(students.error)} onRetry={() => students.refetch()} />;

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between' }} spacing={2}>
        <div>
          <Typography variant="h4">{t('students')}</Typography>
          <Typography color="text.secondary">{t('studentsSubtitle')}</Typography>
        </div>
        <Button component={RouterLink} to={user?.role === 'Instructor' ? '/instructor/students/new' : '/admin/students/new'} variant="contained" startIcon={<PersonAddIcon />}>{t('addStudent')}</Button>
      </Stack>
      <Card>
        <CardContent>
          {students.data?.length ? (
            <Table>
              <TableHead><TableRow><TableCell>{t('name')}</TableCell><TableCell>{t('email')}</TableCell><TableCell>{t('status')}</TableCell><TableCell>{t('created')}</TableCell><TableCell align="right">{t('actions')}</TableCell></TableRow></TableHead>
              <TableBody>
                {students.data.map((student) => (
                  <TableRow key={student.id} hover>
                    <TableCell>{student.fullName}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell><Chip size="small" label={student.mustChangePassword ? t('mustChangePassword') : student.isActive ? t('active') : t('inactive')} color={student.mustChangePassword ? 'warning' : student.isActive ? 'success' : 'default'} /></TableCell>
                    <TableCell>{formatDate(student.createdAt)}</TableCell>
                    <TableCell align="right">
                      {user?.role === 'Admin' && (
                        <Button
                          size="small"
                          startIcon={<PasswordIcon />}
                          disabled={!student.isActive || resetPassword.isPending}
                          onClick={() => setStudentToReset(student)}
                        >
                          {t('resetPassword')}
                        </Button>
                      )}
                      <Button
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        disabled={!student.isActive || remove.isPending}
                        onClick={() => setStudentToDelete(student)}
                      >
                        {t('delete')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <EmptyState title={t('noStudents')} description={t('createStudentsFirst')} />}
        </CardContent>
      </Card>
      <ConfirmDialog
        open={Boolean(studentToDelete)}
        title={t('confirmAction')}
        message={t('deleteStudentConfirm', { name: studentToDelete?.fullName })}
        loading={remove.isPending}
        onClose={() => setStudentToDelete(null)}
        onConfirm={() => studentToDelete && remove.mutate(studentToDelete.id, { onSuccess: () => setStudentToDelete(null) })}
      />
      <ResetPasswordDialog
        open={Boolean(studentToReset)}
        userName={studentToReset?.fullName}
        loading={resetPassword.isPending}
        onClose={() => setStudentToReset(null)}
        onSubmit={(values) => studentToReset && resetPassword.mutate({ userId: studentToReset.id, ...values })}
      />
    </Stack>
  );
}
