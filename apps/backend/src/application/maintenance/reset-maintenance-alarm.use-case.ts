import { MachineRepository } from '@packages/persistence';
import { MachineId, DomainError, Result, ok, err } from '@packages/domain';
import type { IMaintenanceAlarm } from '@packages/domain';
import { logger } from '../../config/logger.config';

/**
 * Use Case: Reiniciar acumulador de horas de una alarma manualmente
 * 
 * Responsabilidades:
 * 1. Validar que la máquina y alarma existen
 * 2. Resetear accumulatedHours a 0
 * 3. Actualizar lastTriggeredAt (opcional)
 * 4. Retornar alarma actualizada
 * 
 * Casos de uso:
 * - Usuario completó mantenimiento físico → resetear contador
 * - Corrección manual por error de datos
 * - Reinicio después de cambio de componente
 * 
 * Diferencia con trigger automático:
 * - NO incrementa timesTriggered (no fue trigger automático)
 * - NO crea evento ni notificación
 * - Permite especificar nuevas horas base (optional)
 * 
 * Sprint #11: Maintenance Alarms - CRUD Operations
 */
export class ResetMaintenanceAlarmUseCase {
  private machineRepository: MachineRepository;

  constructor() {
    this.machineRepository = new MachineRepository();
  }

  async execute(params: {
    machineId: string;
    alarmId: string;
    resetToZero?: boolean; // Default true
  }): Promise<Result<IMaintenanceAlarm, DomainError>> {
    try {
      logger.info({ 
        machineId: params.machineId, 
        alarmId: params.alarmId 
      }, 'Resetting maintenance alarm accumulator');

      // Validar ID de máquina
      const machineIdResult = MachineId.create(params.machineId);
      if (!machineIdResult.success) {
        return err(machineIdResult.error);
      }

      // Resetear acumulador (sin incrementar timesTriggered)
      const result = await this.machineRepository.updateMaintenanceAlarm(
        machineIdResult.data,
        params.alarmId,
        {
          accumulatedHours: 0
        }
      );

      if (!result.success) {
        logger.error({ 
          machineId: params.machineId, 
          alarmId: params.alarmId,
          error: result.error.message 
        }, 'Failed to reset maintenance alarm');
        return err(result.error);
      }

      logger.info({ 
        machineId: params.machineId, 
        alarmId: params.alarmId 
      }, 'Maintenance alarm reset successfully');

      return ok(result.data);

    } catch (error) {
      logger.error({ 
        machineId: params.machineId, 
        alarmId: params.alarmId,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 'Error resetting maintenance alarm');
      return err(DomainError.create('INTERNAL_ERROR', 'Failed to reset maintenance alarm'));
    }
  }
}
