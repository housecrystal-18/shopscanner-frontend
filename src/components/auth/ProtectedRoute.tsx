import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredUserType?: 'consumer' | 'business';
}

export function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check user type requirement
  if (requiredUserType && user) {
    const hasRequiredType = 
      user.type === requiredUserType;

    if (!hasRequiredType) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}