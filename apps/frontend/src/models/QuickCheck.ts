/**
 * QuickCheck UI-only types and interfaces
 * 
 * PRINCIPIO: Separation of Concerns
 * - Domain layer: Business logic, validations, domain rules (@domain)
 * - UI layer: Presentation logic, temporary state, UI-specific helpers (this file)
 * 
 * SSOT (Single Source of Truth):
 * - QuickCheckItemResult, QuickCheckResult: Imported from domain
 * - Constants: QUICK_CHECK_ITEM_RESULTS, QUICK_CHECK_RESULTS from domain
 * - API contracts: CreateQuickCheckRecord from @contracts
 */

import { 
  QuickCheckItemResult,
  QuickCheckResult,
  QUICK_CHECK_ITEM_RESULTS,
  QUICK_CHECK_RESULTS
} from '@domain';

// Re-export domain types for convenience
export type { QuickCheckItemResult, QuickCheckResult };
export { QUICK_CHECK_ITEM_RESULTS, QUICK_CHECK_RESULTS };

// =============================================================================
// UI-ONLY TYPES (No existen en domain porque son específicos de presentación)
// =============================================================================

/**
 * QuickCheck Item for UI (temporal con ID local)
 * El ID es solo para React keys y tracking en UI antes de submit.
 * Al enviar al backend, se transforma a IQuickCheckItem (sin id).
 */
export interface QuickCheckItemUI {
  id: string; // Temporal ID para UI (generado localmente)
  name: string;
  description?: string;
}

/**
 * Input para crear/editar items en modal
 * UI-only: usado en formularios antes de agregar al state
 */
export interface QuickCheckItemInput {
  name: string;
  description?: string;
}

/**
 * State machine modes para el flujo de QuickCheck
 * UI-only: controla qué vista mostrar (edición/ejecución/completado)
 */
export type QuickCheckMode = 'EDITING' | 'EXECUTING' | 'COMPLETED';

/**
 * Tracking de evaluaciones por item (antes de submit)
 * UI-only: mapea itemId temporal → resultado evaluado
 * null = pendiente de evaluar
 */
export interface QuickCheckEvaluations {
  [itemId: string]: QuickCheckItemResult | null;
}

/**
 * Estadísticas calculadas para mostrar en UI
 * UI-only: útil para progress indicators y summary cards
 */
export interface EvaluationStats {
  total: number;
  aprobados: number;
  desaprobados: number;
  omitidos: number;
  pendientes: number;
}
