import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { ProtectedRoute, PublicOnlyRoute } from '../components/RouteGuards';
import { AddStudentPage } from '../pages/AddStudentPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AssignStudentPage } from '../pages/AssignStudentPage';
import { BulkAttendancePage } from '../pages/BulkAttendancePage';
import { ChangePasswordPage } from '../pages/ChangePasswordPage';
import { CourseDetailsPage } from '../pages/CourseDetailsPage';
import { CoursesPage } from '../pages/CoursesPage';
import { InstructorDashboardPage } from '../pages/InstructorDashboardPage';
import { InstructorsPage } from '../pages/InstructorsPage';
import { LeaderboardPage } from '../pages/LeaderboardPage';
import { LoginPage } from '../pages/LoginPage';
import { PointsFormsPage } from '../pages/PointsFormsPage';
import { SessionsManagementPage } from '../pages/SessionsManagementPage';
import { StudentDashboardPage } from '../pages/StudentDashboardPage';
import { StudentMyPointsPage } from '../pages/StudentMyPointsPage';
import { StudentsPage } from '../pages/StudentsPage';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <PublicOnlyRoute><LoginPage /></PublicOnlyRoute> },
  {
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: '/change-password', element: <ChangePasswordPage /> },
      {
        path: '/admin',
        element: <ProtectedRoute roles={['Admin']}><AdminDashboardPage /></ProtectedRoute>,
      },
      { path: '/admin/courses', element: <ProtectedRoute roles={['Admin']}><CoursesPage /></ProtectedRoute> },
      { path: '/admin/courses/:courseId', element: <ProtectedRoute roles={['Admin']}><CourseDetailsPage /></ProtectedRoute> },
      { path: '/admin/students', element: <ProtectedRoute roles={['Admin']}><StudentsPage /></ProtectedRoute> },
      { path: '/admin/students/new', element: <ProtectedRoute roles={['Admin']}><AddStudentPage /></ProtectedRoute> },
      { path: '/admin/instructors', element: <ProtectedRoute roles={['Admin']}><InstructorsPage /></ProtectedRoute> },
      { path: '/admin/assign-student', element: <ProtectedRoute roles={['Admin']}><AssignStudentPage /></ProtectedRoute> },
      { path: '/admin/sessions', element: <ProtectedRoute roles={['Admin']}><SessionsManagementPage /></ProtectedRoute> },
      { path: '/admin/attendance', element: <ProtectedRoute roles={['Admin']}><BulkAttendancePage /></ProtectedRoute> },
      { path: '/admin/question-points', element: <ProtectedRoute roles={['Admin']}><PointsFormsPage mode="question" /></ProtectedRoute> },
      { path: '/admin/contest-points', element: <ProtectedRoute roles={['Admin']}><PointsFormsPage mode="contest" /></ProtectedRoute> },
      { path: '/admin/manual-points', element: <ProtectedRoute roles={['Admin']}><PointsFormsPage mode="manual" /></ProtectedRoute> },
      { path: '/admin/leaderboard', element: <ProtectedRoute roles={['Admin']}><LeaderboardPage /></ProtectedRoute> },
      { path: '/instructor', element: <ProtectedRoute roles={['Instructor']}><InstructorDashboardPage /></ProtectedRoute> },
      { path: '/instructor/courses', element: <ProtectedRoute roles={['Instructor']}><CoursesPage /></ProtectedRoute> },
      { path: '/instructor/courses/:courseId', element: <ProtectedRoute roles={['Instructor']}><CourseDetailsPage /></ProtectedRoute> },
      { path: '/instructor/students', element: <ProtectedRoute roles={['Instructor']}><StudentsPage /></ProtectedRoute> },
      { path: '/instructor/students/new', element: <ProtectedRoute roles={['Instructor']}><AddStudentPage /></ProtectedRoute> },
      { path: '/instructor/instructors', element: <ProtectedRoute roles={['Instructor']}><InstructorsPage /></ProtectedRoute> },
      { path: '/instructor/assign-student', element: <ProtectedRoute roles={['Instructor']}><AssignStudentPage /></ProtectedRoute> },
      { path: '/instructor/attendance', element: <ProtectedRoute roles={['Instructor']}><BulkAttendancePage /></ProtectedRoute> },
      { path: '/instructor/question-points', element: <ProtectedRoute roles={['Instructor']}><PointsFormsPage mode="question" /></ProtectedRoute> },
      { path: '/instructor/contest-points', element: <ProtectedRoute roles={['Instructor']}><PointsFormsPage mode="contest" /></ProtectedRoute> },
      { path: '/instructor/manual-points', element: <ProtectedRoute roles={['Instructor']}><PointsFormsPage mode="manual" /></ProtectedRoute> },
      { path: '/instructor/leaderboard', element: <ProtectedRoute roles={['Instructor']}><LeaderboardPage /></ProtectedRoute> },
      { path: '/student', element: <ProtectedRoute roles={['Student']}><StudentDashboardPage /></ProtectedRoute> },
      { path: '/student/my-points', element: <ProtectedRoute roles={['Student']}><StudentMyPointsPage /></ProtectedRoute> },
      { path: '/student/leaderboard', element: <ProtectedRoute roles={['Student']}><LeaderboardPage studentView /></ProtectedRoute> },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
