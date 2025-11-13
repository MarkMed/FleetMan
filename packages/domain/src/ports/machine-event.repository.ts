import { Result } from '../errors';
import { MachineEvent } from '../entities/machine-event';
import { MachineId } from '../value-objects/machine-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { DomainError } from '../errors';

/**
 * Puerto (interface) para persistencia de MachineEvent
 * Será implementado en packages/persistence
 */
export interface IMachineEventRepository {
  /**
   * Busca un evento por su ID
   */
  findById(id: string): Promise<Result<MachineEvent, DomainError>>;

  /**
   * Busca eventos por máquina (historial completo)
   */
  findByMachineId(machineId: MachineId): Promise<MachineEvent[]>;

  /**
   * Busca eventos por máquina con paginación
   */
  findByMachineIdPaginated(machineId: MachineId, options: {
    page: number;
    limit: number;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    items: MachineEvent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Busca eventos por tipo de evento
   */
  findByTypeId(typeId: string): Promise<MachineEvent[]>;

  /**
   * Busca eventos creados por un usuario específico
   */
  findByCreatedBy(userId: UserId): Promise<MachineEvent[]>;

  /**
   * Busca eventos del sistema (automáticos)
   */
  findSystemGenerated(): Promise<MachineEvent[]>;

  /**
   * Busca eventos en un rango de fechas
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<MachineEvent[]>;

  /**
   * Busca eventos recientes (últimos N eventos de una máquina)
   */
  findRecentByMachineId(machineId: MachineId, limit: number): Promise<MachineEvent[]>;

  /**
   * Guarda un evento
   */
  save(event: MachineEvent): Promise<Result<void, DomainError>>;

  /**
   * Elimina físicamente un evento
   * CUIDADO: Los eventos son parte del historial, eliminar con precaución
   */
  delete(id: string): Promise<Result<void, DomainError>>;

  /**
   * Búsqueda paginada con filtros
   */
  findPaginated(options: {
    page: number;
    limit: number;
    filter?: {
      machineId?: string;
      typeId?: string;
      createdBy?: string;
      isSystemGenerated?: boolean;
      dateRange?: { start: Date; end: Date };
      searchTerm?: string; // Busca en title y description
    };
    sortBy?: 'createdAt' | 'title' | 'typeId';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    items: MachineEvent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  // TODO: Métodos estratégicos para considerar:
  // findEventsByPattern(pattern: string): Promise<MachineEvent[]>; // Análisis de patrones
  // getEventStatsByMachine(machineId: MachineId): Promise<EventStats>; // Estadísticas
  // findSimilarEvents(eventId: string): Promise<MachineEvent[]>; // Eventos similares
  // archiveOldEvents(beforeDate: Date): Promise<number>; // Archivado masivo
}