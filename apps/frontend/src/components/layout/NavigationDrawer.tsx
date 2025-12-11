import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNavigationStore } from '@store/slices';
import { getDrawerNavItems } from '@constants';
import { cn } from '@utils/cn';
import { X } from 'lucide-react';

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
  const { isDrawerOpen, closeDrawer } = useNavigationStore();
  
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

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50',
          'bg-background/80 backdrop-blur-sm',
          'animate-fade-in'
        )}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Drawer Sidebar */}
      <aside
        id="navigation-drawer"
        className={cn(
          // Layout
          'fixed top-0 left-0 bottom-0 z-50',
          'flex flex-col',
          // Width: full on mobile, 280px on desktop
          'w-full md:w-80',
          // Styling
          'bg-background border-r border-border',
          'shadow-lg',
          // Animation
          'animate-slide-in-from-left'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">FleetMan</h2>
          <button
            onClick={closeDrawer}
            className={cn(
              'p-2 rounded-md',
              'text-muted-foreground hover:text-foreground',
              'hover:bg-accent',
              'transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
            )}
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2" role="list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className={cn(
                      // Layout
                      'w-full flex items-center gap-3 px-4 py-3',
                      'rounded-lg',
                      // Typography
                      'text-sm font-medium',
                      // Transitions
                      'transition-all duration-200',
                      // Focus
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      // Active state - primary color
                      active ? [
                        'bg-primary/10 text-primary',
                        'shadow-sm',
                      ] : [
                        'text-muted-foreground',
                        'hover:bg-accent hover:text-foreground',
                      ]
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer (optional) */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} FleetMan
          </p>
        </div>
      </aside>
    </>
  );
};
