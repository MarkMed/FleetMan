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
import { MachineEventsScreen } from '../screens/machines/MachineEventsScreen';
import { MaintenanceAlarmsListScreen } from '../screens/maintenance/MaintenanceAlarmsListScreen';
import { AlarmDetailScreen } from '../screens/maintenance/AlarmDetailScreen';
import { NewMachineScreen } from '../screens/machines/NewMachineScreen';
import { QuickCheckScreen } from '../screens/quickcheck/QuickCheckScreen';
import { QuickCheckHistoryScreen } from '../screens/quickcheck/QuickCheckHistoryScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { ConfigurationsScreen } from '../screens/settings/ConfigurationsScreen';
import { ExamplesScreen } from '../screens/ExamplesScreen';
import { UserDiscoveryScreen, MyContactsScreen } from '../screens/users';

// Route components
import { ProtectedRoute } from '../router/ProtectedRoute';
import { PublicRoute } from '../router/PublicRoute';

export const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading, isHydrated } = useAuth();
  console.log('🔄 AppRouter State:', { isAuthenticated, isLoading, isHydrated });

  // Only show loading during initial hydration, let route components handle auth loading
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-indigo-600 font-medium">Cargando aplicación...</p>
        </div>
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
          <Route path="machines/:id/events" element={<MachineEventsScreen />} />
          <Route path="machines/:id/alarms" element={<MaintenanceAlarmsListScreen />} />
          <Route path="machines/:id/maintenance-alarms/:alarmId" element={<AlarmDetailScreen />} />
          <Route path="machines/:id/quickcheck" element={<QuickCheckScreen />} />
          <Route path="machines/:id/quickcheck/history" element={<QuickCheckHistoryScreen />} />

          {/* Other protected routes */}
          <Route path="notifications" element={<NotificationsScreen />} />
          <Route path="contact-discovery" element={<UserDiscoveryScreen />} />
          <Route path="contacts" element={<MyContactsScreen />} />
          <Route path="profile" element={<ProfileScreen />} />
          <Route path="settings" element={<ConfigurationsScreen />} />

          {/* Examples */}
          <Route path="ejemplos" element={<ExamplesScreen />} />
          
          {/* Additional protected routes can be added here */}
        </Route>
      </Route>

      {/* Redirect routes */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/auth/login"} replace />} />
    </Routes>
  );
};
