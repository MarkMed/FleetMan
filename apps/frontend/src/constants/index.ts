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
  NEW_MACHINE: '/machines/new',
  MACHINE_DETAIL: (id: string) => `/machines/${id}`,
  MAINTENANCE: '/maintenance',
  QUICKCHECK: '/quickcheck',
  QUICKCHECK_MACHINE: (machineId: string) => `/quickcheck/${machineId}`,
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // User Communication (Sprint #12)
  CONTACT_DISCOVERY: '/contact-discovery',
  MY_CONTACTS: '/contacts', // Module 2: User's contact list
  MESSAGES: '/messages', // Module 3: Messaging inbox (conversations list)
  CHAT: (otherUserId: string) => `/messages/${otherUserId}`, // Direct message thread
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
  
  // User Discovery (Sprint #12 - Module 1: User Communication System)
  USER_DISCOVERY: '/users/discover',
  
  // Contact Management (Sprint #12 - Module 2: User Communication System)
  MY_CONTACTS: '/users/me/contacts',
  MY_CONTACT: (contactUserId: string) => `/users/me/contacts/${contactUserId}`,
  
  // User Statistics (Sprint #12 - User Stats Feature)
  USER_STATS_TOTAL: '/users/stats/total',
  
  // Messaging (Sprint #12 - Module 3: 1-to-1 Messaging)
  MESSAGES: '/messages',
  CONVERSATION_HISTORY: (otherUserId: string) => `/messages/conversations/${otherUserId}`,
  
  // Chat Access Control (Sprint #13 Task 9.3e-f)
  ACCEPT_CHAT: (userId: string) => `/messages/chats/${userId}/accept`,
  BLOCK_USER: (userId: string) => `/messages/chats/${userId}/block`,
  
  // Recent Conversations List (Sprint #13 - Conversations Inbox)
  CONVERSATIONS: '/messages/conversations', // List all conversations with metadata
  
  // TODO: Endpoints estratégicos futuros
  // USER_PUBLIC_PROFILE: (userId: string) => `/users/${userId}/public-profile`,
  // USER_STATS: (userId: string) => `/users/${userId}/stats`,
  // MY_CONTACT_DETAILS: (contactUserId: string) => `/users/me/contacts/${contactUserId}/details`,
  // MY_CONTACTS_BULK: '/users/me/contacts/bulk',
  // MY_CONTACT_MUTUAL: (contactUserId: string) => `/users/me/contacts/${contactUserId}/mutual`,
  // MESSAGE: (messageId: string) => `/messages/${messageId}`, // For edit/delete (Future)
  // MARK_CONVERSATION_READ: (otherUserId: string) => `/messages/conversations/${otherUserId}/mark-as-read`,
  // SEARCH_CONVERSATION: (otherUserId: string) => `/messages/conversations/${otherUserId}/search`,
  
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
  
  // Maintenance Alarms (Sprint #11)
  MAINTENANCE_ALARMS: (machineId: string) => `/machines/${machineId}/maintenance-alarms`,
  MAINTENANCE_ALARM: (machineId: string, alarmId: string) => `/machines/${machineId}/maintenance-alarms/${alarmId}`,
  RESET_MAINTENANCE_ALARM: (machineId: string, alarmId: string) => `/machines/${machineId}/maintenance-alarms/${alarmId}/reset`,
  
  // Events
  EVENTS: '/events',
  EVENT: (id: string) => `/events/${id}`,
  
  // Event Types (Machine Event Types - Crowdsourcing catalog)
  EVENT_TYPES_POPULAR: '/event-types/popular',
  EVENT_TYPES_SEARCH: '/event-types/search',
  EVENT_TYPES: '/event-types',
  EVENT_TYPE: (id: string) => `/event-types/${id}`,
  // TODO: Endpoints estratégicos futuros
  // EVENT_TYPES_BY_CATEGORY: (category: string) => `/event-types/category/${category}`,
  // EVENT_TYPES_FAVORITES: (userId: string) => `/users/${userId}/favorite-event-types`,
  // EVENT_TYPES_RECENT: (userId: string) => `/users/${userId}/recent-event-types`,
  
  // QuickCheck
  QUICKCHECKS: '/quickchecks',
  QUICKCHECK: (id: string) => `/quickchecks/${id}`,
  MACHINE_QUICKCHECK: (machineId: string) => `/machines/${machineId}/quickcheck`,
  MACHINE_QUICKCHECKS: (machineId: string) => `/machines/${machineId}/quickchecks`, // For add/history
  QUICKCHECK_EXECUTE: (id: string) => `/quickchecks/${id}/execute`,
  
  // Notifications (User-scoped endpoints matching backend routes)
  USER_NOTIFICATIONS: (userId: string) => `/users/${userId}/notifications`,
  USER_NOTIFICATIONS_UNREAD_COUNT: (userId: string) => `/users/${userId}/notifications/unread-count`,
  
  // Dashboard (Sprint #12 - Bundle 12: Dashboard Recent Activity)
  DASHBOARD_RECENT_QUICKCHECKS: '/dashboard/recent-quickchecks',
  DASHBOARD_RECENT_EVENTS: '/dashboard/recent-events',
  USER_NOTIFICATIONS_MARK_SEEN: (userId: string) => `/users/${userId}/notifications/mark-as-seen`,
  USER_NOTIFICATIONS_STREAM: (userId: string) => `/users/${userId}/notifications/stream`, // SSE endpoint
  
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
  
  // Event Types (Machine Event Types catalog)
  EVENT_TYPES: ['eventTypes'],
  EVENT_TYPES_POPULAR: (limit: number) => ['eventTypes', 'popular', limit],
  EVENT_TYPES_SEARCH: (query: string) => ['eventTypes', 'search', query],
  
  // QuickChecks
  QUICKCHECKS: ['quickchecks'],
  MACHINE_QUICKCHECK: (machineId: string) => ['machines', machineId, 'quickcheck'],
  QUICKCHECK_HISTORY: (machineId: string) => ['machines', machineId, 'quickchecks', 'history'],
  
  // Notifications (User-scoped query keys)
  NOTIFICATIONS: (userId: string) => ['notifications', userId],
  NOTIFICATIONS_UNREAD_COUNT: (userId: string) => ['notifications', 'unread-count', userId],
  
  // User Discovery (Sprint #12 - Module 1)
  USER_DISCOVERY: ['users', 'discovery'],
  
  // Contact Management (Sprint #12 - Module 2)
  CONTACTS: ['contacts'],
  CONTACT: (contactUserId: string) => ['contacts', contactUserId],
  
  // User Statistics (Sprint #12 - User Stats Feature)
  USER_STATS_TOTAL: ['users', 'stats', 'total'],
  
  // Messaging (Sprint #12 - Module 3: 1-to-1 Messaging)
  MESSAGES: (otherUserId: string, page?: number) => 
    page ? ['messages', otherUserId, { page }] : ['messages', otherUserId],
  CONVERSATIONS: ['conversations'],
  
  // Dashboard (Sprint #12 - Bundle 12: Dashboard Recent Activity)
  // Cache key fija para acumulación de datos (sin offset en la key)
  DASHBOARD_RECENT_QUICKCHECKS: ['dashboard', 'recent-quickchecks'] as const,
  DASHBOARD_RECENT_EVENTS: ['dashboard', 'recent-events'] as const,
  
  // TODO: Query keys estratégicas futuras
  // USER_PUBLIC_PROFILE: (userId: string) => ['users', userId, 'public-profile'],
  // USER_STATS: (userId: string) => ['users', userId, 'stats'],
  // CONTACTS_BULK: ['contacts', 'bulk'],
  // DASHBOARD_SUMMARY_STATS: ['dashboard', 'summary-stats'],
  // DASHBOARD_COMPLIANCE_RATE: (period: 'daily' | 'weekly' | 'monthly') => ['dashboard', 'compliance', period],
  // CONTACT_MUTUAL: (contactUserId: string) => ['contacts', contactUserId, 'mutual'],
  // CONVERSATION_METADATA: (otherUserId: string) => ['conversations', otherUserId, 'metadata'],
  // MESSAGE_SEARCH: (otherUserId: string, query: string) => ['messages', otherUserId, 'search', query],
  
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