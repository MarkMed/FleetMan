# Constants Directory

## Propósito
Contiene constantes, enumeraciones y valores fijos utilizados a través de toda la aplicación. Centraliza valores que no cambian durante la ejecución y proporciona una fuente única de verdad para datos estáticos.

## Tipos de Constantes

### 1. **Business Constants** - Constantes de Negocio
### 2. **UI Constants** - Constantes de Interfaz
### 3. **API Constants** - Constantes de API
### 4. **System Constants** - Constantes del Sistema
### 5. **Validation Constants** - Constantes de Validación

## Estructura de Archivos

```
constants/
├── index.ts              # ✅ Barrel exports
├── business/
│   ├── machines.constants.ts # Constantes relacionadas con máquinas
│   ├── maintenance.constants.ts # Constantes de mantenimiento
│   ├── quickcheck.constants.ts # Constantes de chequeos
│   ├── notifications.constants.ts # Constantes de notificaciones
│   ├── users.constants.ts # Constantes de usuarios
│   └── index.ts          # Exports de business constants
├── ui/
│   ├── layout.constants.ts # Constantes de layout
│   ├── theme.constants.ts # Constantes de tema
│   ├── navigation.constants.ts # Constantes de navegación
│   ├── forms.constants.ts # Constantes de formularios
│   ├── tables.constants.ts # Constantes de tablas
│   └── index.ts          # Exports de UI constants
├── api/
│   ├── endpoints.constants.ts # URLs y endpoints
│   ├── status.constants.ts # HTTP status codes
│   ├── headers.constants.ts # Headers HTTP
│   ├── errors.constants.ts # Códigos de error
│   └── index.ts          # Exports de API constants
├── system/
│   ├── storage.constants.ts # Keys de localStorage/sessionStorage
│   ├── events.constants.ts # Nombres de eventos
│   ├── permissions.constants.ts # Permisos y roles
│   ├── formats.constants.ts # Formatos de fecha, números, etc
│   └── index.ts          # Exports de system constants
├── validation/
│   ├── regex.constants.ts # Expresiones regulares
│   ├── limits.constants.ts # Límites de validación
│   ├── messages.constants.ts # Mensajes de error
│   └── index.ts          # Exports de validation constants
└── data/
    ├── countries.constants.ts # Lista de países
    ├── timezones.constants.ts # Zonas horarias
    ├── currencies.constants.ts # Monedas
    └── index.ts            # Exports de data constants
```

## Constantes de Negocio

### `machines.constants.ts`
**Propósito**: Constantes relacionadas con el dominio de máquinas

```typescript
// Estados de máquinas
export const MACHINE_STATUS = {
  ACTIVE: 'ACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  OUT_OF_SERVICE: 'OUT_OF_SERVICE',
  RETIRED: 'RETIRED',
} as const;

export type MachineStatus = typeof MACHINE_STATUS[keyof typeof MACHINE_STATUS];

// Tipos de máquinas
export const MACHINE_TYPES = {
  EXCAVATOR: 'EXCAVATOR',
  BULLDOZER: 'BULLDOZER',
  CRANE: 'CRANE',
  LOADER: 'LOADER',
  COMPACTOR: 'COMPACTOR',
  TRUCK: 'TRUCK',
  GENERATOR: 'GENERATOR',
  OTHER: 'OTHER',
} as const;

export type MachineType = typeof MACHINE_TYPES[keyof typeof MACHINE_TYPES];

// Marcas de máquinas populares
export const MACHINE_BRANDS = [
  'Caterpillar',
  'Komatsu',
  'Volvo',
  'Liebherr',
  'JCB',
  'Hitachi',
  'Doosan',
  'Case',
  'New Holland',
  'Bobcat',
  'Otros',
] as const;

// Niveles de combustible
export const FUEL_LEVELS = {
  EMPTY: { min: 0, max: 10, label: 'Vacío', color: 'destructive' },
  LOW: { min: 11, max: 25, label: 'Bajo', color: 'warning' },
  MEDIUM: { min: 26, max: 60, label: 'Medio', color: 'info' },
  HIGH: { min: 61, max: 85, label: 'Alto', color: 'success' },
  FULL: { min: 86, max: 100, label: 'Lleno', color: 'success' },
} as const;

// Límites operativos
export const MACHINE_LIMITS = {
  MIN_OPERATING_HOURS: 0,
  MAX_OPERATING_HOURS: 99999,
  MIN_FUEL_LEVEL: 0,
  MAX_FUEL_LEVEL: 100,
  MAX_SERIAL_NUMBER_LENGTH: 50,
  MAX_NAME_LENGTH: 100,
  MAX_NOTES_LENGTH: 1000,
  MAX_IMAGES_PER_MACHINE: 10,
  MAX_IMAGE_SIZE_MB: 5,
} as const;

// Intervalos de mantenimiento por defecto (en horas)
export const DEFAULT_MAINTENANCE_INTERVALS = {
  [MACHINE_TYPES.EXCAVATOR]: 250,
  [MACHINE_TYPES.BULLDOZER]: 250,
  [MACHINE_TYPES.CRANE]: 300,
  [MACHINE_TYPES.LOADER]: 200,
  [MACHINE_TYPES.COMPACTOR]: 150,
  [MACHINE_TYPES.TRUCK]: 500,
  [MACHINE_TYPES.GENERATOR]: 100,
  [MACHINE_TYPES.OTHER]: 250,
} as const;

// Iconos por tipo de máquina
export const MACHINE_TYPE_ICONS = {
  [MACHINE_TYPES.EXCAVATOR]: 'excavator',
  [MACHINE_TYPES.BULLDOZER]: 'bulldozer',
  [MACHINE_TYPES.CRANE]: 'crane',
  [MACHINE_TYPES.LOADER]: 'loader',
  [MACHINE_TYPES.COMPACTOR]: 'compactor',
  [MACHINE_TYPES.TRUCK]: 'truck',
  [MACHINE_TYPES.GENERATOR]: 'generator',
  [MACHINE_TYPES.OTHER]: 'generic-machine',
} as const;

// Colores por estado de máquina
export const MACHINE_STATUS_COLORS = {
  [MACHINE_STATUS.ACTIVE]: 'success',
  [MACHINE_STATUS.MAINTENANCE]: 'warning',
  [MACHINE_STATUS.OUT_OF_SERVICE]: 'destructive',
  [MACHINE_STATUS.RETIRED]: 'muted',
} as const;
```

### `maintenance.constants.ts`
**Propósito**: Constantes del dominio de mantenimiento

```typescript
// Tipos de mantenimiento
export const MAINTENANCE_TYPES = {
  PREVENTIVE: 'PREVENTIVE',
  CORRECTIVE: 'CORRECTIVE',
  EMERGENCY: 'EMERGENCY',
  INSPECTION: 'INSPECTION',
} as const;

export type MaintenanceType = typeof MAINTENANCE_TYPES[keyof typeof MAINTENANCE_TYPES];

// Estados de mantenimiento
export const MAINTENANCE_STATUS = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  OVERDUE: 'OVERDUE',
} as const;

export type MaintenanceStatus = typeof MAINTENANCE_STATUS[keyof typeof MAINTENANCE_STATUS];

// Prioridades de mantenimiento
export const MAINTENANCE_PRIORITIES = {
  LOW: { value: 1, label: 'Baja', color: 'info' },
  MEDIUM: { value: 2, label: 'Media', color: 'warning' },
  HIGH: { value: 3, label: 'Alta', color: 'destructive' },
  CRITICAL: { value: 4, label: 'Crítica', color: 'destructive' },
} as const;

// Categorías de mantenimiento
export const MAINTENANCE_CATEGORIES = [
  'Motor',
  'Sistema Hidráulico',
  'Sistema Eléctrico',
  'Transmisión',
  'Frenos',
  'Neumáticos/Orugas',
  'Estructura',
  'Cabina',
  'Sistema de Enfriamiento',
  'Filtros',
  'Lubricación',
  'Otros',
] as const;

// Duraciones estimadas por tipo (en horas)
export const MAINTENANCE_DURATIONS = {
  [MAINTENANCE_TYPES.PREVENTIVE]: 4,
  [MAINTENANCE_TYPES.CORRECTIVE]: 8,
  [MAINTENANCE_TYPES.EMERGENCY]: 2,
  [MAINTENANCE_TYPES.INSPECTION]: 2,
} as const;

// Códigos de resultado de mantenimiento
export const MAINTENANCE_RESULTS = {
  COMPLETED_OK: 'COMPLETED_OK',
  COMPLETED_WITH_ISSUES: 'COMPLETED_WITH_ISSUES',
  PARTS_NEEDED: 'PARTS_NEEDED',
  REQUIRES_SPECIALIST: 'REQUIRES_SPECIALIST',
  POSTPONED: 'POSTPONED',
} as const;

// Límites de mantenimiento
export const MAINTENANCE_LIMITS = {
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_NOTES_LENGTH: 2000,
  MAX_COST: 999999.99,
  MIN_ADVANCE_NOTICE_HOURS: 24,
  MAX_SCHEDULE_ADVANCE_DAYS: 365,
} as const;
```

### `quickcheck.constants.ts`
**Propósito**: Constantes para chequeos rápidos

```typescript
// Estados de chequeo rápido
export const QUICK_CHECK_STATUS = {
  EXCELLENT: 'EXCELLENT',
  GOOD: 'GOOD',
  ATTENTION: 'ATTENTION',
  CRITICAL: 'CRITICAL',
} as const;

export type QuickCheckStatus = typeof QUICK_CHECK_STATUS[keyof typeof QUICK_CHECK_STATUS];

// Categorías de checklist
export const CHECKLIST_CATEGORIES = {
  SAFETY: 'SAFETY',
  ENGINE: 'ENGINE',
  HYDRAULIC: 'HYDRAULIC',
  ELECTRICAL: 'ELECTRICAL',
  STRUCTURAL: 'STRUCTURAL',
  OPERATIONAL: 'OPERATIONAL',
} as const;

// Items de checklist por defecto
export const DEFAULT_CHECKLIST_ITEMS = {
  [CHECKLIST_CATEGORIES.SAFETY]: [
    'Luces y señales funcionando',
    'Cinturones de seguridad en buen estado',
    'Espejos en posición correcta',
    'Alarma de retroceso operativa',
    'Extintores presentes y vigentes',
  ],
  
  [CHECKLIST_CATEGORIES.ENGINE]: [
    'Nivel de aceite correcto',
    'Nivel de refrigerante adecuado',
    'Filtro de aire limpio',
    'Sin fugas visibles',
    'Temperatura normal de operación',
  ],
  
  [CHECKLIST_CATEGORIES.HYDRAULIC]: [
    'Nivel de aceite hidráulico',
    'Mangueras en buen estado',
    'Sin fugas en conexiones',
    'Presión del sistema normal',
    'Movimientos suaves',
  ],
  
  [CHECKLIST_CATEGORIES.ELECTRICAL]: [
    'Batería cargada',
    'Terminales limpios',
    'Luces operativas',
    'Instrumentos funcionando',
    'Sistema de arranque normal',
  ],
  
  [CHECKLIST_CATEGORIES.STRUCTURAL]: [
    'Estructura sin grietas',
    'Soldaduras en buen estado',
    'Pernos y tornillos apretados',
    'Cabina sin daños',
    'Cristales íntegros',
  ],
  
  [CHECKLIST_CATEGORIES.OPERATIONAL]: [
    'Controles responsivos',
    'Frenos operativos',
    'Dirección suave',
    'Transmisión funcionando',
    'Implementos operativos',
  ],
} as const;

// Colores por estado de chequeo
export const QUICK_CHECK_STATUS_COLORS = {
  [QUICK_CHECK_STATUS.EXCELLENT]: 'success',
  [QUICK_CHECK_STATUS.GOOD]: 'info',
  [QUICK_CHECK_STATUS.ATTENTION]: 'warning',
  [QUICK_CHECK_STATUS.CRITICAL]: 'destructive',
} as const;

// Iconos por estado de chequeo
export const QUICK_CHECK_STATUS_ICONS = {
  [QUICK_CHECK_STATUS.EXCELLENT]: 'check-circle',
  [QUICK_CHECK_STATUS.GOOD]: 'thumbs-up',
  [QUICK_CHECK_STATUS.ATTENTION]: 'alert-triangle',
  [QUICK_CHECK_STATUS.CRITICAL]: 'x-circle',
} as const;

// Límites de chequeo rápido
export const QUICK_CHECK_LIMITS = {
  MAX_OBSERVATIONS_LENGTH: 1000,
  MAX_IMAGES: 5,
  MAX_IMAGE_SIZE_MB: 5,
  MIN_CHECKLIST_ITEMS: 1,
  MAX_CHECKLIST_ITEMS: 50,
} as const;
```

## Constantes de UI

### `navigation.constants.ts`
**Propósito**: Constantes para navegación y rutas

```typescript
// Rutas principales
export const ROUTES = {
  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Main routes
  DASHBOARD: '/dashboard',
  MACHINES: '/machines',
  MACHINE_DETAIL: '/machines/:id',
  MACHINE_CREATE: '/machines/create',
  MACHINE_EDIT: '/machines/:id/edit',
  
  MAINTENANCE: '/maintenance',
  MAINTENANCE_DETAIL: '/maintenance/:id',
  MAINTENANCE_CREATE: '/maintenance/create',
  MAINTENANCE_CALENDAR: '/maintenance/calendar',
  
  QUICK_CHECK: '/quick-check',
  QUICK_CHECK_CREATE: '/quick-check/create',
  QUICK_CHECK_HISTORY: '/quick-check/history',
  
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  
  // Admin routes
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

// Elementos del menú de navegación
export const NAVIGATION_ITEMS = [
  {
    id: 'dashboard',
    label: 'Panel Principal',
    icon: 'dashboard',
    href: ROUTES.DASHBOARD,
    shortcut: 'D',
  },
  {
    id: 'machines',
    label: 'Máquinas',
    icon: 'machine',
    href: ROUTES.MACHINES,
    shortcut: 'M',
    children: [
      {
        id: 'machines-list',
        label: 'Lista de Máquinas',
        href: ROUTES.MACHINES,
      },
      {
        id: 'machines-create',
        label: 'Nueva Máquina',
        href: ROUTES.MACHINE_CREATE,
      },
    ],
  },
  {
    id: 'maintenance',
    label: 'Mantenimiento',
    icon: 'wrench',
    href: ROUTES.MAINTENANCE,
    shortcut: 'T',
    children: [
      {
        id: 'maintenance-list',
        label: 'Lista de Mantenimientos',
        href: ROUTES.MAINTENANCE,
      },
      {
        id: 'maintenance-calendar',
        label: 'Calendario',
        href: ROUTES.MAINTENANCE_CALENDAR,
      },
      {
        id: 'maintenance-create',
        label: 'Programar Mantenimiento',
        href: ROUTES.MAINTENANCE_CREATE,
      },
    ],
  },
  {
    id: 'quick-check',
    label: 'Chequeo Rápido',
    icon: 'check-square',
    href: ROUTES.QUICK_CHECK,
    shortcut: 'Q',
    children: [
      {
        id: 'quick-check-create',
        label: 'Nuevo Chequeo',
        href: ROUTES.QUICK_CHECK_CREATE,
      },
      {
        id: 'quick-check-history',
        label: 'Historial',
        href: ROUTES.QUICK_CHECK_HISTORY,
      },
    ],
  },
  {
    id: 'notifications',
    label: 'Notificaciones',
    icon: 'bell',
    href: ROUTES.NOTIFICATIONS,
    shortcut: 'N',
  },
] as const;

// Breadcrumb configurations
export const BREADCRUMB_CONFIGS = {
  [ROUTES.DASHBOARD]: [
    { label: 'Inicio', href: ROUTES.DASHBOARD },
  ],
  [ROUTES.MACHINES]: [
    { label: 'Inicio', href: ROUTES.DASHBOARD },
    { label: 'Máquinas', href: ROUTES.MACHINES },
  ],
  [ROUTES.MACHINE_CREATE]: [
    { label: 'Inicio', href: ROUTES.DASHBOARD },
    { label: 'Máquinas', href: ROUTES.MACHINES },
    { label: 'Nueva Máquina' },
  ],
} as const;
```

### `theme.constants.ts`
**Propósito**: Constantes de tema y estilos

```typescript
// Temas disponibles
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export type Theme = typeof THEMES[keyof typeof THEMES];

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Z-index scale
export const Z_INDEX = {
  HIDE: -1,
  AUTO: 'auto',
  BASE: 0,
  DOCKED: 10,
  DROPDOWN: 1000,
  STICKY: 1100,
  BANNER: 1200,
  OVERLAY: 1300,
  MODAL: 1400,
  POPOVER: 1500,
  SKIP_LINK: 1600,
  TOAST: 1700,
  TOOLTIP: 1800,
} as const;

// Tamaños de componentes
export const COMPONENT_SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
} as const;

// Variantes de componentes
export const COMPONENT_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  WARNING: 'warning',
  DESTRUCTIVE: 'destructive',
  OUTLINE: 'outline',
  GHOST: 'ghost',
  LINK: 'link',
} as const;

// Duraciones de animación
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
  SLOWER: 500,
} as const;

// Easing functions
export const ANIMATION_EASINGS = {
  EASE: 'ease',
  EASE_IN: 'ease-in',
  EASE_OUT: 'ease-out',
  EASE_IN_OUT: 'ease-in-out',
  LINEAR: 'linear',
} as const;
```

## Constantes del Sistema

### `storage.constants.ts`
**Propósito**: Keys para almacenamiento local

```typescript
// LocalStorage keys
export const LOCAL_STORAGE_KEYS = {
  // Auth
  AUTH_TOKEN: 'fleetman_auth_token',
  REFRESH_TOKEN: 'fleetman_refresh_token',
  USER_DATA: 'fleetman_user_data',
  
  // UI preferences
  THEME: 'fleetman_theme',
  LANGUAGE: 'fleetman_language',
  SIDEBAR_COLLAPSED: 'fleetman_sidebar_collapsed',
  TABLE_PREFERENCES: 'fleetman_table_preferences',
  
  // App state
  LAST_VISITED_ROUTE: 'fleetman_last_route',
  FORM_DRAFTS: 'fleetman_form_drafts',
  NOTIFICATION_SETTINGS: 'fleetman_notification_settings',
  
  // Cache
  MACHINES_CACHE: 'fleetman_machines_cache',
  FILTERS_CACHE: 'fleetman_filters_cache',
} as const;

// SessionStorage keys
export const SESSION_STORAGE_KEYS = {
  TEMP_FORM_DATA: 'fleetman_temp_form_data',
  SEARCH_HISTORY: 'fleetman_search_history',
  CURRENT_SESSION: 'fleetman_current_session',
} as const;

// IndexedDB stores
export const INDEXED_DB_STORES = {
  OFFLINE_QUEUE: 'offline_queue',
  IMAGES_CACHE: 'images_cache',
  DOCUMENTS_CACHE: 'documents_cache',
} as const;
```

### `events.constants.ts`
**Propósito**: Nombres de eventos del sistema

```typescript
// Custom events
export const EVENTS = {
  // Auth events
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  SESSION_EXPIRED: 'session:expired',
  
  // Data events
  MACHINE_CREATED: 'machine:created',
  MACHINE_UPDATED: 'machine:updated',
  MACHINE_DELETED: 'machine:deleted',
  
  MAINTENANCE_SCHEDULED: 'maintenance:scheduled',
  MAINTENANCE_COMPLETED: 'maintenance:completed',
  
  QUICK_CHECK_CREATED: 'quickcheck:created',
  
  // UI events
  THEME_CHANGED: 'ui:theme-changed',
  LANGUAGE_CHANGED: 'ui:language-changed',
  SIDEBAR_TOGGLED: 'ui:sidebar-toggled',
  
  // System events
  ONLINE_STATUS_CHANGED: 'system:online-status-changed',
  UPDATE_AVAILABLE: 'system:update-available',
  ERROR_OCCURRED: 'system:error-occurred',
  
  // Notification events
  NOTIFICATION_RECEIVED: 'notification:received',
  NOTIFICATION_CLICKED: 'notification:clicked',
} as const;

// WebSocket events
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',
  ERROR: 'error',
  
  // Custom WS events
  MACHINE_STATUS_UPDATE: 'machine-status-update',
  NOTIFICATION_PUSH: 'notification-push',
  REAL_TIME_UPDATE: 'real-time-update',
} as const;
```

## Constantes de Validación

### `regex.constants.ts`
**Propósito**: Expresiones regulares reutilizables

```typescript
// Validación de emails
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Validación de teléfonos (formato internacional)
export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

// Validación de URLs
export const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

// Validación de números de serie (alfanumérico con guiones)
export const SERIAL_NUMBER_REGEX = /^[A-Z0-9\-]+$/;

// Validación de contraseñas seguras
export const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Validación de códigos postales españoles
export const SPANISH_POSTAL_CODE_REGEX = /^[0-5][0-9]{4}$/;

// Validación de DNI español
export const SPANISH_DNI_REGEX = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;

// Validación de matrículas españolas
export const SPANISH_LICENSE_PLATE_REGEX = /^[0-9]{4}\s?[BCDFGHJKLMNPRSTVWXYZ]{3}$/i;

// Validación de colores hexadecimales
export const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// Validación de slugs
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Validación de versiones semánticas
export const SEMVER_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
```

### `limits.constants.ts`
**Propósito**: Límites de validación y sistema

```typescript
// Límites de texto
export const TEXT_LIMITS = {
  SHORT_TEXT: 50,
  MEDIUM_TEXT: 255,
  LONG_TEXT: 1000,
  VERY_LONG_TEXT: 5000,
} as const;

// Límites de archivos
export const FILE_LIMITS = {
  MAX_FILE_SIZE_MB: 10,
  MAX_IMAGE_SIZE_MB: 5,
  MAX_DOCUMENT_SIZE_MB: 20,
  MAX_FILES_PER_UPLOAD: 5,
  MAX_TOTAL_STORAGE_MB: 100,
} as const;

// Límites de API
export const API_LIMITS = {
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 20,
  MAX_SEARCH_RESULTS: 1000,
  REQUEST_TIMEOUT_MS: 30000,
  MAX_CONCURRENT_REQUESTS: 10,
} as const;

// Límites de formularios
export const FORM_LIMITS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  MAX_FORM_FIELDS: 50,
} as const;

// Límites de sesión
export const SESSION_LIMITS = {
  MAX_IDLE_TIME_MS: 30 * 60 * 1000, // 30 minutos
  SESSION_WARNING_TIME_MS: 5 * 60 * 1000, // 5 minutos
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutos
} as const;

// Límites de notificaciones
export const NOTIFICATION_LIMITS = {
  MAX_VISIBLE_NOTIFICATIONS: 5,
  MAX_NOTIFICATION_HISTORY: 100,
  NOTIFICATION_TIMEOUT_MS: 5000,
  MAX_NOTIFICATION_TEXT_LENGTH: 500,
} as const;
```

## Uso de Constantes

### Import y Uso
```typescript
// Import específico
import { MACHINE_STATUS, MACHINE_TYPES } from '@/constants/business/machines.constants';
import { ROUTES } from '@/constants/ui/navigation.constants';

// Uso en componentes
const status = MACHINE_STATUS.ACTIVE;
const route = ROUTES.MACHINES;

// Uso en validaciones
if (machineType in MACHINE_TYPES) {
  // válido
}
```

### Type Guards
```typescript
// Helper functions para type guards
export const isMachineStatus = (value: string): value is MachineStatus =>
  Object.values(MACHINE_STATUS).includes(value as MachineStatus);

export const isMaintenanceType = (value: string): value is MaintenanceType =>
  Object.values(MAINTENANCE_TYPES).includes(value as MaintenanceType);
```

### Default Values
```typescript
// Usar constantes como valores por defecto
const defaultFilters = {
  status: MACHINE_STATUS.ACTIVE,
  pageSize: API_LIMITS.DEFAULT_PAGE_SIZE,
  sortBy: 'name',
};
```

## Testing

### Constants Tests
```typescript
describe('Machine Constants', () => {
  test('should have all required machine statuses', () => {
    expect(MACHINE_STATUS.ACTIVE).toBe('ACTIVE');
    expect(MACHINE_STATUS.MAINTENANCE).toBe('MAINTENANCE');
    expect(MACHINE_STATUS.OUT_OF_SERVICE).toBe('OUT_OF_SERVICE');
    expect(MACHINE_STATUS.RETIRED).toBe('RETIRED');
  });
  
  test('should have valid regex patterns', () => {
    expect(EMAIL_REGEX.test('test@example.com')).toBe(true);
    expect(EMAIL_REGEX.test('invalid-email')).toBe(false);
  });
});
```

## Convenciones

### Nomenclatura
- Constantes: `UPPER_SNAKE_CASE`
- Objetos de constantes: `DESCRIPTIVE_NAME`
- Archivos: `domain.constants.ts`

### Organización
- Agrupar por dominio o funcionalidad
- Usar `as const` para immutability
- Exportar tipos derivados cuando sea útil
- Documentar propósito y uso cuando no sea obvio