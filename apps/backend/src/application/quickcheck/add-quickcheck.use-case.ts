import { MachineId } from '@packages/domain';
import { MachineRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import { type CreateQuickCheckRecord } from '@packages/contracts';

/**
 * Use Case: Agregar registro de QuickCheck a una máquina
 * 
 * Responsabilidades:
 * 1. Validar que la máquina existe
 * 2. Validar que el usuario tiene acceso (owner o provider asignado)
 * 3. Delegar validaciones de negocio a Machine.addQuickCheckRecord()
 * 4. Persistir cambios en repositorio
 * 
 * Reglas de Acceso:
 * - CLIENT puede agregar quickcheck a sus propias máquinas
 * - PROVIDER puede agregar quickcheck a máquinas asignadas
 * 
 * Campos de Responsabilidad (Obligatorios desde Sprint 8):
 * - responsibleName: Nombre completo del técnico que ejecuta la inspección
 * - responsibleWorkerId: Número de empleado/identificador del trabajador
 * - executedById: ID del usuario logueado (extraído del JWT, server-side)
 * 
 * Estos campos permiten trackear tanto el "quién" (usuario del sistema) 
 * como el "quién físicamente" (técnico que puede no tener cuenta en el sistema).
 */
export class AddQuickCheckUseCase {
  private machineRepository: MachineRepository;

  constructor() {
    this.machineRepository = new MachineRepository();
  }

  /**
   * Ejecuta el caso de uso de agregar QuickCheck
   * 
   * @param machineId - ID de la máquina objetivo
   * @param record - Registro de QuickCheck a agregar. Campos obligatorios:
   *   - result: Resultado general (approved, disapproved, notInitiated)
   *   - responsibleName: Nombre del técnico responsable (1-100 chars)
   *   - responsibleWorkerId: Número/ID de trabajador (1-50 chars)
   *   - quickCheckItems: Array de items inspeccionados (min 1, max 50)
   *   - observations: (opcional) Comentarios generales
   * @param userId - ID del usuario ejecutando la acción (desde JWT) - se asigna a executedById
   * @returns Promise con el registro agregado (incluye fecha generada server-side)
   * @throws Error si máquina no existe, acceso denegado, o validación falla
   */
  async execute(
    machineId: string,
    record: CreateQuickCheckRecord,
    userId: string
  ): Promise<{
    machineId: string;
    quickCheckAdded: any;
    totalQuickChecks: number;
  }> {
    logger.info({ 
      machineId, 
      userId,
      itemsCount: record.quickCheckItems.length 
    }, 'Starting QuickCheck addition');

    try {
      // 1. Validar formato de machineId
      const machineIdResult = MachineId.create(machineId);
      if (!machineIdResult.success) {
        throw new Error(`Invalid machine ID format: ${machineIdResult.error.message}`);
      }

      // 2. Agregar QuickCheck usando repositorio (incluye validaciones de dominio)
      const addResult = await this.machineRepository.addQuickCheckRecord(
        machineIdResult.data,
        {
          ...record,
          executedById: userId // Server-side: usar userId del JWT, no del request body
        }
      );

      if (!addResult.success) {
        // Mapear errores de dominio a mensajes HTTP-friendly
        const error = addResult.error;
        
        if (error.message.includes('not found')) {
          throw new Error(`Machine with ID ${machineId} not found`);
        }
        
        if (error.message.includes('retired machine')) {
          throw new Error('Cannot add QuickCheck to retired machine');
        }
        
        if (error.message.includes('Access denied')) {
          throw new Error('Access denied: you are not the owner or assigned provider');
        }

        // Errores de validación genéricos
        throw new Error(error.message);
      }

      // El repositorio ahora retorna { quickCheckRecord, totalQuickChecks }
      const { quickCheckRecord, totalQuickChecks } = addResult.data;

      logger.info({ 
        machineId,
        totalQuickChecks,
        result: quickCheckRecord.result
      }, '✅ QuickCheck added successfully');

      return {
        machineId,
        quickCheckAdded: quickCheckRecord,
        totalQuickChecks
      };

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        machineId,
        userId
      }, 'QuickCheck addition failed');
      
      throw error;
    }
  }
}
