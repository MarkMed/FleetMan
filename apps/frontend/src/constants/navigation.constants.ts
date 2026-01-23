import type { LucideIcon } from 'lucide-react';
import { 
  Home, 
  Cog, 
  Bell, 
  Users, 
  User, 
  Settings,
  Menu,
  UserSearch,
  MessageCircle
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  labelKey: string; // i18n key for translation
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
 * 
 * @remarks
 * Use t('navigation.{labelKey}') to get translated label
 */
export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    labelKey: 'navigation.dashboard',
    icon: Home,
    href: '/dashboard',
    requiresAuth: true,
    showInMobile: true, // Position 1 in bottom nav
  },
  {
    id: 'machines',
    labelKey: 'navigation.machines',
    icon: Cog,
    href: '/machines',
    requiresAuth: true,
    showInMobile: true, // Position 2 in bottom nav
  },
  {
    id: 'notifications',
    labelKey: 'navigation.notifications',
    icon: Bell,
    href: '/notifications',
    requiresAuth: true,
    showInMobile: true, // Position 3 in bottom nav
  },
//   {
//     id: 'quickcheck',
//     labelKey: 'navigation.quickcheck',
//     icon: CheckSquare,
//     href: '/quickcheck',
//     requiresAuth: true,
//     showInMobile: false, // Only in drawer
//   },
  {
    id: 'messages',
    labelKey: 'navigation.messages',
    icon: MessageCircle,
    href: '/messages',
    requiresAuth: true,
    showInMobile: false, // Only in drawer
  },
  {
    id: 'contact-discovery',
    labelKey: 'navigation.contactDiscovery',
    icon: UserSearch,
    href: '/contact-discovery',
    requiresAuth: true,
    showInMobile: false, // Only in drawer
  },
  {
    id: 'contacts',
    labelKey: 'navigation.contacts',
    icon: Users,
    href: '/contacts',
    requiresAuth: true,
    showInMobile: false, // Only in drawer
  },
  {
    id: 'profile',
    labelKey: 'navigation.profile',
    icon: User,
    href: '/profile',
    requiresAuth: true,
    showInMobile: false, // Only in drawer
  },
  {
    id: 'settings',
    labelKey: 'navigation.settings',
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
  labelKey: 'navigation.menu',
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
