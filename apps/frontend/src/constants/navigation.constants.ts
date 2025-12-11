import type { LucideIcon } from 'lucide-react';
import { 
  Home, 
  Cog, 
  Bell, 
  CheckSquare, 
  User, 
  Settings,
  Menu
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  requiresAuth?: boolean;
  showInMobile?: boolean; // For bottom nav, only first 3 items + menu
}

/**
 * Main navigation items for the application
 * These will appear in:
 * - Desktop: Drawer sidebar when menu is opened
 * - Mobile: Bottom nav (first 3) + Menu button (4th position)
 */
export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    requiresAuth: true,
    showInMobile: true, // Position 1 in bottom nav
  },
  {
    id: 'machines',
    label: 'Mis Máquinas',
    icon: Cog,
    href: '/machines',
    requiresAuth: true,
    showInMobile: true, // Position 2 in bottom nav
  },
  {
    id: 'notifications',
    label: 'Notificaciones',
    icon: Bell,
    href: '/notifications',
    requiresAuth: true,
    showInMobile: true, // Position 3 in bottom nav
  },
  {
    id: 'quickcheck',
    label: 'QuickCheck',
    icon: CheckSquare,
    href: '/quickcheck',
    requiresAuth: true,
    showInMobile: false, // Only in drawer
  },
  {
    id: 'profile',
    label: 'Perfil',
    icon: User,
    href: '/profile',
    requiresAuth: true,
    showInMobile: false, // Only in drawer
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: Settings,
    href: '/settings',
    requiresAuth: true,
    showInMobile: false, // Only in drawer
  },
];

/**
 * Menu button configuration for mobile bottom nav (4th position)
 */
export const MENU_BUTTON_CONFIG = {
  id: 'menu',
  label: 'Menú',
  icon: Menu,
};

/**
 * Get navigation items for mobile bottom nav
 * Returns first 3 items that should be shown in mobile
 */
export const getMobileNavItems = (): NavigationItem[] => {
  return NAVIGATION_ITEMS.filter(item => item.showInMobile === true).slice(0, 3);
};

/**
 * Get all navigation items for drawer
 */
export const getDrawerNavItems = (): NavigationItem[] => {
  return NAVIGATION_ITEMS;
};
