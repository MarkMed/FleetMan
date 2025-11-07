import { ROUTES } from '@constants/index';

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  description?: string;
  disabled?: boolean;
  external?: boolean;
  label?: string;
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface MainNavItem extends NavItem {}

export interface SidebarNavItem extends NavItemWithChildren {}

// Main navigation items
export const mainNav: MainNavItem[] = [
  {
    title: 'Dashboard',
    href: ROUTES.DASHBOARD,
  },
  {
    title: 'Máquinas',
    href: ROUTES.MACHINES,
  },
  {
    title: 'Mantenimiento',
    href: ROUTES.MAINTENANCE,
  },
  {
    title: 'Chequeo Rápido',
    href: ROUTES.QUICKCHECK,
  },
  {
    title: 'Notificaciones',
    href: ROUTES.NOTIFICATIONS,
  },
];

// Sidebar navigation items
export const sidebarNav: SidebarNavItem[] = [
  {
    title: 'General',
    href: '#',
    items: [
      {
        title: 'Dashboard',
        href: ROUTES.DASHBOARD,
        icon: 'dashboard',
        items: [],
      },
      {
        title: 'Máquinas',
        href: ROUTES.MACHINES,
        icon: 'machine',
        items: [],
      },
    ],
  },
  {
    title: 'Operaciones',
    href: '#',
    items: [
      {
        title: 'Mantenimiento',
        href: ROUTES.MAINTENANCE,
        icon: 'maintenance',
        items: [],
      },
      {
        title: 'Chequeo Rápido',
        href: ROUTES.QUICKCHECK,
        icon: 'quickcheck',
        items: [],
      },
    ],
  },
  {
    title: 'Centro de Control',
    href: '#',
    items: [
      {
        title: 'Notificaciones',
        href: ROUTES.NOTIFICATIONS,
        icon: 'notifications',
        items: [],
      },
    ],
  },
];

// Quick actions for dashboard
export const quickActions = [
  {
    title: 'Chequeo Rápido',
    description: 'Realizar chequeo de seguridad',
    href: ROUTES.QUICKCHECK,
    icon: 'quickcheck',
    color: 'bg-blue-500',
  },
  {
    title: 'Reportar Evento',
    description: 'Registrar evento de mantenimiento',
    href: ROUTES.MAINTENANCE,
    icon: 'event',
    color: 'bg-orange-500',
  },
  {
    title: 'Nueva Máquina',
    description: 'Agregar nueva máquina al sistema',
    href: ROUTES.MACHINES,
    icon: 'machine',
    color: 'bg-green-500',
  },
  {
    title: 'Ver Alertas',
    description: 'Revisar notificaciones pendientes',
    href: ROUTES.NOTIFICATIONS,
    icon: 'notifications',
    color: 'bg-red-500',
  },
];

// Breadcrumb configuration
export const getBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { title: 'Inicio', href: ROUTES.DASHBOARD },
  ];

  if (segments.length === 0) {
    return breadcrumbs;
  }

  // Map common routes
  const routeMap: Record<string, string> = {
    'dashboard': 'Panel Principal',
    'machines': 'Máquinas',
    'maintenance': 'Mantenimiento',
    'quickcheck': 'Chequeo Rápido',
    'notifications': 'Notificaciones',
    'profile': 'Perfil',
    'settings': 'Configuración',
  };

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const title = routeMap[segment] || segment;
    
    breadcrumbs.push({
      title: title.charAt(0).toUpperCase() + title.slice(1),
      href: currentPath,
    });
  });

  return breadcrumbs;
};