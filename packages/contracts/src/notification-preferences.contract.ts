import { z } from 'zod';

/**
 * Notification Preferences Contracts
 * Sprint #15 Task 8.7: Email Notifications Configuration
 * 
 * Allows users to control email notification preferences.
 * Opt-out approach: Users receive emails by default, can disable.
 */

// =============================================================================
// Request Schemas
// =============================================================================

/**
 * Update Notification Preferences Request
 * PATCH /users/me/notification-preferences
 * 
 * @example
 * { emailNotifications: false } // Disable email notifications
 * { emailNotifications: true }  // Enable email notifications
 */
export const UpdateNotificationPreferencesRequestSchema = z.object({
  emailNotifications: z.boolean({
    required_error: 'emailNotifications is required',
    invalid_type_error: 'emailNotifications must be a boolean'
  })
});
export type UpdateNotificationPreferencesRequest = z.infer<typeof UpdateNotificationPreferencesRequestSchema>;

// =============================================================================
// Response Schemas
// =============================================================================

/**
 * Notification Preferences Response
 * Returns current notification preferences
 */
export const NotificationPreferencesResponseSchema = z.object({
  emailNotifications: z.boolean()
  // TODO: Campos estratégicos para futuro
  // smsNotifications: z.boolean().optional(), // SMS notifications (opt-in por costo)
  // pushNotifications: z.boolean().optional(), // Push notifications (móvil)
  // emailDigestFrequency: z.enum(['none', 'daily', 'weekly', 'monthly']).optional() // Frecuencia de digest
});
export type NotificationPreferencesResponse = z.infer<typeof NotificationPreferencesResponseSchema>;

/**
 * Update Response
 * Success response after updating preferences
 * 🔧 FIX: Changed 'preferences' to 'data' to match controller implementation
 * and align with standard API response pattern used across the application
 */
export const UpdateNotificationPreferencesResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: NotificationPreferencesResponseSchema
});
export type UpdateNotificationPreferencesResponse = z.infer<typeof UpdateNotificationPreferencesResponseSchema>;
