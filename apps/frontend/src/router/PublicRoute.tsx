import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/AuthProvider';

export const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If not authenticated, render the child routes (login, register)
  return <Outlet />;
};