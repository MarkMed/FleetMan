import { z } from 'zod';
import { QuickCheckResultSchema } from './quickcheck.contract';

// =============================================================================
// DASHBOARD CONTRACTS - Sprint #12 (Bundle 12)
// =============================================================================

/**
 * DTO enriquecido de QuickCheck reciente para dashboard
 * Incluye datos de la máquina asociada para evitar N+1 queries
 */
export const RecentQuickCheckDTOSchema = z.object({
  // QuickCheck data
  id: z.string(),
  result: QuickCheckResultSchema,
  date: z.coerce.date(),
  responsibleName: z.string(),
  responsibleWorkerId: z.string().optional(), // Opcional porque puede no existir en User
  quickCheckItemsCount: z.number().int().min(0),
  approvedItemsCount: z.number().int().min(0),
  disapprovedItemsCount: z.number().int().min(0),
  observations: z.string().optional(),
  
  // Machine data (enriched)
  machine: z.object({
    id: z.string(),
    name: z.string(),
    brand: z.string(),
    model: z.string(),
    serialNumber: z.string(),
    machineType: z.object({
      id: z.string(),
      name: z.string()
    }).optional()
  })
});

export type RecentQuickCheckDTO = z.infer<typeof RecentQuickCheckDTOSchema>;

// Explicit type exports for better IDE support
export type { RecentQuickCheckDTO as RecentQuickCheck };

/**
 * DTO enriquecido de evento de máquina reciente para dashboard
 * Incluye datos de máquina y tipo de evento
 */
export const RecentMachineEventDTOSchema = z.object({
  // Event data
  id: z.string(),
  title: z.string(),
  description: z.string(),
  createdAt: z.coerce.date(),
  isSystemGenerated: z.boolean(),
  responsibleName: z.string(),
  responsibleWorkerId: z.string().optional(), // Opcional porque puede no existir en User
  
  // Event type data (enriched)
  eventType: z.object({
    id: z.string(),
    name: z.string(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    // category: z.string().optional(), // Future: categorización de eventos
    // icon: z.string().optional(), // Future: ícono UI
  }),
  
  // Machine data (enriched)
  machine: z.object({
    id: z.string(),
    name: z.string(),
    brand: z.string(),
    model: z.string(),
    serialNumber: z.string(),
    machineType: z.object({
      id: z.string(),
      name: z.string()
    }).optional()
  }),
  
  // metadata: z.record(z.any()).optional(), // Future: metadata adicional si se necesita
});

export type RecentMachineEventDTO = z.infer<typeof RecentMachineEventDTOSchema>;

/**
 * Request schema para obtener QuickChecks recientes
 * Soporta paginación incremental estilo "Load More"
 */
export const GetRecentQuickChecksRequestSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(5), // Max 50 para evitar abuso
  offset: z.coerce.number().int().min(0).default(0), // Para paginación "Ver más"
  // dateFrom: z.coerce.date().optional(), // Future: filtro por rango de fechas
  // result: QuickCheckResultSchema.optional(), // Future: filtro por resultado
});

export type GetRecentQuickChecksRequest = z.infer<typeof GetRecentQuickChecksRequestSchema>;

/**
 * Response schema para QuickChecks recientes con metadata de paginación
 */
export const GetRecentQuickChecksResponseSchema = z.object({
  data: z.array(RecentQuickCheckDTOSchema),
  total: z.number().int().min(0), // Total de registros disponibles
  limit: z.number().int(),
  offset: z.number().int(),
  hasMore: z.boolean() // Indica si hay más registros para cargar
});

export type GetRecentQuickChecksResponse = z.infer<typeof GetRecentQuickChecksResponseSchema>;

/**
 * Request schema para obtener eventos recientes
 * Soporta paginación incremental estilo "Load More"
 */
export const GetRecentMachineEventsRequestSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(5),
  offset: z.coerce.number().int().min(0).default(0),
  // typeId: z.string().optional(), // Future: filtro por tipo de evento
  // severityMin: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(), // Future: filtro por severidad
  // dateFrom: z.coerce.date().optional(), // Future: filtro por rango
});

export type GetRecentMachineEventsRequest = z.infer<typeof GetRecentMachineEventsRequestSchema>;

/**
 * Response schema para eventos recientes con metadata de paginación
 */
export const GetRecentMachineEventsResponseSchema = z.object({
  data: z.array(RecentMachineEventDTOSchema),
  total: z.number().int().min(0),
  limit: z.number().int(),
  offset: z.number().int(),
  hasMore: z.boolean()
});

export type GetRecentMachineEventsResponse = z.infer<typeof GetRecentMachineEventsResponseSchema>;

// =============================================================================
// FUTURE ENHANCEMENTS (commented for strategic planning)
// =============================================================================

/**
 * Future: Dashboard summary stats
 * 
 * export const DashboardSummarySchema = z.object({
 *   quickCheckStats: z.object({
 *     totalToday: z.number(),
 *     approvedToday: z.number(),
 *     failedToday: z.number(),
 *     pendingMachines: z.number() // Máquinas sin QuickCheck hoy
 *   }),
 *   eventStats: z.object({
 *     totalThisWeek: z.number(),
 *     criticalOpen: z.number(),
 *     resolvedThisWeek: z.number()
 *   }),
 *   machineStats: z.object({
 *     totalActive: z.number(),
 *     inMaintenance: z.number(),
 *     operatingToday: z.number()
 *   })
 * });
 * 
 * Purpose: Agregar widgets de estadísticas resumidas en dashboard
 * Requires: Agregaciones adicionales en repositorio
 */

/**
 * Future: Real-time updates
 * 
 * export const DashboardUpdateEventSchema = z.object({
 *   type: z.enum(['QUICKCHECK_ADDED', 'EVENT_REPORTED', 'MACHINE_STATUS_CHANGED']),
 *   timestamp: z.coerce.date(),
 *   data: z.any() // Typed según el tipo de evento
 * });
 * 
 * Purpose: Notificaciones push de cambios en dashboard via SSE/WebSocket
 * Requires: Implementación de SSE en backend (Sprint #11)
 */
