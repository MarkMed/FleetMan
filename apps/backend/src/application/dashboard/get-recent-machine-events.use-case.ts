import { UserId } from '@packages/domain';
import { MachineRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import type { 
  RecentMachineEventDTO, 
  GetRecentMachineEventsResponse 
} from '@packages/contracts';
import type { IMachineEvent } from '@packages/domain';

/**
 * GetRecentMachineEventsUseCase - Sprint #12 (Bundle 12)
 * 
 * Obtiene los eventos de máquina más recientes del usuario
 * con paginación estilo "Load More" para dashboard.
 * 
 * Business Rules:
 * - Solo eventos de máquinas que pertenecen al usuario (ownerId)
 * - Ordenados por fecha de creación descendente (más recientes primero)
 * - Paginación incremental (offset-based) para botón "Ver más"
 * - Incluye datos enriquecidos de máquina, tipo de máquina y tipo de evento
 * - Soporta eventos generados por sistema y por usuario
 * 
 * Architecture:
 * - Use Case: Orquesta lógica de negocio
 * - Repository: Maneja agregación MongoDB con lookups
 * - DTO: Transforma datos de dominio a contrato API
 */
export class GetRecentMachineEventsUseCase {
  private machineRepository: MachineRepository;

  constructor(machineRepository?: MachineRepository) {
    this.machineRepository = machineRepository || new MachineRepository();
  }

  async execute(
    userId: string,
    limit: number = 5,
    offset: number = 0
  ): Promise<GetRecentMachineEventsResponse> {
    try {
      logger.info({ userId, limit, offset }, 'Executing GetRecentMachineEventsUseCase');

      // Validar límites
      const sanitizedLimit = Math.min(Math.max(limit, 1), 50); // Entre 1 y 50
      const sanitizedOffset = Math.max(offset, 0); // Mínimo 0

      // Crear Value Object
      const userIdResult = UserId.create(userId);
      if (!userIdResult.success) {
        logger.error({ userId, error: userIdResult.error }, 'Invalid userId');
        return {
          data: [],
          total: 0,
          limit: sanitizedLimit,
          offset: sanitizedOffset,
          hasMore: false
        };
      }
      const userIdVO = userIdResult.data;

      // Delegar a repositorio (agregación MongoDB)
      const result = await this.machineRepository.getRecentEventsForUser(
        userIdVO,
        sanitizedLimit,
        sanitizedOffset
      );

      // Transformar a DTOs
      const dtos: RecentMachineEventDTO[] = result.data.map((item: any) => ({
        // Event data
        id: item.event.id,
        title: item.event.title,
        description: item.event.description,
        createdAt: item.event.createdAt,
        isSystemGenerated: item.event.isSystemGenerated,
        
        // Event type data (enriched)
        eventType: {
          id: item.eventType.id,
          name: item.eventType.name,
          severity: item.eventType.severity
        },
        
        // Machine data (enriched)
        machine: {
          id: item.machine.id,
          name: item.machine.name,
          brand: item.machine.brand,
          model: item.machine.model,
          serialNumber: item.machine.serialNumber,
          machineType: item.machine.machineType || undefined
        }
      }));

      // Calcular hasMore
      const hasMore = (sanitizedOffset + dtos.length) < result.total;

      logger.info({ 
        userId, 
        returned: dtos.length, 
        total: result.total, 
        hasMore 
      }, 'GetRecentMachineEventsUseCase completed successfully');

      return {
        data: dtos,
        total: result.total,
        limit: sanitizedLimit,
        offset: sanitizedOffset,
        hasMore
      };
    } catch (error: any) {
      logger.error({ 
        userId, 
        limit, 
        offset, 
        error: error.message 
      }, 'Error in GetRecentMachineEventsUseCase');
      
      // Return empty result gracefully instead of throwing
      // Permite que dashboard funcione aunque haya error parcial
      return {
        data: [],
        total: 0,
        limit: limit,
        offset: offset,
        hasMore: false
      };
    }
  }
}
