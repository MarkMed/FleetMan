/**
 * Notification Type Enum
 * SSOT for notification severity levels
 * Sprint #9 - Notifications System
 * Sprint #12 Module 3 - Added 'new_message' for messaging system
 */
export const NOTIFICATION_TYPES = [
  'success',
  'warning', 
  'error',
  'info',
  'new_message' // 🆕 Sprint #12 Module 3: Mensajes entre usuarios
] as const;

export type NotificationType = typeof NOTIFICATION_TYPES[number];

/**
 * Notification Source Type Enum
 * SSOT for notification source origins
 * Sprint #9 - Notifications System
 * Sprint #12 Module 3 - Added 'MESSAGING' for messaging system
 */
export const NOTIFICATION_SOURCE_TYPES = [
  'QUICKCHECK',
  'EVENT',
  'MAINTENANCE',
  'SYSTEM',
  'MESSAGING' // 🆕 Sprint #12 Module 3: Mensajes entre usuarios
] as const;

export type NotificationSourceType = typeof NOTIFICATION_SOURCE_TYPES[number];
