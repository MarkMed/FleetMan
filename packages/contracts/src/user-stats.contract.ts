import { z } from 'zod';

/**
 * User Statistics Contracts
 * 
 * Schemas and types for user statistics endpoints.
 * Sprint #12 - User Stats Feature (strategic client request)
 * 
 * Purpose:
 * - Show transparency of ecosystem size to users
 * - Stimulate networking and internal business (snowball effect)
 * - Hookear más usuarios mostrando la cantidad de usuarios registrados
 * 
 * Design Principles:
 * - SSOT: Single Source of Truth for stats response structure
 * - Type Safety: Inferred types from Zod schemas
 * - Extensibility: Ready for future stats (growth, breakdown by region, etc.)
 * - Privacy: Only exposes non-sensitive aggregate data
 */

// =============================================================================
// RESPONSE SCHEMAS (SSOT)
// =============================================================================

/**
 * Schema for total users response
 * 
 * Exposes ONLY the total count (no breakdown, no sensitive data)
 * Use case extracts this from repository's internal breakdown
 * 
 * Future extensions (commented for post-MVP):
 * - breakdown?: { clients: number; providers: number } // Opcional por ahora
 * - growthRate?: number // % crecimiento últimos 30 días
 * - activeLastMonth?: number // Usuarios activos últimos 30 días
 */
export const GetTotalUsersResponseSchema = z.object({
  totalUsers: z.number().int().nonnegative()
    .describe('Total number of registered users in the system (all types, no filters)')
});

// =============================================================================
// API RESPONSE WRAPPERS
// =============================================================================

/**
 * Full API response for GET /users/stats/total
 * Wraps data in standard ApiResponse structure
 */
export const GetTotalUsersApiResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: GetTotalUsersResponseSchema
});

// =============================================================================
// INFERRED TYPES (SSOT)
// =============================================================================

/**
 * Data type for total users (use cases return this)
 * Controllers wrap this in ApiResponse<GetTotalUsersResponse>
 */
export type GetTotalUsersResponse = z.infer<typeof GetTotalUsersResponseSchema>;

/**
 * Full API response type (includes success, message, data wrapper)
 */
export type GetTotalUsersApiResponse = z.infer<typeof GetTotalUsersApiResponseSchema>;

// =============================================================================
// FUTURE STRATEGIC STATS (Commented for extensibility)
// =============================================================================

// /**
//  * Schema for user growth statistics
//  * Útil para dashboard de admins o landing page pública
//  */
// export const UserGrowthStatsSchema = z.object({
//   period: z.enum(['7d', '30d', '90d', '1y']),
//   totalUsers: z.number().int().nonnegative(),
//   newUsers: z.number().int().nonnegative(),
//   growthRate: z.number(), // Porcentaje de crecimiento
//   breakdown: z.object({
//     clients: z.number().int().nonnegative(),
//     providers: z.number().int().nonnegative()
//   })
// });
// export type UserGrowthStats = z.infer<typeof UserGrowthStatsSchema>;

// /**
//  * Schema for active users statistics
//  * Define "activo" como login en últimos N días
//  */
// export const ActiveUsersStatsSchema = z.object({
//   totalActive: z.number().int().nonnegative(),
//   period: z.enum(['7d', '30d', '90d']),
//   breakdown: z.object({
//     clients: z.number().int().nonnegative(),
//     providers: z.number().int().nonnegative()
//   }),
//   activityRate: z.number() // % de usuarios totales que son activos
// });
// export type ActiveUsersStats = z.infer<typeof ActiveUsersStatsSchema>;

// /**
//  * Schema for user distribution by region
//  * Requiere agregar campo `region` a User profile
//  */
// export const UsersByRegionStatsSchema = z.object({
//   regions: z.array(z.object({
//     region: z.string(),
//     totalUsers: z.number().int().nonnegative(),
//     breakdown: z.object({
//       clients: z.number().int().nonnegative(),
//       providers: z.number().int().nonnegative()
//     })
//   }))
// });
// export type UsersByRegionStats = z.infer<typeof UsersByRegionStatsSchema>;
