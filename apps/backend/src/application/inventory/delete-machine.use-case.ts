import { MachineId } from '@packages/domain';
import { MachineRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';

/**
 * Use Case para eliminar una máquina
 */
export class DeleteMachineUseCase {
  private machineRepository: MachineRepository;

  constructor() {
    this.machineRepository = new MachineRepository();
  }

  /**
   * Ejecuta el caso de uso de eliminar máquina
   * @param machineId - ID de la máquina a eliminar
   * @param requestingUserId - ID del usuario que solicita
   * @param userType - Tipo de usuario
   */
  async execute(
    machineId: string,
    requestingUserId: string,
    userType: string
  ): Promise<void> {
    logger.info({ machineId, requestingUserId }, 'Starting machine deletion');

    try {
      // Crear value object de ID
      const idResult = MachineId.create(machineId);
      if (!idResult.success) {
        throw new Error('Invalid machine ID format');
      }

      // Buscar máquina para verificar ownership
      const machineResult = await this.machineRepository.findById(idResult.data);
      if (!machineResult.success) {
        throw new Error(machineResult.error.message);
      }

      const machine = machineResult.data;

      // Verificar ownership (solo owner puede eliminar)
      if (userType === 'CLIENT' && machine.ownerId.getValue() !== requestingUserId) {
        throw new Error('Access denied - only the owner can delete this machine');
      }

      // TODO: Validar que no tenga mantenimientos o eventos pendientes críticos
      // const hasActiveEvents = await this.machineEventRepository.hasActiveEvents(idResult.data);
      // if (hasActiveEvents) {
      //   throw new Error('Cannot delete machine with active events or maintenance');
      // }

      // Eliminar la máquina
      const deleteResult = await this.machineRepository.delete(idResult.data);
      if (!deleteResult.success) {
        throw new Error(deleteResult.error.message);
      }

      logger.info({ machineId }, '✅ Machine deleted successfully');

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        machineId 
      }, 'Machine deletion failed');
      
      throw error;
    }
  }
}
