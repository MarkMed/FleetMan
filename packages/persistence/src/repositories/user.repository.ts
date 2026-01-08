import { 
  type IUserRepository,
  type IGetNotificationsResult,
  type INotification,
  User,
  UserId,
  Result,
  DomainError,
  ok,
  err,
  ClientUser,
  ProviderUser,
  type NotificationType,
  type NotificationSourceType
} from '@packages/domain';
import { 
  UserModel, 
  type IUserDocument
} from '../models';
import { NotificationMapper } from '../mappers/notification.mapper';

/**
 * Data structure for adding a notification to user's notifications array.
 * Omits auto-generated fields (id, wasSeen, notificationDate) from INotification.
 */
type AddNotificationData = Omit<INotification, 'id' | 'wasSeen' | 'notificationDate'>;

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
      // Incluir passwordHash explícitamente para autenticación (campo tiene select: false)
      const userDoc = await UserModel.findOne({ email: email.toLowerCase() })
                                     .select('+passwordHash');
      
      if (!userDoc) {
        return err(DomainError.notFound(`User with email ${email} not found`));
      }

      // Convertir documento MongoDB → entidad de dominio
      const userEntity = await this.documentToEntity(userDoc);
      return ok(userEntity);
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

  /**
   * Convierte un documento MongoDB en una entidad de dominio
   * @private
   */
  private async documentToEntity(doc: IUserDocument): Promise<User> {
    const entityData = {
      id: doc.id,
      email: doc.email,
      passwordHash: doc.passwordHash,
      profile: doc.profile,
      type: doc.type,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };

    // Usar factory methods específicos según el tipo de usuario
    if (doc.type === 'CLIENT') {
      const result = ClientUser.fromEntityData(entityData);
      if (!result.success) {
        throw new Error(`Failed to reconstruct ClientUser: ${result.error.message}`);
      }
      return result.data;
    } else if (doc.type === 'PROVIDER') {
      const result = ProviderUser.fromEntityData(entityData);
      if (!result.success) {
        throw new Error(`Failed to reconstruct ProviderUser: ${result.error.message}`);
      }
      return result.data;
    } else {
      throw new Error(`Unknown user type: ${doc.type}`);
    }
  }

  // =============================================================================
  // 🔔 NOTIFICATION METHODS (Sprint #9)
  // =============================================================================

  /**
   * Adds a notification to the user's notifications array
   */
  async addNotification(
    userId: UserId,
    notification: AddNotificationData
  ): Promise<Result<void, DomainError>> {
    try {
      const result = await UserModel.findByIdAndUpdate(
        userId.getValue(),
        {
          $push: {
            notifications: {
              notificationType: notification.notificationType,
              message: notification.message,
              wasSeen: false,
              notificationDate: new Date(),
              actionUrl: notification.actionUrl,
              sourceType: notification.sourceType,
              metadata: notification.metadata
            }
          }
        },
        { new: true }
      );

      if (!result) {
        return err(DomainError.notFound(`User with ID ${userId.getValue()} not found`));
      }

      return ok(undefined);
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error adding notification: ${error.message}`));
    }
  }

  /**
   * Gets user notifications with filters and pagination
   */
  async getUserNotifications(userId: UserId, filters: {
    onlyUnread?: boolean;
    page: number;
    limit: number;
  }): Promise<Result<IGetNotificationsResult, DomainError>> {
    try {
      // Optimization: Only fetch notifications field, not entire user document
      const user = await UserModel.findById(userId.getValue()).select('notifications');

      if (!user) {
        return err(DomainError.notFound(`User with ID ${userId.getValue()} not found`));
      }

      // Convert DocumentArray to normal array
      const notificationsArray = Array.from(user.notifications || []);

      // Filter notifications if onlyUnread is specified
      const filteredNotifications = filters.onlyUnread
        ? notificationsArray.filter(n => !n.wasSeen)
        : notificationsArray;

      // Sort by date descending (most recent first)
      const sortedNotifications = filteredNotifications.sort(
        (a, b) => new Date(b.notificationDate).getTime() - new Date(a.notificationDate).getTime()
      );

      // Calculate pagination
      const total = sortedNotifications.length;
      const skip = (filters.page - 1) * filters.limit;
      const paginatedNotifications = sortedNotifications.slice(skip, skip + filters.limit);

      // Map to domain interfaces using NotificationMapper (DRY)
      const mappedNotifications = NotificationMapper.toDomainArray(paginatedNotifications);

      return ok({
        notifications: mappedNotifications,
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit)
      });
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error getting notifications: ${error.message}`));
    }
  }

  /**
   * Marks notifications as seen
   */
  async markNotificationsAsSeen(userId: UserId, notificationIds: string[]): Promise<Result<void, DomainError>> {
    try {
      const result = await UserModel.findOneAndUpdate(
        { _id: userId.getValue() },
        { $set: { 'notifications.$[elem].wasSeen': true } },
        {
          arrayFilters: [{ 'elem._id': { $in: notificationIds } }],
          new: true
        }
      );

      if (!result) {
        return err(DomainError.notFound(`User with ID ${userId.getValue()} not found`));
      }

      // Note: If notification IDs don't match, MongoDB will still return the user document
      // but won't update any notifications. This is acceptable behavior as invalid IDs are silently ignored.
      return ok(undefined);
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error marking notifications as seen: ${error.message}`));
    }
  }

  /**
   * Counts unread notifications for the user
   */
  async countUnreadNotifications(userId: UserId): Promise<Result<number, DomainError>> {
    try {
      const user = await UserModel.findById(userId.getValue());

      if (!user) {
        return err(DomainError.notFound(`User with ID ${userId.getValue()} not found`));
      }

      const unreadCount = (user.notifications || []).filter(n => !n.wasSeen).length;

      return ok(unreadCount);
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error counting unread notifications: ${error.message}`));
    }
  }

  // =============================================================================
  // 👥 USER DISCOVERY METHODS (Sprint #12 - Module 1)
  // =============================================================================

  /**
   * Finds users for discovery (User Discovery)
   * Returns active users excluding the logged-in user
   * Supports search by company name and filter by type
   */
  async findForDiscovery(excludeUserId: UserId, options: {
    page: number;
    limit: number;
    searchTerm?: string;
    type?: 'CLIENT' | 'PROVIDER';
  }): Promise<{
    items: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      // 1. Build query: active users excluding logged-in user
      const query: any = {
        isActive: true,
        _id: { $ne: excludeUserId.getValue() }
      };

      // 2. Optional filter: user type
      if (options.type) {
        query.type = options.type;
      }

      // 3. Optional filter: search by company name
      if (options.searchTerm) {
        query['profile.companyName'] = { 
          $regex: options.searchTerm, 
          $options: 'i' // Case-insensitive
        };
      }

      // 4. Get total count for pagination
      const total = await UserModel.countDocuments(query);

      // 5. Calculate pagination
      const skip = (options.page - 1) * options.limit;
      const totalPages = Math.ceil(total / options.limit);

      // 6. Execute query with projection to exclude sensitive fields
      const docs = await UserModel.find(query)
        .select('-passwordHash -notifications') // ⚠️ CRITICAL: Exclude sensitive data
        .sort({ 'profile.companyName': 1, createdAt: -1 }) // Sort by company name, then most recent
        .skip(skip)
        .limit(options.limit)
        .lean();

      // 7. Map documents to domain entities (cast needed due to lean() return type)
      const items = await Promise.all(
        docs.map(doc => this.documentToEntity(doc as unknown as IUserDocument))
      );

      return {
        items,
        total,
        page: options.page,
        limit: options.limit,
        totalPages
      };
    } catch (error: any) {
      console.error('Error finding users for discovery:', error);
      // Return empty result on error (graceful degradation)
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