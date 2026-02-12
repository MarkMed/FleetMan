import { MachineTypeRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';

/**
 * LEGACY Use Case - Machine types are now free-text fields
 * 
 * Este use case se mantiene para backward compatibility pero ya no es crítico
 * dado que las máquinas usan machineTypeName (free-text) en lugar de referencias.
 * 
 * Use Case para eliminar un tipo de máquina
 * 
 * TODO: Implementar control de acceso - solo usuarios ADMIN deberían poder eliminar tipos
 * Ejemplo:
 * if (currentUser.type !== 'ADMIN') {
 *   throw new Error('Only administrators can delete machine types');
 * }
 * 
 * NOTA: La verificación de uso ya no aplica con el nuevo modelo free-text.
 * Las máquinas ya no dependen de registros en MachineType collection.
 * LEGACY: Verificación de uso comentada (líneas 54-59)
 */
export class DeleteMachineTypeUseCase {
  private machineTypeRepository: MachineTypeRepository;

  constructor() {
    this.machineTypeRepository = new MachineTypeRepository();
  }

  /**
   * Ejecuta el caso de uso de eliminar tipo de máquina
   * @param id - ID del tipo de máquina a eliminar
   * @returns Promise<void>
   */
  async execute(id: string): Promise<void> {
    logger.info({ id }, 'Starting machine type deletion');

    try {
      // Verificar que el tipo existe
      const existingType = await this.machineTypeRepository.findById(id);
      
      if (!existingType) {
        logger.warn({ id }, 'Machine type not found');
        throw new Error('Machine type not found');
      }

      // LEGACY: Machine usage validation no longer needed (free-text machineTypeName)
      // Machines no longer depend on MachineType records, safe to delete
      // const machinesCount = await this.machineTypeRepository.countMachinesUsingType(id);
      // if (machinesCount > 0) {
      //   logger.warn({ id, machinesCount }, 'Cannot delete machine type in use');
      //   throw new Error(`Cannot delete machine type: ${machinesCount} machines are using it`);
      // }

      // Eliminar el tipo
      const deleted = await this.machineTypeRepository.delete(id);

      if (!deleted) {
        throw new Error('Failed to delete machine type');
      }

      logger.info({ 
        id,
        name: existingType.name 
      }, '🗑️ Machine type deleted successfully');

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        id 
      }, 'Machine type deletion failed');
      
      throw error;
    }
  }
}
