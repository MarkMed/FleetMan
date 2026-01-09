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

  // TODO: Métodos estratégicos a considerar:
  // findByCompanyName(name: string): Promise<User[]>; // Para buscar por empresa
  // findBySubscriptionLevel(level: string): Promise<User[]>; // Para ClientUser
  // findVerifiedProviders(): Promise<User[]>; // Para ProviderUser
  // updateLastLoginAt(id: UserId, date: Date): Promise<void>; // Para tracking
  // findByServiceArea(serviceArea: string): Promise<User[]>; // Para búsquedas por especialidad
  // findNearby(location: {lat: number, lng: number}, radiusKm: number): Promise<User[]>; // Para búsquedas geográficas
}