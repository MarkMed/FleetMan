import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/AuthProvider';
import { isAuthStateReady, getLoadingMessage } from '../utils/authUtils';

export const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading, isHydrated, user, token } = useAuth();
  
  const authState = {
    isAuthenticated,
    isLoading,
    isHydrated,
    hasToken: !!token,
    hasUser: !!user,
  };
  
  console.log('🔒 PublicRoute State:', authState);

  // Show loading if auth state is not ready
  if (!isAuthStateReady(authState)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-indigo-600 font-medium">{getLoadingMessage(authState)}</p>
        </div>
      </div>
    );
  }

  console.log("Is authenticated:", isAuthenticated ? "yes, going to dashboard" : "no");
  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If not authenticated, render the child routes (login, register)
  return <Outlet />;
};