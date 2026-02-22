import { 
  type IMachineRepository,
  Machine,
  MachineId,
  UserId,
  MachineTypeId,
  Result,
  DomainError,
  ok,
  err,
  type IQuickCheckRecord,
  type IMachineEvent,
  type IMaintenanceAlarm,
  type CreateMachineEventProps
} from '@packages/domain';
import { 
  MachineModel, 
  type IMachineDocument,
  MachineEventTypeModel
} from '../models';
import { MachineMapper, MachineEventMapper, MaintenanceAlarmMapper } from '../mappers';
import { type CreateQuickCheckRecord, type QuickCheckHistoryFilters } from '@packages/contracts';
import { logger } from '../utils/logger';

/**
 * Escapes special regex metacharacters in a string so it can be used as a
 * literal substring pattern in a MongoDB $regex query.
 * Prevents ReDoS and accidental wildcard matches from user-supplied input.
 */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Tipo para agregar evento (sin machineId porque se pasa por separado)
 * Agrega isSystemGenerated como opcional (para eventos generados por el sistema)
 */
type AddMachineEventData = Omit<CreateMachineEventProps, 'machineId'> & {
  isSystemGenerated?: boolean;
};

export class MachineRepository implements IMachineRepository {

  /**
   * Busca una máquina por su ID
   */
  async findById(id: MachineId): Promise<Result<Machine, DomainError>> {
    try {
      const machineDoc = await MachineModel.findById(id.getValue());
      
      if (!machineDoc) {
        return err(DomainError.notFound(`Machine with ID ${id.getValue()} not found`));
      }

      const machine = MachineMapper.toEntity(machineDoc);
      if (!machine) {
        return err(DomainError.create('MAPPING_ERROR', 'Failed to convert document to entity'));
      }

      return ok(machine);
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error finding machine by ID: ${error.message}`));
    }
  }

  /**
   * Busca una máquina por número de serie (único)
   */
  async findBySerialNumber(serialNumber: string): Promise<Result<Machine, DomainError>> {
    try {
      const machineDoc = await MachineModel.findOne({ serialNumber: serialNumber.toUpperCase() });
      
      if (!machineDoc) {
        return err(DomainError.notFound(`Machine with serial number ${serialNumber} not found`));
      }

      const machine = MachineMapper.toEntity(machineDoc);
      if (!machine) {
        return err(DomainError.create('MAPPING_ERROR', 'Failed to convert document to entity'));
      }

      return ok(machine);
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error finding machine by serial number: ${error.message}`));
    }
  }

  /**
   * Verifica si existe un número de serie específico
   */
  async serialNumberExists(serialNumber: string): Promise<boolean> {
    try {
      const count = await MachineModel.countDocuments({ serialNumber: serialNumber.toUpperCase() });
      return count > 0;
    } catch (error: any) {
      logger.error({ error: error.message }, 'Error checking serial number existence');
      return false;
    }
  }

  /**
   * Verifica si existe un número de serie excluyendo un ID
   */
  async serialNumberExistsExcluding(serialNumber: string, excludeId: MachineId): Promise<boolean> {
    try {
      const count = await MachineModel.countDocuments({ 
        serialNumber: serialNumber.toUpperCase(),
        _id: { $ne: excludeId.getValue() }
      });
      return count > 0;
    } catch (error: any) {
      logger.error({ error: error.message }, 'Error checking serial number existence excluding ID');
      return false;
    }
  }

  /**
   * Busca máquinas por propietario
   */
  async findByOwnerId(ownerId: UserId): Promise<Machine[]> {
    try {
      const docs = await MachineModel.find({ ownerId: ownerId.getValue() }).sort({ createdAt: -1 });
      return MachineMapper.toEntityArray(docs);
    } catch (error) {
      logger.error({ error }, 'Error finding machines by owner ID');
      return [];
    }
  }

  /**
   * Busca máquinas asignadas a un proveedor
   */
  async findByAssignedProviderId(providerId: UserId): Promise<Machine[]> {
    try {
      const docs = await MachineModel.find({ assignedProviderId: providerId.getValue() }).sort({ createdAt: -1 });
      return MachineMapper.toEntityArray(docs);
    } catch (error) {
      logger.error({ error }, 'Error finding machines by assigned provider ID');
      return [];
    }
  }

  /**
   * Busca máquinas por tipo
   * 
   * LEGACY: Machine types are now free-text (machineTypeName).
   * This method is no longer queryable by ID after the refactoring.
   * Kept commented for reference.
   */
  // async findByMachineTypeId(typeId: MachineTypeId): Promise<Machine[]> {
  //   try {
  //     const docs = await MachineModel.find({ machineTypeId: typeId.getValue() }).sort({ createdAt: -1 });
  //     return MachineMapper.toEntityArray(docs);
  //   } catch (error) {
  //     logger.error({ error }, 'Error finding machines by machine type ID');
  //     return [];
  //   }
  // }

  /**
   * Busca máquinas por nombre de tipo (free-text, case-insensitive)
   * Reemplazo de findByMachineTypeId adaptado a texto libre
   * 
   * @param typeName - Nombre del tipo a buscar (case-insensitive, partial match)
   * @returns Array de máquinas que coinciden con el tipo
   * 
   * Ejemplos:
   * - "Autoelevador" encuentra: "Autoelevador", "autoelevador", "AUTOELEVADOR"
   * - "elev" encuentra: "Autoelevador", "elevador"
   * 
   * Nota: Útil para estadísticas y agrupación por tipo, incluso con variaciones de escritura.
   */
  async findByMachineTypeName(typeName: string): Promise<Machine[]> {
    try {
      if (!typeName.trim()) return [];
      const docs = await MachineModel.find({ 
        machineTypeName: { $regex: escapeRegex(typeName), $options: 'i' } 
      }).sort({ createdAt: -1 });
      
      logger.debug({ typeName, count: docs.length }, 'Found machines by type name');
      return MachineMapper.toEntityArray(docs);
    } catch (error) {
      logger.error({ error, typeName }, 'Error finding machines by machine type name');
      return [];
    }
  }

  /**
   * Busca máquinas por estado
   */
  async findByStatus(statusCode: 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE' | 'RETIRED'): Promise<Machine[]> {
    try {
      const docs = await MachineModel.find({ 'status.code': statusCode }).sort({ createdAt: -1 });
      return MachineMapper.toEntityArray(docs);
    } catch (error) {
      logger.error({ error }, 'Error finding machines by status');
      return [];
    }
  }

  /**
   * 🆕 Sprint #11: Busca máquinas activas que operaron en un día específico
   * 
   * Optimizado para cronjob de mantenimiento - filtra a nivel DB con índice compuesto.
   * Automáticamente excluye máquinas sin usageSchedule (sparse index behavior).
   * 
   * Query MongoDB: { 'status.code': 'ACTIVE', 'usageSchedule.operatingDays': dayOfWeek }
   * Index utilizado: { 'status.code': 1, 'usageSchedule.operatingDays': 1 }
   * 
   * Multikey index: operatingDays es array, query verifica si dayOfWeek existe en el array
   * Ejemplo: Si máquina tiene operatingDays: ['MON', 'TUE', 'WED'] y buscas 'TUE', la retorna.
   * 
   * @param dayOfWeek - Día a buscar (ej: 'MON', 'TUE', 'SAT' del enum DayOfWeek)
   * @returns Array de máquinas activas que operaron ese día (vacío si ninguna)
   * 
   * Performance: ~5x más rápido que findByStatus + filtrado en memoria
   * Ejemplo: 1000 máquinas totales, 200 con schedule, 50 operaron ayer → retorna 50 directo
   */
  async findActiveWithOperatingDay(dayOfWeek: string): Promise<Machine[]> {
    try {
      const docs = await MachineModel.find({
        'status.code': 'ACTIVE',
        'usageSchedule.operatingDays': dayOfWeek  // Array contains check (multikey index)
      }).sort({ createdAt: -1 });
      
      logger.debug(
        { 
          dayOfWeek, 
          count: docs.length 
        }, 
        'Found active machines for operating day'
      );
      
      return MachineMapper.toEntityArray(docs);
    } catch (error) {
      logger.error({ error, dayOfWeek }, 'Error finding active machines by operating day');
      return [];
    }
  }

  /**
   * Obtiene todas las máquinas activas
   */
  async findAllActive(): Promise<Machine[]> {
    try {
      const docs = await MachineModel.find({ 'status.code': 'ACTIVE' }).sort({ createdAt: -1 });
      return MachineMapper.toEntityArray(docs);
    } catch (error) {
      logger.error({ error }, 'Error finding all active machines');
      return [];
    }
  }

  // TODO FUTURO: Bulk update de horas de operación (Sprint 12+)
  // Propósito: Optimizar Stage 1 del cronjob para reducir N queries → 1 query
  // Problema actual: UpdateOperatingHoursUseCase se llama N veces (1 por máquina)
  // Beneficio estimado: 10-100x más rápido para flotas grandes (1000+ máquinas)
  // 
  // async bulkUpdateOperatingHours(updates: Array<{ machineId: string; hoursToAdd: number }>): Promise<number> {
  //   try {
  //     if (updates.length === 0) return 0;
  //     
  //     const operations = updates.map(({ machineId, hoursToAdd }) => ({
  //       updateOne: {
  //         filter: { _id: machineId },
  //         update: {
  //           $inc: { 'specs.operatingHours': hoursToAdd },
  //           $set: { updatedAt: new Date() }
  //         }
  //       }
  //     }));
  //     
  //     const result = await MachineModel.bulkWrite(operations, { ordered: false });
  //     logger.info({ updated: result.modifiedCount, total: updates.length }, 'Bulk updated operating hours');
  //     return result.modifiedCount;
  //   } catch (error: any) {
  //     logger.error({ error: error.message }, 'Error in bulk update operating hours');
  //     throw error;
  //   }
  // }
  //
  // Uso en UpdateMachinesOperatingHoursUseCase:
  // const bulkUpdates = machinesToUpdate.map(machine => ({
  //   machineId: machine.id.getValue(),
  //   hoursToAdd: machine.usageSchedule!.dailyHours
  // }));
  // await this.machineRepository.bulkUpdateOperatingHours(bulkUpdates);

  // TODO FUTURO: Query para máquinas con alarmas activas que operaron ayer (Sprint 12+)
  // Propósito: Optimizar Stage 2 eliminando filtro en memoria de maintenanceAlarms.isActive
  // Problema actual: findActiveWithOperatingDay retorna máquinas SIN alarmas también
  // Beneficio: Reducir data transfer y filtrado en memoria
  //
  // async findActiveWithAlarmsForDay(dayOfWeek: DayOfWeek): Promise<Machine[]> {
  //   try {
  //     const docs = await MachineModel.find({
  //       'status.code': 'ACTIVE',
  //       'usageSchedule.operatingDays': dayOfWeek,
  //       'maintenanceAlarms': { $exists: true, $ne: [] },
  //       'maintenanceAlarms.isActive': true  // Al menos una alarma activa
  //     }).sort({ createdAt: -1 });
  //     
  //     return MachineMapper.toEntityArray(docs);
  //   } catch (error) {
  //     logger.error({ error, dayOfWeek }, 'Error finding machines with alarms for day');
  //     return [];
  //   }
  // }
  //
  // Índice recomendado:
  // machineSchema.index({ 'status.code': 1, 'usageSchedule.operatingDays': 1, 'maintenanceAlarms.isActive': 1 });

  // TODO FUTURO: Aggregation pipeline para actualización server-side (Sprint 13+)
  // Propósito: Eliminar COMPLETAMENTE el load de máquinas en Node.js
  // Beneficio: Zero memory footprint, máxima escalabilidad para flotas de 10,000+ máquinas
  // Técnica: $merge operator para actualizar directamente en MongoDB sin fetch
  //
  // async bulkUpdateOperatingHoursServerSide(dayOfWeek: DayOfWeek): Promise<number> {
  //   try {
  //     const result = await MachineModel.aggregate([
  //       // Stage 1: Match - solo máquinas que operaron ayer
  //       {
  //         $match: {
  //           'status.code': 'ACTIVE',
  //           'usageSchedule.operatingDays': dayOfWeek
  //         }
  //       },
  //       // Stage 2: AddFields - calcular nuevas horas
  //       {
  //         $addFields: {
  //           'specs.operatingHours': {
  //             $add: ['$specs.operatingHours', '$usageSchedule.dailyHours']
  //           },
  //           updatedAt: new Date()
  //         }
  //       },
  //       // Stage 3: Merge - actualizar docs en la misma colección
  //       {
  //         $merge: {
  //           into: 'machines',
  //           whenMatched: 'merge'
  //         }
  //       }
  //     ]);
  //     
  //     logger.info({ dayOfWeek }, 'Server-side bulk update completed');
  //     return result.length;
  //   } catch (error) {
  //     logger.error({ error, dayOfWeek }, 'Error in server-side bulk update');
  //     throw error;
  //   }
  // }
  //
  // Ventajas:
  // - 0 bytes transferidos a Node.js (todo en MongoDB)
  // - Atómico y consistente
  // - Compatible con réplicas y sharding
  // - Ideal para cronjobs de producción con millones de documentos

  /**
   * Guarda una máquina (crear o actualizar)
   */
  async save(machine: Machine): Promise<Result<void, DomainError>> {
    try {
      const docData = MachineMapper.toDocument(machine);
      const machineId = machine.id.getValue();

      // Verificar si existe
      const existing = await MachineModel.findById(machineId);

      if (existing) {
        // Actualizar existente
        await MachineModel.findByIdAndUpdate(machineId, docData, { new: true });
      } else {
        // Crear nuevo
        await MachineModel.create({ _id: machineId, ...docData });
      }

      return ok(undefined);
    } catch (error: any) {
      // Manejar errores de duplicación de serial number
      if (error.code === 11000) {
        return err(DomainError.create('DUPLICATE_KEY', 'Serial number already exists'));
      }
      return err(DomainError.create('PERSISTENCE_ERROR', `Error saving machine: ${error.message}`));
    }
  }

  /**
   * Actualiza campos específicos de una máquina sin cargar entity completa
   * 
   * PRINCIPIO DE EXPERTO:
   * - Repository = Experto en persistencia (CÓMO guardar en DB)
   * - Use Case = Experto en negocio (QUÉ actualizar, validaciones)
   * 
   * ⚠️ IMPORTANTE - Nested Objects:
   * $set con objetos nested REEMPLAZA el objeto completo, NO hace merge.
   * Para updates parciales de nested objects, usar dot notation:
   * 
   * ❌ INCORRECTO: { specs: { operatingHours: 500 } } → Borra enginePower, fuelType, etc.
   * ✅ CORRECTO:   { 'specs.operatingHours': 500 } → Solo actualiza ese campo
   * 
   * Use Cases deben usar flattenToDotNotation() para nested objects.
   * 
   * 🚧 LIMITACIÓN ACTUAL (MVP):
   * flattenToDotNotation() solo soporta MERGE. No permite borrar campos nested.
   * Si necesitas REEMPLAZAR un objeto nested completo (borrar campos), 
   * usar directamente el objeto sin flatten (consciente del riesgo de pérdida de datos).
   * Ver: apps/backend/src/utils/flatten-to-dot-notation.ts para detalles.
   * POST-MVP: Agregar modo 'replace' al utility.
   * 
   * @param machineId - ID de la máquina
   * @param updates - Objeto con campos a actualizar (usar dot notation para nested)
   * @returns Result<Machine> - Retorna la máquina actualizada
   * 
   * Ejemplos:
   * - update(id, { brand: "NewBrand" }) → OK (campo top-level)
   * - update(id, { 'specs.operatingHours': 500 }) → OK (dot notation)
   * - update(id, { brand: "X", 'location.city': "NY" }) → OK (mixto)
   */
  async update(
    machineId: MachineId,
    updates: Record<string, any>
  ): Promise<Result<Machine, DomainError>> {
    try {
      // Validar que hay algo que actualizar
      if (!updates || Object.keys(updates).length === 0) {
        return err(DomainError.create('VALIDATION_ERROR', 'No fields to update'));
      }

      // Mongoose hace merge automático - NO necesitamos lógica especial
      const doc = await MachineModel.findByIdAndUpdate(
        machineId.getValue(),
        { 
          $set: {
            ...updates,
            updatedAt: new Date()
          }
        },
        { 
          new: true,
          runValidators: true // Ejecuta validaciones de Mongoose schema
        }
      );

      if (!doc) {
        return err(DomainError.notFound(`Machine with ID ${machineId.getValue()} not found`));
      }

      // Mappear documento actualizado a entidad de dominio
      const machine = MachineMapper.toEntity(doc);
      if (!machine) {
        return err(DomainError.create('MAPPING_ERROR', 'Failed to map updated machine to entity'));
      }

      return ok(machine);

    } catch (error: any) {
      // Errores de validación Mongoose
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors)
          .map((e: any) => e.message)
          .join(', ');
        return err(DomainError.create('VALIDATION_ERROR', messages));
      }
      
      // Error de duplicado (ej: serialNumber único)
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0] || 'field';
        return err(DomainError.create('DUPLICATE_ERROR', `${field} already exists`));
      }
      
      return err(DomainError.create('PERSISTENCE_ERROR', `Failed to update machine: ${error.message}`));
    }
  }

  /**
   * Elimina físicamente una máquina
   */
  async delete(id: MachineId): Promise<Result<void, DomainError>> {
    try {
      const result = await MachineModel.findByIdAndDelete(id.getValue());
      
      if (!result) {
        return err(DomainError.notFound(`Machine with ID ${id.getValue()} not found`));
      }
      
      return ok(undefined);
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error deleting machine: ${error.message}`));
    }
  }

  /**
   * Búsqueda paginada con filtros avanzados
   */
  async findPaginated(options: {
    page: number;
    limit: number;
    filter?: {
      ownerId?: string;
      assignedProviderId?: string;
      machineTypeId?: string; // LEGACY: Kept for backward compatibility
      machineTypeName?: string; // NEW: Free-text filter for machine type
      status?: string;
      brand?: string;
      searchTerm?: string;
    };
    sortBy?: 'serialNumber' | 'brand' | 'modelName' | 'createdAt' | 'status';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    items: Machine[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      // Build filter query
      const query: any = {};
      
      if (options.filter?.ownerId) {
        query.ownerId = options.filter.ownerId;
      }
      
      if (options.filter?.assignedProviderId) {
        query.assignedProviderId = options.filter.assignedProviderId;
      }
      
      // LEGACY: machineTypeId filter removed (now free-text machineTypeName)
      // if (options.filter?.machineTypeId) {
      //   query.machineTypeId = options.filter.machineTypeId;
      // }

      // NEW: Free-text machineTypeName filter (case-insensitive partial match)
      if (options.filter?.machineTypeName?.trim()) {
        query.machineTypeName = { $regex: escapeRegex(options.filter.machineTypeName), $options: 'i' };
      }
      
      if (options.filter?.status) {
        query['status.code'] = options.filter.status;
      }
      
      if (options.filter?.brand) {
        query.brand = { $regex: options.filter.brand, $options: 'i' };
      }
      
      if (options.filter?.searchTerm) {
        query.$or = [
          { serialNumber: { $regex: options.filter.searchTerm, $options: 'i' } },
          { brand: { $regex: options.filter.searchTerm, $options: 'i' } },
          { modelName: { $regex: options.filter.searchTerm, $options: 'i' } },
          { nickname: { $regex: options.filter.searchTerm, $options: 'i' } }
        ];
      }

      // Get total count
      const total = await MachineModel.countDocuments(query);

      // Build sort options
      const sortField = options.sortBy || 'createdAt';
      const sortDirection = options.sortOrder === 'asc' ? 1 : -1;
      const sort: any = {};
      
      if (sortField === 'status') {
        sort['status.code'] = sortDirection;
      } else {
        sort[sortField] = sortDirection;
      }

      // Execute paginated query
      const skip = (options.page - 1) * options.limit;
      const docs = await MachineModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(options.limit);

      // Convert to entities
      const items = MachineMapper.toEntityArray(docs);

      return {
        items,
        total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(total / options.limit)
      };
    } catch (error) {
      logger.error({ error }, 'Error finding paginated machines');
      return {
        items: [],
        total: 0,
        page: options.page,
        limit: options.limit,
        totalPages: 0
      };
    }
  }

  // =============================================================================
  // QUICKCHECK METHODS
  // =============================================================================

  /**
   * Agrega un nuevo registro de QuickCheck a una máquina
   * IMPORTANTE: Usa la validación de dominio (Machine.addQuickCheckRecord) para garantizar
   * consistencia de reglas de negocio antes de persistir.
   * 
   * @param machineId - ID de la máquina
   * @param record - Registro del QuickCheck a agregar (incluye responsibleName, responsibleWorkerId y executedById)
   * @returns Result con el registro agregado y total de quickchecks (evita query extra)
   */
  async addQuickCheckRecord(
    machineId: MachineId, 
    record: CreateQuickCheckRecord & { executedById: string }
  ): Promise<Result<{ quickCheckRecord: IQuickCheckRecord; totalQuickChecks: number }, DomainError>> {
    try {
      // 1. Cargar la entidad Machine (incluye todas las validaciones de dominio)
      const machineResult = await this.findById(machineId);
      if (!machineResult.success) {
        return err(machineResult.error);
      }

      const machine = machineResult.data;

      // 2. El record ya viene completo desde el use case:
      //    - executedById: extraído del JWT del usuario autenticado
      //    - responsibleName y responsibleWorkerId: ingresados por el usuario en el frontend
      // Solo agregamos la fecha del servidor
      const quickCheckRecord: IQuickCheckRecord = {
        ...record,
        date: new Date()
      };

      // 3. Validar usando la lógica de dominio (CRÍTICO - no bypass)
      const validationResult = machine.addQuickCheckRecord(quickCheckRecord);
      if (!validationResult.success) {
        return err(validationResult.error);
      }

      // 4. Persistir cambios (la entidad ya tiene el nuevo record en su estado)
      const saveResult = await this.save(machine);
      if (!saveResult.success) {
        return err(saveResult.error);
      }

      // 5. Obtener total de quickchecks del estado actual (sin query extra)
      const totalQuickChecks = machine.toPublicInterface().quickChecks?.length || 0;

      // 6. Retornar el registro agregado con metadata
      return ok({ quickCheckRecord, totalQuickChecks });
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error adding QuickCheck record: ${error.message}`));
    }
  }

  /**
   * Obtiene el historial de QuickChecks de una máquina
   * Usa MongoDB aggregation pipeline para filtrado y paginación eficiente en BD.
   * 
   * @param machineId - ID de la máquina
   * @param filters - Filtros opcionales para el historial
   * @returns Array de registros QuickCheck
   */
  async getQuickCheckHistory(
    machineId: MachineId,
    filters?: QuickCheckHistoryFilters
  ): Promise<Result<IQuickCheckRecord[], DomainError>> {
    try {
      const matchStage: any = { _id: machineId.getValue() };
      
      // Build quickChecks filters for aggregation
      const quickCheckMatch: any = {};
      if (filters) {
        if (filters.result) {
          quickCheckMatch['quickChecks.result'] = filters.result;
        }
        if (filters.dateFrom) {
          quickCheckMatch['quickChecks.date'] = quickCheckMatch['quickChecks.date'] || {};
          quickCheckMatch['quickChecks.date'].$gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          quickCheckMatch['quickChecks.date'] = quickCheckMatch['quickChecks.date'] || {};
          quickCheckMatch['quickChecks.date'].$lte = filters.dateTo;
        }
        if (filters.executedById) {
          quickCheckMatch['quickChecks.executedById'] = filters.executedById;
        }
      }

      const skip = filters?.skip || 0;
      const limit = filters?.limit || 20;

      const pipeline: any[] = [
        { $match: matchStage },
        { $unwind: '$quickChecks' },
      ];

      if (Object.keys(quickCheckMatch).length > 0) {
        pipeline.push({ $match: quickCheckMatch });
      }

      // Sort by date descending (most recent first)
      pipeline.push({ $sort: { 'quickChecks.date': -1 } });

      // Pagination
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      // Project only the quickChecks field
      pipeline.push({ $replaceRoot: { newRoot: '$quickChecks' } });

      const records = await MachineModel.aggregate(pipeline);
      
      return ok(records as IQuickCheckRecord[]);
    } catch (error: any) {
      // Check if error is due to machine not found
      if (error.message?.includes('not found')) {
        return err(DomainError.notFound(`Machine with ID ${machineId.getValue()} not found`));
      }
      return err(DomainError.create('PERSISTENCE_ERROR', `Error getting QuickCheck history: ${error.message}`));
    }
  }

  /**
   * Obtiene el último QuickCheck de una máquina
   * Optimizado: Solo carga campo quickChecks (no todo el documento)
   * 
   * @param machineId - ID de la máquina
   * @returns Último QuickCheck o undefined si no hay historial
   */
  async getLatestQuickCheck(machineId: MachineId): Promise<Result<IQuickCheckRecord | undefined, DomainError>> {
    try {
      // OPTIMIZACIÓN: .select() solo carga quickChecks, .lean() retorna POJO (más rápido)
      const machineDoc = await MachineModel
        .findById(machineId.getValue())
        .select('quickChecks') // Solo proyectar campo necesario (reduce bandwidth ~85%)
        .lean(); // Retornar plain JS object (evita overhead de Mongoose Document)
      
      if (!machineDoc) {
        return err(DomainError.notFound(`Machine with ID ${machineId.getValue()} not found`));
      }

      // Los QuickChecks ya están ordenados por fecha DESC (más reciente primero)
      // Ver MachineModel schema: quickChecks array mantiene orden de inserción invertido
      const latest = machineDoc.quickChecks?.[0];
      
      return ok(latest as IQuickCheckRecord | undefined);
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error getting latest QuickCheck: ${error.message}`));
    }
  }

  /**
   * Cuenta cuántos QuickChecks no aprobados tiene una máquina
   * @param machineId - ID de la máquina
   * @returns Cantidad de QuickChecks disapproved
   */
  async countDisapprovedQuickChecks(machineId: MachineId): Promise<Result<number, DomainError>> {
    try {
      const result = await MachineModel.aggregate([
        { $match: { _id: machineId.getValue() } },
        { $unwind: '$quickChecks' },
        { $match: { 'quickChecks.result': 'disapproved' } },
        { $count: 'total' }
      ]);

      const count = result[0]?.total || 0;
      return ok(count);
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error counting disapproved QuickChecks: ${error.message}`));
    }
  }

  // ===========================================================================
  // 🆕 Sprint #10: MACHINE EVENTS METHODS (Embedded Pattern, like QuickCheck)
  // ===========================================================================

  /**
   * Agrega un evento al historial de la máquina
   * Patrón IDÉNTICO a addNotification (UserRepository) - $push directo a MongoDB
   * 
   * @param machineId - ID de la máquina
   * @param eventData - Datos del evento a crear (basado en CreateMachineEventProps)
   * @returns Result con el evento creado o error
   */
  async addEvent(
    machineId: MachineId,
    eventData: AddMachineEventData
  ): Promise<Result<IMachineEvent, DomainError>> {
    try {
      const now = new Date();
      
      // $push directo a MongoDB (como notificaciones)
      const result = await MachineModel.findByIdAndUpdate(
        machineId.getValue(),
        {
          $push: {
            eventsHistory: {
              $each: [{
                typeId: eventData.typeId,
                title: eventData.title,
                description: eventData.description || '',
                createdBy: eventData.createdBy,
                isSystemGenerated: eventData.isSystemGenerated || false,
                metadata: eventData.metadata ? {
                  additionalInfo: eventData.metadata,
                  notes: undefined
                } : undefined,
                createdAt: now,
                updatedAt: now
              }],
              $position: 0 // Agregar al principio (como unshift)
            }
          }
        },
        { new: true }
      );

      if (!result) {
        return err(DomainError.notFound(`Machine with ID ${machineId.getValue()} not found`));
      }


      // Increment event type usage (fire-and-forget)
      MachineEventTypeModel.findByIdAndUpdate(
        eventData.typeId,
        { $inc: { timesUsed: 1 } }
      ).catch((err: any) => {
        logger.error({
          typeId: eventData.typeId,
          error: err.message
        }, 'Failed to increment event type usage');
      });

      // Mapear el evento creado (posición 0 porque usamos $position: 0 en línea 612)
      const createdEvent = result.eventsHistory?.[0];
      if (!createdEvent) {
        return err(DomainError.create('PERSISTENCE_ERROR', 'Event was not persisted correctly'));
      }
      
      const mappedEvent = MachineEventMapper.toDomain(createdEvent as any);
      return ok(mappedEvent);

    } catch (error: any) {
      logger.error({ 
        machineId: machineId.getValue(), 
        error: error.message 
      }, 'Error adding machine event');
      return err(DomainError.create('PERSISTENCE_ERROR', `Failed to add event: ${error.message}`));
    }
  }

  /**
   * Obtiene historial de eventos con filtros y paginación
   * Patrón IDÉNTICO a getQuickCheckHistory (aggregation pipeline)
   * 
   * @param machineId - ID de la máquina
   * @param filters - Filtros opcionales (typeId, fechas, isSystemGenerated, searchTerm)
   * @returns Result con eventos paginados
   */
  async getEventsHistory(
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
  }, DomainError>> {
    try {
      // Build match stage para máquina
      const matchStage: any = { _id: machineId.getValue() };

      // Build filters para eventos
      const eventMatch: any = {};

      if (filters?.typeId) {
        eventMatch['eventsHistory.typeId'] = filters.typeId;
      }

      if (filters?.isSystemGenerated !== undefined) {
        eventMatch['eventsHistory.isSystemGenerated'] = filters.isSystemGenerated;
      }

      if (filters?.startDate || filters?.endDate) {
        eventMatch['eventsHistory.createdAt'] = {};
        if (filters.startDate) {
          eventMatch['eventsHistory.createdAt'].$gte = filters.startDate;
        }
        if (filters.endDate) {
          eventMatch['eventsHistory.createdAt'].$lte = filters.endDate;
        }
      }

      if (filters?.searchTerm) {
        // Search en title y description
        const searchRegex = new RegExp(filters.searchTerm, 'i');
        eventMatch.$or = [
          { 'eventsHistory.title': searchRegex },
          { 'eventsHistory.description': searchRegex }
        ];
      }

      // Pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      // Aggregation pipeline (como QuickCheck)
      const pipeline: any[] = [
        { $match: matchStage },
        { $unwind: '$eventsHistory' }
      ];

      if (Object.keys(eventMatch).length > 0) {
        pipeline.push({ $match: eventMatch });
      }

      // Sort by createdAt descending (most recent first)
      pipeline.push({ $sort: { 'eventsHistory.createdAt': -1 } });

      // Use $facet para obtener total count y datos paginados en una sola query
      pipeline.push({
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: skip },
            { $limit: limit },
            { $replaceRoot: { newRoot: '$eventsHistory' } }
          ]
        }
      });

      const [result] = await MachineModel.aggregate(pipeline);

      const total = result.metadata[0]?.total || 0;
      const items = MachineEventMapper.toDomainArray(result.data);

      return ok({
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });

    } catch (error: any) {
      logger.error({ 
        machineId: machineId.getValue(), 
        error: error.message 
      }, 'Error getting events history');
      return err(DomainError.create('PERSISTENCE_ERROR', `Failed to get events: ${error.message}`));
    }
  }

  /**
   * Obtiene el último evento de una máquina
   * Optimizado: Solo carga campo eventsHistory (no todo el documento)
   * 
   * @param machineId - ID de la máquina
   * @returns Último evento o undefined si no hay historial
   */
  async getLatestEvent(machineId: MachineId): Promise<Result<IMachineEvent | undefined, DomainError>> {
    try {
      // OPTIMIZACIÓN: .select() solo carga eventsHistory, .lean() retorna POJO
      const machineDoc = await MachineModel
        .findById(machineId.getValue())
        .select('eventsHistory')
        .lean();

      if (!machineDoc) {
        return err(DomainError.notFound(`Machine with ID ${machineId.getValue()} not found`));
      }

      // Los eventos ya están ordenados por fecha DESC (más reciente primero)
      const latest = machineDoc.eventsHistory?.[0];

      if (!latest) {
        return ok(undefined);
      }

      const mappedEvent = MachineEventMapper.toDomain(latest as any);
      return ok(mappedEvent);

    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error getting latest event: ${error.message}`));
    }
  }

  /**
   * Cuenta eventos por tipo
   * Útil para dashboard analytics
   * 
   * @param machineId - ID de la máquina
   * @returns Map de typeId → count
   */
  async countEventsByType(machineId: MachineId): Promise<Result<Map<string, number>, DomainError>> {
    try {
      const result = await MachineModel.aggregate([
        { $match: { _id: machineId.getValue() } },
        { $unwind: '$eventsHistory' },
        { $group: {
          _id: '$eventsHistory.typeId',
          count: { $sum: 1 }
        }}
      ]);

      const countMap = new Map<string, number>();
      for (const item of result) {
        countMap.set(item._id, item.count);
      }

      return ok(countMap);
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error counting events by type: ${error.message}`));
    }
  }

  // TODO: Implementar método para obtener eventos de múltiples máquinas
  // Razón: Dashboard de flota necesita ver eventos recientes de todas las máquinas
  // Declaración: async getFleetEvents(ownerId: UserId, filters?: EventFilters): Promise<Result<IMachineEvent[], DomainError>>

  // TODO: Implementar soft delete de eventos
  // Razón: Permitir que usuarios "borren" eventos user-generated sin perder trazabilidad
  // Declaración: async deleteEvent(machineId: MachineId, eventId: string): Promise<Result<void, DomainError>>

  // ==========================================================================
  // 🆕 Sprint #11: Maintenance Alarms Methods (Embedded Pattern)
  // ==========================================================================

  /**
   * Agrega una alarma de mantenimiento a la máquina
   * Patrón $push idéntico a addEvent y addNotification
   */
  async addMaintenanceAlarm(
    machineId: MachineId,
    alarmData: {
      title: string;
      description?: string;
      relatedParts: string[];
      intervalHours: number;
      accumulatedHours: number;
      createdBy: string;
    }
  ): Promise<Result<IMaintenanceAlarm, DomainError>> {
    try {
      const now = new Date();

      const result = await MachineModel.findByIdAndUpdate(
        machineId.getValue(),
        {
          $push: {
            maintenanceAlarms: {
              title: alarmData.title,
              description: alarmData.description,
              relatedParts: alarmData.relatedParts,
              intervalHours: alarmData.intervalHours,
              accumulatedHours: alarmData.accumulatedHours,
              isActive: true, // Default value
              createdBy: alarmData.createdBy,
              timesTriggered: 0,
              createdAt: now,
              updatedAt: now
            }
          }
        },
        { new: true }
      );

      if (!result) {
        return err(DomainError.notFound(`Machine with ID ${machineId.getValue()} not found`));
      }

      // Get the last added alarm (newest - se agrega al final del array)
      const alarms = result.maintenanceAlarms || [];
      if (alarms.length === 0) {
        return err(DomainError.create('PERSISTENCE_ERROR', 'Failed to retrieve created alarm'));
      }
      const createdAlarm = alarms[alarms.length - 1];
      
      // Mapear usando MaintenanceAlarmMapper (DRY principle)
      const mappedAlarm = MaintenanceAlarmMapper.toDomain(createdAlarm as any);
      return ok(mappedAlarm);
    } catch (error: any) {
      logger.error({
        machineId: machineId.getValue(),
        error: error.message
      }, 'Error adding maintenance alarm');
      return err(DomainError.create('PERSISTENCE_ERROR', `Failed to add maintenance alarm: ${error.message}`));
    }
  }

  /**
   * Obtiene alarmas de mantenimiento con filtros
   */
  async getMaintenanceAlarms(
    machineId: MachineId,
    filters?: { onlyActive?: boolean }
  ): Promise<Result<IMaintenanceAlarm[], DomainError>> {
    try {
      const machine = await MachineModel.findById(machineId.getValue()).select('maintenanceAlarms');
      
      if (!machine) {
        return err(DomainError.notFound(`Machine with ID ${machineId.getValue()} not found`));
      }

      let alarms = machine.maintenanceAlarms || [];
      
      if (filters?.onlyActive) {
        alarms = alarms.filter(a => a.isActive);
      }

      // Mapear usando MaintenanceAlarmMapper (DRY principle)
      const mappedAlarms = MaintenanceAlarmMapper.toDomainArray(alarms as any);
      return ok(mappedAlarms);
    } catch (error: any) {
      logger.error({
        machineId: machineId.getValue(),
        error: error.message
      }, 'Error getting maintenance alarms');
      return err(DomainError.create('PERSISTENCE_ERROR', `Failed to get maintenance alarms: ${error.message}`));
    }
  }

  /**
   * Actualiza una alarma específica
   * Usa arrayFilters para actualizar subdocumento específico
   */
  async updateMaintenanceAlarm(
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
  ): Promise<Result<IMaintenanceAlarm, DomainError>> {
    try {
      const updateFields: any = {};
      
      if (updates.title !== undefined) {
        updateFields['maintenanceAlarms.$[alarm].title'] = updates.title;
      }
      if (updates.description !== undefined) {
        updateFields['maintenanceAlarms.$[alarm].description'] = updates.description;
      }
      if (updates.relatedParts !== undefined) {
        updateFields['maintenanceAlarms.$[alarm].relatedParts'] = updates.relatedParts;
      }
      if (updates.intervalHours !== undefined) {
        updateFields['maintenanceAlarms.$[alarm].intervalHours'] = updates.intervalHours;
      }
      if (updates.isActive !== undefined) {
        updateFields['maintenanceAlarms.$[alarm].isActive'] = updates.isActive;
      }
      if (updates.accumulatedHours !== undefined) {
        updateFields['maintenanceAlarms.$[alarm].accumulatedHours'] = updates.accumulatedHours;
      }
      if (updates.lastTriggeredAt !== undefined) {
        updateFields['maintenanceAlarms.$[alarm].lastTriggeredAt'] = updates.lastTriggeredAt;
      }

      // Always update updatedAt timestamp
      updateFields['maintenanceAlarms.$[alarm].updatedAt'] = new Date();

      const result = await MachineModel.findOneAndUpdate(
        { _id: machineId.getValue() },
        { $set: updateFields },
        {
          arrayFilters: [{ 'alarm._id': alarmId }],
          new: true
        }
      );

      if (!result) {
        return err(DomainError.notFound(`Machine with ID ${machineId.getValue()} not found`));
      }

      // Find and return the updated alarm
      const updatedAlarm = result.maintenanceAlarms?.find((a: any) => a._id.toString() === alarmId);
      if (!updatedAlarm) {
        return err(DomainError.notFound(`Maintenance alarm with ID ${alarmId} not found in machine`));
      }

      // Map to domain entity using MaintenanceAlarmMapper
      const mappedAlarm = MaintenanceAlarmMapper.toDomain(updatedAlarm as any);
      return ok(mappedAlarm);
    } catch (error: any) {
      logger.error({
        machineId: machineId.getValue(),
        alarmId,
        error: error.message
      }, 'Error updating maintenance alarm');
      return err(DomainError.create('PERSISTENCE_ERROR', `Failed to update maintenance alarm: ${error.message}`));
    }
  }

  /**
   * Eliminar alarma de mantenimiento (HARD DELETE)
   * Usa $pull para remover físicamente el subdocumento del array
   * 
   * Validaciones:
   * - Máquina debe existir
   * - Alarma debe existir en el array
   * 
   * Patrón MongoDB: $pull remueve elementos que coinciden con condición
   * 
   * @param machineId - ID de la máquina
   * @param alarmId - ID de la alarma (subdocument _id)
   * @returns Result<void> si exitoso, error si falla
   */
  async deleteMaintenanceAlarm(
    machineId: MachineId,
    alarmId: string
  ): Promise<Result<void, DomainError>> {
    try {
      // Validar que la máquina existe
      const machine = await MachineModel.findById(machineId.getValue());
      if (!machine) {
        return err(DomainError.notFound(`Machine with ID ${machineId.getValue()} not found`));
      }

      // Validar que la alarma existe en el array
      const alarmExists = machine.maintenanceAlarms?.some(
        (alarm: any) => alarm._id.toString() === alarmId
      );
      
      if (!alarmExists) {
        return err(
          DomainError.notFound(
            `Maintenance alarm with ID ${alarmId} not found in machine ${machineId.getValue()}`
          )
        );
      }

      // Eliminar alarma usando $pull
      const result = await MachineModel.findByIdAndUpdate(
        machineId.getValue(),
        {
          $pull: {
            maintenanceAlarms: { _id: alarmId }
          }
        },
        { new: true }
      );

      if (!result) {
        return err(
          DomainError.create(
            'DELETE_FAILED',
            'Failed to delete maintenance alarm'
          )
        );
      }

      logger.info(
        { machineId: machineId.getValue(), alarmId },
        'Maintenance alarm deleted successfully'
      );

      return ok(undefined);
    } catch (error: any) {
      logger.error(
        { 
          machineId: machineId.getValue(), 
          alarmId,
          error: error.message 
        },
        'Error deleting maintenance alarm'
      );
      return err(
        DomainError.create(
          'DELETE_FAILED',
          `Failed to delete maintenance alarm: ${error.message}`
        )
      );
    }
  }

  /**
   * Actualiza el acumulador de horas de una alarma específica
   * Usado por cronjob para sumar horas diarias después de día operativo
   * 
   * @param machineId - ID de la máquina
   * @param alarmId - ID de la alarma (subdocument _id)
   * @param hoursToAdd - Horas a sumar (usualmente usageSchedule.dailyHours)
   */
  async updateAlarmAccumulatedHours(
    machineId: MachineId,
    alarmId: string,
    hoursToAdd: number
  ): Promise<Result<void, DomainError>> {
    try {
      const result = await MachineModel.findOneAndUpdate(
        { _id: machineId.getValue() },
        {
          $inc: {
            'maintenanceAlarms.$[alarm].accumulatedHours': hoursToAdd
          },
          $set: {
            'maintenanceAlarms.$[alarm].updatedAt': new Date()
          }
        },
        {
          arrayFilters: [{ 'alarm._id': alarmId }],
          new: true
        }
      );

      if (!result) {
        return err(DomainError.notFound(`Machine with ID ${machineId.getValue()} not found`));
      }

      return ok(undefined);
    } catch (error: any) {
      logger.error({
        machineId: machineId.getValue(),
        alarmId,
        hoursToAdd,
        error: error.message
      }, 'Error updating alarm accumulated hours');
      return err(DomainError.create('PERSISTENCE_ERROR', `Failed to update accumulated hours: ${error.message}`));
    }
  }

  /**
   * Actualiza tracking fields cuando alarma se dispara
   * Usado por cronjob - AHORA RESETEA acumulatedHours a 0
   */
  async triggerMaintenanceAlarm(
    machineId: MachineId,
    alarmId: string,
    currentOperatingHours: number
  ): Promise<Result<void, DomainError>> {
    try {
      const result = await MachineModel.findOneAndUpdate(
        { _id: machineId.getValue() },
        {
          $set: {
            'maintenanceAlarms.$[alarm].lastTriggeredAt': new Date(),
            'maintenanceAlarms.$[alarm].lastTriggeredHours': currentOperatingHours,
            'maintenanceAlarms.$[alarm].accumulatedHours': 0, // 🆕 NUEVO: Reset accumulator
            'maintenanceAlarms.$[alarm].updatedAt': new Date()
          },
          $inc: {
            'maintenanceAlarms.$[alarm].timesTriggered': 1
          }
        },
        {
          arrayFilters: [{ 'alarm._id': alarmId }],
          new: true
        }
      );

      if (!result) {
        return err(DomainError.notFound(`Machine with ID ${machineId.getValue()} not found`));
      }

      return ok(undefined);
    } catch (error: any) {
      logger.error({
        machineId: machineId.getValue(),
        alarmId,
        currentOperatingHours,
        error: error.message
      }, 'Error triggering maintenance alarm');
      return err(DomainError.create('PERSISTENCE_ERROR', `Failed to trigger maintenance alarm: ${error.message}`));
    }
  }

  /**
   * 🆕 Sprint #12 (Bundle 12): Obtiene QuickChecks recientes del usuario
   * Implementación con agregación MongoDB para máxima performance
   */
  async getRecentQuickChecksForUser(
    userId: UserId,
    limit: number = 5,
    offset: number = 0
  ): Promise<{
    data: Array<{
      quickCheck: IQuickCheckRecord & { responsibleWorkerId?: string };
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
  }> {
    try {
      const userIdValue = userId.getValue();

      // Pipeline de agregación MongoDB
      // Type assertion necesaria porque TypeScript no puede inferir correctamente PipelineStage[]
      const pipeline: any[] = [
        // 1. Filtrar máquinas del usuario
        { 
          $match: { ownerId: userIdValue } 
        },
        
        // 2. Lookup para obtener machineType
        {
          $lookup: {
            from: 'machinetypes',
            localField: 'machineTypeId',
            foreignField: '_id',
            as: 'machineTypeData'
          }
        },
        
        // 3. Descomponer array de quickChecks
        { 
          $unwind: {
            path: '$quickChecks',
            preserveNullAndEmptyArrays: false // Solo máquinas con QuickChecks
          }
        },
        
        // 4. Ordenar por fecha descendente (más recientes primero)
        { 
          $sort: { 'quickChecks.date': -1 } 
        },
        
        // 5. Facet para obtener data paginada + total count en una sola query
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [
              { $skip: offset },
              { $limit: limit },
              {
                $project: {
                  quickCheck: '$quickChecks', // Ya contiene todos los campos incluyendo responsibleWorkerId
                  machine: {
                    id: { $toString: '$_id' },
                    name: '$nickname', // nickname es el campo correcto
                    brand: '$basicInfo.brand',
                    model: '$basicInfo.model',
                    serialNumber: '$serialNumber',
                    machineType: {
                      $cond: {
                        if: { $gt: [{ $size: '$machineTypeData' }, 0] },
                        then: {
                          id: { $toString: { $arrayElemAt: ['$machineTypeData._id', 0] } },
                          name: { $arrayElemAt: ['$machineTypeData.name', 0] }
                        },
                        else: null
                      }
                    }
                  }
                }
              }
            ]
          }
        }
      ];

      const result = await MachineModel.aggregate(pipeline);
      
      const total = result[0]?.metadata[0]?.total || 0;
      const data = result[0]?.data || [];

      logger.info({ 
        userId: userIdValue, 
        limit, 
        offset, 
        total, 
        returned: data.length 
      }, 'Retrieved recent QuickChecks for user');

      return { data, total };
    } catch (error: any) {
      logger.error({
        userId: userId.getValue(),
        limit,
        offset,
        error: error.message
      }, 'Error fetching recent QuickChecks');
      // Return empty result on error instead of throwing
      return { data: [], total: 0 };
    }
  }

  /**
   * 🆕 Sprint #12 (Bundle 12): Obtiene eventos recientes del usuario
   * Implementación con agregación MongoDB para máxima performance
   */
  async getRecentEventsForUser(
    userId: UserId,
    limit: number = 5,
    offset: number = 0
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
      responsible: {
        name: string;
        workerId?: string;
      };
    }>;
    total: number;
  }> {
    try {
      const userIdValue = userId.getValue();

      // Pipeline de agregación MongoDB
      // Type assertion necesaria porque TypeScript no puede inferir correctamente PipelineStage[]
      const pipeline: any[] = [
        // 1. Filtrar máquinas del usuario
        { 
          $match: { ownerId: userIdValue } 
        },
        
        // 2. Lookup para machineType
        {
          $lookup: {
            from: 'machinetypes',
            localField: 'machineTypeId',
            foreignField: '_id',
            as: 'machineTypeData'
          }
        },
        
        // 3. Descomponer array de eventos
        { 
          $unwind: {
            path: '$eventsHistory',
            preserveNullAndEmptyArrays: false // Solo máquinas con eventos
          }
        },
        
        // 3.5. Filtrar solo eventos REPORTADOS (no generados por el sistema)
        {
          $match: {
            'eventsHistory.isSystemGenerated': false
          }
        },
        
        // 4. Lookup para eventType (usando typeId del evento)
        // NOTA: typeId en eventsHistory es string, necesitamos convertir a ObjectId para el lookup
        // Usamos $convert con onError para manejar typeIds inválidos sin romper el pipeline
        {
          $lookup: {
            from: 'machine_event_types',
            let: { typeId: '$eventsHistory.typeId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [
                      '$_id',
                      {
                        $convert: {
                          input: '$$typeId',
                          to: 'objectId',
                          onError: null,
                          onNull: null
                        }
                      }
                    ]
                  }
                }
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  normalizedName: 1,
                  languages: 1,
                  systemGenerated: 1,
                  timesUsed: 1
                }
              }
            ],
            as: 'eventTypeData'
          }
        },
        
        // 5. Ordenar por fecha de creación descendente
        { 
          $sort: { 'eventsHistory.createdAt': -1 } 
        },
        
        // 6. Facet para data paginada + total count
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [
              { $skip: offset },
              { $limit: limit },
              {
                $project: {
                  _id: 0,
                  id: { $toString: '$eventsHistory._id' },
                  title: '$eventsHistory.title',
                  description: '$eventsHistory.description',
                  createdAt: '$eventsHistory.createdAt',
                  isSystemGenerated: '$eventsHistory.isSystemGenerated',
                  machine: {
                    id: { $toString: '$_id' },
                    name: '$nickname',
                    serialNumber: '$serialNumber',
                    machineType: {
                      $cond: {
                        if: { $gt: [{ $size: '$machineTypeData' }, 0] },
                        then: {
                          id: { $toString: { $arrayElemAt: ['$machineTypeData._id', 0] } },
                          name: { $arrayElemAt: ['$machineTypeData.name', 0] }
                        },
                        else: null
                      }
                    }
                  },
                  eventType: {
                    $cond: {
                      if: { $gt: [{ $size: '$eventTypeData' }, 0] },
                      then: {
                        id: { $toString: { $arrayElemAt: ['$eventTypeData._id', 0] } },
                        name: { $arrayElemAt: ['$eventTypeData.name', 0] }
                      },
                      else: null
                    }
                  }
                }
              }
            ]
          }
        }
      ];

      const result = await MachineModel.aggregate(pipeline);
      
      const total = result[0]?.metadata[0]?.total || 0;
      const data = result[0]?.data || [];

      logger.info({ 
        userId: userIdValue, 
        limit, 
        offset, 
        total, 
        returned: data.length 
      }, 'Retrieved recent events for user');

      return { data, total };
    } catch (error: any) {
      logger.error({
        userId: userId.getValue(),
        limit,
        offset,
        error: error.message
      }, 'Error fetching recent events');
      // Return empty result on error instead of throwing
      return { data: [], total: 0 };
    }
  }

  // TODO: Implementar método para obtener alarmas próximas a dispararse
  // Razón: Dashboard preventivo - mostrar alarmas que están cerca de cumplir su intervalo
  // Declaración: async getUpcomingAlarms(machineId: MachineId, hoursThreshold: number): Promise<Result<IMaintenanceAlarm[], DomainError>>
  // Lógica: currentOperatingHours >= (lastTriggeredHours + intervalHours - hoursThreshold)

  // TODO: Implementar método para resetear alarma después de mantenimiento completado
  // Razón: Usuario completa mantenimiento → resetear lastTriggeredHours manualmente (no esperar al cronjob)
  // Declaración: async resetMaintenanceAlarm(machineId: MachineId, alarmId: string): Promise<Result<void, DomainError>>
  // Lógica: Actualizar lastTriggeredAt a ahora, lastTriggeredHours a specs.operatingHours actual
  
  // TODO Future: Método para dashboard stats agregados
  // Razón: Obtener estadísticas agregadas en una sola query (total máquinas, QuickChecks hoy, eventos críticos)
  // Declaración: async getDashboardStats(userId: UserId): Promise<DashboardStats>
  // Lógica: Pipeline de agregación con $facet para múltiples conteos + cálculos
}
