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
   * Convierte documento Mongoose a entidad de dominio
   * Pattern: Inline conversion (como MachineType, NO usa mapper separado)
   */
  private toEntity(doc: IMachineEventTypeDocument): Result<MachineEventType, DomainError> {
    try {
      const createProps = {
        name: doc.name,
        language: doc.languages[0], // Primer idioma para validación
        languages: doc.languages,   // Array completo para reconstitución
        createdBy: doc.createdBy || undefined
      };

      // Recreate entity usando factory method apropiado
      const entityResult = doc.systemGenerated 
        ? MachineEventType.createSystemType(createProps)
        : MachineEventType.createUserType(createProps);

      if (!entityResult.success) {
        return err(entityResult.error);
      }

      const entity = entityResult.data;

      // Parse createdBy si existe
      let createdByUserId = null;
      if (doc.createdBy) {
        const userIdResult = UserId.create(doc.createdBy);
        if (userIdResult.success) {
          createdByUserId = userIdResult.data;
        }
      }

      // Override propiedades que vienen de la DB (no del factory)
      (entity as any).props = {
        id: doc.id,
        name: doc.name,
        normalizedName: doc.normalizedName,
        languages: doc.languages,
        systemGenerated: doc.systemGenerated,
        createdBy: createdByUserId,
        createdAt: doc.createdAt,
        timesUsed: doc.timesUsed,
        isActive: doc.isActive
      };

      return ok(entity);
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error converting document to entity: ${error.message}`));
    }
  }

  /**
   * Convierte array de documentos a entidades
   */
  private toEntityArray(docs: IMachineEventTypeDocument[]): MachineEventType[] {
    return docs
      .map(doc => this.toEntity(doc))
      .filter(result => result.success)
      .map(result => result.data as MachineEventType);
  }

  /**
   * Busca un tipo de evento por su ID
   */
  async findById(id: string): Promise<Result<MachineEventType, DomainError>> {
    try {
      const eventTypeDoc = await MachineEventTypeModel.findById(id);
      
      if (!eventTypeDoc) {
        return err(DomainError.notFound(`MachineEventType with ID ${id} not found`));
      }

      return this.toEntity(eventTypeDoc);
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error finding machine event type by ID: ${error.message}`));
    }
  }

  /**
   * Busca un tipo de evento por nombre normalizado
   * Útil para get-or-create pattern (evitar duplicados)
   */
  async findByNormalizedName(normalizedName: string): Promise<Result<MachineEventType, DomainError>> {
    try {
      const eventTypeDoc = await MachineEventTypeModel.findOne({ 
        normalizedName: normalizedName.toLowerCase() 
      });
      
      if (!eventTypeDoc) {
        return err(DomainError.notFound(`MachineEventType with normalized name ${normalizedName} not found`));
      }

      return this.toEntity(eventTypeDoc);
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
    try {
      const docs = await MachineEventTypeModel.find({ isActive: true })
        .sort({ timesUsed: -1 }); // Más populares primero
      
      return this.toEntityArray(docs);
    } catch (error) {
      console.error('Error finding active machine event types:', error);
      return [];
    }
  }

  /**
   * Obtiene todos los tipos de evento (activos e inactivos)
   */
  async findAll(): Promise<MachineEventType[]> {
    try {
      const docs = await MachineEventTypeModel.find()
        .sort({ timesUsed: -1 });
      
      return this.toEntityArray(docs);
    } catch (error) {
      console.error('Error finding all machine event types:', error);
      return [];
    }
  }

  /**
   * Busca tipos de evento generados por el sistema
   */
  async findSystemGenerated(): Promise<MachineEventType[]> {
    try {
      const docs = await MachineEventTypeModel.find({ 
        systemGenerated: true,
        isActive: true 
      }).sort({ name: 1 });
      
      return this.toEntityArray(docs);
    } catch (error) {
      console.error('Error finding system-generated event types:', error);
      return [];
    }
  }

  /**
   * Busca tipos de evento creados por usuarios
   */
  async findUserGenerated(): Promise<MachineEventType[]> {
    try {
      const docs = await MachineEventTypeModel.find({ 
        systemGenerated: false,
        isActive: true 
      }).sort({ timesUsed: -1 });
      
      return this.toEntityArray(docs);
    } catch (error) {
      console.error('Error finding user-generated event types:', error);
      return [];
    }
  }

  /**
   * Busca tipos de evento por creador
   */
  async findByCreatedBy(userId: UserId): Promise<MachineEventType[]> {
    try {
      const docs = await MachineEventTypeModel.find({ 
        createdBy: userId.getValue(),
        isActive: true 
      }).sort({ timesUsed: -1 });
      
      return this.toEntityArray(docs);
    } catch (error) {
      console.error('Error finding event types by creator:', error);
      return [];
    }
  }

  /**
   * Obtiene tipos más usados (ordenados por timesUsed)
   * Útil para sugerencias en UI (Quick Actions)
   */
  async findMostUsed(limit: number): Promise<MachineEventType[]> {
    try {
      const docs = await MachineEventTypeModel.find({ isActive: true })
        .sort({ timesUsed: -1 })
        .limit(limit);
      
      return this.toEntityArray(docs);
    } catch (error) {
      console.error('Error finding most used event types:', error);
      return [];
    }
  }

  /**
   * Obtiene tipos activos ordenados por frecuencia de uso
   */
  async findActiveByUsageFrequency(limit: number = 50): Promise<MachineEventType[]> {
    try {
      const docs = await MachineEventTypeModel.find({ isActive: true })
        .sort({ timesUsed: -1, name: 1 })
        .limit(limit);
      
      return this.toEntityArray(docs);
    } catch (error) {
      console.error('Error finding active event types by usage:', error);
      return [];
    }
  }

  /**
   * Busca tipos por propietario/creador
   */
  async findByOwnerId(ownerId: UserId): Promise<MachineEventType[]> {
    try {
      const docs = await MachineEventTypeModel.find({ 
        createdBy: ownerId.getValue(),
        isActive: true 
      }).sort({ timesUsed: -1 });
      
      return this.toEntityArray(docs);
    } catch (error) {
      console.error('Error finding event types by owner:', error);
      return [];
    }
  }

  /**
   * Guarda un tipo de evento (crear o actualizar)
   * Patrón: Upsert inteligente (como MachineType) - Si ya existe por normalizedName, retorna existente
   * Esto previene duplicados cuando 2 usuarios crean "Mantenimiento" simultáneamente
   */
  async save(eventType: MachineEventType): Promise<Result<void, DomainError>> {
    try {
      const publicInterface = eventType.toPublicInterface();
      
      // Si tiene ID, es update
      if (publicInterface.id && publicInterface.id.startsWith('mevt_type_')) {
        const existingDoc = await MachineEventTypeModel.findById(publicInterface.id);
        
        if (existingDoc) {
          // Update de documento existente (usar set para evitar readonly errors)
          existingDoc.set({
            name: publicInterface.name,
            normalizedName: publicInterface.normalizedName,
            timesUsed: publicInterface.timesUsed,
            isActive: publicInterface.isActive
          });
          
          await existingDoc.save();
          return ok(undefined);
        }
      }
      
      // Es create - usar upsert por normalizedName (prevenir duplicados)
      try {
        await MachineEventTypeModel.create({
          _id: publicInterface.id,
          name: publicInterface.name,
          normalizedName: publicInterface.normalizedName,
          systemGenerated: publicInterface.systemGenerated,
          createdBy: publicInterface.createdBy,
          timesUsed: publicInterface.timesUsed,
          isActive: publicInterface.isActive
        });
        
        return ok(undefined);
      } catch (createError: any) {
        // Si hay duplicate key error (race condition), buscar el existente
        if (createError.code === 11000) {
          const existing = await MachineEventTypeModel.findOne({ 
            normalizedName: publicInterface.normalizedName 
          });
          
          if (existing) {
            // Ya existe - actualizar entity con ID del existente
            (eventType as any).props.id = existing.id;
            return ok(undefined);
          }
        }
        
        throw createError;
      }
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
   * Pattern: Fire-and-forget atomic operation (NO throw errors)
   * Llamado después de crear un evento con este tipo
   */
  async incrementUsageCount(id: string): Promise<Result<void, DomainError>> {
    try {
      const result = await MachineEventTypeModel.findByIdAndUpdate(
        id,
        { $inc: { timesUsed: 1 } }, // ✅ Campo correcto
        { new: true }
      );
      
      if (!result) {
        // Fire-and-forget: log pero no fail
        console.warn(`MachineEventType with ID ${id} not found for increment`);
        return ok(undefined);
      }
      
      return ok(undefined);
    } catch (error: any) {
      // Fire-and-forget: log pero no throw
      console.error('Error incrementing usage count:', error);
      return ok(undefined);
    }
  }

  /**
   * Busca tipos de evento por término de búsqueda
   * Usado para autocomplete en UI (debounced)
   */
  async searchByTerm(searchTerm: string, limit: number = 10): Promise<MachineEventType[]> {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        // Sin término, retornar los más populares
        return this.findMostUsed(limit);
      }
      
      const regex = new RegExp(searchTerm, 'i'); // Case-insensitive
      
      const docs = await MachineEventTypeModel.find({
        isActive: true,
        $or: [
          { name: regex },
          { normalizedName: regex }
        ]
      })
        .sort({ timesUsed: -1 }) // Más populares primero
        .limit(limit);
      
      return this.toEntityArray(docs);
    } catch (error) {
      console.error('Error searching event types by term:', error);
      return [];
    }
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

      // Build sort
      const sortField = options.sortBy || 'timesUsed';
      const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
      const sort: any = { [sortField]: sortOrder };
      
      // Get total count
      const total = await MachineEventTypeModel.countDocuments(query);
      
      // Get paginated documents
      const docs = await MachineEventTypeModel.find(query)
        .sort(sort)
        .skip((options.page - 1) * options.limit)
        .limit(options.limit);
      
      const items = this.toEntityArray(docs);

      return {
        items,
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