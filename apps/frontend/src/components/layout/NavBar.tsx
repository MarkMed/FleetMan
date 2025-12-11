import React from 'react';
import { HamburgerButton } from './HamburgerButton';
import { useNavigationStore } from '@store/slices';
import { cn } from '@utils/cn';

interface NavBarProps {
  title?: string;
  className?: string;
}

/**
 * NavBar - Barra de navegación superior para desktop y tablets
 * 
 * Layout:
 * - Izquierda: HamburgerButton para abrir drawer
 * - Centro/Derecha: Título customizable (default: "FleetMan")
 * - Fixed top, responsive
 * - Hidden en mobile (<768px) donde se usa MobileBottomNav
 */
export const NavBar: React.FC<NavBarProps> = ({ 
  title = 'FleetMan',
  className 
}) => {
  const { isDrawerOpen, toggleDrawer } = useNavigationStore();

  return (
    <nav
      className={cn(
        // Layout
        'fixed top-0 left-0 right-0 z-40',
        'flex items-center justify-between',
        'h-16 px-4',
        // Styling
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'border-b border-border',
        // Responsive - hidden on mobile
        'hidden md:flex',
        className
      )}
    >
      {/* Left: Hamburger Menu Button */}
      <div className="flex items-center gap-3">
        <HamburgerButton 
          isOpen={isDrawerOpen} 
          onClick={toggleDrawer}
        />
        <h1 className="text-xl font-semibold text-foreground">
          {title}
        </h1>
      </div>

      {/* Right: Could add user profile, notifications, etc. */}
      <div className="flex items-center gap-2">
        {/* Placeholder for future additions like user avatar, theme toggle */}
      </div>
    </nav>
  );
};
