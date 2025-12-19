import type { NotificationType, NotificationSourceType } from '../enums/NotificationEnums';

/**
 * Domain Event: Notification Created
 * 
 * Represents the immutable business fact that a notification was created
 * for a specific user at a specific point in time.
 * 
 * Use Case: Emitted by AddNotificationUseCase after successfully saving
 * notification to database. Backend EventBus listeners (e.g., SSEManager)
 * react to this event to push real-time updates to connected clients.
 * 
 * Pattern: Event-Driven Architecture
 * - Events describe WHAT HAPPENED (past tense)
 * - Events are IMMUTABLE (no setters, readonly fields)
 * - Events contain ALL data needed by consumers
 * 
 * Example Flow:
 * ```
 * 1. AddNotificationUseCase saves notification to DB
 * 2. Creates NotificationCreatedEvent with saved data
 * 3. EventBus.emit("notification-created", event)
 * 4. SSEManager receives event → Push to all user's devices
 * 5. Frontend receives → Toast + Cache invalidation
 * ```
 * 
 * Multi-Device Scenario:
 * ```
 * Company "ABC" (userId: "empresaabc_123")
 *   ├─ PC Desktop (connected via SSE)
 *   ├─ Mobile Phone (connected via SSE)
 *   └─ Tablet (connected via SSE)
 * 
 * Event published → All 3 devices receive simultaneously in <300ms
 * ```
 */
export class NotificationCreatedEvent {
  constructor(
    /**
     * User ID who owns the notification (empresa/cuenta ID)
     * Example: "empresaabc_123"
     * Used by SSEManager to find connected devices: clients.get(userId)
     */
    public readonly userId: string,

    /**
     * Unique notification ID (MongoDB subdocument _id as string)
     * Used for tracking and potential deduplication
     */
    public readonly notificationId: string,

    /**
     * Type of notification: 'success' | 'warning' | 'error' | 'info'
     * Determines toast color and icon in frontend
     */
    public readonly notificationType: NotificationType,

    /**
     * Notification message content
     * Can be i18n key (e.g., "notification.quickcheck.completed.disapproved")
     * or plain text for system-generated messages
     */
    public readonly message: string,

    /**
     * Timestamp when notification was created (server time)
     * Used for ordering and latency measurement
     */
    public readonly createdAt: Date,

    /**
     * Optional URL for navigation when user clicks toast action
     * Example: "/machines/123/quickchecks" → Navigate to QuickCheck detail
     */
    public readonly actionUrl?: string,

    /**
     * Optional source type: 'QUICKCHECK' | 'EVENT' | 'MAINTENANCE' | 'SYSTEM'
     * Used for categorization and filtering in UI
     */
    public readonly sourceType?: NotificationSourceType,

    /**
     * Optional metadata for i18next interpolation
     * Example: { machineName: "Excavadora CAT 320", userName: "Juan Pérez" }
     * Used to replace placeholders like {{machineName}} in translation strings
     */
    public readonly metadata?: Record<string, any>
  ) {}

  /**
   * Serializes event to JSON for EventBus transmission
   * Used by SSEManager to format HTTP stream payload
   */
  toJSON() {
    return {
      userId: this.userId,
      notificationId: this.notificationId,
      notificationType: this.notificationType,
      message: this.message,
      createdAt: this.createdAt.toISOString(),
      actionUrl: this.actionUrl,
      sourceType: this.sourceType,
      metadata: this.metadata
    };
  }

  /**
   * String representation for logging/debugging
   */
  toString(): string {
    return `NotificationCreatedEvent(userId=${this.userId}, notificationId=${this.notificationId}, type=${this.notificationType})`;
  }
}
