import { SparePartRepository, MachineRepository } from '@packages/persistence';
import { type ISparePart } from '@packages/domain';
import { logger } from '../../config/logger.config';
import type { UpdateSparePartRequest } from '@packages/contracts';

/**
 * Use Case: Update Spare Part
 * Sprint #15/16 - Task 7.1: Alta/edición repuesto (RF-014)
 * 
 * Responsibilities:
 * 1. Validate spare part exists
 * 2. Validate machine exists
 * 3. Validate user has access (only machine owner)
 * 4. Update spare part fields
 * 5. Return updated spare part
 * 
 * Business Rules:
 * - Only authenticated users can update spare parts
 * - User must be the machine owner
 * - machineId cannot be changed (business rule)
 * - Serial ID must remain unique within the same machine
 * 
 * @example
 * const useCase = new UpdateSparePartUseCase();
 * const updated = await useCase.execute(userId, sparePartId, {
 *   amount: 10
 * });
 */
export class UpdateSparePartUseCase {
  private sparePartRepository: SparePartRepository;
  private machineRepository: MachineRepository;

  constructor() {
    this.sparePartRepository = new SparePartRepository();
    this.machineRepository = new MachineRepository();
  }

  /**
   * Execute the update spare part use case
   * 
   * @param userId - ID of the user updating (from JWT)
   * @param sparePartId - Spare part ID to update
   * @param updates - Partial data to update
   * @returns Updated spare part
   * @throws Error if not found, validation fails, or access denied
   */
  async execute(
    userId: string,
    sparePartId: string,
    updates: UpdateSparePartRequest
  ): Promise<ISparePart> {
    logger.info({ 
      userId,
      sparePartId,
      updates
    }, 'Updating spare part');

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
        throw new Error('Access denied: You can only update spare parts for your own machines');
      }

      // 4. Update spare part
      const updatedSparePart = await this.sparePartRepository.update(
        sparePartId,
        updates
      );

      logger.info({ 
        sparePartId
      }, '✅ Spare part updated successfully');

      return updatedSparePart;

    } catch (error: any) {
      logger.error({ 
        error: error.message,
        userId,
        sparePartId
      }, 'Failed to update spare part');
      
      throw error;
    }
  }
}
