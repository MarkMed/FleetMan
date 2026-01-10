import { useQuery } from '@tanstack/react-query';
import { userStatsService } from '@services/api/userStatsService';
import { QUERY_KEYS } from '@constants';
import type { GetTotalUsersResponse } from '@packages/contracts';

/**
 * TanStack Query Hooks for User Statistics
 * 
 * Provides React hooks for fetching user statistics with automatic caching,
 * refetching, and error handling.
 * 
 * Sprint #12 - User Stats Feature (strategic client request)
 * 
 * Purpose:
 * - Show ecosystem size to stimulate networking
 * - Marketing hook for landing pages
 * - Dashboard metrics
 * - Snowball effect: más usuarios → más confianza → más registros
 * 
 * Architecture:
 * - Wraps userStatsService with TanStack Query
 * - Provides consistent query keys (QUERY_KEYS.USER_STATS_TOTAL)
 * - Automatic cache invalidation and refetching strategies
 * - Type-safe with @packages/contracts types
 * 
 * @example
 * ```tsx
 * function UserDiscoveryScreen() {
 *   const { data, isLoading, error } = useUserStats();
 *   
 *   if (isLoading) return <Skeleton />;
 *   if (error) return <ErrorMessage />;
 *   
 *   return <div>Total usuarios: {data.totalUsers}</div>;
 * }
 * ```
 */

/**
 * Hook to fetch total registered users
 * 
 * Features:
 * - Automatic caching (15 min stale time - stats don't change frequently)
 * - Retry logic (2 retries for network errors)
 * - Error handling
 * - Optional enabled/disabled control
 * 
 * Use cases:
 * - Display on User Discovery screen header
 * - Landing page marketing
 * - Dashboard widgets
 * - Show community growth to stimulate networking
 * 
 * Cache strategy:
 * - staleTime: 15 minutes (stats don't change rapidly)
 * - gcTime: 30 minutes (keep in cache longer)
 * - refetchOnWindowFocus: false (avoid unnecessary refetches)
 * 
 * @param options - Query options (enabled, refetchInterval, etc.)
 * @returns TanStack Query result with total users data
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const { data, isLoading, error } = useUserStats();
 * 
 * // Conditional fetching
 * const { data } = useUserStats({ enabled: isUserLoggedIn });
 * 
 * // Auto-refresh every 5 minutes
 * const { data } = useUserStats({ refetchInterval: 5 * 60 * 1000 });
 * ```
 */
export const useUserStats = (options?: { 
  enabled?: boolean;
  refetchInterval?: number;
}) => {
  return useQuery<GetTotalUsersResponse>({
    queryKey: QUERY_KEYS.USER_STATS_TOTAL,
    queryFn: () => userStatsService.getTotalUsers(),
    enabled: options?.enabled !== false, // Default to true unless explicitly disabled
    staleTime: 0, // CRITICAL: Always consider data stale to avoid showing outdated stats
    gcTime: 5 * 60 * 1000, // 5 minutes cache (reduced from 30min to avoid stale data confusion)
    refetchOnMount: 'always', // CRITICAL: Always refetch on mount to ensure fresh data
    refetchOnWindowFocus: false, // Avoid unnecessary refetches
    refetchInterval: options?.refetchInterval, // Optional auto-refresh
    retry: (failureCount, error: any) => {
      // Don't retry on 401 (unauthorized) or 403 (forbidden)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
};

// =============================================================================
// FUTURE HOOKS (Strategic, commented for extensibility)
// =============================================================================

/**
 * TODO: Hook to fetch user growth statistics
 * 
 * @param period - Time period for growth stats ('7d' | '30d' | '90d' | '1y')
 * @param options - Query options
 * @returns TanStack Query result with growth data
 * 
 * @example
 * const { data } = useUserGrowthStats('30d');
 * // data = { period: '30d', totalUsers: 1247, newUsers: 152, growthRate: 13.9, ... }
 */
// export const useUserGrowthStats = (
//   period: '7d' | '30d' | '90d' | '1y',
//   options?: { enabled?: boolean }
// ) => {
//   return useQuery<UserGrowthStats>({
//     queryKey: [...QUERY_KEYS.USER_STATS_GROWTH, period],
//     queryFn: () => userStatsService.getGrowthStats(period),
//     enabled: options?.enabled !== false,
//     staleTime: 30 * 60 * 1000, // 30 minutes (growth stats change even slower)
//   });
// };

/**
 * TODO: Hook to fetch active users statistics
 * 
 * @param period - Time period for activity check ('7d' | '30d' | '90d')
 * @param options - Query options
 * @returns TanStack Query result with active users data
 * 
 * @example
 * const { data } = useActiveUsersStats('30d');
 * // data = { totalActive: 843, activityRate: 67.6, breakdown: {...}, ... }
 */
// export const useActiveUsersStats = (
//   period: '7d' | '30d' | '90d',
//   options?: { enabled?: boolean }
// ) => {
//   return useQuery<ActiveUsersStats>({
//     queryKey: [...QUERY_KEYS.USER_STATS_ACTIVE, period],
//     queryFn: () => userStatsService.getActiveUsers(period),
//     enabled: options?.enabled !== false,
//     staleTime: 15 * 60 * 1000, // 15 minutes
//   });
// };
