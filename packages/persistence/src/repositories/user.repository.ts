import { 
  type IUserRepository,
  User,
  UserId,
  Result,
  DomainError,
  ok,
  err
} from '@packages/domain';
import { 
  UserModel, 
  type IUserDocument
} from '../models';

export class UserRepository implements IUserRepository {

  /**
   * Busca un usuario por su ID
   */
  async findById(id: UserId): Promise<Result<User, DomainError>> {
    try {
      const userDoc = await UserModel.findById(id.getValue());
      
      if (!userDoc) {
        return err(DomainError.notFound(`User with ID ${id.getValue()} not found`));
      }

      // TODO: Implement proper document to entity conversion
      // For now, return an error indicating incomplete implementation
      return err(DomainError.create('INCOMPLETE_IMPLEMENTATION', 'UserRepository.findById needs complete implementation'));
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error finding user by ID: ${error.message}`));
    }
  }

  /**
   * Busca un usuario por email (único)
   */
  async findByEmail(email: string): Promise<Result<User, DomainError>> {
    try {
      const userDoc = await UserModel.findOne({ email: email.toLowerCase() });
      
      if (!userDoc) {
        return err(DomainError.notFound(`User with email ${email} not found`));
      }

      // TODO: Implement proper document to entity conversion
      return err(DomainError.create('INCOMPLETE_IMPLEMENTATION', 'UserRepository.findByEmail needs complete implementation'));
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error finding user by email: ${error.message}`));
    }
  }

  /**
   * Verifica si existe un email específico
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const count = await UserModel.countDocuments({ email: email.toLowerCase() });
      return count > 0;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  }

  /**
   * Verifica si existe un email excluyendo un ID
   */
  async emailExistsExcluding(email: string, excludeId: UserId): Promise<boolean> {
    try {
      const count = await UserModel.countDocuments({ 
        email: email.toLowerCase(),
        _id: { $ne: excludeId.getValue() }
      });
      return count > 0;
    } catch (error) {
      console.error('Error checking email existence excluding ID:', error);
      return false;
    }
  }

  /**
   * Obtiene todos los usuarios activos
   */
  async findAllActive(): Promise<User[]> {
    // TODO: Implement when document to entity conversion is ready
    console.warn('UserRepository.findAllActive not fully implemented');
    return [];
  }

  /**
   * Busca usuarios por tipo (CLIENT/PROVIDER)
   */
  async findByType(type: 'CLIENT' | 'PROVIDER'): Promise<User[]> {
    // TODO: Implement when document to entity conversion is ready
    console.warn('UserRepository.findByType not fully implemented');
    return [];
  }

  /**
   * Crea un nuevo usuario en la base de datos
   * @param userData - Datos del usuario a crear
   * @returns Promise con resultado de la creación
   */
  async create(userData: Pick<IUserDocument, 'email' | 'passwordHash' | 'profile' | 'type'>): Promise<Result<{ id: string; email: string; profile: any; type: string; isActive: boolean; createdAt: string; updatedAt: string }, DomainError>> {
    try {
      // Usar el UserModel que ya tiene toda la configuración de Mongoose
      const savedUser = await UserModel.create({
        email: userData.email.toLowerCase(),
        passwordHash: userData.passwordHash,
        profile: userData.profile,
        type: userData.type,
        isActive: true
      });
      
      // El modelo ya maneja automáticamente:
      // - Validaciones de schema
      // - Timestamps (createdAt, updatedAt) 
      // - Virtual fields (id desde _id)
      // - Discriminators para CLIENT/PROVIDER
      // - Transformaciones JSON
      
      // Retornar datos usando la transformación automática del modelo
      const result = {
        id: savedUser.id,
        email: savedUser.email,
        profile: savedUser.profile,
        type: savedUser.type,
        isActive: savedUser.isActive,
        createdAt: savedUser.createdAt.toISOString(),
        updatedAt: savedUser.updatedAt.toISOString()
      };
      
      return ok(result);
    } catch (error: any) {
      if (error.code === 11000) {
        // Error de duplicado de email (índice único)
        return err(DomainError.create('EMAIL_ALREADY_EXISTS', 'Email already registered'));
      }
      if (error.name === 'ValidationError') {
        // Errores de validación del schema de Mongoose
        return err(DomainError.create('VALIDATION_ERROR', `Invalid data: ${error.message}`));
      }
      return err(DomainError.create('PERSISTENCE_ERROR', `Error creating user: ${error.message}`));
    }
  }

  /**
   * Guarda un usuario (crear o actualizar)
   */
  async save(user: User): Promise<Result<void, DomainError>> {
    try {
      // TODO: Implement entity to document conversion and save logic
      return err(DomainError.create('INCOMPLETE_IMPLEMENTATION', 'UserRepository.save needs complete implementation'));
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error saving user: ${error.message}`));
    }
  }

  /**
   * Elimina físicamente un usuario
   */
  async delete(id: UserId): Promise<Result<void, DomainError>> {
    try {
      const result = await UserModel.findByIdAndDelete(id.getValue());
      
      if (!result) {
        return err(DomainError.notFound(`User with ID ${id.getValue()} not found`));
      }
      
      return ok(undefined);
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error deleting user: ${error.message}`));
    }
  }

  /**
   * Búsqueda paginada con filtros
   */
  async findPaginated(options: {
    page: number;
    limit: number;
    filter?: {
      type?: 'CLIENT' | 'PROVIDER';
      isActive?: boolean;
      searchTerm?: string;
    };
    sortBy?: 'email' | 'createdAt' | 'type';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    items: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      // Build filter query
      const query: any = {};
      
      if (options.filter?.type) {
        query.type = options.filter.type;
      }
      
      if (options.filter?.isActive !== undefined) {
        query.isActive = options.filter.isActive;
      }
      
      if (options.filter?.searchTerm) {
        query.$or = [
          { email: { $regex: options.filter.searchTerm, $options: 'i' } },
          { 'profile.companyName': { $regex: options.filter.searchTerm, $options: 'i' } }
        ];
      }

      // Get total count
      const total = await UserModel.countDocuments(query);

      // TODO: Return empty results until document to entity conversion is implemented
      return {
        items: [],
        total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(total / options.limit)
      };
    } catch (error) {
      console.error('Error finding paginated users:', error);
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