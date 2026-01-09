import { type IUserRepository, UserId, type IUserPublicProfile, ClientUser, ProviderUser } from '@packages/domain';
import { logger } from '../../config/logger.config';

/**
 * Use Case: Add Contact (Sprint #12 Module 2 - Contact Management)
 * 
 * Permite que un usuario agregue a otro usuario como contacto en su agenda personal
 * 
 * Reglas de negocio:
 * - Relación unidireccional: userId agrega a contactUserId (no viceversa)
 * - No puede agregarse a sí mismo como contacto
 * - El contacto debe existir y estar activo
 * - Idempotente: si ya es contacto, no falla (repositorio usa $addToSet)
 * - Límite recomendado: 100 contactos por usuario (prevenir abuso y mantener performance)
 * 
 * @example
 * const useCase = new AddContactUseCase(userRepository);
 * await useCase.execute('user_abc123', 'user_def456');
 */
export class AddContactUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Ejecuta el caso de uso de agregar contacto
   * @param userId - ID del usuario que agrega el contacto (autenticado)
   * @param contactUserId - ID del usuario a agregar como contacto
   * @throws Error si validaciones fallan o hay error de persistencia
   */
  async execute(userId: string, contactUserId: string): Promise<void> {
    logger.info({ userId, contactUserId }, 'Adding contact');

    try {
      // 1. Validar formato de IDs
      const userIdResult = UserId.create(userId);
      if (!userIdResult.success) {
        throw new Error(`Invalid user ID format: ${userIdResult.error.message}`);
      }

      const contactUserIdResult = UserId.create(contactUserId);
      if (!contactUserIdResult.success) {
        throw new Error(`Invalid contact user ID format: ${contactUserIdResult.error.message}`);
      }

      // 2. Validar que no intenta agregarse a sí mismo
      if (userId === contactUserId) {
        throw new Error('Cannot add yourself as a contact');
      }

      // 3. Verificar límite de contactos (prevenir abuso y mantener performance)
      // TODO: Implementar si se requiere control estricto
      // const contacts = await this.userRepository.getContacts(userIdResult.data);
      // if (contacts.success && contacts.data.length >= 100) {
      //   throw new Error('Maximum contacts limit reached (100)');
      // }

      // 4. Verificar si ya es contacto (opcional: para logging)
      const isAlreadyContact = await this.userRepository.isContact(
        userIdResult.data,
        contactUserIdResult.data
      );

      if (isAlreadyContact) {
        logger.info({ userId, contactUserId }, 'User is already a contact (idempotent operation)');
      }

      // 5. Agregar contacto en repositorio
      // addContact() valida que contactUserId existe y está activo
      const result = await this.userRepository.addContact(
        userIdResult.data,
        contactUserIdResult.data
      );

      // 6. Manejar errores de infraestructura
      if (!result.success) {
        logger.error({ userId, contactUserId, error: result.error.message }, 'Repository error adding contact');
        throw new Error(result.error.message);
      }

      logger.info({ userId, contactUserId, wasAlreadyContact: isAlreadyContact }, 'Contact added successfully');
    } catch (error: any) {
      logger.error({ error: error.message, userId, contactUserId }, 'Error adding contact');
      throw error;
    }
  }
}
