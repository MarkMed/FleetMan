import { Machine, MachineId, MachineStatusRegistry } from '@packages/domain';
import { MachineRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import { UpdateMachineRequest } from '@packages/contracts';

/**
 * Use Case para actualizar una máquina existente
 */
export class UpdateMachineUseCase {
  private machineRepository: MachineRepository;

  constructor() {
    this.machineRepository = new MachineRepository();
  }

  /**
   * Ejecuta el caso de uso de actualizar máquina
   * @param machineId - ID de la máquina a actualizar
   * @param request - Datos a actualizar
   * @param requestingUserId - ID del usuario que solicita
   * @param userType - Tipo de usuario
   * @returns Promise con la máquina actualizada
   */
  async execute(
    machineId: string,
    request: UpdateMachineRequest,
    requestingUserId: string,
    userType: string
  ): Promise<Machine> {
    logger.info({ machineId, requestingUserId }, 'Starting machine update');

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

      // Verificar ownership (solo owner puede actualizar)
      if (userType === 'CLIENT' && machine.ownerId.getValue() !== requestingUserId) {
        throw new Error('Access denied - not your machine');
      }

      // Actualizar specs si se proporcionan
      if (request.specs) {
        const updateSpecsResult = machine.updateSpecs(request.specs);
        if (!updateSpecsResult.success) {
          throw new Error(updateSpecsResult.error.message);
        }
      }

      // Actualizar location si se proporciona
      if (request.location) {
        const updateLocationResult = machine.updateLocation({
          ...request.location,
          lastUpdated: new Date(request.location.lastUpdated)
        });
        if (!updateLocationResult.success) {
          throw new Error(updateLocationResult.error.message);
        }
      }

      // Actualizar nickname si se proporciona
      if (request.nickname !== undefined) {
        const updatePropsResult = machine.updateMachineProps({
          nickname: request.nickname
        });
        if (!updatePropsResult.success) {
          throw new Error(updatePropsResult.error.message);
        }
      }

      // Actualizar status si se proporciona
      if (request.status) {
        const newStatus = MachineStatusRegistry.getByCode(request.status);
        if (!newStatus) {
          throw new Error(`Invalid status code: ${request.status}`);
        }
        const changeStatusResult = machine.changeStatus(newStatus);
        if (!changeStatusResult.success) {
          throw new Error(changeStatusResult.error.message);
        }
      }

      // Guardar cambios
      const saveResult = await this.machineRepository.save(machine);
      if (!saveResult.success) {
        throw new Error(saveResult.error.message);
      }

      logger.info({ machineId }, '✅ Machine updated successfully');
      return machine;

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        machineId 
      }, 'Machine update failed');
      
      throw error;
    }
  }
}
