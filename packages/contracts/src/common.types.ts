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
 */
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
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
