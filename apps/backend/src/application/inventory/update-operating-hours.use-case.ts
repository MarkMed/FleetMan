import { MachineId } from '@packages/domain';
import { MachineRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';

/**
 * Interfaz de solicitud para actualizar horas de operación
 */
interface UpdateOperatingHoursRequest {
  machineId: string;
  hoursToAdd: number;
}

/**
 * Use Case para actualizar horas de operación de una máquina
 * 
 * PRINCIPIO DE EXPERTO:
 * - Use Case = Experto en lógica de negocio (cálculo de nuevas horas, validaciones)
 * - Repository = Experto en persistencia (update directo en DB)
 * 
 * Casos de uso:
 * 1. Cronjob diario: Incrementa horas basado en usageSchedule.dailyHours
 * 2. Ajuste manual: Corrección de horas por mantenimiento o error
 */
export class UpdateOperatingHoursUseCase {
  private machineRepository: MachineRepository;

  constructor() {
    this.machineRepository = new MachineRepository();
  }

  /**
   * Ejecuta el caso de uso de actualizar horas de operación
   * 
   * @param request - Datos de la solicitud (machineId, hoursToAdd)
   * @returns Promise con las nuevas horas totales
   */
  async execute(request: UpdateOperatingHoursRequest): Promise<number> {
    const { machineId, hoursToAdd } = request;

    logger.info({ machineId, hoursToAdd }, 'Starting operating hours update');

    try {
      // Validación de negocio (Use Case responsabilidad)
      if (hoursToAdd <= 0) {
        throw new Error('Hours to add must be positive');
      }

      // Crear value object de ID
      const idResult = MachineId.create(machineId);
      if (!idResult.success) {
        throw new Error('Invalid machine ID format');
      }

      // Obtener máquina actual (solo para leer operatingHours)
      const machineResult = await this.machineRepository.findById(idResult.data);
      if (!machineResult.success) {
        throw new Error(machineResult.error.message);
      }

      const machine = machineResult.data;

      // Calcular nuevas horas (lógica de negocio)
      // Usar nullish coalescing (??) para distinguir 0 de undefined
      const currentHours = machine.specs?.operatingHours ?? 0;
      const newTotalHours = currentHours + hoursToAdd;

      logger.info(
        { 
          machineId, 
          currentHours, 
          hoursToAdd, 
          newTotalHours 
        }, 
        'Calculated new operating hours'
      );

      // Delegar update al repo (sin lógica, solo persistencia)
      // Usar dot notation para actualizar SOLO operatingHours sin borrar otros campos de specs
      const updateResult = await this.machineRepository.update(
        idResult.data,
        {
          'specs.operatingHours': newTotalHours
        }
      );

      if (!updateResult.success) {
        throw new Error(updateResult.error.message);
      }

      // Obtener el valor actualizado de la máquina retornada
      const updatedMachine = updateResult.data;
      const finalHours = updatedMachine.specs?.operatingHours || newTotalHours;

      logger.info({ machineId, finalHours }, '✅ Operating hours updated successfully');
      return finalHours;

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        machineId 
      }, 'Operating hours update failed');
      
      throw error;
    }
  }
}

// TODO POST-MVP: BatchUpdateOperatingHoursUseCase para cronjob optimizado
// Razón: Procesar múltiples máquinas en una sola operación batch
// Declaración:
// export class BatchUpdateOperatingHoursUseCase {
//   async execute(updates: Array<{ machineId: string; hoursToAdd: number }>): Promise<{ updated: number; failed: number }> {
//     // Iterar sobre cada máquina y llamar a UpdateOperatingHoursUseCase
//     // O implementar bulkWrite directo en Repository para mejor performance
//   }
// }
