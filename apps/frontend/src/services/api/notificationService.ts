import { apiClient, handleBackendApiResponse } from './apiClient';
import { API_ENDPOINTS } from '../../constants';
import type { 
  GetNotificationsQuery,
  GetNotificationsResponse,
  UnreadCountResponse,
  MarkAsSeenRequest
} from '@contracts';

/**
 * NotificationService - API client for Notifications operations
 * 
 * Endpoints:
 * - GET /users/:userId/notifications - Get paginated notifications with filters
 * - GET /users/:userId/notifications/unread-count - Get unread count for badge
 * - PATCH /users/:userId/notifications/mark-as-seen - Batch mark as seen
 * 
 * Pattern follows authService.ts:
 * - Class with methods
 * - handleBackendApiResponse for unwrapping
 * - Return types from @contracts
 * - No manual error handling (apiClient handles it)
 * 
 * @example
 * ```ts
 * // Get notifications with filters
 * const response = await notificationService.getNotifications('user_123', {
 *   onlyUnread: true,
 *   page: 1,
 *   limit: 20
 * });
 * 
 * // Get unread count for badge
 * const count = await notificationService.getUnreadCount('user_123');
 * 
 * // Mark notifications as seen
 * await notificationService.markAsSeen('user_123', ['notif_1', 'notif_2']);
 * ```
 */
export class NotificationService {
  /**
   * Get paginated notifications with optional filters
   * 
   * @param userId - User ID (empresaabc_123)
   * @param query - Optional filters: onlyUnread, page, limit
   * @returns Paginated notifications response
   */
  async getNotifications(
    userId: string,
    query?: GetNotificationsQuery
  ): Promise<GetNotificationsResponse['data']> {
    console.log('🔗 NotificationService.getNotifications called with:', { userId, query });

    // Build query params
    const params: Record<string, string> = {};
    if (query?.onlyUnread !== undefined) {
      params.onlyUnread = String(query.onlyUnread);
    }
    if (query?.page !== undefined) {
      params.page = String(query.page);
    }
    if (query?.limit !== undefined) {
      params.limit = String(query.limit);
    }

    const response = await apiClient.get<GetNotificationsResponse>(
      API_ENDPOINTS.USER_NOTIFICATIONS(userId),
      params
    );

    console.log('🔗 Raw API response:', response);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch notifications');
    }

    console.log('🔗 Processed result (GetNotificationsResponse.data):', response.data.data);

    return response.data.data;
  }

  /**
   * Get unread notifications count (lightweight for badge)
   * 
   * @param userId - User ID
   * @returns Unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    console.log('🔗 NotificationService.getUnreadCount called with:', { userId });

    const response = await apiClient.get<UnreadCountResponse>(
      API_ENDPOINTS.USER_NOTIFICATIONS_UNREAD_COUNT(userId)
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch unread count');
    }

    console.log('🔗 Unread count result:', response.data.data.unreadCount);

    return response.data.data.unreadCount;
  }

  /**
   * Mark notifications as seen (batch operation)
   * 
   * @param userId - User ID
   * @param notificationIds - Array of notification IDs (1-100 max per backend contract)
   * @returns Success response
   */
  async markAsSeen(
    userId: string,
    notificationIds: string[]
  ): Promise<{ success: boolean; message: string }> {
    console.log('🔗 NotificationService.markAsSeen called with:', {
      userId,
      count: notificationIds.length,
      ids: notificationIds
    });

    const body: MarkAsSeenRequest = {
      notificationIds
    };

    const response = await apiClient.patch<{ success: boolean; message: string }>(
      API_ENDPOINTS.USER_NOTIFICATIONS_MARK_SEEN(userId),
      body
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to mark notifications as seen');
    }

    console.log('🔗 Mark as seen successful');

    return {
      success: true,
      message: response.data?.message ?? 'Notifications marked as seen'
    };
  }

  // TODO Sprint #10+: Advanced operations (commented for future)

  /**
   * FUTURE: Delete notification (soft delete)
   * Backend needs to implement DELETE endpoint first
   */
  // async deleteNotification(userId: string, notificationId: string): Promise<void> {
  //   await apiClient.delete(
  //     API_ENDPOINTS.USER_NOTIFICATION(userId, notificationId)
  //   );
  // }

  /**
   * FUTURE: Delete all notifications for user
   * Useful for "Clear all" button
   */
  // async deleteAllNotifications(userId: string): Promise<void> {
  //   await apiClient.delete(
  //     API_ENDPOINTS.USER_NOTIFICATIONS(userId)
  //   );
  // }

  /**
   * FUTURE: Mark all as seen (without providing IDs)
   * Backend needs dedicated endpoint: PATCH /users/:userId/notifications/mark-all-seen
   */
  // async markAllAsSeen(userId: string): Promise<void> {
  //   await apiClient.patch(
  //     API_ENDPOINTS.USER_NOTIFICATIONS_MARK_ALL_SEEN(userId)
  //   );
  // }
}

// Export singleton instance
export const notificationService = new NotificationService();
