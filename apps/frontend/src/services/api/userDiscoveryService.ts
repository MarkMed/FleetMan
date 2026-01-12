import { apiClient, handleBackendApiResponse } from './apiClient';
import { API_ENDPOINTS } from '../../constants';
import type { 
  DiscoverUsersQuery, 
  PaginatedUsers 
} from '@packages/contracts';

/**
 * User Discovery Service
 * 
 * Handles API calls for discovering registered users in the system.
 * Part of Sprint #12 - Module 1: User Communication System (User Discovery).
 * 
 * Purpose:
 * - Allow users to explore other registered users (clients and providers)
 * - Search by company name, filter by user type
 * - Paginated results for performance
 * - Exclude sensitive data (only public profiles)
 * 
 * Architecture:
 * - Consumes GET /api/v1/users/discover endpoint
 * - Uses DiscoverUsersQuery (Zod-validated query params)
 * - Returns PaginatedUsers (SSOT from @packages/contracts)
 * - Integrates with TanStack Query via useUserDiscovery hook
 * 
 * @example
 * ```tsx
 * // Basic usage: Get all users (page 1, default 20 per page)
 * const users = await userDiscoveryService.discoverUsers();
 * 
 * // With search term
 * const filtered = await userDiscoveryService.discoverUsers({ searchTerm: 'Acme' });
 * 
 * // Filter by type (only providers)
 * const providers = await userDiscoveryService.discoverUsers({ type: 'PROVIDER' });
 * 
 * // With pagination
 * const page2 = await userDiscoveryService.discoverUsers({ page: 2, limit: 10 });
 * ```
 */

/**
 * Discover registered users with optional filters and pagination
 * 
 * @param query - Query parameters (search, type, page, limit)
 * @returns Promise with paginated user profiles and metadata
 * 
 * Backend validation:
 * - page: min 1, default 1
 * - limit: min 1, max 50, default 20
 * - searchTerm: min 1 char, max 100 chars (case-insensitive)
 * - type: enum ['CLIENT', 'PROVIDER'] (optional)
 * 
 * Response excludes logged user (backend handles this automatically)
 * Response only includes public profile data (no email, phone, etc.)
 */
export async function discoverUsers(
  query?: DiscoverUsersQuery
): Promise<PaginatedUsers> {
  // Build query string params manually
  const params = query ? {
    page: String(query.page),
    limit: String(query.limit),
    ...(query.searchTerm && { searchTerm: query.searchTerm }),
    ...(query.type && { type: query.type }),
  } : undefined;

  const response = await apiClient.get<{ success: boolean; message: string; data: PaginatedUsers }>(
    API_ENDPOINTS.USER_DISCOVERY,
    params
  );
  
  return handleBackendApiResponse(response);
}

// =============================================================================
// FUTURE ENDPOINTS (Strategic, commented for post-MVP)
// =============================================================================

/**
 * TODO: Get detailed public profile of specific user
 * Útil para modal con más info antes de agregar contacto
 * 
 * @param userId - ID of user to fetch
 * @returns Promise with user's public profile
 * 
 * @example
 * const profile = await userDiscoveryService.getUserProfile('abc123');
 */
// export async function getUserProfile(userId: string): Promise<IUserPublicProfile> {
//   const response = await apiClient.get<IUserPublicProfile>(
//     API_ENDPOINTS.USER_PUBLIC_PROFILE(userId)
//   );
//   return handleApiResponse(response);
// }

/**
 * TODO: Get user statistics for discovery (machine count, rating, etc.)
 * Útil para mostrar más contexto en UserCard
 * 
 * @param userId - ID of user
 * @returns Promise with user stats
 * 
 * @example
 * const stats = await userDiscoveryService.getUserStats('abc123');
 * // { machineCount: 15, averageRating: 4.5, joinedDate: '2023-01-15' }
 */
// export async function getUserStats(userId: string): Promise<UserStats> {
//   const response = await apiClient.get<UserStats>(
//     API_ENDPOINTS.USER_STATS(userId)
//   );
//   return handleApiResponse(response);
// }

const userDiscoveryService = {
  discoverUsers,
  // Future: getUserProfile, getUserStats
};

export { userDiscoveryService };
export default userDiscoveryService;
