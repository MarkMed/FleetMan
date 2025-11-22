import { Machine } from '@packages/domain';
import { MachineRepository, MachineTypeRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import { CreateMachineRequest } from '@packages/contracts';

/**
 * Use Case para crear una nueva máquina
 * Valida serial number único, machineTypeId existente y crea la entidad
 */
export class CreateMachineUseCase {
  private machineRepository: MachineRepository;
  private machineTypeRepository: MachineTypeRepository;

  constructor() {
    this.machineRepository = new MachineRepository();
    this.machineTypeRepository = new MachineTypeRepository();
  }

  /**
   * Ejecuta el caso de uso de crear máquina
   * @param request - Datos de la máquina a crear
   * @returns Promise con la máquina creada
   */
  async execute(request: CreateMachineRequest): Promise<Machine> {
    logger.info({ 
      serialNumber: request.serialNumber,
      ownerId: request.ownerId 
    }, 'Starting machine creation');

    try {
      // Validar que el serial number no exista
      const serialExists = await this.machineRepository.serialNumberExists(request.serialNumber);
      if (serialExists) {
        throw new Error(`Serial number ${request.serialNumber} already exists`);
      }

      // Validar que el machine type exista
      const machineType = await this.machineTypeRepository.findById(request.machineTypeId);
      if (!machineType) {
        throw new Error(`Machine type with ID ${request.machineTypeId} not found`);
      }

      // Crear entidad de dominio
      const machineResult = Machine.create({
        serialNumber: request.serialNumber,
        brand: request.brand,
        modelName: request.modelName,
        machineTypeId: request.machineTypeId,
        ownerId: request.ownerId,
        createdById: request.createdById,
        nickname: request.nickname,
        specs: request.specs,
        location: request.location ? {
          ...request.location,
          lastUpdated: new Date(request.location.lastUpdated)
        } : undefined,
        initialStatus: request.initialStatus
      });

      if (!machineResult.success) {
        throw new Error(machineResult.error.message);
      }

      const machine = machineResult.data;

      // Guardar en repositorio
      const saveResult = await this.machineRepository.save(machine);
      if (!saveResult.success) {
        throw new Error(saveResult.error.message);
      }

      logger.info({ 
        id: machine.id.getValue(),
        serialNumber: machine.serialNumber.getValue()
      }, '✅ Machine created successfully');

      return machine;

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        serialNumber: request.serialNumber
      }, 'Machine creation failed');
      
      throw error;
    }
  }
}
