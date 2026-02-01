import { SparePartRepository, MachineRepository } from '@packages/persistence';
import { MachineId, type ISparePart } from '@packages/domain';
import { logger } from '../../config/logger.config';
import type { CreateSparePartRequest } from '@packages/contracts';

/**
 * Use Case: Create Spare Part
 * Sprint #15/16 - Task 7.1: Alta/edición repuesto (RF-012)
 * 
 * Responsibilities:
 * 1. Validate machine exists
 * 2. Validate user has access (only machine owner can add spare parts)
 * 3. Create spare part in database
 * 4. Return created spare part
 * 
 * Business Rules:
 * - Only authenticated users can create spare parts
 * - Spare part belongs to a specific machine
 * - Serial ID must be unique within the same machine
 * - Amount must be >= 0
 * 
 * @example
 * const useCase = new CreateSparePartUseCase();
 * const sparePart = await useCase.execute(userId, {
 *   name: "Filtro de Aceite",
 *   serialId: "F-1234",
 *   amount: 5,
 *   machineId: "machine-xyz"
 * });
 */
export class CreateSparePartUseCase {
  private sparePartRepository: SparePartRepository;
  private machineRepository: MachineRepository;

  constructor() {
    this.sparePartRepository = new SparePartRepository();
    this.machineRepository = new MachineRepository();
  }

  /**
   * Execute the create spare part use case
   * 
   * @param userId - ID of the user creating the spare part (from JWT)
   * @param request - Spare part data
   * @returns Created spare part (ISparePart - SSOT from domain)
   * @throws Error if validation fails or creation fails
   */
  async execute(
    userId: string,
    request: CreateSparePartRequest
  ): Promise<ISparePart> {
    logger.info({ 
      userId,
      machineId: request.machineId,
      name: request.name
    }, 'Creating spare part');

    try {
      // 1. Validate machine exists
      const machineIdResult = MachineId.create(request.machineId);
      if (!machineIdResult.success) {
        throw new Error('Invalid machine ID format');
      }

      const machineResult = await this.machineRepository.findById(machineIdResult.data);
      if (!machineResult.success || !machineResult.data) {
        throw new Error('Machine not found');
      }

      const machine = machineResult.data;

      // 2. Validate user has access (only owner can add spare parts)
      if (machine.ownerId.getValue() !== userId) {
        throw new Error('Access denied: You can only add spare parts to your own machines');
      }

      // 3. Create spare part
      const sparePart = await this.sparePartRepository.create({
        name: request.name,
        serialId: request.serialId,
        amount: request.amount,
        machineId: request.machineId
      });

      logger.info({ 
        sparePartId: sparePart.id,
        machineId: request.machineId
      }, '✅ Spare part created successfully');

      return sparePart;

    } catch (error: any) {
      logger.error({ 
        error: error.message,
        userId,
        machineId: request.machineId
      }, 'Failed to create spare part');
      
      throw error;
    }
  }
}
