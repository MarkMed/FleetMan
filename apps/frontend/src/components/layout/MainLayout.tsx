import React from 'react';
import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar';
import { MobileBottomNav } from './MobileBottomNav';
import { NavigationDrawer } from './NavigationDrawer';
import { useNavigationSync } from '@hooks/useNavigationSync';

export const MainLayout: React.FC = () => {
  // Sync current route with navigation store
  useNavigationSync();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Drawer (opens from left) */}
      <NavigationDrawer />
      
      {/* Desktop/Tablet Top Navigation Bar */}
      <NavBar />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Main content with padding to account for fixed navbars */}
      <main className="container mx-auto px-4 py-8 md:pt-24 pb-20 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
};