import { apiClient, handleBackendApiResponse } from './apiClient';
import { API_ENDPOINTS } from '../../constants';
import type { GetTotalUsersResponse } from '@packages/contracts';

/**
 * User Statistics Service
 * 
 * Handles API calls for user statistics and metrics.
 * Part of Sprint #12 - User Stats Feature (strategic client request).
 * 
 * Purpose:
 * - Show transparency of ecosystem size to users
 * - Stimulate networking and internal business (snowball effect)
 * - Marketing hook: más usuarios ven números altos → más confianza → más registros
 * 
 * Architecture:
 * - Consumes GET /api/v1/users/stats/total endpoint
 * - Returns GetTotalUsersResponse (SSOT from @packages/contracts)
 * - Integrates with TanStack Query via useUserStats hook
 * 
 * Privacy: Only exposes aggregate data (total count, no sensitive info)
 * 
 * @example
 * ```tsx
 * // Get total registered users
 * const stats = await userStatsService.getTotalUsers();
 * console.log(stats.totalUsers); // 1247
 * ```
 */

/**
 * Get total number of registered users in the system
 * 
 * No filters applied - counts ALL users regardless of type.
 * Any authenticated user can access this endpoint.
 * 
 * Use cases:
 * - Display on User Discovery screen to show ecosystem size
 * - Landing page marketing hook
 * - Dashboard metrics
 * - Stimulate networking (show active community)
 * 
 * @returns Promise with total users count
 * @throws Error if request fails or user not authenticated
 * 
 * @example
 * ```tsx
 * const { totalUsers } = await getTotalUsers();
 * // totalUsers = 1247 (clients + providers + all types)
 * ```
 */
export async function getTotalUsers(): Promise<GetTotalUsersResponse> {
  const response = await apiClient.get<{ 
    success: boolean; 
    message: string; 
    data: GetTotalUsersResponse 
  }>(API_ENDPOINTS.USER_STATS_TOTAL);
  
  return handleBackendApiResponse(response);
}

// =============================================================================
// FUTURE ENDPOINTS (Strategic, commented for post-MVP)
// =============================================================================

/**
 * TODO: Get user growth statistics
 * Útil para dashboard de admins o landing page pública
 * 
 * @param period - Time period for growth calculation ('7d' | '30d' | '90d' | '1y')
 * @returns Promise with growth stats (new users, growth rate, breakdown)
 * 
 * @example
 * const growth = await userStatsService.getGrowthStats('30d');
 * // { period: '30d', totalUsers: 1247, newUsers: 152, growthRate: 13.9, breakdown: {...} }
 */
// export async function getGrowthStats(period: '7d' | '30d' | '90d' | '1y'): Promise<UserGrowthStats> {
//   const response = await apiClient.get<UserGrowthStats>(
//     `${API_ENDPOINTS.USER_STATS_GROWTH}?period=${period}`
//   );
//   return handleBackendApiResponse(response);
// }

/**
 * TODO: Get active users statistics
 * Define "activo" como login en últimos N días
 * 
 * @param period - Time period for activity check ('7d' | '30d' | '90d')
 * @returns Promise with active users stats (total active, breakdown, activity rate)
 * 
 * @example
 * const active = await userStatsService.getActiveUsers('30d');
 * // { totalActive: 843, period: '30d', breakdown: {...}, activityRate: 67.6 }
 */
// export async function getActiveUsers(period: '7d' | '30d' | '90d'): Promise<ActiveUsersStats> {
//   const response = await apiClient.get<ActiveUsersStats>(
//     `${API_ENDPOINTS.USER_STATS_ACTIVE}?period=${period}`
//   );
//   return handleBackendApiResponse(response);
// }

const userStatsService = {
  getTotalUsers,
  // Future: getGrowthStats, getActiveUsers, getUsersByRegion
};

export { userStatsService };
export default userStatsService;
