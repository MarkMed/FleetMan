import { z } from 'zod';
import type { NotificationType, NotificationSourceType } from '@packages/domain';
import { NOTIFICATION_TYPES, NOTIFICATION_SOURCE_TYPES } from '@packages/domain';

// =============================================================================
// NOTIFICATION SCHEMAS (Sprint #9)
// =============================================================================

/**
 * Schema para Notification Record embebida en User
 * Similar a QuickCheckRecordSchema pero para notificaciones
 */
export const NotificationSchema = z.object({
  id: z.string(),
  notificationType: z.enum(NOTIFICATION_TYPES) satisfies z.ZodType<NotificationType>,
  message: z.string()
    .min(1, 'Message is required')
    .max(500, 'Message cannot exceed 500 characters'),
  wasSeen: z.boolean(),
  notificationDate: z.coerce.date(),
  actionUrl: z.string().url('Must be a valid URL').optional(),
  sourceType: z.enum(NOTIFICATION_SOURCE_TYPES).optional() satisfies z.ZodType<NotificationSourceType | undefined>
});

/**
 * Schema para crear una notificación (request DTO)
 * Solo se envían los campos necesarios, el resto se genera server-side
 */
export const AddNotificationRequestSchema = z.object({
  notificationType: z.enum(NOTIFICATION_TYPES),
  message: z.string()
    .min(1, 'Message is required')
    .max(500, 'Message cannot exceed 500 characters')
    .trim(),
  actionUrl: z.string().url('Must be a valid URL').optional(),
  sourceType: z.enum(NOTIFICATION_SOURCE_TYPES).optional()
});

/**
 * Schema para marcar notificaciones como vistas (PATCH request)
 */
export const MarkAsSeenRequestSchema = z.object({
  notificationIds: z.array(z.string())
    .min(1, 'At least one notification ID is required')
    .max(100, 'Cannot mark more than 100 notifications at once')
});

/**
 * Schema para query params al obtener notificaciones (GET request)
 */
export const GetNotificationsQuerySchema = z.object({
  onlyUnread: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20)
});

/**
 * Schema para response de notificaciones paginadas
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
 * Schema para response de contador de no leídas
 */
export const UnreadCountResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    unreadCount: z.number().int().nonnegative()
  })
});

// =============================================================================
// TYPES INFERIDOS DE SCHEMAS
// =============================================================================

export type NotificationDTO = z.infer<typeof NotificationSchema>;
export type AddNotificationRequest = z.infer<typeof AddNotificationRequestSchema>;
export type MarkAsSeenRequest = z.infer<typeof MarkAsSeenRequestSchema>;
export type GetNotificationsQuery = z.infer<typeof GetNotificationsQuerySchema>;
export type GetNotificationsResponse = z.infer<typeof GetNotificationsResponseSchema>;
export type UnreadCountResponse = z.infer<typeof UnreadCountResponseSchema>;
