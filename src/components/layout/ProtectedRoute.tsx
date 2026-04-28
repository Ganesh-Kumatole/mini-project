import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { Layout } from './Layout';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-text-primary-light dark:text-text-primary-dark">
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    // Save the page the user was trying to visit so we can redirect after login
    sessionStorage.setItem('fintracker-return-url', window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};
