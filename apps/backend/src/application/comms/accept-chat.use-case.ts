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
 * Use Case: Accept Chat (Sprint #13 Task 9.3f - Chat Access Control)
 * 
 * Responsabilidades:
 * 1. Validar formato de userId autenticado y fromUserId
 * 2. Verificar que ambos usuarios existen y están activos
 * 3. Validar que fromUserId NO esté en blacklist (mutuamente excluyente)
 * 4. Agregar fromUserId a acceptedChatsFrom del usuario autenticado
 * 5. Persistir cambios en base de datos (idempotente con $addToSet)
 * 
 * Reglas de negocio:
 * - Usuario NO puede aceptar chats de sí mismo
 * - Usuario NO puede aceptar chats de usuario bloqueado (usar unblock primero)
 * - Operación idempotente: OK si ya está aceptado (no error)
 * - Whitelist (acceptedChatsFrom) y blacklist (usersBlackList) son mutuamente excluyentes
 * 
 * Flujo UX:
 * - Usuario B recibe mensaje de Usuario A (no es contacto)
 * - Usuario B ve banner "Primera conversación con A. ¿Aceptar chat?"
 * - Usuario B click "Aceptar Chat" → ejecuta este use case
 * - Usuario B ahora puede ver conversación y enviar mensajes a A
 * 
 * @example
 * const useCase = new AcceptChatUseCase();
 * const result = await useCase.execute(
 *   'user_authenticated123', // userId del JWT
 *   'user_sender456'         // fromUserId del sender que envió el mensaje
 * );
 */
export class AcceptChatUseCase {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Ejecuta el caso de uso de aceptar chat
   * 
   * @param userId - ID del usuario autenticado (del JWT)
   * @param fromUserId - ID del usuario del cual se aceptan chats
   * @returns Result con void si exitoso, DomainError si falla validación
   */
  async execute(
    userId: string,
    fromUserId: string
  ): Promise<Result<void, DomainError>> {
    logger.info({ 
      userId, 
      fromUserId
    }, 'Accepting chat from user');

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

      const fromUserIdResult = UserId.create(fromUserId);
      if (!fromUserIdResult.success) {
        logger.warn({ 
          fromUserId, 
          error: fromUserIdResult.error.message 
        }, 'Invalid fromUser ID format');
        return err(DomainError.create('INVALID_INPUT', `Invalid fromUser ID: ${fromUserIdResult.error.message}`));
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

      // Verificar fromUser existe
      const fromUserResult = await this.userRepository.findById(fromUserIdResult.data);
      if (!fromUserResult.success) {
        logger.warn({ 
          fromUserId, 
          error: fromUserResult.error.message 
        }, 'FromUser not found');
        return err(DomainError.notFound('FromUser not found'));
      }

      // Verificar fromUser está activo
      if (!fromUserResult.data.isActive) {
        logger.warn({ fromUserId }, 'FromUser is not active');
        return err(DomainError.create('INVALID_STATE', 'FromUser is not active'));
      }

      // =================================================================
      // 3. VALIDAR REGLAS DE DOMINIO (LÓGICA EN ENTIDAD USER)
      // =================================================================
      // User.acceptChatFrom() valida:
      // - No aceptar chats de uno mismo
      // - No aceptar chats de usuario bloqueado (mutuamente excluyente)
      // - No duplicar si ya está aceptado (idempotente)
      const acceptResult = userResult.data.acceptChatFrom(fromUserIdResult.data);
      if (!acceptResult.success) {
        logger.warn({ 
          userId, 
          fromUserId,
          error: acceptResult.error.message 
        }, 'Failed to accept chat (domain validation)');
        return err(acceptResult.error);
      }

      // =================================================================
      // 4. PERSISTIR CAMBIOS EN BASE DE DATOS
      // =================================================================
      // UserRepository.acceptChatFrom() usa $addToSet (idempotente)
      const saveResult = await this.userRepository.acceptChatFrom(
        userIdResult.data,
        fromUserIdResult.data
      );

      if (!saveResult.success) {
        logger.error({ 
          userId, 
          fromUserId,
          error: saveResult.error.message 
        }, 'Failed to persist accept chat');
        return err(saveResult.error);
      }

      logger.info({ 
        userId, 
        fromUserId 
      }, 'Chat accepted successfully');

      return ok(undefined);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ 
        userId,
        fromUserId,
        error: errorMessage
      }, 'Unexpected error accepting chat');
      return err(DomainError.create('INTERNAL_ERROR', 'Failed to accept chat'));
    }
  }

  // =============================================================================
  // 🔮 POST-MVP: FEATURES ESTRATÉGICOS (COMENTADOS)
  // =============================================================================

  /**
   * TODO: Agregar audit log de aceptaciones de chat
   * Registrar cuándo y por qué se aceptó un chat para compliance
   * 
   * @example
   * await this.auditService.logChatAccepted({
   *   userId,
   *   fromUserId,
   *   acceptedAt: new Date(),
   *   reason: 'user_action' // 'user_action' | 'auto_accept_contact' | 'admin_override'
   * });
   */

  /**
   * TODO: Notificar al sender que su chat fue aceptado
   * UX mejorada: "User B ha aceptado tu solicitud de chat"
   * 
   * @example
   * await this.addNotificationUseCase.execute(fromUserId, {
   *   notificationType: 'chat_accepted',
   *   message: `${userDisplayName} ha aceptado tu solicitud de chat`,
   *   sourceType: 'MESSAGING',
   *   actionUrl: `/chat/${userId}`
   * });
   */

  /**
   * TODO: Auto-accept chats de contactos mutuos
   * Si A agrega a B como contacto Y B agrega a A, auto-accept bidireccional
   * 
   * @example
   * const isMutualContact = await this.userRepository.isContact(fromUserId, userId) &&
   *                        await this.userRepository.isContact(userId, fromUserId);
   * if (isMutualContact) {
   *   // Auto-accept ambos lados
   *   await this.userRepository.acceptChatFrom(userIdResult.data, fromUserIdResult.data);
   *   await this.userRepository.acceptChatFrom(fromUserIdResult.data, userIdResult.data);
   * }
   */
}
