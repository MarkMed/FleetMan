import React from 'react';
import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar';
import { MobileBottomNav } from './MobileBottomNav';
import { NavigationDrawer } from './NavigationDrawer';
import { useNavigationSync } from '@hooks/useNavigationSync';
import { useMachineTypes, useNotificationObserver } from '@hooks';

export const MainLayout: React.FC = () => {
  // Sync current route with navigation store
  useNavigationSync();
  
  // Pre-fetch machine types on authenticated layout mount (60min cache)
  // This ensures machine types are cached before any screen needs them
  useMachineTypes();

  // Activate SSE observer for real-time notifications (connects to backend stream)
  // This hook connects SSE client when user is authenticated and disconnects on unmount
  // All notification events will trigger toast + TanStack Query cache invalidation
  useNotificationObserver();

  return (
    <div className="min-h-screen bg-background">
      {/* Main content with padding to account for fixed navbars */}
      <main className="container mx-auto px-4 py-8 md:pt-24 pb-20 md:pb-8">
        <Outlet />
      </main>
      {/* Desktop/Tablet Top Navigation Bar */}
      <NavBar />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Navigation Drawer (opens from left) */}
      <NavigationDrawer />
    </div>
  );
};