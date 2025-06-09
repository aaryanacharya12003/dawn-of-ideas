
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();

  // Minimal loading state for faster logout transitions
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-muted/40">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  // Immediate redirect when user is null (after logout)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirements if specified
  if (requiredRole && user.role !== requiredRole) {
    console.log(`AuthGuard: Access denied. Required role: ${requiredRole}, User role: ${user.role}`);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
