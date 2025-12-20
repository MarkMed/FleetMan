import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@store/AuthProvider';
import { useNotifications, useUnreadCount, useMarkNotificationsAsSeen } from '@hooks';

/**
 * ViewModel: NotificationsScreen Business Logic
 * 
 * Responsibilities (MVVM-lite):
 * - Manage local state (filters, pagination)
 * - Fetch data from API via hooks
 * - Handle user actions (mark as seen, click notification)
 * - Compute derived data (hasMore, formatted data)
 * - Navigation logic
 * 
 * Pattern:
 * - View (NotificationsScreen.tsx) calls this hook
 * - ViewModel returns { state, data, actions }
 * - View renders based on ViewModel output
 * 
 * @example
 * ```tsx
 * const vm = useNotificationsViewModel();
 * return <div>{vm.notifications.map(...)}</div>;
 * ```
 */
export function useNotificationsViewModel() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // ========================
  // STATE MANAGEMENT
  // ========================
  
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  // ========================
  // DATA FETCHING
  // ========================
  
  const { data, isLoading, error, refetch } = useNotifications(user?.id, {
    onlyUnread,
    page,
    limit,
  });
  
  const { data: unreadCount } = useUnreadCount(user?.id);
  const markAsSeenMutation = useMarkNotificationsAsSeen(user?.id);

  // ========================
  // DERIVED STATE
  // ========================
  
  // Note: Currently showing only current page. 
  // TODO Sprint #12: Implement useInfiniteNotifications for accumulated pagination
  const notifications = data?.notifications || [];
  const totalCount = data?.total || 0;
  const totalPages = data?.totalPages || 0;
  const hasMore = page < totalPages;
  const isFirstPageLoading = isLoading && page === 1;

  // ========================
  // BUSINESS LOGIC ACTIONS
  // ========================
  
  /**
   * Mark single notification as seen
   * @param notificationId - Notification ID to mark
   */
  const handleMarkAsSeen = (notificationId: string) => {
    markAsSeenMutation.mutate([notificationId]);
  };

  /**
   * Handle notification click: mark as seen + navigate if actionUrl exists
   * @param notification - Notification object
   */
  const handleNotificationClick = (notification: any) => {
    // Mark as seen if unread
    if (!notification.wasSeen) {
      handleMarkAsSeen(notification.id);
    }
    
    // Navigate to actionUrl if exists and is internal route
    // TODO Sprint #10: Validate actionUrl more strictly (whitelist, regex, etc.)
    if (notification.actionUrl && notification.actionUrl.trim() !== '') {
      let url = notification.actionUrl.trim();
      
      // Fix backend route inconsistency: /quickchecks/history → /quickcheck/history
      // Frontend uses singular 'quickcheck' in routes
    //   url = url.replace('/quickchecks/', '/quickcheck/');
      
      // Check if it's an internal route (starts with /)
      if (url.startsWith('/')) {
        navigate(url);
      }
    }
  };

  /**
   * Handle filter change: update onlyUnread state and reset pagination
   * @param value - Filter value ('all' | 'unread')
   */
  const handleFilterChange = (value: 'all' | 'unread') => {
    setOnlyUnread(value === 'unread');
    setPage(1); // Reset pagination when filter changes
  };

  /**
   * Handle load more action: increment page number
   */
  const handleLoadMore = () => {
    setPage(page + 1);
  };

  /**
   * Handle retry action: refetch data
   */
  const handleRetry = () => {
    refetch();
  };

  // TODO Sprint #10: Implement mark all as seen
  // const handleMarkAllAsSeen = async () => {
  //   // Requires backend endpoint: PATCH /users/:userId/notifications/mark-all-seen
  //   // Should mark all notifications for current user as seen
  //   // After success: invalidate NOTIFICATIONS and UNREAD_COUNT queries
  // };

  // TODO Sprint #11: Implement notification settings
  // const handleOpenSettings = () => {
  //   // Open modal/drawer with notification preferences
  //   // - Email notifications toggle
  //   // - Push notifications toggle
  //   // - Notification types filter (which types to receive)
  //   // Persist to backend: PATCH /users/:userId/notification-settings
  // };

  // TODO Sprint #11: Implement type filter
  // const [selectedType, setSelectedType] = useState<NotificationSourceType | 'all'>('all');
  // const handleTypeFilterChange = (type: NotificationSourceType | 'all') => {
  //   setSelectedType(type);
  //   setPage(1);
  //   // Requires backend query param: ?sourceType=QUICKCHECK
  // };

  // TODO Sprint #11: Implement date range filter
  // const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);
  // const handleDateRangeChange = (range: { from: Date; to: Date } | null) => {
  //   setDateRange(range);
  //   setPage(1);
  //   // Requires backend query params: ?startDate=ISO&endDate=ISO
  // };

  // ========================
  // RETURN ViewModel API
  // ========================
  
  return {
    // State
    state: {
      onlyUnread,
      page,
      limit,
      isLoading,
      isFirstPageLoading,
      error,
    },

    // Data
    data: {
      notifications,
      unreadCount: unreadCount || 0,
      totalCount,
      totalPages,
      hasMore,
    },

    // Actions
    actions: {
      handleMarkAsSeen,
      handleNotificationClick,
      handleFilterChange,
      handleLoadMore,
      handleRetry,
      // Future actions (commented for Sprint #10+)
      // handleMarkAllAsSeen,
      // handleOpenSettings,
      // handleTypeFilterChange,
      // handleDateRangeChange,
    },

    // I18n
    t,
  };
}

/**
 * ViewModel Return Type (for type safety in View)
 */
export type NotificationsViewModel = ReturnType<typeof useNotificationsViewModel>;
