import { MachineTypeRepository } from '@packages/persistence';
import { MachineType } from '@packages/domain';
import { logger } from '../../config/logger.config';

/**
 * Use Case para listar tipos de máquina
 * Opcionalmente puede filtrar por idioma
 */
export class ListMachineTypesUseCase {
  private machineTypeRepository: MachineTypeRepository;

  constructor() {
    this.machineTypeRepository = new MachineTypeRepository();
  }

  /**
   * Ejecuta el caso de uso de listar tipos de máquina
   * @param language - Opcional: código ISO 639-1 del idioma para filtrar
   * @returns Promise con array de tipos de máquina
   */
  async execute(language?: string): Promise<MachineType[]> {
    try {
      logger.info({ language }, 'Listing machine types');

      let machineTypes: MachineType[];

      if (language) {
        // Filtrar por idioma específico
        machineTypes = await this.machineTypeRepository.findByLanguage(language);
        logger.info({ count: machineTypes.length, language }, 'Machine types filtered by language');
      } else {
        // Obtener todos los tipos
        machineTypes = await this.machineTypeRepository.findAll();
        logger.info({ count: machineTypes.length }, 'All machine types retrieved');
      }

      return machineTypes;

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        language 
      }, 'Failed to list machine types');
      
      throw error;
    }
  }
}
