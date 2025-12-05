import { MachineId } from '@packages/domain';
import { MachineRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import { type QuickCheckHistoryFilters } from '@packages/contracts';

/**
 * Use Case: Obtener historial de QuickChecks de una máquina
 * 
 * Responsabilidades:
 * 1. Validar que la máquina existe
 * 2. Validar que el usuario tiene acceso (owner o provider asignado)
 * 3. Obtener historial filtrado y paginado desde repositorio
 * 4. Retornar resultados con metadata
 * 
 * Reglas de Acceso:
 * - CLIENT puede ver quickchecks de sus propias máquinas
 * - PROVIDER puede ver quickchecks de máquinas asignadas
 */
export class GetQuickCheckHistoryUseCase {
  private machineRepository: MachineRepository;

  constructor() {
    this.machineRepository = new MachineRepository();
  }

  /**
   * Ejecuta el caso de uso de obtener historial de QuickCheck
   * 
   * @param machineId - ID de la máquina
   * @param userId - ID del usuario solicitante (desde JWT)
   * @param filters - Filtros opcionales (result, dateFrom, dateTo, executedById, limit, skip)
   * @returns Promise con historial de QuickChecks
   * @throws Error si máquina no existe o acceso denegado
   */
  async execute(
    machineId: string,
    userId: string,
    filters?: QuickCheckHistoryFilters
  ): Promise<{
    machineId: string;
    quickChecks: any[];
    total: number;
    filters?: QuickCheckHistoryFilters;
  }> {
    logger.info({ 
      machineId, 
      userId,
      filters 
    }, 'Fetching QuickCheck history');

    try {
      // 1. Validar formato de machineId
      const machineIdResult = MachineId.create(machineId);
      if (!machineIdResult.success) {
        throw new Error(`Invalid machine ID format: ${machineIdResult.error.message}`);
      }

      // 2. Validar que la máquina existe y que el usuario tiene acceso
      const machineResult = await this.machineRepository.findById(machineIdResult.data);
      if (!machineResult.success) {
        throw new Error(`Machine with ID ${machineId} not found`);
      }

      const machine = machineResult.data;

      // 3. Validar acceso del usuario
      const isOwner = machine.ownerId.getValue() === userId;
      const isAssignedProvider = machine.assignedProviderId?.getValue() === userId;

      if (!isOwner && !isAssignedProvider) {
        throw new Error('Access denied: you are not the owner or assigned provider');
      }

      // 4. Obtener historial filtrado desde repositorio
      const historyResult = await this.machineRepository.getQuickCheckHistory(
        machineIdResult.data,
        filters
      );

      if (!historyResult.success) {
        throw new Error(`Failed to retrieve QuickCheck history: ${historyResult.error.message}`);
      }

      const quickChecks = historyResult.data;

      // 5. Obtener total de quickchecks (sin filtros) para metadata
      // Esto es útil para paginación en frontend
      const allQuickChecks = machine.toPublicInterface().quickChecks || [];
      const total = allQuickChecks.length;

      logger.info({ 
        machineId,
        retrieved: quickChecks.length,
        total
      }, '✅ QuickCheck history retrieved');

      return {
        machineId,
        quickChecks,
        total,
        filters
      };

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        machineId,
        userId
      }, 'Failed to retrieve QuickCheck history');
      
      throw error;
    }
  }
}
