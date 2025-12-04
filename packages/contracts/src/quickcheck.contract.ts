import { z } from 'zod';

// =============================================================================
// QUICKCHECK TYPES & SCHEMAS
// =============================================================================

/**
 * Resultado individual de un item del QuickCheck
 */
export const QuickCheckItemResultSchema = z.enum(['approved', 'disapproved', 'omitted']);
export type QuickCheckItemResult = z.infer<typeof QuickCheckItemResultSchema>;

/**
 * Item individual del QuickCheck con su resultado
 */
export const QuickCheckItemSchema = z.object({
  name: z.string()
    .min(1, 'El nombre del item es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  result: QuickCheckItemResultSchema
});

export type QuickCheckItem = z.infer<typeof QuickCheckItemSchema>;

/**
 * Resultado general del QuickCheck
 */
export const QuickCheckResultSchema = z.enum(['approved', 'disapproved', 'notInitiated']);
export type QuickCheckResult = z.infer<typeof QuickCheckResultSchema>;

/**
 * Registro completo de un QuickCheck ejecutado
 * Este objeto se embede dentro del array quickChecks[] de Machine
 */
export const QuickCheckRecordSchema = z.object({
  result: QuickCheckResultSchema,
  date: z.coerce.date(),
  executedById: z.string()
    .min(1, 'ID del ejecutor es requerido'),
  quickCheckItems: z.array(QuickCheckItemSchema)
    .min(1, 'Debe tener al menos un item')
    .max(50, 'Máximo 50 items por QuickCheck'),
  observations: z.string()
    .max(1000, 'Las observaciones no pueden exceder 1000 caracteres')
    .optional()
});

export type QuickCheckRecord = z.infer<typeof QuickCheckRecordSchema>;

/**
 * Schema para crear un nuevo QuickCheck (request desde frontend)
 */
export const CreateQuickCheckRecordSchema = QuickCheckRecordSchema.omit({ date: true });
export type CreateQuickCheckRecord = z.infer<typeof CreateQuickCheckRecordSchema>;

/**
 * Schema para filtros de historial de QuickCheck
 */
export const QuickCheckHistoryFiltersSchema = z.object({
  result: QuickCheckResultSchema.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  executedById: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  skip: z.number().int().min(0).default(0)
});

export type QuickCheckHistoryFilters = z.infer<typeof QuickCheckHistoryFiltersSchema>;
