import { MachineTypeRepository } from '@packages/persistence';
import { MachineType } from '@packages/domain';
import { logger } from '../../config/logger.config';
import { UpdateMachineTypeRequest } from '@packages/contracts';

/**
 * Use Case para actualizar el nombre de un tipo de máquina
 * 
 * TODO: Implementar control de acceso - solo usuarios ADMIN deberían poder actualizar tipos
 * Ejemplo:
 * if (currentUser.type !== 'ADMIN') {
 *   throw new Error('Only administrators can update machine types');
 * }
 */
export class UpdateMachineTypeUseCase {
  private machineTypeRepository: MachineTypeRepository;

  constructor() {
    this.machineTypeRepository = new MachineTypeRepository();
  }

  /**
   * Ejecuta el caso de uso de actualizar tipo de máquina
   * @param id - ID del tipo de máquina a actualizar
   * @param request - Nuevos datos del tipo de máquina
   * @returns Promise con el tipo de máquina actualizado
   */
  async execute(id: string, request: UpdateMachineTypeRequest): Promise<MachineType> {
    logger.info({ id, newName: request.name }, 'Starting machine type update');

    try {
      // Verificar que el tipo existe
      const existingType = await this.machineTypeRepository.findById(id);
      
      if (!existingType) {
        logger.warn({ id }, 'Machine type not found');
        throw new Error('Machine type not found');
      }

      // Actualizar el nombre
      const updatedType = await this.machineTypeRepository.updateName(id, request.name);

      if (!updatedType) {
        throw new Error('Failed to update machine type');
      }

      logger.info({ 
        id: updatedType.id,
        oldName: existingType.name,
        newName: updatedType.name 
      }, '✅ Machine type updated successfully');

      return updatedType;

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        id,
        newName: request.name 
      }, 'Machine type update failed');
      
      throw error;
    }
  }
}
