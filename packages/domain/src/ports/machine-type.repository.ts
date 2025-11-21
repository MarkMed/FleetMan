import { MachineType } from '../entities/machine-type';

/**
 * Puerto (interface) para persistencia de MachineType
 * API simple y minimalista para tipos de máquina multilenguaje
 */
export interface IMachineTypeRepository {
  /**
   * Busca un tipo de máquina por su ID
   */
  findById(id: string): Promise<MachineType | null>;

  /**
   * Busca un tipo de máquina por nombre (case-insensitive)
   */
  findByName(name: string): Promise<MachineType | null>;

  /**
   * Obtiene todos los tipos de máquina
   */
  findAll(): Promise<MachineType[]>;

  /**
   * Busca tipos de máquina que tengan un idioma específico
   */
  findByLanguage(language: string): Promise<MachineType[]>;

  /**
   * Guarda un tipo de máquina de forma inteligente:
   * - Si existe un registro con ese nombre (case-insensitive), agrega el idioma si no está presente
   * - Si no existe, crea un nuevo registro con el nombre y el idioma dado
   * 
   * @param name Nombre del tipo de máquina
   * @param language Código ISO 639-1 del idioma (ej: 'es', 'en')
   * @returns El MachineType guardado/actualizado
   */
  save(name: string, language: string): Promise<MachineType>;

  /**
   * Actualiza el nombre de un tipo de máquina
   */
  updateName(id: string, newName: string): Promise<MachineType | null>;

  /**
   * Elimina físicamente un tipo de máquina
   * CUIDADO: Solo usar si no hay máquinas asociadas
   */
  delete(id: string): Promise<boolean>;

  /**
   * Cuenta cuántas máquinas usan este tipo
   */
  countMachinesUsingType(id: string): Promise<number>;
}