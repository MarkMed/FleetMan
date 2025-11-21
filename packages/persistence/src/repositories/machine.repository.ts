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

      // TODO: Implement proper document to entity conversion
      return err(DomainError.create('INCOMPLETE_IMPLEMENTATION', 'MachineRepository.findById needs complete implementation'));
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

      // TODO: Implement proper document to entity conversion
      return err(DomainError.create('INCOMPLETE_IMPLEMENTATION', 'MachineRepository.findBySerialNumber needs complete implementation'));
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
    // TODO: Implement when document to entity conversion is ready
    console.warn('MachineRepository.findByOwnerId not fully implemented');
    return [];
  }

  /**
   * Busca máquinas asignadas a un proveedor
   */
  async findByAssignedProviderId(providerId: UserId): Promise<Machine[]> {
    // TODO: Implement when document to entity conversion is ready
    console.warn('MachineRepository.findByAssignedProviderId not fully implemented');
    return [];
  }

  /**
   * Busca máquinas por tipo
   */
  async findByMachineTypeId(typeId: MachineTypeId): Promise<Machine[]> {
    // TODO: Implement when document to entity conversion is ready
    console.warn('MachineRepository.findByMachineTypeId not fully implemented');
    return [];
  }

  /**
   * Busca máquinas por estado
   */
  async findByStatus(statusCode: 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE' | 'RETIRED'): Promise<Machine[]> {
    // TODO: Implement when document to entity conversion is ready
    console.warn('MachineRepository.findByStatus not fully implemented');
    return [];
  }

  /**
   * Obtiene todas las máquinas activas
   */
  async findAllActive(): Promise<Machine[]> {
    // TODO: Implement when document to entity conversion is ready
    console.warn('MachineRepository.findAllActive not fully implemented');
    return [];
  }

  /**
   * Guarda una máquina (crear o actualizar)
   */
  async save(machine: Machine): Promise<Result<void, DomainError>> {
    try {
      // TODO: Implement entity to document conversion and save logic
      return err(DomainError.create('INCOMPLETE_IMPLEMENTATION', 'MachineRepository.save needs complete implementation'));
    } catch (error: any) {
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

      // TODO: Return empty results until document to entity conversion is implemented
      return {
        items: [],
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