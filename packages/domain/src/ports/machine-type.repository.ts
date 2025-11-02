import { Result } from '../errors';
import { MachineType } from '../entities/machine-type';
import { MachineTypeId } from '../value-objects/machine-type-id.vo';
import { DomainError } from '../errors';

/**
 * Puerto (interface) para persistencia de MachineType
 * Será implementado en packages/persistence
 * 
 * Sigue el patrón Repository para separar el dominio de la persistencia
 */
export interface IMachineTypeRepository {
  /**
   * Busca un tipo de máquina por su ID
   */
  findById(id: MachineTypeId): Promise<Result<MachineType, DomainError>>;

  /**
   * Busca un tipo de máquina por su código único
   */
  findByCode(code: string): Promise<Result<MachineType, DomainError>>;

  /**
   * Obtiene todos los tipos de máquina activos
   * Ordenados por sortOrder y luego por displayName
   */
  findAllActive(): Promise<MachineType[]>;

  /**
   * Obtiene todos los tipos de máquina (activos e inactivos)
   * Para administración
   */
  findAll(): Promise<MachineType[]>;

  /**
   * Busca tipos de máquina por categoría
   */
  findByCategory(category: string): Promise<MachineType[]>;

  /**
   * Busca tipos de máquina por tags en metadata
   */
  findByTags(tags: string[]): Promise<MachineType[]>;

  /**
   * Verifica si existe un código específico
   * Útil para validar unicidad antes de crear
   */
  codeExists(code: string): Promise<boolean>;

  /**
   * Verifica si existe un código específico excluyendo un ID
   * Útil para validar unicidad al actualizar
   */
  codeExistsExcluding(code: string, excludeId: MachineTypeId): Promise<boolean>;

  /**
   * Guarda un tipo de máquina (crear o actualizar)
   */
  save(machineType: MachineType): Promise<Result<void, DomainError>>;

  /**
   * Elimina físicamente un tipo de máquina
   * CUIDADO: Solo usar si no hay máquinas asociadas
   */
  delete(id: MachineTypeId): Promise<Result<void, DomainError>>;

  /**
   * Cuenta cuántas máquinas usan este tipo
   * Para validar si se puede eliminar
   */
  countMachinesUsingType(id: MachineTypeId): Promise<number>;

  /**
   * Búsqueda paginada con filtros
   */
  findPaginated(options: {
    page: number;
    limit: number;
    filter?: {
      category?: string;
      isActive?: boolean;
      searchTerm?: string; // Busca en displayName y description
    };
    sortBy?: 'displayName' | 'category' | 'createdAt' | 'sortOrder';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    items: MachineType[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}