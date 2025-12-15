// Application Routes
export const ROUTES = {
  // Auth routes
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  
  // Main application routes
  DASHBOARD: '/dashboard',
  MACHINES: '/machines',
  MACHINE_DETAIL: (id: string) => `/machines/${id}`,
  MAINTENANCE: '/maintenance',
  QUICKCHECK: '/quickcheck',
  QUICKCHECK_MACHINE: (machineId: string) => `/quickcheck/${machineId}`,
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

// Re-export navigation constants
export * from './navigation.constants';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Users
  USERS: '/users',
  USER: (id: string) => `/users/${id}`,
  
  // Machines
  MACHINES: '/machines',
  MACHINE: (id: string) => `/machines/${id}`,
  MACHINE_TYPES: '/machine-types',
  MACHINE_TYPE: (id: string) => `/machine-types/${id}`,
  MACHINE_EVENTS: (id: string) => `/machines/${id}/events`,
  
  // Maintenance
  MAINTENANCE_REMINDERS: '/maintenance/reminders',
  MAINTENANCE_REMINDER: (id: string) => `/maintenance/reminders/${id}`,
  MACHINE_REMINDERS: (machineId: string) => `/machines/${machineId}/reminders`,
  
  // Events
  EVENTS: '/events',
  EVENT: (id: string) => `/events/${id}`,
  
  // QuickCheck
  QUICKCHECKS: '/quickchecks',
  QUICKCHECK: (id: string) => `/quickchecks/${id}`,
  MACHINE_QUICKCHECK: (machineId: string) => `/machines/${machineId}/quickcheck`,
  MACHINE_QUICKCHECKS: (machineId: string) => `/machines/${machineId}/quickchecks`, // For add/history
  QUICKCHECK_EXECUTE: (id: string) => `/quickchecks/${id}/execute`,
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATION: (id: string) => `/notifications/${id}`,
  NOTIFICATIONS_MARK_READ: '/notifications/mark-read',
  NOTIFICATIONS_MARK_ALL_READ: '/notifications/mark-all-read',
  
  // Spare Parts (Post-MVP)
  SPARE_PARTS: '/spare-parts',
  SPARE_PART: (id: string) => `/spare-parts/${id}`,
  MACHINE_SPARE_PARTS: (machineId: string) => `/machines/${machineId}/spare-parts`,
} as const;

// User Roles
export const USER_ROLES = {
  CLIENT: 'client',
  PROVIDER: 'provider',
  ADMIN: 'admin',
} as const;

// Machine Event Types
export const MACHINE_EVENT_TYPES = {
  MAINTENANCE: 'maintenance',
  BREAKDOWN: 'breakdown',
  INSPECTION: 'inspection',
  REPAIR: 'repair',
  QUICKCHECK: 'quickcheck',
  REMINDER: 'reminder',
  MANUAL: 'manual',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  MAINTENANCE_DUE: 'maintenance_due',
  MAINTENANCE_OVERDUE: 'maintenance_overdue',
  QUICKCHECK_FAILED: 'quickcheck_failed',
  MACHINE_DOWN: 'machine_down',
  REMINDER: 'reminder',
  SYSTEM: 'system',
} as const;

// QuickCheck Item Status
export const QUICKCHECK_STATUS = {
  OK: 'ok',
  FAIL: 'fail',
  OMIT: 'omit',
} as const;

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es requerido',
  EMAIL_INVALID: 'Ingresa un email válido',
  PASSWORD_MIN_LENGTH: 'La contraseña debe tener al menos 8 caracteres',
  PASSWORD_MATCH: 'Las contraseñas no coinciden',
  PHONE_INVALID: 'Ingresa un número de teléfono válido',
  URL_INVALID: 'Ingresa una URL válida',
  NUMBER_INVALID: 'Ingresa un número válido',
  DATE_INVALID: 'Ingresa una fecha válida',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'fleetman_auth_token',
  REFRESH_TOKEN: 'fleetman_refresh_token',
  USER: 'fleetman_user',
  LANGUAGE: 'fleetman_language',
  THEME: 'fleetman_theme',
  SIDEBAR_COLLAPSED: 'fleetman_sidebar_collapsed',
} as const;

// Theme constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Languages
export const LANGUAGES = {
  ES: 'es',
  EN: 'en',
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  XS: '480px',
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;

// Query keys for React Query
export const QUERY_KEYS = {
  // Auth
  ME: ['auth', 'me'],
  
  // Machines
  MACHINES: ['machines'],
  MACHINE_TYPES: ['machine-types'],
  MACHINE: (id: string) => ['machines', id],
  MACHINE_EVENTS: (id: string) => ['machines', id, 'events'],
  
  // Maintenance
  MAINTENANCE_REMINDERS: ['maintenance', 'reminders'],
  MACHINE_REMINDERS: (machineId: string) => ['machines', machineId, 'reminders'],
  
  // Events
  EVENTS: ['events'],
  
  // QuickChecks
  QUICKCHECKS: ['quickchecks'],
  MACHINE_QUICKCHECK: (machineId: string) => ['machines', machineId, 'quickcheck'],
  QUICKCHECK_HISTORY: (machineId: string) => ['machines', machineId, 'quickchecks', 'history'],
  
  // Notifications
  NOTIFICATIONS: ['notifications'],
  NOTIFICATIONS_COUNT: ['notifications', 'count'],
  
  // Spare Parts
  SPARE_PARTS: ['spare-parts'],
  MACHINE_SPARE_PARTS: (machineId: string) => ['machines', machineId, 'spare-parts'],
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type MachineEventType = typeof MACHINE_EVENT_TYPES[keyof typeof MACHINE_EVENT_TYPES];
export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
export type QuickCheckStatus = typeof QUICKCHECK_STATUS[keyof typeof QUICKCHECK_STATUS];
export type Theme = typeof THEMES[keyof typeof THEMES];
export type Language = typeof LANGUAGES[keyof typeof LANGUAGES];

// Day of Week labels
export * from './dayOfWeekLabels';