import { Result } from '../errors';
import { User } from '../entities/user';
import { UserId } from '../value-objects/user-id.vo';
import { DomainError } from '../errors';

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

  // TODO: Métodos estratégicos a considerar:
  // findByCompanyName(name: string): Promise<User[]>; // Para buscar por empresa
  // findBySubscriptionLevel(level: string): Promise<User[]>; // Para ClientUser
  // findVerifiedProviders(): Promise<User[]>; // Para ProviderUser
  // updateLastLoginAt(id: UserId, date: Date): Promise<void>; // Para tracking
}