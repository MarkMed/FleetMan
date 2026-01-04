import { MachineRepository } from '@packages/persistence';
import { MachineId, DomainError, Result, ok, err } from '@packages/domain';
import type { IMaintenanceAlarm } from '@packages/domain';
import { logger } from '../../config/logger.config';

/**
 * Use Case: Listar alarmas de mantenimiento de una máquina
 * 
 * Responsabilidades:
 * 1. Validar que la máquina existe
 * 2. Obtener máquina con sus alarmas
 * 3. Retornar lista de alarmas (activas e inactivas)
 * 
 * Filtros opcionales:
 * - isActive: Filtrar solo alarmas activas/inactivas
 * - sortBy: Ordenar por campo (accumulatedHours, intervalHours, timesTriggered)
 * 
 * Sprint #11: Maintenance Alarms - CRUD Operations
 */
export class ListMaintenanceAlarmsUseCase {
  private machineRepository: MachineRepository;

  constructor() {
    this.machineRepository = new MachineRepository();
  }

  async execute(params: {
    machineId: string;
    isActive?: boolean;
  }): Promise<Result<IMaintenanceAlarm[], DomainError>> {
    try {
      logger.debug({ machineId: params.machineId }, 'Listing maintenance alarms');

      // Validar ID de máquina
      const machineIdResult = MachineId.create(params.machineId);
      if (!machineIdResult.success) {
        return err(machineIdResult.error);
      }

      // Obtener máquina
      const machineResult = await this.machineRepository.findById(machineIdResult.data);
      if (!machineResult.success) {
        return err(machineResult.error);
      }

      const machine = machineResult.data.toPublicInterface();
      let alarms = machine.maintenanceAlarms || [];

      // Filtrar por isActive si se especifica
      if (params.isActive !== undefined) {
        alarms = alarms.filter(alarm => alarm.isActive === params.isActive);
      }

      logger.debug({ 
        machineId: params.machineId, 
        totalAlarms: alarms.length 
      }, 'Maintenance alarms listed successfully');

      return ok(alarms as IMaintenanceAlarm[]);

    } catch (error) {
      logger.error({ 
        machineId: params.machineId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 'Error listing maintenance alarms');
      return err(DomainError.create('INTERNAL_ERROR', 'Failed to list maintenance alarms'));
    }
  }
}
