/**
 * Notification Type Enum
 * SSOT for notification severity levels
 * Sprint #9 - Notifications System
 */
export const NOTIFICATION_TYPES = [
  'success',
  'warning', 
  'error',
  'info'
] as const;

export type NotificationType = typeof NOTIFICATION_TYPES[number];

/**
 * Notification Source Type Enum
 * SSOT for notification source origins
 * Sprint #9 - Notifications System
 */
export const NOTIFICATION_SOURCE_TYPES = [
  'QUICKCHECK',
  'EVENT',
  'MAINTENANCE',
  'SYSTEM'
] as const;

export type NotificationSourceType = typeof NOTIFICATION_SOURCE_TYPES[number];
