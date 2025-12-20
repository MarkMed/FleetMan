import { z } from 'zod';
import type { NotificationType, NotificationSourceType, INotification } from '@packages/domain';
import { NOTIFICATION_TYPES, NOTIFICATION_SOURCE_TYPES } from '@packages/domain';

// =============================================================================
// NOTIFICATION SCHEMAS (Sprint #9)
// =============================================================================

/**
 * Schema for Notification Record embedded in User
 * Similar to QuickCheckRecordSchema but for notifications
 * Uses satisfies to ensure compile-time validation against domain INotification
 */
export const NotificationSchema = z.object({
  id: z.string(),
  notificationType: z.enum(NOTIFICATION_TYPES),
  message: z.string()
    .min(1, 'Message is required')
    .max(500, 'Message cannot exceed 500 characters'),
  wasSeen: z.boolean(),
  notificationDate: z.coerce.date(),
  actionUrl: z.string().url('Must be a valid URL').optional(),
  sourceType: z.enum(NOTIFICATION_SOURCE_TYPES).optional(),
  metadata: z.record(z.any()).optional()
}) satisfies z.ZodType<INotification>;

/**
 * Schema for creating a notification (request DTO)
 * Only required fields are sent, the rest is generated server-side
 */
export const AddNotificationRequestSchema = z.object({
  notificationType: z.enum(NOTIFICATION_TYPES),
  message: z.string()
    .min(1, 'Message is required')
    .max(500, 'Message cannot exceed 500 characters')
    .trim(),
  actionUrl: z.string().url('Must be a valid URL').optional(),
  sourceType: z.enum(NOTIFICATION_SOURCE_TYPES).optional(),
  metadata: z.record(z.any()).optional()
});

/**
 * Schema for marking notifications as seen (PATCH request)
 */
export const MarkAsSeenRequestSchema = z.object({
  notificationIds: z.array(
    z.string().regex(/^[a-f\d]{24}$/i, 'Must be a valid MongoDB ObjectId')
  )
    .min(1, 'At least one notification ID is required')
    .max(100, 'Cannot mark more than 100 notifications at once')
});

/**
 * Schema for query params when fetching notifications (GET request)
 * 
 * Note: Query params always arrive as strings from Express
 * - onlyUnread: Strict validation with enum - only accepts 'true', 'false', '1', '0'
 *   Rejects invalid values like 'yes', 'no', typos (fail-fast principle)
 * - page/limit: z.coerce works fine for numbers
 * 
 * Sprint #9 - Sistema de Notificaciones
 */
export const GetNotificationsQuerySchema = z.object({
  onlyUnread: z
    .enum(['true', 'false', '1', '0'])
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      return val === 'true' || val === '1';
    }),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});

/**
 * Schema for paginated notifications response
 */
export const GetNotificationsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    notifications: z.array(NotificationSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative()
  })
});

/**
 * Schema for unread count response
 */
export const UnreadCountResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    unreadCount: z.number().int().nonnegative()
  })
});

// =============================================================================
// INFERRED TYPES FROM SCHEMAS
// =============================================================================

export type NotificationDTO = z.infer<typeof NotificationSchema>;
export type AddNotificationRequest = z.infer<typeof AddNotificationRequestSchema>;
export type MarkAsSeenRequest = z.infer<typeof MarkAsSeenRequestSchema>;
export type GetNotificationsQuery = z.infer<typeof GetNotificationsQuerySchema>;
export type GetNotificationsResponse = z.infer<typeof GetNotificationsResponseSchema>;
export type UnreadCountResponse = z.infer<typeof UnreadCountResponseSchema>;
