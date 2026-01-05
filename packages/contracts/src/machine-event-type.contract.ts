import { z } from 'zod';
import { SortOrderSchema, PaginationSchema, BasePaginatedResponseSchema } from './common.types';

// =============================================================================
// REAL DRY APPROACH: Re-export de types del dominio
// =============================================================================

// Import local para uso en schemas
import type { CreateMachineEventTypeProps, IMachineEventType } from '@packages/domain';

// Re-exportamos los types exactos del dominio para reutilización (type-only)
export type { CreateMachineEventTypeProps } from '@packages/domain';

// =============================================================================
// Schemas Zod basados en types IMPORTADOS del dominio (DRY REAL)
// =============================================================================

/**
 * Schema para crear tipo de evento basado en CreateMachineEventTypeProps del dominio
 */
export const CreateMachineEventTypeRequestSchema = z.object({
  name: z.string()
    .min(1, 'Event type name is required')
    .max(50, 'Event type name cannot exceed 50 characters'),
  language: z.string()
    .length(2, 'Language code must be ISO 639-1 (2 letters)')
}) satisfies z.ZodType<CreateMachineEventTypeProps>;

/**
 * Schema de respuesta con información completa del tipo de evento
 */
export const CreateMachineEventTypeResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  normalizedName: z.string(),
  languages: z.array(z.string()), // Códigos ISO 639-1
  systemGenerated: z.boolean(),
  createdAt: z.string().datetime(),
  timesUsed: z.number(),
  isActive: z.boolean()
});

/**
 * Schema para obtener tipo de evento
 */
export const GetMachineEventTypeRequestSchema = z.object({
  id: z.string()
});

export const GetMachineEventTypeResponseSchema = CreateMachineEventTypeResponseSchema;

/**
 * Schema para listar tipos de eventos (usando types comunes)
 */
export const ListMachineEventTypesRequestSchema = PaginationSchema.extend({
  systemGenerated: z.coerce.boolean().optional(), // Filtrar por tipos del sistema o usuarios (query param)
  isActive: z.coerce.boolean().default(true), // Query param llega como "true"/"false"
  search: z.string().optional(), // Buscar por nombre
  sortBy: z.enum(['name', 'timesUsed', 'createdAt']).default('timesUsed'), // Ordenar por popularidad por defecto
  sortOrder: SortOrderSchema.default('desc')
});

export const ListMachineEventTypesResponseSchema = BasePaginatedResponseSchema.extend({
  eventTypes: z.array(CreateMachineEventTypeResponseSchema)
});

/**
 * Schema para obtener tipos más populares
 */
export const GetPopularEventTypesRequestSchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10), // Query param numérico
  isActive: z.coerce.boolean().default(true) // Query param boolean
});

export const GetPopularEventTypesResponseSchema = z.object({
  eventTypes: z.array(CreateMachineEventTypeResponseSchema)
});

/**
 * Schema para buscar tipos similares (para sugerencias UX)
 */
export const SearchSimilarEventTypesRequestSchema = z.object({
  searchTerm: z.string().min(1, 'Search term is required'),
  limit: z.coerce.number().min(1).max(20).default(5), // Query param numérico
  isActive: z.coerce.boolean().default(true) // Query param boolean
});

export const SearchSimilarEventTypesResponseSchema = z.object({
  suggestions: z.array(z.object({
    eventType: CreateMachineEventTypeResponseSchema,
    similarity: z.number().min(0).max(1) // Score de similitud
  }))
});

/**
 * Schema para desactivar tipo de evento
 */
export const DeactivateEventTypeRequestSchema = z.object({
  id: z.string()
});

export const DeactivateEventTypeResponseSchema = z.object({
  success: z.boolean(),
  message: z.string()
});

/**
 * Schema para reactivar tipo de evento
 */
export const ReactivateEventTypeRequestSchema = z.object({
  id: z.string()
});

export const ReactivateEventTypeResponseSchema = z.object({
  success: z.boolean(),
  message: z.string()
});

/**
 * Schema para incrementar uso (interno del sistema)
 */
export const IncrementEventTypeUsageRequestSchema = z.object({
  id: z.string()
});

export const IncrementEventTypeUsageResponseSchema = z.object({
  id: z.string(),
  timesUsed: z.number()
});

/**
 * Schema para actualizar tipo de evento (PATCH genérico)
 */
export const UpdateEventTypeRequestSchema = z.object({
  id: z.string(),
  isActive: z.boolean().optional(),
  languagesToAdd: z.array(z.string().length(2)).optional(),
  languagesToRemove: z.array(z.string().length(2)).optional()
}).refine(
  (data) => {
    // Al menos una operación debe estar presente
    return data.isActive !== undefined || 
           (data.languagesToAdd && data.languagesToAdd.length > 0) || 
           (data.languagesToRemove && data.languagesToRemove.length > 0);
  },
  {
    message: 'At least one update operation must be provided (isActive, languagesToAdd, or languagesToRemove)'
  }
);

export const UpdateEventTypeResponseSchema = CreateMachineEventTypeResponseSchema;

// =============================================================================
// Type Inference (derivados automáticamente del dominio)
// =============================================================================

export type CreateMachineEventTypeRequest = z.infer<typeof CreateMachineEventTypeRequestSchema>;
export type CreateMachineEventTypeResponse = z.infer<typeof CreateMachineEventTypeResponseSchema>;

export type GetMachineEventTypeRequest = z.infer<typeof GetMachineEventTypeRequestSchema>;
export type GetMachineEventTypeResponse = z.infer<typeof GetMachineEventTypeResponseSchema>;

export type ListMachineEventTypesRequest = z.infer<typeof ListMachineEventTypesRequestSchema>;
export type ListMachineEventTypesResponse = z.infer<typeof ListMachineEventTypesResponseSchema>;

export type GetPopularEventTypesRequest = z.infer<typeof GetPopularEventTypesRequestSchema>;
export type GetPopularEventTypesResponse = z.infer<typeof GetPopularEventTypesResponseSchema>;

export type SearchSimilarEventTypesRequest = z.infer<typeof SearchSimilarEventTypesRequestSchema>;
export type SearchSimilarEventTypesResponse = z.infer<typeof SearchSimilarEventTypesResponseSchema>;

export type DeactivateEventTypeRequest = z.infer<typeof DeactivateEventTypeRequestSchema>;
export type DeactivateEventTypeResponse = z.infer<typeof DeactivateEventTypeResponseSchema>;

export type ReactivateEventTypeRequest = z.infer<typeof ReactivateEventTypeRequestSchema>;
export type ReactivateEventTypeResponse = z.infer<typeof ReactivateEventTypeResponseSchema>;

export type IncrementEventTypeUsageRequest = z.infer<typeof IncrementEventTypeUsageRequestSchema>;
export type IncrementEventTypeUsageResponse = z.infer<typeof IncrementEventTypeUsageResponseSchema>;

export type UpdateEventTypeRequest = z.infer<typeof UpdateEventTypeRequestSchema>;
export type UpdateEventTypeResponse = z.infer<typeof UpdateEventTypeResponseSchema>;