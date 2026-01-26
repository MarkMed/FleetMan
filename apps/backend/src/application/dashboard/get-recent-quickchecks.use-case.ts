import { UserId } from '@packages/domain';
import { MachineRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import type { 
  RecentQuickCheckDTO, 
  GetRecentQuickChecksResponse,
  QuickCheckItem
} from '@packages/contracts';
import type { IQuickCheckRecord } from '@packages/domain';

/**
 * GetRecentQuickChecksUseCase - Sprint #12 (Bundle 12)
 * 
 * Obtiene los QuickChecks más recientes de todas las máquinas del usuario
 * con paginación estilo "Load More" para dashboard.
 * 
 * Business Rules:
 * - Solo QuickChecks de máquinas que pertenecen al usuario (ownerId)
 * - Ordenados por fecha descendente (más recientes primero)
 * - Paginación incremental (offset-based) para botón "Ver más"
 * - Incluye datos enriquecidos de máquina y tipo
 * - Calcula estadísticas de items (aprobados/desaprobados)
 * 
 * Architecture:
 * - Use Case: Orquesta lógica de negocio
 * - Repository: Maneja agregación MongoDB
 * - DTO: Transforma datos de dominio a contrato API
 */
export class GetRecentQuickChecksUseCase {
  private machineRepository: MachineRepository;

  constructor(machineRepository?: MachineRepository) {
    this.machineRepository = machineRepository || new MachineRepository();
  }

  async execute(
    userId: string,
    limit: number = 5,
    offset: number = 0
  ): Promise<GetRecentQuickChecksResponse> {
    try {
      logger.info({ userId, limit, offset }, 'Executing GetRecentQuickChecksUseCase');

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
      const result = await this.machineRepository.getRecentQuickChecksForUser(
        userIdVO,
        sanitizedLimit,
        sanitizedOffset
      );

      // Transformar a DTOs
      const dtos: RecentQuickCheckDTO[] = result.data.map((item: any) => {
        // Calcular estadísticas de items
        const items = (item.quickCheck.quickCheckItems || []) as QuickCheckItem[];
        const approvedCount = items.filter((i: QuickCheckItem) => i.result === 'approved').length;
        const disapprovedCount = items.filter((i: QuickCheckItem) => i.result === 'disapproved').length;

        return {
          // QuickCheck data
          id: (item.quickCheck as any)._id?.toString() || '', // MongoDB subdocument _id
          result: item.quickCheck.result,
          date: item.quickCheck.date,
          responsibleName: item.quickCheck.responsibleName,
          responsibleWorkerId: item.quickCheck.responsibleWorkerId || undefined,
          quickCheckItemsCount: items.length,
          approvedItemsCount: approvedCount,
          disapprovedItemsCount: disapprovedCount,
          observations: item.quickCheck.observations,
          
          // Machine data (enriched)
          machine: {
            id: item.machine.id,
            name: item.machine.name,
            brand: item.machine.brand,
            model: item.machine.model,
            serialNumber: item.machine.serialNumber,
            machineType: item.machine.machineType || undefined
          }
        };
      });

      // Calcular hasMore
      const hasMore = (sanitizedOffset + dtos.length) < result.total;

      logger.info({ 
        userId, 
        returned: dtos.length, 
        total: result.total, 
        hasMore 
      }, 'GetRecentQuickChecksUseCase completed successfully');

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
      }, 'Error in GetRecentQuickChecksUseCase');
      
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
