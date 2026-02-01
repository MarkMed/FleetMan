import { SparePartRepository, MachineRepository } from '@packages/persistence';
import { type ISparePart } from '@packages/domain';
import { logger } from '../../config/logger.config';

/**
 * Use Case: Get Spare Part Details
 * Sprint #15/16 - Task 7.1: Alta/edición repuesto (RF-012)
 * 
 * Responsibilities:
 * 1. Validate spare part exists
 * 2. Validate machine exists
 * 3. Validate user has access (only machine owner)
 * 4. Return spare part details
 * 
 * Business Rules:
 * - Only authenticated users can view spare part details
 * - User must be the machine owner
 * 
 * @example
 * const useCase = new GetSparePartUseCase();
 * const sparePart = await useCase.execute(userId, sparePartId);
 */
export class GetSparePartUseCase {
  private sparePartRepository: SparePartRepository;
  private machineRepository: MachineRepository;

  constructor() {
    this.sparePartRepository = new SparePartRepository();
    this.machineRepository = new MachineRepository();
  }

  /**
   * Execute the get spare part use case
   * 
   * @param userId - ID of the user requesting details (from JWT)
   * @param sparePartId - Spare part ID
   * @returns Spare part details
   * @throws Error if not found or access denied
   */
  async execute(
    userId: string,
    sparePartId: string
  ): Promise<ISparePart> {
    logger.info({ 
      userId,
      sparePartId
    }, 'Getting spare part details');

    try {
      // 1. Find spare part
      const sparePart = await this.sparePartRepository.findById(sparePartId);
      if (!sparePart) {
        throw new Error('Spare part not found');
      }

      // 2. Validate machine access
      const machineResult = await this.machineRepository.findById({ getValue: () => sparePart.machineId } as any);
      if (!machineResult.success || !machineResult.data) {
        throw new Error('Machine not found');
      }

      const machine = machineResult.data;

      // 3. Validate user has access
      if (machine.ownerId.getValue() !== userId) {
        throw new Error('Access denied: You can only view spare parts for your own machines');
      }

      logger.info({ 
        sparePartId
      }, '✅ Spare part retrieved successfully');

      return sparePart;

    } catch (error: any) {
      logger.error({ 
        error: error.message,
        userId,
        sparePartId
      }, 'Failed to get spare part details');
      
      throw error;
    }
  }
}
