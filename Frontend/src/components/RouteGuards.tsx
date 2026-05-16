import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../types/api';

export function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { user, accessToken } = useAuthStore();
  const location = useLocation();

  if (!user || !accessToken) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.mustChangePassword && location.pathname !== '/change-password') return <Navigate to="/change-password" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={user.role === 'Admin' ? '/admin' : user.role === 'Instructor' ? '/instructor' : '/student'} replace />;
  return children;
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuthStore();
  if (user && accessToken) return <Navigate to={user.role === 'Admin' ? '/admin' : user.role === 'Instructor' ? '/instructor' : '/student'} replace />;
  return children;
}
