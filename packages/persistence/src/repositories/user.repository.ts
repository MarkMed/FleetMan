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

      // Convertir documento MongoDB → entidad de dominio
      const userEntity = await this.documentToEntity(userDoc);
      return ok(userEntity);
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
   * @returns Result.success() with paginated data or Result.fail() with infrastructure error
   */
  async findForDiscovery(excludeUserId: UserId, options: {
    page: number;
    limit: number;
    searchTerm?: string;
    type?: 'CLIENT' | 'PROVIDER';
  }): Promise<Result<{
    items: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }, DomainError>> {
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
      // ⚠️ IMPORTANT: Use lean() for performance (30-50% faster than full Mongoose docs)
      // Note: lean() returns plain objects without Mongoose virtuals, so we transform _id → id manually
      const docs = await UserModel.find(query)
        .select('-passwordHash -notifications') // ⚠️ CRITICAL: Exclude sensitive data
        .sort({ 'profile.companyName': 1, createdAt: -1 }) // Sort by company name, then most recent
        .skip(skip)
        .limit(options.limit)
        .lean(); // Plain JS objects for performance

      // 7. Transform _id to id (required by documentToEntity)
      // lean() returns MongoDB's _id (ObjectId), but domain entities expect id (string)
      const docsWithId = docs.map(doc => ({
        ...doc,
        id: doc._id.toString() // Convert ObjectId to string
      }));

      // 8. Map documents to domain entities
      const items = await Promise.all(
        docsWithId.map(doc => this.documentToEntity(doc as unknown as IUserDocument))
      );

      return ok({
        items,
        total,
        page: options.page,
        limit: options.limit,
        totalPages
      });
    } catch (error: any) {
      console.error('Error finding users for discovery:', error);
      // Return err() to propagate infrastructure errors to use case
      // This allows proper error handling instead of silent failures
      return err(
        DomainError.create(
          'PERSISTENCE_ERROR',
          `Failed to find users for discovery: ${error.message}`
        )
      );
    }
  }

  // =============================================================================
  // 📇 CONTACT MANAGEMENT METHODS (Sprint #12 Module 2)
  // =============================================================================

  /**
   * Agrega un contacto al array contacts del usuario
   * Usa $addToSet para prevenir duplicados (idempotente)
   * Valida que el contacto existe y está activo
   */
  async addContact(userId: UserId, contactUserId: UserId): Promise<Result<void, DomainError>> {
    try {
      // 1. Validar que contactUserId existe y está activo
      const contactUser = await UserModel.findOne({
        _id: contactUserId.getValue(),
        isActive: true
      }).select('_id'); // Solo necesitamos verificar existencia

      if (!contactUser) {
        return err(DomainError.notFound('Contact user not found or inactive'));
      }

      // 2. Agregar contacto usando $addToSet (previene duplicados automáticamente)
      const result = await UserModel.findByIdAndUpdate(
        userId.getValue(),
        {
          $addToSet: {
            contacts: {
              contactUserId: contactUserId.getValue(),
              addedAt: new Date()
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
      return err(DomainError.create('PERSISTENCE_ERROR', `Error adding contact: ${error.message}`));
    }
  }

  /**
   * Remueve un contacto del array contacts usando $pull
   */
  async removeContact(userId: UserId, contactUserId: UserId): Promise<Result<void, DomainError>> {
    try {
      const result = await UserModel.findByIdAndUpdate(
        userId.getValue(),
        {
          $pull: {
            contacts: { contactUserId: contactUserId.getValue() }
          }
        },
        { new: true }
      );

      if (!result) {
        return err(DomainError.notFound(`User with ID ${userId.getValue()} not found`));
      }

      return ok(undefined);
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error removing contact: ${error.message}`));
    }
  }

  /**
   * Obtiene los contactos de un usuario con sus entidades completas
   * Filtra solo usuarios activos
   */
  async getContacts(userId: UserId): Promise<Result<User[], DomainError>> {
    try {
      // 1. Obtener usuario con su array de contactos
      const userDoc = await UserModel.findById(userId.getValue()).select('contacts');

      if (!userDoc) {
        return err(DomainError.notFound(`User with ID ${userId.getValue()} not found`));
      }

      // 2. Si no tiene contactos, retornar array vacío
      if (!userDoc.contacts || userDoc.contacts.length === 0) {
        return ok([]);
      }

      // 3. Extraer IDs de contactos del array
      const contactIds = userDoc.contacts.map(c => c.contactUserId);

      // 4. Buscar usuarios que son contactos (solo activos)
      const contactDocs = await UserModel.find({
        _id: { $in: contactIds },
        isActive: true // Filtrar solo usuarios activos
      }).lean();

      // 5. Transform _id to id (required by documentToEntity)
      const docsWithId = contactDocs.map(doc => ({
        ...doc,
        id: doc._id.toString()
      }));

      // 6. Mapear documentos a entidades de dominio
      const contacts = await Promise.all(
        docsWithId.map(doc => this.documentToEntity(doc as unknown as IUserDocument))
      );

      return ok(contacts);
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error getting contacts: ${error.message}`));
    }
  }

  /**
   * Verifica si contactUserId está en el array contacts de userId
   */
  async isContact(userId: UserId, contactUserId: UserId): Promise<boolean> {
    try {
      const user = await UserModel.findOne({
        _id: userId.getValue(),
        'contacts.contactUserId': contactUserId.getValue()
      }).select('_id');

      return !!user; // true si encontró el documento, false si null
    } catch (error: any) {
      console.error('Error checking if is contact:', error);
      return false; // En caso de error, asumir que no es contacto (fail-safe)
    }
  }

  // =============================================================================
  // 📊 USER STATISTICS METHODS (Sprint #12 - User Stats Feature)
  // =============================================================================

  /**
   * Obtiene el total de usuarios registrados en el sistema
   * Retorna breakdown interno con conteos por tipo
   * 
   * NO aplica filtros: Cuenta TODOS los usuarios en la collection (Client, Provider, Admin, etc.)
   * El use case decide qué información exponer al controller
   * 
   * Performance: Usa $facet para ejecutar múltiples aggregations en 1 query
   */
  async getTotalRegisteredUsers(): Promise<Result<{
    totalUsers: number;
    breakdown: {
      clients: number;
      providers: number;
    };
  }, DomainError>> {
    try {
      // Agregación eficiente con $facet para contar en 1 query
      const result = await UserModel.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            byType: [
              {
                $group: {
                  _id: '$profile.type',
                  count: { $sum: 1 }
                }
              }
            ]
          }
        }
      ]);

      // Extraer conteos
      const totalUsers = result[0]?.total[0]?.count || 0;
      const byTypeArray = result[0]?.byType || [];

      // Mapear conteos por tipo
      const clientsCount = byTypeArray.find((item: any) => item._id === 'CLIENT')?.count || 0;
      const providersCount = byTypeArray.find((item: any) => item._id === 'PROVIDER')?.count || 0;

      return ok({
        totalUsers,
        breakdown: {
          clients: clientsCount,
          providers: providersCount
        }
      });
    } catch (error: any) {
      return err(
        DomainError.create(
          'PERSISTENCE_ERROR',
          `Error getting total registered users: ${error.message}`
        )
      );
    }
  }
}