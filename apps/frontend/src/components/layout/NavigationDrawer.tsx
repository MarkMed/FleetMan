import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNavigationStore } from '@store/slices';
import { useAuthStore } from '@store/slices/authSlice';
import { useLogoutWithConfirmation } from '@hooks/useLogoutWithConfirmation';
import { getDrawerNavItems } from '@constants';
import { cn } from '@utils/cn';
import { Button } from '@components/ui';
import { X, LogOut } from 'lucide-react';
import { getAvatarLetter, getUserDisplayName } from '@utils/userHelpers';

/**
 * NavigationDrawer - Sidebar deslizable con navegación completa
 * 
 * Comportamiento:
 * - Desktop/Tablet (≥768px): Sidebar width ~280px desde la izquierda
 * - Mobile (<768px): Full width desde la izquierda
 * - Overlay con blur backdrop
 * - Click fuera cierra el drawer
 * - Esc key cierra el drawer
 * - Focus trap cuando está abierto
 * - Auto-cierre al navegar
 */
export const NavigationDrawer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isDrawerOpen, closeDrawer } = useNavigationStore();
  const { user } = useAuthStore();
  const handleLogout = useLogoutWithConfirmation();
  
  const navItems = getDrawerNavItems();

  // Close drawer on route change
  useEffect(() => {
    if (isDrawerOpen) {
      closeDrawer();
    }
  }, [location.pathname]);

  // Handle Esc key to close drawer
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };

    if (isDrawerOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen, closeDrawer]);

  const handleNavClick = (href: string) => {
    navigate(href);
    // closeDrawer will be called by useEffect on route change
  };

  const handleOverlayClick = () => {
    closeDrawer();
  };

  const isActive = (href: string): boolean => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  /**
   * Sprint #14 Task 14.10: Logout handler con confirmación
   * Delegado al hook compartido useLogoutWithConfirmation
   */
  const handleLogoutClick = () => {
    closeDrawer(); // Cerrar drawer primero
    handleLogout(); // Usar hook compartido
  };

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-60',
          'bg-background/80 backdrop-blur-sm',
          'animate-fade-in'
        )}
        onClick={handleOverlayClick}
        role="presentation"
        aria-hidden="true"
      />

      {/* Drawer Sidebar */}
      <aside
        id="navigation-drawer"
        className={cn(
          // Layout
          'fixed top-0 left-0 bottom-0 z-60',
          'flex flex-col',
          // Width: full on mobile, 280px on desktop
          'w-full md:w-80',
          // Styling
          'bg-background border-r border-border',
          'shadow-lg',
          // Animation
          'animate-slide-in-from-left',
          'z-50'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 py-3 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">FleetMan</h2>
          <Button
            onPress={closeDrawer}
            className={cn(
              'p-2 rounded-md',
              'text-muted-foreground hover:text-foreground',
              'hover:bg-accent',
              'transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              'bg-transparent'
            )}
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2" role="list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <li key={item.id}>
                  <Button
                    onPress={() => handleNavClick(item.href)}
                    className={cn(
                      // Layout
                      'w-full flex items-center gap-3 px-4 py-3',
                      'rounded-lg',
                      // Typography
                      'text-lg font-medium',
                      // Transitions
                      'transition-all duration-200',
                      // Focus
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      'bg-transparent',
                      'justify-start',
                      // Active state - primary color
                      active ? [
                        'bg-primary/10 text-primary',
                        'shadow-sm',
                        'hover:bg-[hsl(var(--color-card))] hover:text-foreground',
                      ] : [
                        'text-muted-foreground',
                        'hover:bg-[hsl(var(--color-card))] hover:text-foreground',
                      ]
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{t(item.labelKey)}</span>
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer - Sprint #14 Task 14.10: User info + Logout */}
        <div className="border-t border-border">
          {/* User info card */}
          {user && (
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                {/* Avatar - Uses theme token bg-primary instead of hardcoded color */}
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {getAvatarLetter(user.email)}
                </div>
                
                {/* User details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {getUserDisplayName(user)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Logout button */}
          <div className="w-full justify-start p-4">
            <Button
              variant="outline"
              onPress={handleLogout}
              className='w-full justify-start gap-3 h-auto text-destructive border border-red-600 bg-destructive/5 hover:bg-destructive/20 hover:text-destructive'
            >
              <LogOut className="w-5 h-5" />
              <span>{t('profile.menu.logout')}</span>
            </Button>
          </div>

          {/* Copyright */}
          <div className="p-4">
            <p className="text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()} FleetMan
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
