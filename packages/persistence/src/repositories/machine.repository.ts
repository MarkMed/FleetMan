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
  type IQuickCheckRecord
} from '@packages/domain';
import { 
  MachineModel, 
  type IMachineDocument
} from '../models';
import { MachineMapper } from '../mappers';
import { type CreateQuickCheckRecord, type QuickCheckHistoryFilters } from '@packages/contracts';

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
    } catch (error) {
      console.error('Error checking serial number existence:', error);
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
    } catch (error) {
      console.error('Error checking serial number existence excluding ID:', error);
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
      console.error('Error finding machines by owner ID:', error);
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
      console.error('Error finding machines by assigned provider ID:', error);
      return [];
    }
  }

  /**
   * Busca máquinas por tipo
   */
  async findByMachineTypeId(typeId: MachineTypeId): Promise<Machine[]> {
    try {
      const docs = await MachineModel.find({ machineTypeId: typeId.getValue() }).sort({ createdAt: -1 });
      return MachineMapper.toEntityArray(docs);
    } catch (error) {
      console.error('Error finding machines by machine type ID:', error);
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
      console.error('Error finding machines by status:', error);
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
      console.error('Error finding all active machines:', error);
      return [];
    }
  }

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
      machineTypeId?: string;
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
      
      if (options.filter?.machineTypeId) {
        query.machineTypeId = options.filter.machineTypeId;
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
      console.error('Error finding paginated machines:', error);
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
   * @param machineId - ID de la máquina
   * @returns Último registro QuickCheck o undefined
   */
  async getLatestQuickCheck(machineId: MachineId): Promise<Result<IQuickCheckRecord | undefined, DomainError>> {
    try {
      const machineDoc = await MachineModel.findById(machineId.getValue());
      
      if (!machineDoc) {
        return err(DomainError.notFound(`Machine with ID ${machineId.getValue()} not found`));
      }

      const latest = machineDoc.quickChecks?.[0]; // Ya están ordenados por fecha (más reciente primero)
      
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
}