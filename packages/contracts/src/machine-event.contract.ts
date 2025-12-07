import { z } from 'zod';
import { SortOrderSchema, PaginationSchema, BasePaginatedResponseSchema } from './common.types';

// =============================================================================
// REAL DRY APPROACH: Re-export de types del dominio
// =============================================================================

// Import local para uso en schemas
import type { MachineEventMetadata, CreateMachineEventProps } from '@packages/domain';

// Re-exportamos los types exactos del dominio para reutilización (type-only)
export type { MachineEventMetadata, CreateMachineEventProps } from '@packages/domain';

// =============================================================================
// Schemas Zod basados en types IMPORTADOS del dominio (DRY REAL)
// =============================================================================

/**
 * Schema basado en MachineEventMetadata del dominio
 */
export const MachineEventMetadataSchema = z.object({
  additionalInfo: z.record(z.any()).optional(),
  notes: z.string().optional()
}) satisfies z.ZodType<MachineEventMetadata>;

/**
 * Schema para crear evento basado en CreateMachineEventProps del dominio
 */
export const CreateMachineEventRequestSchema = z.object({
  machineId: z.string().min(1, 'Machine ID is required'),
  createdBy: z.string().min(1, 'Creator ID is required'),
  typeId: z.string().min(1, 'Event type ID is required'),
  title: z.string()
    .min(1, 'Event title is required')
    .max(200, 'Event title cannot exceed 200 characters'),
  description: z.string()
    .min(1, 'Event description is required')
    .max(2000, 'Event description cannot exceed 2000 characters'),
  metadata: MachineEventMetadataSchema.optional()
}) satisfies z.ZodType<CreateMachineEventProps>;

/**
 * Schema de respuesta con información completa del evento
 */
export const CreateMachineEventResponseSchema = z.object({
  id: z.string(),
  machineId: z.string(),
  createdBy: z.string(),
  typeId: z.string(),
  title: z.string(),
  description: z.string(),
  metadata: MachineEventMetadataSchema.nullable(),
  createdAt: z.string().datetime(),
  isSystemGenerated: z.boolean()
});

/**
 * Schema para obtener evento
 */
export const GetMachineEventRequestSchema = z.object({
  id: z.string()
});

export const GetMachineEventResponseSchema = CreateMachineEventResponseSchema;

/**
 * Schema para listar eventos de máquina (usando types comunes)
 */
export const ListMachineEventsRequestSchema = PaginationSchema.extend({
  machineId: z.string().optional(),
  typeId: z.string().optional(),
  createdBy: z.string().optional(),
  isSystemGenerated: z.boolean().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  search: z.string().optional(), // Buscar en título y descripción
  sortBy: z.enum(['createdAt', 'title', 'typeId']).default('createdAt'),
  sortOrder: SortOrderSchema.default('desc')
});

export const ListMachineEventsResponseSchema = BasePaginatedResponseSchema.extend({
  events: z.array(CreateMachineEventResponseSchema)
});

/**
 * Schema para obtener historial completo de máquina específica (usando types comunes)
 */
export const GetMachineEventHistoryRequestSchema = z.object({
  machineId: z.string(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  typeId: z.string().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional()
});

export const GetMachineEventHistoryResponseSchema = z.object({
  machineId: z.string(),
  events: z.array(CreateMachineEventResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
});

/**
 * Schema para crear evento del sistema (uso interno)
 */
export const CreateSystemEventRequestSchema = z.object({
  machineId: z.string().min(1, 'Machine ID is required'),
  systemUserId: z.string().min(1, 'System user ID is required'),
  typeId: z.string().min(1, 'Event type ID is required'),
  title: z.string()
    .min(1, 'Event title is required')
    .max(200, 'Event title cannot exceed 200 characters'),
  description: z.string()
    .min(1, 'Event description is required')
    .max(2000, 'Event description cannot exceed 2000 characters'),
  metadata: MachineEventMetadataSchema.optional()
});

export const CreateSystemEventResponseSchema = CreateMachineEventResponseSchema;

/**
 * Schema para obtener resumen de eventos
 */
export const GetEventsSummaryRequestSchema = z.object({
  machineId: z.string().optional(),
  ownerId: z.string().optional(), // Para ver resumen de todas las máquinas del usuario
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional()
});

export const GetEventsSummaryResponseSchema = z.object({
  totalEvents: z.number(),
  eventsByType: z.array(z.object({
    typeId: z.string(),
    typeName: z.string(),
    count: z.number()
  })),
  recentEvents: z.array(CreateMachineEventResponseSchema),
  criticalEvents: z.array(CreateMachineEventResponseSchema)
});

/**
 * Schema para buscar eventos relacionados
 */
export const GetRelatedEventsRequestSchema = z.object({
  eventId: z.string(),
  timeRangeHours: z.number().min(1).max(8760).default(168), // Default: 7 días
  limit: z.number().min(1).max(50).default(10)
});

export const GetRelatedEventsResponseSchema = z.object({
  relatedEvents: z.array(CreateMachineEventResponseSchema)
});

// =============================================================================
// Type Inference (derivados automáticamente del dominio)
// =============================================================================

export type CreateMachineEventRequest = z.infer<typeof CreateMachineEventRequestSchema>;
export type CreateMachineEventResponse = z.infer<typeof CreateMachineEventResponseSchema>;

export type GetMachineEventRequest = z.infer<typeof GetMachineEventRequestSchema>;
export type GetMachineEventResponse = z.infer<typeof GetMachineEventResponseSchema>;

export type ListMachineEventsRequest = z.infer<typeof ListMachineEventsRequestSchema>;
export type ListMachineEventsResponse = z.infer<typeof ListMachineEventsResponseSchema>;

export type GetMachineEventHistoryRequest = z.infer<typeof GetMachineEventHistoryRequestSchema>;
export type GetMachineEventHistoryResponse = z.infer<typeof GetMachineEventHistoryResponseSchema>;

export type CreateSystemEventRequest = z.infer<typeof CreateSystemEventRequestSchema>;
export type CreateSystemEventResponse = z.infer<typeof CreateSystemEventResponseSchema>;

export type GetEventsSummaryRequest = z.infer<typeof GetEventsSummaryRequestSchema>;
export type GetEventsSummaryResponse = z.infer<typeof GetEventsSummaryResponseSchema>;

export type GetRelatedEventsRequest = z.infer<typeof GetRelatedEventsRequestSchema>;
export type GetRelatedEventsResponse = z.infer<typeof GetRelatedEventsResponseSchema>;