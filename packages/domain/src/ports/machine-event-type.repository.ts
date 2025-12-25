import { Result } from '../errors';
import { MachineEventType } from '../entities/machine-event-type';
import { UserId } from '../value-objects/user-id.vo';
import { DomainError } from '../errors';

/**
 * Puerto (interface) para persistencia de MachineEventType
 * Será implementado en packages/persistence
 */
export interface IMachineEventTypeRepository {
  /**
   * Busca un tipo de evento por su ID
   */
  findById(id: string): Promise<Result<MachineEventType, DomainError>>;

  /**
   * Busca un tipo de evento por nombre normalizado
   * Para evitar duplicados similares
   */
  findByNormalizedName(normalizedName: string): Promise<Result<MachineEventType, DomainError>>;

  /**
   * Verifica si existe un nombre normalizado específico
   */
  normalizedNameExists(normalizedName: string): Promise<boolean>;

  /**
   * Obtiene todos los tipos de evento activos
   */
  findAllActive(): Promise<MachineEventType[]>;

  /**
   * Obtiene todos los tipos de evento (activos e inactivos)
   */
  findAll(): Promise<MachineEventType[]>;

  /**
   * Busca tipos de evento generados por el sistema
   */
  findSystemGenerated(): Promise<MachineEventType[]>;

  /**
   * Busca tipos de evento creados por usuarios
   */
  findUserGenerated(): Promise<MachineEventType[]>;

  /**
   * Busca tipos de evento por creador
   */
  findByCreatedBy(userId: UserId): Promise<MachineEventType[]>;

  /**
   * Obtiene tipos más usados (ordenados por timesUsed)
   */
  findMostUsed(limit: number): Promise<MachineEventType[]>;

  /**
   * Guarda un tipo de evento (crear o actualizar)
   */
  save(eventType: MachineEventType): Promise<Result<void, DomainError>>;

  /**
   * Elimina físicamente un tipo de evento
   * CUIDADO: Verificar que no tenga eventos asociados
   */
  delete(id: string): Promise<Result<void, DomainError>>;

  /**
   * Incrementa el contador de uso
   */
  incrementUsageCount(id: string): Promise<Result<void, DomainError>>;

  /**
   * Busca tipos de evento por término de búsqueda
   * Para autocomplete en UI
   */
  searchByTerm(searchTerm: string, limit?: number): Promise<MachineEventType[]>;

  /**
   * Cuenta cuántos eventos usan este tipo
   * Para validar si se puede eliminar
   */
  countEventsUsingType(id: string): Promise<number>;

  /**
   * Búsqueda paginada con filtros
   */
  findPaginated(options: {
    page: number;
    limit: number;
    filter?: {
      isActive?: boolean;
      systemGenerated?: boolean;
      createdBy?: string;
      searchTerm?: string; // Busca en name
    };
    sortBy?: 'name' | 'timesUsed' | 'createdAt' | 'systemGenerated';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    items: MachineEventType[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  // TODO: Métodos estratégicos para considerar:
  // findSuggestions(partialName: string): Promise<MachineEventType[]>; // Autocompletado
  // findUnusedTypes(): Promise<MachineEventType[]>; // Limpieza de tipos no usados
  // mergeEventTypes(sourceId: string, targetId: string): Promise<void>; // Consolidación
  // generateEventTypeReport(): Promise<EventTypeStats>; // Reportes de uso
}