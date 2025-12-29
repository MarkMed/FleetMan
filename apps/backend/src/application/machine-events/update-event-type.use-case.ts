import { MachineEventType } from '@packages/domain';
import { MachineEventTypeRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';

/**
 * Use Case: Actualizar tipo de evento de máquina
 * 
 * Responsabilidades:
 * 1. Activar/Desactivar tipos de evento (soft delete)
 * 2. Agregar idiomas a tipos existentes
 * 3. Remover idiomas de tipos existentes
 * 
 * Validaciones:
 * - NO se puede desactivar tipos system-generated (business rule)
 * - NO se puede remover el único idioma de un tipo (debe tener al menos 1)
 * - Idiomas deben ser ISO 639-1 válidos (2 letras)
 * 
 * Patrón: Load → Modify → Save
 * - Carga entidad desde repositorio
 * - Aplica modificaciones usando métodos de dominio
 * - Persiste cambios en repositorio
 */
export class UpdateEventTypeUseCase {
  private eventTypeRepository: MachineEventTypeRepository;

  constructor() {
    this.eventTypeRepository = new MachineEventTypeRepository();
  }

  /**
   * Ejecuta la actualización de un tipo de evento
   * 
   * @param eventTypeId - ID del tipo de evento
   * @param updates - Objeto con las propiedades a actualizar
   * @returns Promise con el tipo de evento actualizado
   * @throws Error si validación falla o tipo no existe
   */
  async execute(
    eventTypeId: string,
    updates: {
      isActive?: boolean;
      languagesToAdd?: string[];
      languagesToRemove?: string[];
    }
  ): Promise<MachineEventType> {
    logger.info({ 
      eventTypeId, 
      updates 
    }, 'Updating machine event type');

    try {
      // 1. Cargar tipo de evento desde repositorio
      const eventTypeResult = await this.eventTypeRepository.findById(eventTypeId);

      if (!eventTypeResult.success) {
        throw new Error(`Event type not found: ${eventTypeId}`);
      }

      const eventType = eventTypeResult.data;

      // 2. Aplicar cambio de estado (activar/desactivar)
      if (updates.isActive !== undefined) {
        if (updates.isActive === false) {
          // Desactivar
          const deactivateResult = eventType.deactivate();
          if (!deactivateResult.success) {
            throw new Error(deactivateResult.error.message);
          }
          logger.info({ eventTypeId }, '🔴 Event type deactivated');
        } else {
          // Reactivar
          eventType.reactivate();
          logger.info({ eventTypeId }, '🟢 Event type reactivated');
        }
      }

      // 3. Agregar idiomas
      if (updates.languagesToAdd && updates.languagesToAdd.length > 0) {
        for (const language of updates.languagesToAdd) {
          const addResult = eventType.addLanguage(language);
          if (!addResult.success) {
            throw new Error(`Failed to add language ${language}: ${addResult.error.message}`);
          }
        }
        logger.info({ 
          eventTypeId, 
          languages: updates.languagesToAdd 
        }, '🌐 Languages added to event type');
      }

      // 4. Remover idiomas
      if (updates.languagesToRemove && updates.languagesToRemove.length > 0) {
        for (const language of updates.languagesToRemove) {
          const removeResult = eventType.removeLanguage(language);
          if (!removeResult.success) {
            throw new Error(`Failed to remove language ${language}: ${removeResult.error.message}`);
          }
        }
        logger.info({ 
          eventTypeId, 
          languages: updates.languagesToRemove 
        }, '🗑️ Languages removed from event type');
      }

      // 5. Persistir cambios usando método update del repositorio
      const updateResult = await this.eventTypeRepository.update(eventType);

      if (!updateResult.success) {
        throw new Error(`Failed to persist event type updates: ${updateResult.error.message}`);
      }

      logger.info({ eventTypeId }, '✅ Event type updated successfully');

      return eventType;

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        eventTypeId,
        updates
      }, 'Event type update failed');
      
      throw error;
    }
  }

  // ============================================================================
  // MÉTODOS ESTRATÉGICOS FUTUROS (Comentados)
  // ============================================================================

  /**
   * TODO: Fusionar tipos de eventos duplicados
   * 
   * @param sourceTypeId - ID del tipo a eliminar
   * @param targetTypeId - ID del tipo destino
   * @param adminUserId - ID del admin ejecutando merge
   * @returns Promise<void>
   * 
   * Propósito:
   * - Admin detecta duplicados ("Mantenimiento" vs "mantenimiento ")
   * - Actualizar todos los eventos que usan sourceType → targetType
   * - Sumar timesUsed del source al target
   * - Fusionar languages (union de ambos arrays)
   * - Desactivar sourceType (soft delete)
   * 
   * Validaciones:
   * - Solo admin puede ejecutar
   * - Ambos tipos deben existir
   * - NO se puede merge si source es system-generated
   * - Confirmación requerida si source tiene >50 eventos
   * 
   * Declaración:
   * async mergeEventTypes(sourceTypeId: string, targetTypeId: string, adminUserId: string): Promise<void>
   */

  /**
   * TODO: Renombrar tipo de evento (con migración de normalizedName)
   * 
   * @param eventTypeId - ID del tipo a renombrar
   * @param newName - Nuevo nombre
   * @param adminUserId - ID del admin ejecutando rename
   * @returns Promise<MachineEventType>
   * 
   * Propósito:
   * - Corregir typos en nombres de tipos
   * - Actualizar normalizedName automáticamente
   * - Mantener historial de nombres antiguos (metadata)
   * 
   * Validaciones:
   * - Solo admin puede ejecutar
   * - NO se puede renombrar system-generated (son i18n keys)
   * - Verificar que nuevo nombre no cause duplicados
   * - Mantener al menos 1 idioma después del rename
   * 
   * Declaración:
   * async renameEventType(eventTypeId: string, newName: string, adminUserId: string): Promise<MachineEventType>
   */

  /**
   * TODO: Bulk update de múltiples tipos
   * 
   * @param updates - Array de updates a aplicar
   * @param adminUserId - ID del admin ejecutando bulk update
   * @returns Promise<{ success: number, failed: number }>
   * 
   * Propósito:
   * - Activar/desactivar múltiples tipos de una vez
   * - Agregar idioma a múltiples tipos (ej: agregar 'en' a todos los tipos en español)
   * - Operaciones masivas de mantenimiento
   * 
   * Validaciones:
   * - Solo admin puede ejecutar
   * - Máximo 100 tipos por batch (performance)
   * - Continuar en caso de error individual (no atomicidad)
   * 
   * Declaración:
   * async bulkUpdate(updates: Array<{ id: string, updates: UpdateParams }>, adminUserId: string): Promise<{ success: number, failed: number }>
   */
}
