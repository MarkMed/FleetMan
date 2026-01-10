import { type IUserRepository, UserId, type IUserPublicProfile, ClientUser, ProviderUser } from '@packages/domain';
import { type ListContactsResponse } from '@packages/contracts';
import { logger } from '../../config/logger.config';

/**
 * Use Case: List Contacts (Sprint #12 Module 2 - Contact Management)
 * 
 * Obtiene la lista de contactos de un usuario con sus perfiles públicos
 * 
 * Reglas de negocio:
 * - Solo retorna usuarios activos (isActive: true)
 * - Mapea entidades User → IUserPublicProfile (sanitiza datos sensibles)
 * - Incluye total count para estadísticas/UI
 * 
 * @example
 * const useCase = new ListContactsUseCase(userRepository);
 * const response = await useCase.execute('user_abc123');
 * // response: { contacts: IUserPublicProfile[], total: number }
 */
export class ListContactsUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Ejecuta el caso de uso de listar contactos
   * @param userId - ID del usuario del que se obtienen contactos (autenticado)
   * @returns ListContactsResponse con perfiles públicos y total count
   * @throws Error si validaciones fallan o hay error de persistencia
   */
  async execute(userId: string): Promise<ListContactsResponse> {
    logger.info({ userId }, 'Listing contacts');

    try {
      // 1. Validar formato de userId
      const userIdResult = UserId.create(userId);
      if (!userIdResult.success) {
        throw new Error(`Invalid user ID format: ${userIdResult.error.message}`);
      }

      // 2. Obtener contactos desde repositorio
      const result = await this.userRepository.getContacts(userIdResult.data);

      // 3. Manejar errores de infraestructura
      if (!result.success) {
        logger.error({ userId, error: result.error.message }, 'Repository error getting contacts');
        throw new Error(result.error.message);
      }

      const contactUsers = result.data;

      // 4. Mapear entidades User → IUserPublicProfile (sanitizar datos sensibles)
      // Reutiliza lógica de User Discovery (DRY)
      const contacts = contactUsers.map(user => 
        this.mapToPublicProfile(user as ClientUser | ProviderUser)
      );

      logger.info({ userId, totalContacts: contacts.length }, 'Contacts retrieved successfully');

      return {
        contacts,
        total: contacts.length
      };
    } catch (error: any) {
      logger.error({ error: error.message, userId }, 'Error listing contacts');
      throw error;
    }
  }

  /**
   * Mapea User entity a IUserPublicProfile
   * Extrae solo campos públicos, excluye datos sensibles
   * 
   * Pattern: Same mapping logic as DiscoverUsersUseCase (DRY)
   */
  private mapToPublicProfile(user: ClientUser | ProviderUser): IUserPublicProfile {
    const baseProfile: IUserPublicProfile = {
      id: user.id.getValue(),
      profile: {
        companyName: user.profile.companyName
      },
      type: user.type
    };

    // Provider-specific fields (optional)
    if (user instanceof ProviderUser) {
      return {
        ...baseProfile,
        serviceAreas: user.specialties, // Map specialties to serviceAreas for public API
        isVerified: user.isVerified
      };
    }

    // ClientUser: only base fields
    return baseProfile;
  }
}
