import { Machine, UserId } from '@packages/domain';
import { MachineRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import { ListMachinesRequest } from '@packages/contracts';

/**
 * Use Case para listar máquinas con filtros y paginación
 */
export class ListMachinesUseCase {
  private machineRepository: MachineRepository;

  constructor() {
    this.machineRepository = new MachineRepository();
  }

  /**
   * Ejecuta el caso de uso de listar máquinas
   * @param request - Parámetros de búsqueda y paginación
   * @param requestingUserId - ID del usuario que solicita
   * @param userType - Tipo de usuario (CLIENT, PROVIDER)
   * @returns Promise con resultados paginados
   */
  async execute(
    request: ListMachinesRequest,
    requestingUserId: string,
    userType: string
  ): Promise<{
    items: Machine[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    logger.info({ 
      page: request.page,
      limit: request.limit,
      requestingUserId,
      userType
    }, 'Listing machines');

    try {
      // Configurar filtros según tipo de usuario
      const filter: any = { ...request };

      // CLIENT: solo puede ver sus propias máquinas
      if (userType === 'CLIENT') {
        filter.ownerId = requestingUserId;
      }

      // PROVIDER: puede ver máquinas asignadas o todas (según filtro)
      // Si no especifica filtro, ver las asignadas a él
      if (userType === 'PROVIDER' && !filter.ownerId && !filter.assignedProviderId) {
        filter.assignedProviderId = requestingUserId;
      }

      // Ejecutar búsqueda paginada
      const result = await this.machineRepository.findPaginated({
        page: request.page || 1,
        limit: Math.min(request.limit || 10, 100), // Max 100
        filter: {
          ownerId: filter.ownerId,
          assignedProviderId: filter.assignedProviderId,
          machineTypeId: filter.machineTypeId,
          status: filter.status,
          brand: filter.brand,
          searchTerm: filter.search
        },
        sortBy: request.sortBy as 'serialNumber' | 'brand' | 'modelName' | 'createdAt' | 'status' | undefined,
        sortOrder: request.sortOrder
      });

      logger.info({ 
        total: result.total,
        returned: result.items.length
      }, 'Machines listed successfully');

      return result;

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'Failed to list machines');
      
      throw error;
    }
  }
}
