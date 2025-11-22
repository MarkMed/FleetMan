import { 
  type IMachineRepository,
  Machine,
  MachineId,
  UserId,
  MachineTypeId,
  Result,
  DomainError,
  ok,
  err
} from '@packages/domain';
import { 
  MachineModel, 
  type IMachineDocument
} from '../models';
import { MachineMapper } from '../mappers';

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
}