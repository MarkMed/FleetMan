import { type IUserRepository, UserId } from '@packages/domain';
import { logger } from '../../config/logger.config';

/**
 * Use Case: Remove Contact (Sprint #12 Module 2 - Contact Management)
 * 
 * Permite que un usuario remueva a otro usuario de su lista de contactos
 * 
 * Reglas de negocio:
 * - Relación unidireccional: solo afecta la lista de userId
 * - Idempotente: si no es contacto, no falla (repositorio usa $pull)
 * - No requiere que el contacto exista o esté activo (puede remover usuarios desactivados)
 * 
 * @example
 * const useCase = new RemoveContactUseCase(userRepository);
 * await useCase.execute('user_abc123', 'user_def456');
 */
export class RemoveContactUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Ejecuta el caso de uso de remover contacto
   * @param userId - ID del usuario que remueve el contacto (autenticado)
   * @param contactUserId - ID del usuario a remover de contactos
   * @throws Error si validaciones fallan o hay error de persistencia
   */
  async execute(userId: string, contactUserId: string): Promise<void> {
    logger.info({ userId, contactUserId }, 'Removing contact');

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

      // 2. Remover contacto en repositorio
      // removeContact() es idempotente (no falla si no existe)
      const result = await this.userRepository.removeContact(
        userIdResult.data,
        contactUserIdResult.data
      );

      // 3. Manejar errores de infraestructura
      if (!result.success) {
        logger.error({ userId, contactUserId, error: result.error.message }, 'Repository error removing contact');
        throw new Error(result.error.message);
      }

      logger.info({ userId, contactUserId }, 'Contact removed successfully');
    } catch (error: any) {
      logger.error({ error: error.message, userId, contactUserId }, 'Error removing contact');
      throw error;
    }
  }
}
