import { MachineRepository } from '@packages/persistence';
import { MachineId, DomainError, Result, ok, err } from '@packages/domain';
import { logger } from '../../config/logger.config';

/**
 * Use Case: Eliminar alarma de mantenimiento
 * 
 * Responsabilidades:
 * 1. Validar que la máquina y alarma existen
 * 2. Eliminar alarma del array maintenanceAlarms
 * 3. Confirmar eliminación
 * 
 * Consideraciones:
 * - Eliminación física (no soft delete por ahora)
 * - Histórico de eventos de la alarma NO se elimina
 * - Solo owner o admin pueden eliminar
 * 
 * Sprint #11: Maintenance Alarms - CRUD Operations
 */
export class DeleteMaintenanceAlarmUseCase {
  private machineRepository: MachineRepository;

  constructor() {
    this.machineRepository = new MachineRepository();
  }

  async execute(params: {
    machineId: string;
    alarmId: string;
  }): Promise<Result<void, DomainError>> {
    try {
      logger.info({ 
        machineId: params.machineId, 
        alarmId: params.alarmId 
      }, 'Deleting maintenance alarm');

      // Validar ID de máquina
      const machineIdResult = MachineId.create(params.machineId);
      if (!machineIdResult.success) {
        return err(machineIdResult.error);
      }

      // Eliminar alarma
      const result = await this.machineRepository.deleteMaintenanceAlarm(
        machineIdResult.data,
        params.alarmId
      );

      if (!result.success) {
        logger.error({ 
          machineId: params.machineId, 
          alarmId: params.alarmId,
          error: result.error.message 
        }, 'Failed to delete maintenance alarm');
        return err(result.error);
      }

      logger.info({ 
        machineId: params.machineId, 
        alarmId: params.alarmId 
      }, 'Maintenance alarm deleted successfully');

      return ok(undefined);

    } catch (error) {
      logger.error({ 
        machineId: params.machineId, 
        alarmId: params.alarmId,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 'Error deleting maintenance alarm');
      return err(DomainError.create('INTERNAL_ERROR', 'Failed to delete maintenance alarm'));
    }
  }
}
