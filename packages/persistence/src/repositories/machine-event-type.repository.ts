import { 
  type IMachineEventTypeRepository,
  MachineEventType,
  UserId,
  Result,
  DomainError,
  ok,
  err
} from '@packages/domain';
import { 
  MachineEventTypeModel, 
  type IMachineEventTypeDocument
} from '../models';

export class MachineEventTypeRepository implements IMachineEventTypeRepository {

  /**
   * Busca un tipo de evento por su ID
   */
  async findById(id: string): Promise<Result<MachineEventType, DomainError>> {
    try {
      const eventTypeDoc = await MachineEventTypeModel.findById(id);
      
      if (!eventTypeDoc) {
        return err(DomainError.notFound(`MachineEventType with ID ${id} not found`));
      }

      // TODO: Implement proper document to entity conversion
      return err(DomainError.create('INCOMPLETE_IMPLEMENTATION', 'MachineEventTypeRepository.findById needs complete implementation'));
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error finding machine event type by ID: ${error.message}`));
    }
  }

  /**
   * Busca un tipo de evento por nombre normalizado
   */
  async findByNormalizedName(normalizedName: string): Promise<Result<MachineEventType, DomainError>> {
    try {
      const eventTypeDoc = await MachineEventTypeModel.findOne({ normalizedName: normalizedName.toLowerCase() });
      
      if (!eventTypeDoc) {
        return err(DomainError.notFound(`MachineEventType with normalized name ${normalizedName} not found`));
      }

      // TODO: Implement proper document to entity conversion
      return err(DomainError.create('INCOMPLETE_IMPLEMENTATION', 'MachineEventTypeRepository.findByNormalizedName needs complete implementation'));
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error finding machine event type by normalized name: ${error.message}`));
    }
  }

  /**
   * Verifica si existe un nombre normalizado
   */
  async normalizedNameExists(normalizedName: string): Promise<boolean> {
    try {
      const count = await MachineEventTypeModel.countDocuments({ normalizedName: normalizedName.toLowerCase() });
      return count > 0;
    } catch (error) {
      console.error('Error checking normalized name existence:', error);
      return false;
    }
  }

  /**
   * Verifica si existe un nombre normalizado excluyendo un ID
   */
  async normalizedNameExistsExcluding(normalizedName: string, excludeId: string): Promise<boolean> {
    try {
      const count = await MachineEventTypeModel.countDocuments({ 
        normalizedName: normalizedName.toLowerCase(),
        _id: { $ne: excludeId }
      });
      return count > 0;
    } catch (error) {
      console.error('Error checking normalized name existence excluding ID:', error);
      return false;
    }
  }

  /**
   * Obtiene todos los tipos de evento activos
   */
  async findAllActive(): Promise<MachineEventType[]> {
    // TODO: Implement when document to entity conversion is ready
    console.warn('MachineEventTypeRepository.findAllActive not fully implemented');
    return [];
  }

  /**
   * Obtiene todos los tipos de evento (activos e inactivos)
   */
  async findAll(): Promise<MachineEventType[]> {
    // TODO: Implement when document to entity conversion is ready
    console.warn('MachineEventTypeRepository.findAll not fully implemented');
    return [];
  }

  /**
   * Busca tipos de evento generados por el sistema
   */
  async findSystemGenerated(): Promise<MachineEventType[]> {
    // TODO: Implement when document to entity conversion is ready
    console.warn('MachineEventTypeRepository.findSystemGenerated not fully implemented');
    return [];
  }

  /**
   * Busca tipos de evento creados por usuarios
   */
  async findUserGenerated(): Promise<MachineEventType[]> {
    // TODO: Implement when document to entity conversion is ready
    console.warn('MachineEventTypeRepository.findUserGenerated not fully implemented');
    return [];
  }

  /**
   * Busca tipos de evento por creador
   */
  async findByCreatedBy(userId: UserId): Promise<MachineEventType[]> {
    // TODO: Implement when document to entity conversion is ready
    console.warn('MachineEventTypeRepository.findByCreatedBy not fully implemented');
    return [];
  }

  /**
   * Obtiene tipos más usados (ordenados por timesUsed)
   */
  async findMostUsed(limit: number): Promise<MachineEventType[]> {
    // TODO: Implement when document to entity conversion is ready
    console.warn('MachineEventTypeRepository.findMostUsed not fully implemented');
    return [];
  }

  /**
   * Obtiene tipos activos ordenados por frecuencia de uso
   */
  async findActiveByUsageFrequency(limit: number = 50): Promise<MachineEventType[]> {
    // TODO: Implement when document to entity conversion is ready
    console.warn('MachineEventTypeRepository.findActiveByUsageFrequency not fully implemented');
    return [];
  }

  /**
   * Busca tipos por propietario/creador
   */
  async findByOwnerId(ownerId: UserId): Promise<MachineEventType[]> {
    // TODO: Implement when document to entity conversion is ready
    console.warn('MachineEventTypeRepository.findByOwnerId not fully implemented');
    return [];
  }

  /**
   * Guarda un tipo de evento (crear o actualizar)
   */
  async save(eventType: MachineEventType): Promise<Result<void, DomainError>> {
    try {
      // TODO: Implement entity to document conversion and save logic
      return err(DomainError.create('INCOMPLETE_IMPLEMENTATION', 'MachineEventTypeRepository.save needs complete implementation'));
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error saving machine event type: ${error.message}`));
    }
  }

  /**
   * Elimina físicamente un tipo de evento
   */
  async delete(id: string): Promise<Result<void, DomainError>> {
    try {
      const result = await MachineEventTypeModel.findByIdAndDelete(id);
      
      if (!result) {
        return err(DomainError.notFound(`MachineEventType with ID ${id} not found`));
      }
      
      return ok(undefined);
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error deleting machine event type: ${error.message}`));
    }
  }

  /**
   * Incrementa el contador de uso
   */
  async incrementUsageCount(id: string): Promise<Result<void, DomainError>> {
    try {
      const result = await MachineEventTypeModel.findByIdAndUpdate(
        id,
        { $inc: { usageCount: 1 } },
        { new: true }
      );
      
      if (!result) {
        return err(DomainError.notFound(`MachineEventType with ID ${id} not found`));
      }
      
      return ok(undefined);
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error incrementing usage count: ${error.message}`));
    }
  }

  /**
   * Busca tipos de evento por término de búsqueda
   */
  async searchByTerm(searchTerm: string): Promise<MachineEventType[]> {
    // TODO: Implement when document to entity conversion is ready
    console.warn('MachineEventTypeRepository.searchByTerm not fully implemented');
    return [];
  }

  /**
   * Cuenta cuántos eventos usan este tipo
   */
  async countEventsUsingType(id: string): Promise<number> {
    try {
      // This would typically query MachineEvent collection
      // For now, return 0 as placeholder
      console.warn('MachineEventTypeRepository.countEventsUsingType not fully implemented');
      return 0;
    } catch (error) {
      console.error('Error counting events using type:', error);
      return 0;
    }
  }

  /**
   * Búsqueda paginada con filtros
   */
  async findPaginated(options: {
    page: number;
    limit: number;
    filter?: {
      isActive?: boolean;
      systemGenerated?: boolean;
      createdBy?: string;
      searchTerm?: string;
    };
    sortBy?: 'name' | 'timesUsed' | 'createdAt' | 'systemGenerated';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    items: MachineEventType[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      // Build filter query
      const query: any = {};
      
      if (options.filter?.isActive !== undefined) {
        query.isActive = options.filter.isActive;
      }
      
      if (options.filter?.systemGenerated !== undefined) {
        query.systemGenerated = options.filter.systemGenerated;
      }
      
      if (options.filter?.createdBy) {
        query.createdBy = options.filter.createdBy;
      }
      
      if (options.filter?.searchTerm) {
        query.$or = [
          { name: { $regex: options.filter.searchTerm, $options: 'i' } },
          { description: { $regex: options.filter.searchTerm, $options: 'i' } }
        ];
      }

      // Get total count
      const total = await MachineEventTypeModel.countDocuments(query);

      // TODO: Return empty results until document to entity conversion is implemented
      return {
        items: [],
        total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(total / options.limit)
      };
    } catch (error) {
      console.error('Error finding paginated machine event types:', error);
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