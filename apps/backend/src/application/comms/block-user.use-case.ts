import { 
  UserId, 
  Result, 
  DomainError,
  ok,
  err
} from '@packages/domain';
import { UserRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';

/**
 * Use Case: Block User (Sprint #13 Task 9.3f - Chat Access Control)
 * 
 * Responsabilidades:
 * 1. Validar formato de userId autenticado y userIdToBlock
 * 2. Verificar que ambos usuarios existen y están activos
 * 3. Validar que userIdToBlock NO sea el usuario autenticado (no auto-bloqueo)
 * 4. Agregar userIdToBlock a usersBlackList Y remover de acceptedChatsFrom (operación atómica)
 * 5. Persistir cambios en base de datos (idempotente con $addToSet + $pull)
 * 
 * Reglas de negocio:
 * - Usuario NO puede bloquearse a sí mismo
 * - Operación idempotente: OK si ya está bloqueado (no error)
 * - Whitelist (acceptedChatsFrom) y blacklist (usersBlackList) son mutuamente excluyentes
 * - Bloquear remueve automáticamente de acceptedChatsFrom si existía
 * - Bloquear NO elimina contacto existente (solo previene mensajería)
 * 
 * Flujo UX:
 * - Usuario B recibe mensaje no deseado de Usuario A
 * - Usuario B ve banner "Primera conversación con A. ¿Bloquear?"
 * - Usuario B click "Bloquear Usuario" → ejecuta este use case
 * - Usuario A NO puede enviar más mensajes a Usuario B (403 Forbidden)
 * 
 * Nota: Usuario B aún puede ver historial antiguo con Usuario A
 * 
 * @example
 * const useCase = new BlockUserUseCase();
 * const result = await useCase.execute(
 *   'user_authenticated123', // userId del JWT
 *   'user_spam456'          // userIdToBlock del usuario spam/no deseado
 * );
 */
export class BlockUserUseCase {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Ejecuta el caso de uso de bloquear usuario
   * 
   * @param userId - ID del usuario autenticado (del JWT)
   * @param userIdToBlock - ID del usuario a bloquear
   * @returns Result con void si exitoso, DomainError si falla validación
   */
  async execute(
    userId: string,
    userIdToBlock: string
  ): Promise<Result<void, DomainError>> {
    logger.info({ 
      userId, 
      userIdToBlock
    }, 'Blocking user');

    try {
      // =================================================================
      // 1. VALIDAR FORMATO DE IDs
      // =================================================================
      const userIdResult = UserId.create(userId);
      if (!userIdResult.success) {
        logger.warn({ 
          userId, 
          error: userIdResult.error.message 
        }, 'Invalid user ID format');
        return err(DomainError.create('INVALID_INPUT', `Invalid user ID: ${userIdResult.error.message}`));
      }

      const userIdToBlockResult = UserId.create(userIdToBlock);
      if (!userIdToBlockResult.success) {
        logger.warn({ 
          userIdToBlock, 
          error: userIdToBlockResult.error.message 
        }, 'Invalid userIdToBlock format');
        return err(DomainError.create('INVALID_INPUT', `Invalid userIdToBlock: ${userIdToBlockResult.error.message}`));
      }

      // =================================================================
      // 2. VERIFICAR QUE AMBOS USUARIOS EXISTEN Y ESTÁN ACTIVOS
      // =================================================================
      // Verificar usuario autenticado existe
      const userResult = await this.userRepository.findById(userIdResult.data);
      if (!userResult.success) {
        logger.warn({ 
          userId, 
          error: userResult.error.message 
        }, 'Authenticated user not found');
        return err(DomainError.notFound('User not found'));
      }

      // Verificar usuario está activo
      if (!userResult.data.isActive) {
        logger.warn({ userId }, 'User is not active');
        return err(DomainError.create('INVALID_STATE', 'User is not active'));
      }

      // Verificar userToBlock existe
      const userToBlockResult = await this.userRepository.findById(userIdToBlockResult.data);
      if (!userToBlockResult.success) {
        logger.warn({ 
          userIdToBlock, 
          error: userToBlockResult.error.message 
        }, 'User to block not found');
        return err(DomainError.notFound('User to block not found'));
      }

      // Verificar userToBlock está activo
      if (!userToBlockResult.data.isActive) {
        logger.warn({ userIdToBlock }, 'User to block is not active');
        return err(DomainError.create('INVALID_STATE', 'User to block is not active'));
      }

      // =================================================================
      // 3. VALIDAR REGLAS DE DOMINIO (LÓGICA EN ENTIDAD USER)
      // =================================================================
      // User.blockUser() valida:
      // - No bloquear a uno mismo
      // - No duplicar si ya está bloqueado (idempotente)
      // - Remover de acceptedChatsFrom si existe (mutua exclusión)
      const blockResult = userResult.data.blockUser(userIdToBlockResult.data);
      if (!blockResult.success) {
        logger.warn({ 
          userId, 
          userIdToBlock,
          error: blockResult.error.message 
        }, 'Failed to block user (domain validation)');
        return err(blockResult.error);
      }

      // =================================================================
      // 4. PERSISTIR CAMBIOS EN BASE DE DATOS
      // =================================================================
      // UserRepository.blockUser() usa $addToSet + $pull (operación atómica)
      const saveResult = await this.userRepository.blockUser(
        userIdResult.data,
        userIdToBlockResult.data
      );

      if (!saveResult.success) {
        logger.error({ 
          userId, 
          userIdToBlock,
          error: saveResult.error.message 
        }, 'Failed to persist block user');
        return err(saveResult.error);
      }

      logger.info({ 
        userId, 
        userIdToBlock 
      }, 'User blocked successfully');

      return ok(undefined);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ 
        userId,
        userIdToBlock,
        error: errorMessage
      }, 'Unexpected error blocking user');
      return err(DomainError.create('INTERNAL_ERROR', 'Failed to block user'));
    }
  }

  // =============================================================================
  // 🔮 POST-MVP: FEATURES ESTRATÉGICOS (COMENTADOS)
  // =============================================================================

  /**
   * TODO: Agregar audit log de bloqueos
   * Registrar cuándo y por qué se bloqueó un usuario para moderación/compliance
   * 
   * @example
   * await this.auditService.logUserBlocked({
   *   userId,
   *   blockedUserId: userIdToBlock,
   *   blockedAt: new Date(),
   *   reason: 'user_action', // 'user_action' | 'spam_report' | 'admin_action'
   *   context: { lastMessageId, reportedCount }
   * });
   */

  /**
   * TODO: Eliminar mensajes no leídos del usuario bloqueado
   * Opción configurable: limpiar bandeja de mensajes del bloqueado
   * 
   * @example
   * if (config.AUTO_DELETE_MESSAGES_ON_BLOCK) {
   *   await this.messageRepository.deleteUnreadMessages({
   *     recipientId: userId,
   *     senderId: userIdToBlock
   *   });
   * }
   */

  /**
   * TODO: Notificar a moderadores si usuario recibe muchos bloqueos
   * Sistema anti-spam: detectar patrones de comportamiento problemático
   * 
   * @example
   * const blockCount = await this.userRepository.countBlocksByUser(userIdToBlock);
   * if (blockCount >= SPAM_THRESHOLD) {
   *   await this.moderationService.flagForReview({
   *     userId: userIdToBlock,
   *     reason: 'HIGH_BLOCK_COUNT',
   *     blockCount
   *   });
   * }
   */

  /**
   * TODO: Auto-remover de contactos al bloquear
   * Opción configurable: bloquear también remueve de lista de contactos
   * 
   * @example
   * if (config.AUTO_REMOVE_CONTACT_ON_BLOCK) {
   *   const isContact = await this.userRepository.isContact(userId, userIdToBlock);
   *   if (isContact) {
   *     await this.userRepository.removeContact(userId, userIdToBlock);
   *   }
   * }
   */

  /**
   * TODO: Reportar razón de bloqueo
   * UX mejorada: permitir seleccionar categoría (spam, ofensivo, otro)
   * 
   * @example
   * interface BlockUserRequest {
   *   userIdToBlock: string;
   *   reason?: 'spam' | 'offensive' | 'unwanted' | 'other';
   *   details?: string;
   * }
   */
}
