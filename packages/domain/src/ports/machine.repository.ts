import { Result } from '../errors';
import { Machine } from '../entities/machine';
import { MachineId } from '../value-objects/machine-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { MachineTypeId } from '../value-objects/machine-type-id.vo';
import { DomainError } from '../errors';
import type { IQuickCheckRecord, IMachineEvent, IMaintenanceAlarm } from '../models/interfaces';

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
   * 
   * LEGACY: Machine types are now free-text (machineTypeName).
   * This method is no longer queryable by ID after the refactoring.
   * Kept commented for backward compatibility.
   */
  // findByMachineTypeId(typeId: MachineTypeId): Promise<Machine[]>;

  /**
   * Busca máquinas por nombre de tipo (free-text, case-insensitive)
   * Reemplazo de findByMachineTypeId adaptado a texto libre
   * 
   * @param typeName - Nombre del tipo a buscar (case-insensitive, partial match)
   * @returns Array de máquinas que coinciden con el tipo
   * 
   * Casos de uso:
   * - Estadísticas: "¿Cuántos autoelevadores tengo?"
   * - Agrupación: Listar todas las máquinas de un tipo específico
   * - Filtrado: Buscar máquinas similares incluso con variaciones de escritura
   * 
   * Ejemplos:
   * - findByMachineTypeName("Autoelevador") → encuentra "Autoelevador", "autoelevador", "AUTOELEVADOR"
   * - findByMachineTypeName("elev") → encuentra "Autoelevador", "elevador", "Elevadora"
   */
  findByMachineTypeName(typeName: string): Promise<Machine[]>;

  /**
   * Busca máquinas por estado
   */
  findByStatus(statusCode: 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE' | 'RETIRED'): Promise<Machine[]>;

  /**
   * 🆕 Sprint #11: Busca máquinas activas que operaron en un día específico
   * 
   * Optimizado para cronjob de mantenimiento - filtra a nivel DB.
   * Query MongoDB: { 'status.code': 'ACTIVE', 'usageSchedule.operatingDays': dayOfWeek }
   * 
   * @param dayOfWeek - Día de la semana (ej: 'MON', 'TUE', 'SAT' del enum DayOfWeek)
   * @returns Máquinas activas que operaron ese día (vacío si ninguna)
   */
  findActiveWithOperatingDay(dayOfWeek: string): Promise<Machine[]>;

  /**
   * Obtiene todas las máquinas activas
   */
  findAllActive(): Promise<Machine[]>;

  /**
   * Guarda una máquina (crear o actualizar)
   */
  save(machine: Machine): Promise<Result<void, DomainError>>;

  /**
   * Actualiza campos específicos de una máquina sin cargar entity completa
   * 
   * Método genérico para updates parciales. No contiene lógica de negocio.
   * Los Use Cases deciden QUÉ actualizar y con QUÉ validaciones.
   * 
   * ⚠️ IMPORTANTE: Para nested objects, usar dot notation para evitar reemplazar todo:
   * - update(id, { brand: "X" }) → OK (campo top-level)
   * - update(id, { 'specs.operatingHours': 500 }) → OK (dot notation, solo actualiza ese campo)
   * - update(id, { specs: { operatingHours: 500 } }) → ⚠️ REEMPLAZA todo specs (borra otros campos)
   * 
   * Use Cases deben usar flattenToDotNotation() para nested objects.
   * 
   * @param machineId - ID de la máquina
   * @param updates - Objeto con campos a actualizar (usar dot notation para nested)
   * @returns Promise<Result<Machine>> - Retorna la máquina actualizada
   */
  update(
    machineId: MachineId,
    updates: Record<string, any>
  ): Promise<Result<Machine, DomainError>>;

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
      machineTypeId?: string; // LEGACY: Kept for backward compatibility during transition
      machineTypeName?: string; // NEW: Free-text filter for machine type (case-insensitive)
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

  // ==========================================================================
  // 🆕 Sprint #11: Maintenance Alarms Methods (Embedded Pattern)
  // ==========================================================================

  /**
   * Agrega una alarma de mantenimiento a la máquina
   * Patrón $push idéntico a addEvent y addNotification
   * 
   * @param machineId - ID de la máquina
   * @param alarmData - Datos de la alarma a crear
   * @returns Result con la alarma creada o error
   */
  addMaintenanceAlarm(
    machineId: MachineId,
    alarmData: {
      title: string;
      description?: string;
      relatedParts: string[];
      intervalHours: number;
      createdBy: string;
    }
  ): Promise<Result<IMaintenanceAlarm, DomainError>>;

  /**
   * Obtiene todas las alarmas de mantenimiento de una máquina
   * Soporta filtrado por estado activo/inactivo
   * 
   * @param machineId - ID de la máquina
   * @param filters - Filtros opcionales
   * @returns Result con array de alarmas
   */
  getMaintenanceAlarms(
    machineId: MachineId,
    filters?: {
      onlyActive?: boolean;
    }
  ): Promise<Result<IMaintenanceAlarm[], DomainError>>;

  /**
   * Actualiza una alarma de mantenimiento específica
   * Usa arrayFilters para actualizar subdocumento específico por ID
   * 
   * @param machineId - ID de la máquina
   * @param alarmId - ID de la alarma (subdocument _id)
   * @param updates - Campos a actualizar (partial update)
   * @returns Result con la alarma actualizada o error
   */
  updateMaintenanceAlarm(
    machineId: MachineId,
    alarmId: string,
    updates: {
      title?: string;
      description?: string;
      relatedParts?: string[];
      intervalHours?: number;
      isActive?: boolean;
      accumulatedHours?: number;
      lastTriggeredAt?: Date;
    }
  ): Promise<Result<IMaintenanceAlarm, DomainError>>;

  /**
   * Elimina (soft delete) una alarma de mantenimiento
   * Eliminación física usando $pull (remueve del array)
   * 
   * Consideraciones:
   * - Eliminación permanente del subdocumento
   * - Histórico de eventos relacionados NO se elimina
   * - Solo owner puede eliminar
   * 
   * @param machineId - ID de la máquina
   * @param alarmId - ID de la alarma (subdocument _id)
   * @returns Result void o error
   */
  deleteMaintenanceAlarm(
    machineId: MachineId,
    alarmId: string
  ): Promise<Result<void, DomainError>>;

  /**
   * Actualiza el acumulador de horas de una alarma específica
   * Usado por cronjob para sumar horas diarias después de día operativo
   * 
   * @param machineId - ID de la máquina
   * @param alarmId - ID de la alarma (subdocument _id)
   * @param hoursToAdd - Horas a sumar (usualmente usageSchedule.dailyHours)
   * @returns Result void o error
   */
  updateAlarmAccumulatedHours(
    machineId: MachineId,
    alarmId: string,
    hoursToAdd: number
  ): Promise<Result<void, DomainError>>;

  /**
   * Actualiza tracking fields cuando alarma de mantenimiento se dispara
   * Uso interno: Invocado por cronjob cuando se cumple condición
   * Ahora también resetea acumulatedHours a 0
   * 
   * @param machineId - ID de la máquina
   * @param alarmId - ID de la alarma (subdocument _id)
   * @param currentOperatingHours - Horas acumuladas actuales de la máquina
   * @returns Result void o error
   */
  triggerMaintenanceAlarm(
    machineId: MachineId,
    alarmId: string,
    currentOperatingHours: number
  ): Promise<Result<void, DomainError>>;

  /**
   * 🆕 Sprint #12 (Bundle 12): Obtiene QuickChecks recientes de todas las máquinas del usuario
   * 
   * Query agregada a nivel MongoDB para performance óptima.
   * Pasos de agregación:
   * 1. $match: filtra máquinas del usuario (ownerId)
   * 2. $unwind: descompone array quickChecks[]
   * 3. $sort: ordena por quickChecks.date descendente
   * 4. $skip/$limit: paginación
   * 5. $lookup: enriquece con machineType
   * 6. $project: formatea respuesta con datos de máquina
   * 
   * @param userId - ID del propietario
   * @param limit - Cantidad de registros a retornar (default 5, max 50)
   * @param offset - Offset para paginación "Load More" (default 0)
   * @returns Array de QuickChecks con datos enriquecidos de máquina
   */
  getRecentQuickChecksForUser(
    userId: UserId,
    limit: number,
    offset: number
  ): Promise<{
    data: Array<{
      quickCheck: IQuickCheckRecord;
      machine: {
        id: string;
        name: string;
        brand: string;
        model: string;
        serialNumber: string;
        machineType?: { id: string; name: string };
      };
    }>;
    total: number;
  }>;

  /**
   * 🆕 Sprint #12 (Bundle 12): Obtiene eventos recientes de todas las máquinas del usuario
   * 
   * Query agregada a nivel MongoDB para performance óptima.
   * Pasos de agregación:
   * 1. $match: filtra máquinas del usuario (ownerId)
   * 2. $unwind: descompone array eventsHistory[]
   * 3. $sort: ordena por eventsHistory.createdAt descendente
   * 4. $skip/$limit: paginación
   * 5. $lookup: enriquece con eventType y machineType
   * 6. $project: formatea respuesta con datos completos
   * 
   * @param userId - ID del propietario
   * @param limit - Cantidad de registros a retornar (default 5, max 50)
   * @param offset - Offset para paginación "Load More" (default 0)
   * @returns Array de eventos con datos enriquecidos de máquina y tipo
   */
  getRecentEventsForUser(
    userId: UserId,
    limit: number,
    offset: number
  ): Promise<{
    data: Array<{
      event: IMachineEvent;
      machine: {
        id: string;
        name: string;
        brand: string;
        model: string;
        serialNumber: string;
        machineType?: { id: string; name: string };
      };
      eventType: {
        id: string;
        name: string;
        severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      };
    }>;
    total: number;
  }>;

  // TODO: Métodos estratégicos para considerar:
  // findNearLocation(lat: number, lng: number, radiusKm: number): Promise<Machine[]>; // Geolocalización
  // findByOperatingHoursRange(min: number, max: number): Promise<Machine[]>; // Por horas de uso
  // findDueForMaintenance(beforeDate?: Date): Promise<Machine[]>; // Mantenimiento pendiente
  // findBySpecs(specs: Partial<MachineSpecs>): Promise<Machine[]>; // Búsqueda por especificaciones
  // updateOperatingHours(id: MachineId, hours: number): Promise<void>; // Actualización específica
  
  // Future dashboard enhancements:
  // getDashboardSummaryStats(userId: UserId): Promise<DashboardStats>; // Estadísticas agregadas
  // getQuickCheckComplianceRate(userId: UserId, period: 'daily' | 'weekly' | 'monthly'): Promise<number>; // Tasa de cumplimiento
  // getCriticalEventsCount(userId: UserId): Promise<number>; // Eventos críticos pendientes
}