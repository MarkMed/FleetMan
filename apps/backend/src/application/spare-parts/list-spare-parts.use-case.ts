import { SparePartRepository, MachineRepository } from '@packages/persistence';
import { MachineId, type ISparePart } from '@packages/domain';
import { logger } from '../../config/logger.config';

/**
 * Use Case: List Spare Parts
 * Sprint #15/16 - Task 7.1: Listado por máquina (RF-013)
 * 
 * Responsibilities:
 * 1. Validate machine exists
 * 2. Validate user has access (only machine owner)
 * 3. Retrieve all spare parts for the machine
 * 4. Return sorted list
 * 
 * Business Rules:
 * - Only authenticated users can list spare parts
 * - User must be the machine owner
 * - Results sorted alphabetically by name
 * 
 * @example
 * const useCase = new ListSparePartsUseCase();
 * const spareParts = await useCase.execute(userId, machineId);
 */
export class ListSparePartsUseCase {
  private sparePartRepository: SparePartRepository;
  private machineRepository: MachineRepository;

  constructor() {
    this.sparePartRepository = new SparePartRepository();
    this.machineRepository = new MachineRepository();
  }

  /**
   * Execute the list spare parts use case
   * 
   * @param userId - ID of the user requesting the list (from JWT)
   * @param machineId - Machine ID to list spare parts for
   * @returns Array of spare parts (empty if none found)
   * @throws Error if machine not found or access denied
   */
  async execute(
    userId: string,
    machineId: string
  ): Promise<ISparePart[]> {
    logger.info({ 
      userId,
      machineId
    }, 'Listing spare parts');

    try {
      // 1. Validate machine exists
      const machineIdResult = MachineId.create(machineId);
      if (!machineIdResult.success) {
        throw new Error('Invalid machine ID format');
      }

      const machineResult = await this.machineRepository.findById(machineIdResult.data);
      if (!machineResult.success || !machineResult.data) {
        throw new Error('Machine not found');
      }

      const machine = machineResult.data;

      // 2. Validate user has access
      if (machine.ownerId.getValue() !== userId) {
        throw new Error('Access denied: You can only view spare parts for your own machines');
      }

      // 3. Retrieve spare parts
      const spareParts = await this.sparePartRepository.findByMachineId(machineId);

      logger.info({ 
        machineId,
        count: spareParts.length
      }, `✅ Retrieved ${spareParts.length} spare parts`);

      return spareParts;

    } catch (error: any) {
      logger.error({ 
        error: error.message,
        userId,
        machineId
      }, 'Failed to list spare parts');
      
      throw error;
    }
  }
}
