import { UserId, type IUserPublicProfile, ClientUser, ProviderUser } from '@packages/domain';
import { UserRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import type { DiscoverUsersQuery, PaginatedUsers } from '@packages/contracts';

/**
 * Use Case: Discover Users
 * 
 * Responsabilidades:
 * 1. Validar formato de userId del usuario logueado
 * 2. Aplicar filtros de búsqueda y paginación
 * 3. Mapear entidades User completas → IUserPublicProfile (sanitizar datos sensibles)
 * 4. Retornar perfiles públicos con metadata de paginación
 * 
 * Filtros soportados:
 * - searchTerm: Búsqueda case-insensitive en profile.companyName
 * - type: Filtrar por CLIENT o PROVIDER
 * - page: Página actual (default: 1)
 * - limit: Cantidad por página (default: 20, max: 50)
 * 
 * IMPORTANTE: El usuario logueado NUNCA aparece en sus propios resultados
 * 
 * Sprint #12 - User Communication System - Module 1
 */
export class DiscoverUsersUseCase {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Ejecuta el caso de uso de descubrimiento de usuarios
   * 
   * SSOT: Retorna PaginatedUsers (definido en contracts)
   * Si mañana cambia la estructura, TypeScript falla en compilación
   * 
   * @param loggedUserId - ID del usuario logueado (se excluye de resultados)
   * @param filters - Filtros y opciones de paginación (validados por Zod)
   * @returns Promise con PaginatedUsers (type-safe, SSOT)
   * @throws Error si userId inválido
   */
  async execute(
    loggedUserId: string,
    filters: DiscoverUsersQuery
  ): Promise<PaginatedUsers> {
    logger.info({ 
      loggedUserId,
      filters 
    }, 'Discovering users');

    try {
      // 1. Validar formato de userId del usuario logueado
      const userIdResult = UserId.create(loggedUserId);
      if (!userIdResult.success) {
        throw new Error(`Invalid user ID format: ${userIdResult.error.message}`);
      }

      // 2. Buscar usuarios desde repositorio con filtros y exclusión del usuario logueado
      const result = await this.userRepository.findForDiscovery(
        userIdResult.data,
        {
          page: filters.page,
          limit: filters.limit,
          searchTerm: filters.searchTerm,
          type: filters.type
        }
      );

      // 3. Mapear entidades User → IUserPublicProfile (sanitizar datos sensibles)
      const profiles = result.items.map(user => 
        this.mapToPublicProfile(user as ClientUser | ProviderUser)
      );

      logger.info({ 
        loggedUserId,
        totalUsers: result.total,
        returnedCount: profiles.length,
        page: result.page,
        searchTerm: filters.searchTerm,
        typeFilter: filters.type
      }, 'Users discovered successfully');

      return {
        profiles,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      };
    } catch (error: any) {
      logger.error({ 
        error: error.message,
        loggedUserId,
        filters 
      }, 'Error discovering users');
      throw error;
    }
  }

  /**
   * Mapea una entidad User a IUserPublicProfile
   * Extrae solo campos públicos, excluye datos sensibles
   * 
   * EXCLUIDO: email, phone, passwordHash, subscription, notifications
   * INCLUIDO: id, companyName, type, serviceAreas (providers), isVerified (providers)
   * 
   * @private
   */
  private mapToPublicProfile(user: ClientUser | ProviderUser): IUserPublicProfile {
    const baseProfile: IUserPublicProfile = {
      id: user.id.getValue(),
      profile: {
        companyName: user.profile.companyName
      },
      type: user.type
    };

    // Provider-specific fields (opcionales)
    if (user instanceof ProviderUser) {
      return {
        ...baseProfile,
        serviceAreas: user.specialties, // Map specialties to serviceAreas for public API
        isVerified: user.isVerified
      };
    }

    // ClientUser: solo campos base
    return baseProfile;

    // TODO: Campos estratégicos para futuro
    // if (user instanceof ClientUser) {
    //   return {
    //     ...baseProfile,
    //     machineCount: user.machineCount // Mostrar experiencia del cliente
    //   };
    // }
  }
}
