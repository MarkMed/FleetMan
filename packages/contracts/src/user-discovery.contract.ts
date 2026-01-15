import { z } from 'zod';
import type { IUserPublicProfile } from '@packages/domain';

// =============================================================================
// USER DISCOVERY SCHEMAS (Sprint #12 - Module 1)
// =============================================================================

/**
 * Schema for User Public Profile (Discovery DTO)
 * Exposes only non-sensitive user data for public discovery
 * Uses satisfies to ensure compile-time validation against domain IUserPublicProfile
 * 
 * EXCLUDED (sensitive): email, phone, passwordHash, subscriptionLevel, notifications, address
 * INCLUDED (public): id, companyName, bio, tags, type, serviceAreas (providers), isVerified (providers)
 */
export const UserPublicProfileSchema = z.object({
  id: z.string(),
  profile: z.object({
    companyName: z.string().optional(),
    bio: z.string().optional(), // 🆕 Sprint #13 Task 10.2: Biografía pública
    tags: z.array(z.string()).readonly().optional() // 🆕 Sprint #13 Task 10.2: Tags públicos (readonly para coincidir con domain)
  }),
  type: z.enum(['CLIENT', 'PROVIDER']),
  // Provider-specific fields (optional, only when type === 'PROVIDER')
  serviceAreas: z.array(z.string()).readonly().optional(),
  isVerified: z.boolean().optional()
}) satisfies z.ZodType<IUserPublicProfile>;

/**
 * Schema for query params when discovering users (GET request)
 * 
 * Query params arrive as strings from Express:
 * - page: Default 1, minimum 1 (first page)
 * - limit: Default 20, max 50 (prevent excessive data transfer)
 * - searchTerm: Optional, searches in profile.companyName (case-insensitive)
 * - type: Optional, filters by user type (CLIENT or PROVIDER)
 * 
 * Sprint #12 - User Communication System - Module 1
 */
export const DiscoverUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().min(1).max(50).default(20),
  searchTerm: z.string()
    .min(1, 'Search term must have at least 1 character')
    .max(100, 'Search term cannot exceed 100 characters')
    .trim()
    .optional(),
  type: z.enum(['CLIENT', 'PROVIDER']).optional()
});

/**
 * Schema for paginated users data (SSOT - Single Source of Truth)
 * Representa SOLO los datos de la respuesta, sin el wrapper ApiResponse
 * Esto permite reutilizar la estructura en Use Cases y Controllers
 * 
 * PRINCIPIO DRY: Esta estructura se define UNA sola vez
 * PRINCIPIO SSOT: Cualquier cambio aquí se propaga automáticamente
 */
export const PaginatedUsersSchema = z.object({
  profiles: z.array(UserPublicProfileSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative()
});

// =============================================================================
// INFERRED TYPES
// =============================================================================

export type UserPublicProfile = z.infer<typeof UserPublicProfileSchema>;
export type DiscoverUsersQuery = z.infer<typeof DiscoverUsersQuerySchema>;

/**
 * Tipo para datos paginados de usuarios (SSOT)
 * Use Cases retornan este tipo directamente
 * Controllers lo envuelven en ApiResponse<PaginatedUsers>
 */
export type PaginatedUsers = z.infer<typeof PaginatedUsersSchema>;

/**
 * Tipo para respuesta HTTP completa de descubrimiento de usuarios
 * Composición de ApiResponse genérico + PaginatedUsers
 * NO necesitamos schema Zod porque ApiResponse<T> ya es genérico
 * 
 * Estructura final:
 * {
 *   success: true,
 *   message: string,
 *   data: PaginatedUsers
 * }
 */
export type DiscoverUsersResponse = {
  success: true;
  message: string;
  data: PaginatedUsers;
};

// =============================================================================
// RUNTIME VALIDATION (Optional)
// =============================================================================
// Para desarrollo, puedes validar en runtime:
// const validated = PaginatedUsersSchema.parse(result);
// En producción, confiar en TypeScript es suficiente y más performante

// TODO: Schemas estratégicos para futuras features
// export const UserProfileDetailSchema = z.object({
//   ...UserPublicProfileSchema.shape,
//   machineCount: z.number().int().nonnegative().optional(), // Cantidad de máquinas registradas
//   rating: z.number().min(1).max(5).optional(), // Rating promedio (proveedores)
//   location: z.object({ city: z.string(), region: z.string() }).optional(), // Ubicación geográfica
//   joinedDate: z.coerce.date(), // Fecha de registro en la plataforma
// }); // Para vista detallada de perfil de usuario (Module 1.5)

// TODO: Helper genérico para construir ApiResponse (DRY en controllers)
// export function createApiResponse<T>(message: string, data: T): ApiResponse<T> & { success: true } {
//   return { success: true, message, data };
// }
// Uso: const response = createApiResponse('Success', paginatedUsers);
