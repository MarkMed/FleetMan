import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNavigationStore } from '@store/slices';
import { getMobileNavItems, MENU_BUTTON_CONFIG } from '@constants';
import { cn } from '@utils/cn';

/**
 * MobileBottomNav - Navegación inferior para dispositivos móviles
 * 
 * Layout:
 * - Fixed bottom
 * - 4 items: 3 primeras rutas + botón Menú
 * - Cada item: ícono arriba, label abajo
 * - Active state con color primary
 * - Solo visible en mobile (<768px)
 */
export const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { toggleDrawer } = useNavigationStore();
  
  const mobileNavItems = getMobileNavItems();

  const handleNavClick = (href: string) => {
    navigate(href);
  };

  const handleMenuClick = () => {
    toggleDrawer();
  };

  const isActive = (href: string): boolean => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      className={cn(
        // Layout
        'fixed bottom-0 left-0 right-0 z-40',
        'flex items-center justify-around',
        'h-16 px-2',
        // Styling
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'border-t border-border',
        // Responsive - only visible on mobile
        'md:hidden'
      )}
      role="navigation"
      aria-label="Navegación móvil"
    >
      {/* First 3 nav items */}
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        
        return (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.href)}
            className={cn(
              'flex flex-col items-center justify-center',
              'flex-1 h-full',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              'active:scale-95',
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label={t(item.labelKey)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">{t(item.labelKey)}</span>
          </button>
        );
      })}

      {/* Menu button (4th position) */}
      <button
        onClick={handleMenuClick}
        className={cn(
          'flex flex-col items-center justify-center',
          'flex-1 h-full',
          'text-muted-foreground hover:text-foreground',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          'active:scale-95'
        )}
        aria-label={t(MENU_BUTTON_CONFIG.labelKey)}
        aria-controls="navigation-drawer"
      >
        <MENU_BUTTON_CONFIG.icon className="w-6 h-6" />
        <span className="text-xs mt-1 font-medium">{t(MENU_BUTTON_CONFIG.labelKey)}</span>
      </button>
    </nav>
  );
};
