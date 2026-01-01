import { MachineId, IMachine } from '@packages/domain';
import { MachineRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';

/**
 * Use Case para obtener una máquina por ID
 */
export class GetMachineUseCase {
  private machineRepository: MachineRepository;

  constructor() {
    this.machineRepository = new MachineRepository();
  }

  /**
   * Ejecuta el caso de uso de obtener máquina
   * @param machineId - ID de la máquina
   * @param requestingUserId - ID del usuario que solicita (para verificar ownership)
   * @param userType - Tipo de usuario (CLIENT, PROVIDER)
   * @returns Promise<IMachine> - Interface ligera de la máquina
   */
  async execute(
    machineId: string, 
    requestingUserId: string,
    userType: string
  ): Promise<IMachine> {
    logger.info({ machineId, requestingUserId }, 'Getting machine by ID');

    try {
      // Crear value object de ID
      const idResult = MachineId.create(machineId);
      if (!idResult.success) {
        throw new Error('Invalid machine ID format');
      }

      // Buscar máquina
      const machineResult = await this.machineRepository.findById(idResult.data);
      if (!machineResult.success) {
        throw new Error(machineResult.error.message);
      }

      const machine = machineResult.data;

      // Verificar ownership (solo si no es PROVIDER)
      if (userType === 'CLIENT') {
        if (machine.ownerId.getValue() !== requestingUserId) {
          throw new Error('Access denied - not your machine');
        }
      }

      logger.info({ machineId }, 'Machine retrieved successfully');
      
      // Convertir entity a interface ligera (DTO pattern)
      return machine.toPublicInterface();

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        machineId 
      }, 'Failed to get machine');
      
      throw error;
    }
  }
}
