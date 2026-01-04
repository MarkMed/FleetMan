import { z } from 'zod';
import { 
  QUICK_CHECK_ITEM_RESULTS, 
  QUICK_CHECK_RESULTS,
  type QuickCheckItemResult as DomainQuickCheckItemResult,
  type QuickCheckResult as DomainQuickCheckResult,
  type IQuickCheckItem,
  type IQuickCheckRecord
} from '@packages/domain';

// =============================================================================
// QUICKCHECK TYPES & SCHEMAS
// =============================================================================

/**
 * Resultado individual de un item del QuickCheck
 * SSOT: Usa constante desde domain para evitar duplicación
 */
export const QuickCheckItemResultSchema = z.enum(QUICK_CHECK_ITEM_RESULTS) satisfies z.ZodType<DomainQuickCheckItemResult>;

/**
 * Item individual del QuickCheck con su resultado
 * Uses satisfies to ensure compile-time validation against domain IQuickCheckItem
 */
export const QuickCheckItemSchema = z.object({
  name: z.string()
    .min(1, 'El nombre del item es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  result: QuickCheckItemResultSchema
}) satisfies z.ZodType<IQuickCheckItem>;

export type QuickCheckItem = z.infer<typeof QuickCheckItemSchema>;

/**
 * Resultado general del QuickCheck
 * SSOT: Usa constante desde domain para evitar duplicación
 */
export const QuickCheckResultSchema = z.enum(QUICK_CHECK_RESULTS) satisfies z.ZodType<DomainQuickCheckResult>;

/**
 * Registro completo de un QuickCheck ejecutado
 * Este objeto se embede dentro del array quickChecks[] de Machine
 * Uses satisfies to ensure compile-time validation against domain IQuickCheckRecord
 */
export const QuickCheckRecordSchema = z.object({
  result: QuickCheckResultSchema,
  date: z.coerce.date(),
  executedById: z.string()
    .min(1, 'ID del ejecutor es requerido'),
  responsibleName: z.string()
    .min(1, 'El nombre del responsable es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  responsibleWorkerId: z.string()
    .min(1, 'El número de trabajador es requerido')
    .max(50, 'El número de trabajador no puede exceder 50 caracteres')
    .trim(),
  quickCheckItems: z.array(QuickCheckItemSchema)
    .min(1, 'Debe tener al menos un item')
    .max(50, 'Máximo 50 items por QuickCheck'),
  observations: z.string()
    .max(1000, 'Las observaciones no pueden exceder 1000 caracteres')
    .optional()
}) satisfies z.ZodType<IQuickCheckRecord>;

export type QuickCheckRecord = z.infer<typeof QuickCheckRecordSchema>;

/**
 * Schema para crear un nuevo QuickCheck (request desde frontend)
 * Omite date y executedById porque el servidor los genera automáticamente:
 * - date: generado con Date.now()
 * - executedById: extraído del JWT del usuario autenticado
 */
export const CreateQuickCheckRecordSchema = QuickCheckRecordSchema.omit({ 
  date: true, 
  executedById: true 
});
export type CreateQuickCheckRecord = z.infer<typeof CreateQuickCheckRecordSchema>;

/**
 * Schema para filtros de historial de QuickCheck
 */
export const QuickCheckHistoryFiltersSchema = z.object({
  result: QuickCheckResultSchema.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  executedById: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20), // Query param numérico
  skip: z.coerce.number().int().min(0).default(0) // Query param numérico
});

export type QuickCheckHistoryFilters = z.infer<typeof QuickCheckHistoryFiltersSchema>;

// =============================================================================
// REQUEST/RESPONSE SCHEMAS (para API REST)
// =============================================================================

/**
 * Request para agregar QuickCheck a una máquina
 * Combina path param (machineId) con body (record)
 */
export const AddQuickCheckRequestSchema = z.object({
  machineId: z.string().min(1, 'Machine ID is required'),
  record: CreateQuickCheckRecordSchema
});

export type AddQuickCheckRequest = z.infer<typeof AddQuickCheckRequestSchema>;

/**
 * Response exitoso al agregar QuickCheck
 */
export const AddQuickCheckResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    machineId: z.string(),
    quickCheckAdded: QuickCheckRecordSchema,
    totalQuickChecks: z.number()
  })
});

export type AddQuickCheckResponse = z.infer<typeof AddQuickCheckResponseSchema>;

/**
 * Response de historial de QuickChecks
 */
export const GetQuickCheckHistoryResponseSchema = z.object({
  machineId: z.string(),
  quickChecks: z.array(QuickCheckRecordSchema),
  total: z.number(),
  filters: QuickCheckHistoryFiltersSchema.optional()
});

export type GetQuickCheckHistoryResponse = z.infer<typeof GetQuickCheckHistoryResponseSchema>;

// =============================================================================
// TEMPLATE DERIVATION (para inicializar formularios sin duplicación)
// =============================================================================

/**
 * Template item - Item SIN resultado (para inicializar formulario)
 * Derivado del último QuickCheck ejecutado en la máquina
 * 
 * Propósito: Reutilizar estructura de ítems del último QuickCheck sin duplicar
 * almacenamiento. El usuario completará los campos 'result' en el formulario.
 */
export const QuickCheckItemTemplateSchema = z.object({
  name: z.string()
    .min(1, 'El nombre del item es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .refine(
      (value) => value === undefined || value.trim().length > 0,
      'La descripción no puede estar vacía si se proporciona'
    )
  // NOTE: NO incluir 'result' - se seleccionará en el formulario
});

export type QuickCheckItemTemplate = z.infer<typeof QuickCheckItemTemplateSchema>;

/**
 * Response para GET /machines/:machineId/quickcheck/items-template
 * 
 * Estrategia: Derivar template desde último QuickCheck ejecutado
 * - Si existe historial: Retorna items sin resultado (usuario los completa)
 * - Si NO existe: Retorna array vacío (usuario crea items desde cero)
 * 
 * Ventajas vs catálogo separado:
 * - Zero duplicación de almacenamiento
 * - Self-documenting: Último QuickCheck refleja ítems actuales
 * - Evolutivo: Si checklist cambia, se adapta automáticamente
 */
export const GetQuickCheckItemsTemplateResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    items: z.array(QuickCheckItemTemplateSchema),
    sourceQuickCheckDate: z.coerce.date().optional(), // Para debugging/auditoría
    hasTemplate: z.boolean() // true si derivado de QC previo, false si array vacío
  })
});

export type GetQuickCheckItemsTemplateResponse = z.infer<typeof GetQuickCheckItemsTemplateResponseSchema>;

// =============================================================================
// ESTADÍSTICAS Y MÉTRICAS (para dashboard - POST-MVP)
// =============================================================================

/**
 * TODO POST-MVP: Response con estadísticas de QuickCheck por máquina
 * Útil para dashboard de calidad y alertas tempranas
 */
// export const QuickCheckStatsSchema = z.object({
//   machineId: z.string(),
//   totalQuickChecks: z.number(),
//   approvedCount: z.number(),
//   disapprovedCount: z.number(),
//   approvalRate: z.number().min(0).max(100), // Porcentaje 0-100
//   lastQuickCheck: QuickCheckRecordSchema.optional(),
//   daysSinceLastInspection: z.number().optional()
// });
//
// export type QuickCheckStats = z.infer<typeof QuickCheckStatsSchema>;
