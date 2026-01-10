import { useQuery } from '@tanstack/react-query';
import { userDiscoveryService } from '@services/api/userDiscoveryService';
import { QUERY_KEYS } from '@constants';
import type { DiscoverUsersQuery, PaginatedUsers } from '@packages/contracts';

export type { DiscoverUsersQuery, PaginatedUsers };

/**
 * Hook: Discover registered users with filters and pagination
 * 
 * Fetches list of users (clients and providers) for discovery purposes.
 * Part of Sprint #12 - Module 1: User Communication System.
 * 
 * Features:
 * - Pagination (page, limit with max 50 per page)
 * - Search by company name (case-insensitive)
 * - Filter by user type (CLIENT | PROVIDER)
 * - Excludes logged user automatically (backend)
 * - Only exposes public profile data (no email, phone, etc.)
 * 
 * @param query - Optional filters and pagination
 * @param options - TanStack Query options (enabled, staleTime, etc.)
 * 
 * @example
 * ```tsx
 * // Basic usage: Get all users (page 1, default 20 per page)
 * const { data, isLoading } = useDiscoverUsers();
 * 
 * // With search term
 * const { data } = useDiscoverUsers({ searchTerm: 'Acme Corp' });
 * 
 * // Filter providers only
 * const { data } = useDiscoverUsers({ type: 'PROVIDER' });
 * 
 * // Paginated with custom limit
 * const { data } = useDiscoverUsers({ page: 2, limit: 10 });
 * 
 * // Disabled until user clicks "Search"
 * const [filters, setFilters] = useState<DiscoverUsersQuery>();
 * const { data } = useDiscoverUsers(filters, { enabled: !!filters });
 * 
 * // data structure:
 * // {
 * //   profiles: UserPublicProfile[], // Array of public user profiles
 * //   total: 45,                       // Total count of users matching filters
 * //   page: 1,                         // Current page
 * //   limit: 20,                       // Items per page
 * //   totalPages: 3                    // Total pages available
 * // }
 * ```
 */
export const useDiscoverUsers = (
  query?: DiscoverUsersQuery,
  options?: { enabled?: boolean }
) => {
  return useQuery<PaginatedUsers>({
    queryKey: [...QUERY_KEYS.USER_DISCOVERY, query],
    queryFn: () => userDiscoveryService.discoverUsers(query),
    enabled: options?.enabled !== false, // Default to true unless explicitly disabled
    staleTime: 60 * 1000, // 1 minute - balance between freshness and performance
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnMount: 'always', // CRITICAL: Always refetch on mount (user reported stale data issues)
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
// FUTURE HOOKS (Strategic, commented for post-MVP)
// =============================================================================

/**
 * TODO: Hook to get detailed public profile of specific user
 * Útil para modal con más detalles antes de agregar contacto
 * 
 * @param userId - ID of user to fetch
 * @returns Query with user's public profile
 * 
 * @example
 * const { data: profile } = useUserPublicProfile('abc123');
 */
// export const useUserPublicProfile = (userId: string | undefined) => {
//   return useQuery({
//     queryKey: QUERY_KEYS.USER_PUBLIC_PROFILE(userId || ''),
//     queryFn: () => {
//       if (!userId) throw new Error('userId is required');
//       return userDiscoveryService.getUserProfile(userId);
//     },
//     enabled: !!userId,
//     staleTime: 10 * 60 * 1000, // 10 minutes (profile data changes rarely)
//   });
// };

/**
 * TODO: Hook to get user statistics (machine count, rating, etc.)
 * Útil para mostrar más contexto en UserCard
 * 
 * @param userId - ID of user
 * @returns Query with user stats
 * 
 * @example
 * const { data: stats } = useUserStats('abc123');
 * // stats: { machineCount: 15, averageRating: 4.5, joinedDate: '2023-01-15' }
 */
// export const useUserStats = (userId: string | undefined) => {
//   return useQuery({
//     queryKey: QUERY_KEYS.USER_STATS(userId || ''),
//     queryFn: () => {
//       if (!userId) throw new Error('userId is required');
//       return userDiscoveryService.getUserStats(userId);
//     },
//     enabled: !!userId,
//     staleTime: 10 * 60 * 1000, // 10 minutes
//   });
// };
