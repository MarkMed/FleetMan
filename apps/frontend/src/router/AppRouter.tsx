import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../store/AuthProvider';

// Import layouts
import { AuthLayout } from '../components/layout/AuthLayout';
import { MainLayout } from '../components/layout/MainLayout';

// Import screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { MachinesScreen } from '../screens/machines/MachinesScreen';
import { MachineDetailsScreen } from '../screens/machines/MachineDetailsScreen';
import { NewMachineScreen } from '../screens/machines/NewMachineScreen';

// Route components
import { ProtectedRoute } from '../router/ProtectedRoute';
import { PublicRoute } from '../router/PublicRoute';

export const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes - accessible only when NOT authenticated */}
      <Route path="/auth" element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginScreen />} />
          <Route path="register" element={<RegisterScreen />} />
        </Route>
      </Route>

      {/* Protected routes - accessible only when authenticated */}
      <Route path="/" element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<DashboardScreen />} />
          <Route path="dashboard" element={<DashboardScreen />} />
          
          {/* Machine routes */}
          <Route path="machines" element={<MachinesScreen />} />
          <Route path="machines/new" element={<NewMachineScreen />} />
          <Route path="machines/:id" element={<MachineDetailsScreen />} />
          
          {/* Additional protected routes can be added here */}
        </Route>
      </Route>

      {/* Redirect routes */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/auth/login"} replace />} />
    </Routes>
  );
};