import { z } from 'zod';

// =============================================================================
// COMMON TYPES: Types reutilizables para todos los contratos
// =============================================================================

export type ApiError = { code: string; message: string };

/**
 * Schema común para ordenamiento
 */
export const SortOrderSchema = z.enum(['asc', 'desc']);

/**
 * Schema común para paginación
 * 
 * Usa z.coerce para convertir automáticamente query params (strings) a números.
 * Ejemplo: ?page=1&limit=20 → { page: 1, limit: 20 }
 */
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
});

/**
 * Schema base para respuestas paginadas
 */
export const BasePaginatedResponseSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
});

/**
 * Schema común para búsqueda
 */
export const SearchSchema = z.object({
  search: z.string().optional()
});

// =============================================================================
// Type Inference
// =============================================================================

export type SortOrder = z.infer<typeof SortOrderSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type BasePaginatedResponse = z.infer<typeof BasePaginatedResponseSchema>;
export type Search = z.infer<typeof SearchSchema>;

/**
 * Generic API Response Wrapper
 * 
 * Standardizes HTTP response structure across all controllers.
 * All endpoints return: { success, message, data? }
 * 
 * Usage:
 * ```typescript
 * const response: ApiResponse<Machine> = {
 *   success: true,
 *   message: 'Machine created',
 *   data: machine
 * };
 * ```
 */
export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

// POST-MVP: Error response con múltiples errores de validación
// export type ApiValidationError = ApiResponse<never> & {
//   success: false;
//   errors: Array<{ field: string; message: string }>;
// };
