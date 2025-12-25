import { Result } from '../errors';
import { Machine } from '../entities/machine';
import { MachineId } from '../value-objects/machine-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { MachineTypeId } from '../value-objects/machine-type-id.vo';
import { DomainError } from '../errors';
import type { IQuickCheckRecord, IMachineEvent } from '../models/interfaces';

/**
 * Puerto (interface) para persistencia de Machine
 * Será implementado en packages/persistence
 */
export interface IMachineRepository {
  /**
   * Busca una máquina por su ID
   */
  findById(id: MachineId): Promise<Result<Machine, DomainError>>;

  /**
   * Busca una máquina por número de serie (único)
   */
  findBySerialNumber(serialNumber: string): Promise<Result<Machine, DomainError>>;

  /**
   * Verifica si existe un número de serie específico
   */
  serialNumberExists(serialNumber: string): Promise<boolean>;

  /**
   * Verifica si existe un número de serie excluyendo un ID
   */
  serialNumberExistsExcluding(serialNumber: string, excludeId: MachineId): Promise<boolean>;

  /**
   * Busca máquinas por propietario
   */
  findByOwnerId(ownerId: UserId): Promise<Machine[]>;

  /**
   * Busca máquinas asignadas a un proveedor
   */
  findByAssignedProviderId(providerId: UserId): Promise<Machine[]>;

  /**
   * Busca máquinas por tipo
   */
  findByMachineTypeId(typeId: MachineTypeId): Promise<Machine[]>;

  /**
   * Busca máquinas por estado
   */
  findByStatus(statusCode: 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE' | 'RETIRED'): Promise<Machine[]>;

  /**
   * Obtiene todas las máquinas activas
   */
  findAllActive(): Promise<Machine[]>;

  /**
   * Guarda una máquina (crear o actualizar)
   */
  save(machine: Machine): Promise<Result<void, DomainError>>;

  /**
   * Elimina físicamente una máquina
   */
  delete(id: MachineId): Promise<Result<void, DomainError>>;

  /**
   * Búsqueda paginada con filtros avanzados
   */
  findPaginated(options: {
    page: number;
    limit: number;
    filter?: {
      ownerId?: string;
      assignedProviderId?: string;
      machineTypeId?: string;
      status?: string;
      brand?: string;
      searchTerm?: string; // Busca en serialNumber, brand, modelName, nickname
    };
    sortBy?: 'serialNumber' | 'brand' | 'modelName' | 'createdAt' | 'status';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    items: Machine[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Obtiene el último QuickCheck ejecutado para una máquina
   * Ordenado por fecha descendente (más reciente primero)
   * 
   * @param machineId - ID de la máquina
   * @returns Último QuickCheck o undefined si no hay registros
   * 
   * Caso de uso: Derivar template de ítems para inicializar formulario
   * sin duplicar catálogos de ítems en base de datos
   */
  getLatestQuickCheck(machineId: MachineId): Promise<Result<IQuickCheckRecord | undefined, DomainError>>;

  // ==========================================================================
  // 🆕 Sprint #10: Machine Events Methods (Embedded Pattern)
  // ==========================================================================

  /**
   * Agrega un evento al historial de la máquina
   * Incrementa timesUsed del tipo de evento (fire-and-forget)
   * 
   * @param machineId - ID de la máquina
   * @param eventData - Datos del evento a crear
   * @returns Result con el evento creado o error
   */
  addEvent(
    machineId: MachineId,
    eventData: {
      typeId: string;
      title: string;
      description?: string;
      createdBy: string;
      isSystemGenerated?: boolean;
      metadata?: Record<string, any>;
    }
  ): Promise<Result<IMachineEvent, DomainError>>;

  /**
   * Obtiene historial de eventos con filtros y paginación
   * Soporta búsqueda por typeId, fechas, isSystemGenerated, searchTerm
   * 
   * @param machineId - ID de la máquina
   * @param filters - Filtros opcionales
   * @returns Result con eventos paginados
   */
  getEventsHistory(
    machineId: MachineId,
    filters?: {
      typeId?: string;
      isSystemGenerated?: boolean;
      startDate?: Date;
      endDate?: Date;
      searchTerm?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<Result<{
    items: IMachineEvent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }, DomainError>>;

  /**
   * Obtiene el último evento de una máquina
   * Optimizado: Solo carga campo eventsHistory
   * 
   * @param machineId - ID de la máquina
   * @returns Último evento o undefined si no hay historial
   */
  getLatestEvent(machineId: MachineId): Promise<Result<IMachineEvent | undefined, DomainError>>;

  /**
   * Cuenta eventos por tipo
   * Útil para dashboard analytics
   * 
   * @param machineId - ID de la máquina
   * @returns Map de typeId → count
   */
  countEventsByType(machineId: MachineId): Promise<Result<Map<string, number>, DomainError>>;

  // TODO: Métodos estratégicos para considerar:
  // findNearLocation(lat: number, lng: number, radiusKm: number): Promise<Machine[]>; // Geolocalización
  // findByOperatingHoursRange(min: number, max: number): Promise<Machine[]>; // Por horas de uso
  // findDueForMaintenance(beforeDate?: Date): Promise<Machine[]>; // Mantenimiento pendiente
  // findBySpecs(specs: Partial<MachineSpecs>): Promise<Machine[]>; // Búsqueda por especificaciones
  // updateOperatingHours(id: MachineId, hours: number): Promise<void>; // Actualización específica
}