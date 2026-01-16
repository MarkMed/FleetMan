import { 
  UserId, 
  Message, 
  Result, 
  DomainError,
  ok,
  err,
  type IMessage,
  NOTIFICATION_SOURCE_TYPES
} from '@packages/domain';
import { MessageRepository, UserRepository } from '@packages/persistence';
import { AddNotificationUseCase } from '../notifications/add-notification.use-case';
import { logger } from '../../config/logger.config';
import type { SendMessageRequest } from '@packages/contracts';

/**
 * Use Case: Send Message (Sprint #12 Module 3 - Messaging System)
 * Sprint #13 Task 9.3f-h: Chat Access Control integration
 * 
 * Responsabilidades:
 * 1. Validar formato de senderId y recipientId
 * 2. Verificar que ambos usuarios existen y están activos
 * 3. Validar permisos de envío: recipientId debe permitir mensajes de senderId
 * 4. Crear entidad Message con validaciones de dominio
 * 5. Persistir mensaje en base de datos
 * 6. Notificar a recipientId por SSE (fire-and-forget)
 * 7. Retornar mensaje guardado al sender
 * 
 * Reglas de negocio (Sprint #13 Task 9.3f-h):
 * - Bloqueo tiene prioridad: Si recipient bloqueó a sender → 403 Forbidden
 * - Permisos de envío (OR lógico):
 *   → recipientId tiene a senderId como contacto (unidireccional)
 *   → recipientId aceptó chat de senderId (acceptedChatsFrom whitelist)
 * - No requiere contacto mutuo: Solo recipient debe permitir sender
 * - No auto-mensajes: senderId ≠ recipientId (validado en Message.create)
 * - Content max 1000 chars (validado en Message.create)
 * - Usuarios deben existir y estar activos
 * 
 * Patrón SSE fire-and-forget:
 * - Mensaje se guarda PRIMERO en DB (crítico)
 * - Notificación SSE se envía DESPUÉS (nice-to-have)
 * - Si SSE falla, mensaje YA está guardado y usuario puede refrescar
 * 
 * @example
 * // Caso 1: Contacto mutuo (ambos se tienen agregados)
 * const result1 = await useCase.execute({ senderId: 'A', recipientId: 'B', content: 'Hola' });
 * 
 * // Caso 2: Contacto unidireccional (B tiene a A, pero A NO tiene a B)
 * const result2 = await useCase.execute({ senderId: 'A', recipientId: 'B', content: 'Hola' });
 * 
 * // Caso 3: No contactos, pero B aceptó chat de A (Sprint #13)
 * // B.acceptedChatsFrom = ['A']
 * const result3 = await useCase.execute({ senderId: 'A', recipientId: 'B', content: 'Hola' });
 */
export class SendMessageUseCase {
  private messageRepository: MessageRepository;
  private userRepository: UserRepository;
  private addNotificationUseCase: AddNotificationUseCase;

  constructor() {
    this.messageRepository = new MessageRepository();
    this.userRepository = new UserRepository();
    this.addNotificationUseCase = new AddNotificationUseCase();
  }

  /**
   * Ejecuta el caso de uso de enviar mensaje
   * 
   * @param input - senderId (JWT), recipientId, content
   * @returns Result con IMessage guardado o error de dominio
   */
  async execute(
    input: SendMessageRequest & { senderId: string }
  ): Promise<Result<IMessage, DomainError>> {
    logger.info({ 
      senderId: input.senderId, 
      recipientId: input.recipientId,
      contentLength: input.content.length
    }, 'Sending message');

    try {
      // =================================================================
      // 1. VALIDAR FORMATO DE IDs
      // =================================================================
      const senderIdResult = UserId.create(input.senderId);
      if (!senderIdResult.success) {
        logger.warn({ 
          senderId: input.senderId, 
          error: senderIdResult.error.message 
        }, 'Invalid sender ID format');
        return err(DomainError.create('INVALID_INPUT', `Invalid sender ID: ${senderIdResult.error.message}`));
      }

      const recipientIdResult = UserId.create(input.recipientId);
      if (!recipientIdResult.success) {
        logger.warn({ 
          recipientId: input.recipientId, 
          error: recipientIdResult.error.message 
        }, 'Invalid recipient ID format');
        return err(DomainError.create('INVALID_INPUT', `Invalid recipient ID: ${recipientIdResult.error.message}`));
      }

      // =================================================================
      // 2. VERIFICAR QUE AMBOS USUARIOS EXISTEN Y ESTÁN ACTIVOS
      // =================================================================
      // Verificar sender existe
      const senderResult = await this.userRepository.findById(senderIdResult.data);
      if (!senderResult.success) {
        logger.warn({ 
          senderId: input.senderId, 
          error: senderResult.error.message 
        }, 'Sender user not found');
        return err(DomainError.notFound('Sender user not found'));
      }

      // Verificar sender está activo
      if (!senderResult.data.isActive) {
        logger.warn({ senderId: input.senderId }, 'Sender user is not active');
        return err(DomainError.create('INVALID_STATE', 'Sender user is not active'));
      }

      // Verificar recipient existe
      const recipientResult = await this.userRepository.findById(recipientIdResult.data);
      if (!recipientResult.success) {
        logger.warn({ 
          recipientId: input.recipientId, 
          error: recipientResult.error.message 
        }, 'Recipient user not found');
        return err(DomainError.notFound('Recipient user not found'));
      }

      // Verificar recipient está activo
      if (!recipientResult.data.isActive) {
        logger.warn({ recipientId: input.recipientId }, 'Recipient user is not active');
        return err(DomainError.create('INVALID_STATE', 'Recipient user is not active'));
      }

      // =================================================================
      // 3. VALIDAR PERMISOS DE ENVÍO (Sprint #13 Task 9.3f-h)
      // =================================================================
      /**
       * LÓGICA DE PERMISOS PARA ENVIAR MENSAJE:
       * 
       * 1. BLOCKER (prioridad absoluta):
       *    - Si recipient bloqueó a sender → 403 Forbidden
       *    - Bloqueo prevalece sobre contactos y chats aceptados
       * 
       * 2. PERMISOS DE ENVÍO (OR lógico):
       *    - senderId tiene a recipientId como contacto (unidireccional sender → recipient) [LÓGICA ORIGINAL]
       *    - senderId aceptó chat de recipientId (whitelist acceptedChatsFrom) [SPRINT #13 NUEVA - permite responder]
       * 
       * Escenarios permitidos:
       * - Caso A: A tiene a B como contacto → A puede enviar mensaje a B [✔️ Lógica original]
       * - Caso B: B aceptó chat de A (Sprint #13) → B puede responder a A [✔️ Nueva funcionalidad]
       * - Caso C: A tiene a B como contacto Y A aceptó chat de B → A puede enviar (redundante pero válido)
       * 
       * Escenarios bloqueados:
       * - A NO tiene a B como contacto Y NO aceptó chat de B → 403 Forbidden
       * - B bloqueó a A (usersBlackList) → 403 Forbidden (prioridad absoluta)
       */
      
      logger.debug({ 
        senderId: input.senderId, 
        recipientId: input.recipientId 
      }, 'Validating send permissions');

      // 1. Verificar bloqueo (BLOCKER - prioridad absoluta)
      const isBlockedByRecipient = await this.userRepository.isBlocked(
        recipientIdResult.data,
        senderIdResult.data
      );

      if (isBlockedByRecipient) {
        logger.warn({ 
          senderId: input.senderId, 
          recipientId: input.recipientId 
        }, 'Cannot send message: sender is blocked by recipient');
        return err(DomainError.create('FORBIDDEN', 'Cannot send message to user who has blocked you'));
      }

      // 2. Verificar permisos de envío (OR lógico)
      // senderIsContactOfRecipient: sender tiene a recipient como contacto (unidireccional - lógica ORIGINAL)
      const senderIsContactOfRecipient = await this.userRepository.isContact(
        senderIdResult.data,
        recipientIdResult.data
      );

      // senderAcceptedChatFromRecipient: sender aceptó recibir chats de recipient (Sprint #13 whitelist - NUEVA)
      // Esto permite que sender RESPONDA después de aceptar chat
      const senderAcceptedChatFromRecipient = await this.userRepository.hasChatAcceptedFrom(
        senderIdResult.data,
        recipientIdResult.data
      );

      // Evaluar permisos con lógica OR
      const canSendMessage = senderIsContactOfRecipient || senderAcceptedChatFromRecipient;

      if (!canSendMessage) {
        logger.warn({ 
          senderId: input.senderId, 
          recipientId: input.recipientId,
          senderIsContactOfRecipient,
          senderAcceptedChatFromRecipient
        }, 'Cannot send message: sender must have recipient as contact or accept their chat');
        return err(DomainError.create('FORBIDDEN', 'Cannot send message. You must add them as contact or accept their chat.'));
      }

      logger.debug({ 
        senderId: input.senderId, 
        recipientId: input.recipientId,
        senderIsContactOfRecipient,
        senderAcceptedChatFromRecipient,
        canSendMessage: true
      }, 'Send permissions validated successfully');

      // =================================================================
      // 4. CREAR ENTIDAD MESSAGE
      // =================================================================
      // Message.create valida:
      // - Content no vacío, max 1000 chars
      // - senderId ≠ recipientId (no auto-mensajes)
      const messageResult = Message.create({
        senderId: input.senderId,
        recipientId: input.recipientId,
        content: input.content
      });

      if (!messageResult.success) {
        logger.warn({ 
          error: messageResult.error.message 
        }, 'Message entity creation failed');
        return err(messageResult.error);
      }

      // =================================================================
      // 5. PERSISTIR MENSAJE EN BASE DE DATOS
      // =================================================================
      const savedMessageResult = await this.messageRepository.save(messageResult.data);
      if (!savedMessageResult.success) {
        logger.error({ 
          senderId: input.senderId, 
          recipientId: input.recipientId,
          error: savedMessageResult.error.message 
        }, 'Failed to save message to database');
        return err(savedMessageResult.error);
      }

      const savedMessage = savedMessageResult.data;
      logger.info({ 
        messageId: savedMessage.id,
        senderId: input.senderId, 
        recipientId: input.recipientId 
      }, 'Message saved successfully');

      // =================================================================
      // 6. NOTIFICAR POR SSE (FIRE-AND-FORGET)
      // =================================================================
      // Patrón: Mensaje YA está guardado en DB (crítico)
      // SSE es nice-to-have, no debe bloquear flujo principal
      try {
        // Extraer datos del sender para metadata
        const senderPublicData = senderResult.data.toPublicData();
        const senderName = senderPublicData.profile?.companyName || 'Unknown User';

        // Preview truncado del mensaje (primeros 50 caracteres)
        const preview = savedMessage.content.length > 50 
          ? `${savedMessage.content.substring(0, 50)}...` 
          : savedMessage.content;

        await this.addNotificationUseCase.execute(
          input.recipientId,
          {
            notificationType: 'new_message', // Tipo específico para mensajes (lowercase según NOTIFICATION_TYPES)
            message: `New message from ${senderName}`,
            sourceType: NOTIFICATION_SOURCE_TYPES[4], // 'MESSAGING' - usando enum de domain (SSOT)
            metadata: {
              messageId: savedMessage.id,
              senderId: input.senderId,
              senderName: senderName,
              preview: preview,
              sentAt: savedMessage.sentAt.toISOString()
            }
          }
        );

        logger.debug({ 
          messageId: savedMessage.id,
          recipientId: input.recipientId 
        }, 'SSE notification sent for new message');
      } catch (sseError) {
        // SSE failure NO debe romper el flujo principal
        // Mensaje ya está guardado, usuario puede refrescar
        const errorMessage = sseError instanceof Error ? sseError.message : 'Unknown error';
        logger.warn({
          messageId: savedMessage.id,
          error: errorMessage
        }, 'Failed to send SSE notification (message already saved in DB)');
        // NO retornar error - continuar con flujo normal
      }

      // =================================================================
      // 7. RETORNAR MENSAJE GUARDADO
      // =================================================================
      return ok(savedMessage);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ 
        senderId: input.senderId,
        recipientId: input.recipientId,
        error: errorMessage
      }, 'Unexpected error sending message');
      return err(DomainError.create('INTERNAL_ERROR', 'Failed to send message'));
    }
  }

  // =============================================================================
  // 🔮 POST-MVP: FEATURES ESTRATÉGICOS (COMENTADOS)
  // =============================================================================

  /**
   * TODO: Rate Limiting
   * Prevenir spam de mensajes (max N mensajes por hora)
   * 
   * @example
   * const recentMessages = await this.messageRepository.countRecentMessagesBySender(
   *   senderIdResult.data,
   *   60 * 60 * 1000 // Última hora
   * );
   * if (recentMessages >= 50) {
   *   return err(DomainError.create('RATE_LIMIT_EXCEEDED', 'Too many messages sent'));
   * }
   */

  /**
   * TODO: Profanity Filter
   * Filtrar contenido inapropiado antes de guardar
   * 
   * @example
   * const hasProfanity = await this.profanityService.check(input.content);
   * if (hasProfanity) {
   *   return err(DomainError.create('INVALID_CONTENT', 'Message contains inappropriate content'));
   * }
   */

  /**
   * TODO: Attachment Support
   * Permitir enviar imágenes/documentos adjuntos
   * 
   * @example
   * interface SendMessageWithAttachmentsInput extends SendMessageRequest {
   *   attachmentUrls?: string[]; // URLs a archivos en Cloudinary
   * }
   */

  /**
   * TODO: Thread/Reply Support
   * Habilitar respuestas a mensajes específicos
   * 
   * @example
   * interface SendReplyInput extends SendMessageRequest {
   *   parentMessageId: string; // ID del mensaje al que responde
   * }
   */
}
