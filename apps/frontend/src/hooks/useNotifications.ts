import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@services/api/notificationService';
import { QUERY_KEYS } from '@constants';
import type { GetNotificationsQuery } from '@contracts';

/**
 * Hook: Get paginated notifications with filters
 * 
 * @param userId - User ID from useAuth
 * @param filters - Optional filters: onlyUnread, page, limit
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useNotifications(user?.id, {
 *   onlyUnread: true,
 *   page: 1,
 *   limit: 20
 * });
 * 
 * // data structure:
 * // {
 * //   notifications: INotification[],
 * //   total: 45,
 * //   page: 1,
 * //   limit: 20,
 * //   totalPages: 3
 * // }
 * ```
 */
export const useNotifications = (userId: string | undefined, filters?: GetNotificationsQuery) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.NOTIFICATIONS(userId || ''), filters],
    queryFn: () => {
      if (!userId) {
        throw new Error('userId is required for fetching notifications');
      }
      return notificationService.getNotifications(userId, filters);
    },
    enabled: !!userId, // Only fetch when userId is available
    staleTime: 30 * 1000, // 30 seconds (SSE invalidates on new notifications)
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (user not found)
      if (error?.status === 404) return false;
      return failureCount < 2;
    },
  });
};

/**
 * Hook: Get unread notifications count (for badge)
 * 
 * @param userId - User ID from useAuth
 * 
 * @example
 * ```tsx
 * const { data: unreadCount } = useUnreadCount(user?.id);
 * 
 * return (
 *   <Badge count={unreadCount}>
 *     <BellIcon />
 *   </Badge>
 * );
 * ```
 */
export const useUnreadCount = (userId: string | undefined) => {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS_UNREAD_COUNT(userId || ''),
    queryFn: () => {
      if (!userId) {
        throw new Error('userId is required for fetching unread count');
      }
      return notificationService.getUnreadCount(userId);
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    // NOTE: No refetchInterval here - SSE Observer invalidates this query when new notification arrives
    // This prevents redundant polling (SSE already provides real-time updates)
  });
};

/**
 * Hook: Mark notifications as seen (batch mutation)
 * 
 * @param userId - User ID from useAuth
 * 
 * @example
 * ```tsx
 * const markAsSeen = useMarkNotificationsAsSeen(user?.id);
 * 
 * // Mark single notification
 * <Button onClick={() => markAsSeen.mutate(['notif_123'])}>
 *   Mark as read
 * </Button>
 * 
 * // Mark multiple notifications
 * <Button onClick={() => markAsSeen.mutate(selectedIds)}>
 *   Mark selected as read
 * </Button>
 * ```
 */
export const useMarkNotificationsAsSeen = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationIds: string[]) => {
      if (!userId) {
        throw new Error('userId is required for marking notifications as seen');
      }
      return notificationService.markAsSeen(userId, notificationIds);
    },
    onSuccess: () => {
      // Invalidate both queries to refetch updated data
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS(userId || '')
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS_UNREAD_COUNT(userId || '')
      });
    },
    onError: (error) => {
      console.error('Failed to mark notifications as seen:', error);
    },
  });
};

// TODO Sprint #10+: Additional hooks (commented for future)

/**
 * FUTURE: Hook for deleting notification
 * Requires backend DELETE endpoint implementation
 */
// export const useDeleteNotification = (userId: string | undefined) => {
//   const queryClient = useQueryClient();
//
//   return useMutation({
//     mutationFn: (notificationId: string) => {
//       if (!userId) throw new Error('userId required');
//       return notificationService.deleteNotification(userId, notificationId);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS(userId || '') });
//       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS_UNREAD_COUNT(userId || '') });
//     },
//   });
// };

/**
 * FUTURE: Hook for infinite scroll pagination
 * Useful for "Load more" button or infinite scroll UI
 */
// export const useInfiniteNotifications = (
//   userId: string | undefined,
//   filters?: Omit<GetNotificationsQuery, 'page'>
// ) => {
//   return useInfiniteQuery({
//     queryKey: [...QUERY_KEYS.NOTIFICATIONS(userId || ''), filters],
//     queryFn: ({ pageParam = 1 }) => {
//       if (!userId) throw new Error('userId required');
//       return notificationService.getNotifications(userId, { ...filters, page: pageParam });
//     },
//     getNextPageParam: (lastPage) => {
//       return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined;
//     },
//     enabled: !!userId,
//   });
// };
