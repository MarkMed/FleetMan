import { MachineTypeRepository } from '@packages/persistence';
import { MachineType } from '@packages/domain';
import { logger } from '../../config/logger.config';
import { CreateMachineTypeRequest } from '@packages/contracts';

/**
 * Use Case para crear un nuevo tipo de máquina
 * Utiliza lógica inteligente: si el tipo ya existe, agrega el idioma; si no, lo crea
 */
export class CreateMachineTypeUseCase {
  private machineTypeRepository: MachineTypeRepository;

  constructor() {
    this.machineTypeRepository = new MachineTypeRepository();
  }

  /**
   * Ejecuta el caso de uso de crear tipo de máquina
   * @param request - Datos del tipo de máquina a crear
   * @returns Promise con el tipo de máquina creado/actualizado
   */
  async execute(request: CreateMachineTypeRequest): Promise<MachineType> {
    logger.info({ name: request.name, language: request.language }, 'Starting machine type creation');

    try {
      // El repositorio maneja la lógica inteligente de crear o agregar idioma
      const machineType = await this.machineTypeRepository.save(
        request.name,
        request.language
      );

      logger.info({ 
        id: machineType.id,
        name: machineType.name,
        languages: machineType.languages 
      }, '✅ Machine type saved successfully');

      return machineType;

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        name: request.name,
        language: request.language 
      }, 'Machine type creation failed');
      
      throw error;
    }
  }
}
