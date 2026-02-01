import { SparePartRepository, MachineRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';

/**
 * Use Case: Delete Spare Part
 * Sprint #15/16 - Task 7.1: Alta/edición repuesto (RF-012)
 * 
 * Responsibilities:
 * 1. Validate spare part exists
 * 2. Validate machine exists
 * 3. Validate user has access (only machine owner)
 * 4. Delete spare part from database
 * 
 * Business Rules:
 * - Only authenticated users can delete spare parts
 * - User must be the machine owner
 * - Deletion is permanent (no soft delete in v0.0.1)
 * 
 * @example
 * const useCase = new DeleteSparePartUseCase();
 * await useCase.execute(userId, sparePartId);
 */
export class DeleteSparePartUseCase {
  private sparePartRepository: SparePartRepository;
  private machineRepository: MachineRepository;

  constructor() {
    this.sparePartRepository = new SparePartRepository();
    this.machineRepository = new MachineRepository();
  }

  /**
   * Execute the delete spare part use case
   * 
   * @param userId - ID of the user deleting (from JWT)
   * @param sparePartId - Spare part ID to delete
   * @throws Error if not found or access denied
   */
  async execute(
    userId: string,
    sparePartId: string
  ): Promise<void> {
    logger.info({ 
      userId,
      sparePartId
    }, 'Deleting spare part');

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
        throw new Error('Access denied: You can only delete spare parts for your own machines');
      }

      // 4. Delete spare part
      await this.sparePartRepository.delete(sparePartId);

      logger.info({ 
        sparePartId
      }, '✅ Spare part deleted successfully');

    } catch (error: any) {
      logger.error({ 
        error: error.message,
        userId,
        sparePartId
      }, 'Failed to delete spare part');
      
      throw error;
    }
  }
}
