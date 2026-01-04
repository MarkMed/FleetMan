import { MachineRepository } from '@packages/persistence';
import { MachineId, DomainError, Result, ok, err } from '@packages/domain';
import type { IMaintenanceAlarm } from '@packages/domain';
import { logger } from '../../config/logger.config';

/**
 * Use Case: Actualizar alarma de mantenimiento
 * 
 * Responsabilidades:
 * 1. Validar que la máquina y alarma existen
 * 2. Actualizar campos permitidos
 * 3. Retornar alarma actualizada
 * 
 * Campos actualizables:
 * - title
 * - description
 * - relatedParts
 * - intervalHours (cuidado: puede afectar cálculo de trigger)
 * - isActive
 * 
 * Campos NO actualizables (gestionados por sistema):
 * - accumulatedHours (solo via cronjob o reset manual)
 * - timesTriggered
 * - lastTriggeredAt
 * - lastTriggeredHours
 * 
 * Sprint #11: Maintenance Alarms - CRUD Operations
 */
export class UpdateMaintenanceAlarmUseCase {
  private machineRepository: MachineRepository;

  constructor() {
    this.machineRepository = new MachineRepository();
  }

  async execute(params: {
    machineId: string;
    alarmId: string;
    title?: string;
    description?: string;
    relatedParts?: string[];
    intervalHours?: number;
    isActive?: boolean;
  }): Promise<Result<IMaintenanceAlarm, DomainError>> {
    try {
      logger.info({ 
        machineId: params.machineId, 
        alarmId: params.alarmId 
      }, 'Updating maintenance alarm');

      // Validar ID de máquina
      const machineIdResult = MachineId.create(params.machineId);
      if (!machineIdResult.success) {
        return err(machineIdResult.error);
      }

      // Construir update payload (solo campos especificados)
      const updates: {
        title?: string;
        description?: string;
        relatedParts?: string[];
        intervalHours?: number;
        isActive?: boolean;
      } = {};
      if (params.title !== undefined) updates.title = params.title;
      if (params.description !== undefined) updates.description = params.description;
      if (params.relatedParts !== undefined) updates.relatedParts = params.relatedParts;
      if (params.intervalHours !== undefined) updates.intervalHours = params.intervalHours;
      if (params.isActive !== undefined) updates.isActive = params.isActive;

      // Actualizar alarma
      const result = await this.machineRepository.updateMaintenanceAlarm(
        machineIdResult.data,
        params.alarmId,
        updates
      );

      if (!result.success) {
        logger.error({ 
          machineId: params.machineId, 
          alarmId: params.alarmId,
          error: result.error.message 
        }, 'Failed to update maintenance alarm');
        return err(result.error);
      }

      logger.info({ 
        machineId: params.machineId, 
        alarmId: params.alarmId 
      }, 'Maintenance alarm updated successfully');

      return ok(result.data);

    } catch (error) {
      logger.error({ 
        machineId: params.machineId, 
        alarmId: params.alarmId,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 'Error updating maintenance alarm');
      return err(DomainError.create('INTERNAL_ERROR', 'Failed to update maintenance alarm'));
    }
  }
}
