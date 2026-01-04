import { MachineRepository } from '@packages/persistence';
import { MachineId, DomainError, Result, ok, err } from '@packages/domain';
import type { IMaintenanceAlarm } from '@packages/domain';
import { logger } from '../../config/logger.config';

/**
 * Use Case: Crear alarma de mantenimiento en una máquina
 * 
 * Responsabilidades:
 * 1. Validar que la máquina existe
 * 2. Crear nueva alarma con accumulatedHours = 0
 * 3. Agregar alarma al array maintenanceAlarms
 * 4. Retornar alarma creada
 * 
 * Validaciones:
 * - Máquina debe existir
 * - Usuario debe ser owner o admin (validado en controller)
 * - intervalHours debe ser > 0
 * 
 * Sprint #11: Maintenance Alarms - CRUD Operations
 */
export class CreateMaintenanceAlarmUseCase {
  private machineRepository: MachineRepository;

  constructor() {
    this.machineRepository = new MachineRepository();
  }

  async execute(params: {
    machineId: string;
    title: string;
    description?: string;
    relatedParts: string[];
    intervalHours: number;
    createdBy: string;
  }): Promise<Result<IMaintenanceAlarm, DomainError>> {
    try {
      logger.info({ machineId: params.machineId, title: params.title }, 'Creating maintenance alarm');

      // Validar ID de máquina
      const machineIdResult = MachineId.create(params.machineId);
      if (!machineIdResult.success) {
        return err(machineIdResult.error);
      }

      // Crear alarma en repository
      const result = await this.machineRepository.addMaintenanceAlarm(
        machineIdResult.data,
        {
          title: params.title,
          description: params.description,
          relatedParts: params.relatedParts,
          intervalHours: params.intervalHours,
          accumulatedHours: 0, // Inicia en 0
          createdBy: params.createdBy
        }
      );

      if (!result.success) {
        logger.error({ 
          machineId: params.machineId, 
          error: result.error.message 
        }, 'Failed to create maintenance alarm');
        return err(result.error);
      }

      logger.info({ 
        machineId: params.machineId, 
        alarmId: result.data.id 
      }, 'Maintenance alarm created successfully');

      return ok(result.data);

    } catch (error) {
      logger.error({ 
        machineId: params.machineId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 'Error creating maintenance alarm');
      return err(DomainError.create('INTERNAL_ERROR', 'Failed to create maintenance alarm'));
    }
  }
}
