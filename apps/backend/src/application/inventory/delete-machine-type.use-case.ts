import { MachineTypeRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';

/**
 * Use Case para eliminar un tipo de máquina
 * 
 * TODO: Implementar control de acceso - solo usuarios ADMIN deberían poder eliminar tipos
 * Ejemplo:
 * if (currentUser.type !== 'ADMIN') {
 *   throw new Error('Only administrators can delete machine types');
 * }
 * 
 * TODO: Implementar verificación de uso antes de eliminar (prevenir pérdida de datos)
 * Se recomienda usar soft delete o verificar que no haya máquinas usando este tipo.
 * Ejemplo:
 * const machinesCount = await this.machineTypeRepository.countMachinesUsingType(id);
 * if (machinesCount > 0) {
 *   throw new Error(`Cannot delete machine type: ${machinesCount} machines are using it. Consider marking as inactive instead.`);
 * }
 * 
 * Alternativamente, se puede implementar soft delete agregando un campo "isActive" al modelo:
 * - En lugar de eliminar físicamente, marcar como isActive: false
 * - Filtrar tipos inactivos en las consultas de lista
 * - Permitir reactivar tipos si es necesario
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

      // TODO: Descomentar cuando Machine esté implementado
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
