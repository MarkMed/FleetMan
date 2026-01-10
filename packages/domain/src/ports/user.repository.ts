import { Result } from '../errors';
import { User } from '../entities/user';
import { UserId } from '../value-objects/user-id.vo';
import { DomainError } from '../errors';
import type { NotificationType, NotificationSourceType } from '../enums/NotificationEnums';
import type { INotification } from '../models/interfaces';

/**
 * Result type for getUserNotifications method (DRY/SSOT)
 * Uses INotification interface directly to avoid field-by-field duplication
 */
export interface IGetNotificationsResult {
  notifications: INotification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Puerto (interface) para persistencia de User
 * Será implementado en packages/persistence
 */
export interface IUserRepository {
  /**
   * Busca un usuario por su ID
   */
  findById(id: UserId): Promise<Result<User, DomainError>>;

  /**
   * Busca un usuario por email (único)
   */
  findByEmail(email: string): Promise<Result<User, DomainError>>;

  /**
   * Verifica si existe un email específico
   * Útil para validar unicidad antes de crear
   */
  emailExists(email: string): Promise<boolean>;

  /**
   * Verifica si existe un email excluyendo un ID
   * Útil para validar unicidad al actualizar
   */
  emailExistsExcluding(email: string, excludeId: UserId): Promise<boolean>;

  /**
   * Obtiene todos los usuarios activos
   */
  findAllActive(): Promise<User[]>;

  /**
   * Busca usuarios por tipo (CLIENT/PROVIDER)
   */
  findByType(type: 'CLIENT' | 'PROVIDER'): Promise<User[]>;

  /**
   * Guarda un usuario (crear o actualizar)
   */
  save(user: User): Promise<Result<void, DomainError>>;

  /**
   * Elimina físicamente un usuario
   * CUIDADO: Solo usar con validación previa
   */
  delete(id: UserId): Promise<Result<void, DomainError>>;

  /**
   * Búsqueda paginada con filtros
   */
  findPaginated(options: {
    page: number;
    limit: number;
    filter?: {
      type?: 'CLIENT' | 'PROVIDER';
      isActive?: boolean;
      searchTerm?: string; // Busca en email y profile.companyName
    };
    sortBy?: 'email' | 'createdAt' | 'type';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    items: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  // =============================================================================
  // 🔔 NOTIFICATION METHODS (Sprint #9)
  // =============================================================================

  /**
   * Agrega una notificación al array de notificaciones del usuario
   * @param userId - ID del usuario
   * @param notification - Datos de la notificación a crear
   */
  addNotification(userId: UserId, notification: {
    notificationType: NotificationType;
    message: string;
    actionUrl?: string;
    sourceType?: NotificationSourceType;
    metadata?: Record<string, any>;
  }): Promise<Result<void, DomainError>>;

  /**
   * Obtiene las notificaciones del usuario con filtros y paginación
   * @param userId - ID del usuario
   * @param filters - Filtros y opciones de paginación
   */
  getUserNotifications(userId: UserId, filters: {
    onlyUnread?: boolean;
    page: number;
    limit: number;
  }): Promise<Result<IGetNotificationsResult, DomainError>>;

  /**
   * Marca notificaciones como vistas
   * @param userId - ID del usuario (para validar ownership)
   * @param notificationIds - Array de IDs de notificaciones a marcar
   */
  markNotificationsAsSeen(userId: UserId, notificationIds: string[]): Promise<Result<void, DomainError>>;

  /**
   * Cuenta las notificaciones no vistas del usuario (para badge)
   * @param userId - ID del usuario
   */
  countUnreadNotifications(userId: UserId): Promise<Result<number, DomainError>>;

  // =============================================================================
  // 👥 USER DISCOVERY METHODS (Sprint #12 - Module 1)
  // =============================================================================

  /**
   * Busca usuarios para descubrimiento (User Discovery)
   * Retorna usuarios activos excluyendo al usuario logueado
   * Soporta búsqueda por nombre de empresa y filtro por tipo
   * @param excludeUserId - ID del usuario logueado (se excluye de resultados)
   * @param options - Filtros y paginación
   * @returns Result<data, DomainError> - Success con datos paginados o Fail con error de infraestructura
   */
  findForDiscovery(excludeUserId: UserId, options: {
    page: number;
    limit: number;
    searchTerm?: string; // Busca en profile.companyName
    type?: 'CLIENT' | 'PROVIDER';
  }): Promise<Result<{
    items: User[]; // Entidades completas (el use case mapea a IUserPublicProfile)
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }, DomainError>>;

  // =============================================================================
  // 📊 USER STATISTICS METHODS (Sprint #12 - User Stats Feature)
  // =============================================================================

  /**
   * Obtiene el total de usuarios registrados en el sistema
   * Retorna breakdown interno con conteos por tipo (CLIENT, PROVIDER, etc.)
   * que el use case puede usar para decisiones internas
   * 
   * @returns Result<TotalUsersStats, DomainError> - Success con estadísticas completas o Fail con error
   * 
   * Purpose: Feature estratégica para transparencia del ecosistema y estimular networking
   * Snowball effect: Mostrar cantidad total hookea a más usuarios y estimula negocios internos
   */
  getTotalRegisteredUsers(): Promise<Result<{
    totalUsers: number; // Total absoluto de usuarios en la collection (sin filtros)
    breakdown: {
      clients: number; // Usuarios tipo CLIENT
      providers: number; // Usuarios tipo PROVIDER
      // Extensible: admins, iaAgents, etc. (futuro)
    };
  }, DomainError>>;

  // TODO: Métodos estratégicos a considerar:
  // findByCompanyName(name: string): Promise<User[]>; // Para buscar por empresa
  // findBySubscriptionLevel(level: string): Promise<User[]>; // Para ClientUser
  // findVerifiedProviders(): Promise<User[]>; // Para ProviderUser
  // updateLastLoginAt(id: UserId, date: Date): Promise<void>; // Para tracking
  // findByServiceArea(serviceArea: string): Promise<User[]>; // Para búsquedas por especialidad
  // getTotalActiveUsers(days: number): Promise<Result<number, DomainError>>; // Activos últimos N días (KPI)
  // getTotalUsersByRegion(region: string): Promise<Result<number, DomainError>>; // Filtrar por geografía
  // getUserGrowthStats(period: '7d' | '30d' | '90d'): Promise<Result<GrowthStats, DomainError>>; // Crecimiento temporal
  // findNearby(location: {lat: number, lng: number}, radiusKm: number): Promise<User[]>; // Para búsquedas geográficas

  // =============================================================================
  // 📇 CONTACT MANAGEMENT METHODS (Sprint #12 - Module 2)
  // =============================================================================

  /**
   * Agrega un contacto al array de contactos del usuario
   * Relación unidireccional: userId agrega a contactUserId (no viceversa)
   * Idempotente: no duplica si ya existe (usa $addToSet)
   * @param userId - ID del usuario que agrega el contacto
   * @param contactUserId - ID del usuario a agregar como contacto
   * @returns Result<void, DomainError> - Success si se agregó o ya existía, Fail si error
   */
  addContact(userId: UserId, contactUserId: UserId): Promise<Result<void, DomainError>>;

  /**
   * Remueve un contacto del array de contactos del usuario
   * @param userId - ID del usuario que remueve el contacto
   * @param contactUserId - ID del usuario a remover de contactos
   * @returns Result<void, DomainError> - Success si se removió (o no existía), Fail si error
   */
  removeContact(userId: UserId, contactUserId: UserId): Promise<Result<void, DomainError>>;

  /**
   * Obtiene los contactos de un usuario con sus perfiles completos
   * Filtra solo usuarios activos (isActive: true)
   * @param userId - ID del usuario del que se obtienen contactos
   * @returns Result<User[], DomainError> - Lista de usuarios que son contactos (entidades completas)
   */
  getContacts(userId: UserId): Promise<Result<User[], DomainError>>;

  /**
   * Verifica si un usuario ya es contacto de otro
   * Útil para evitar duplicados y validaciones en use cases
   * @param userId - ID del usuario dueño de la lista de contactos
   * @param contactUserId - ID del usuario a verificar si es contacto
   * @returns boolean - true si contactUserId está en contacts de userId
   */
  isContact(userId: UserId, contactUserId: UserId): Promise<boolean>;

  // TODO: Métodos estratégicos para futuro (Contact Management avanzado)
  // getContactsByTag(userId: UserId, tag: string): Promise<Result<User[], DomainError>>; // Filtrar por tags
  // getFavoriteContacts(userId: UserId): Promise<Result<User[], DomainError>>; // Solo favoritos
  // searchContactsByName(userId: UserId, searchTerm: string): Promise<Result<User[], DomainError>>; // Buscar en agenda
  // updateContactNickname(userId: UserId, contactUserId: UserId, nickname: string): Promise<Result<void, DomainError>>; // Personalizar
  // getContactsAddedSince(userId: UserId, date: Date): Promise<Result<User[], DomainError>>; // Contactos recientes
}