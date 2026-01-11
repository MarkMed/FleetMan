import { 
  UserId, 
  Result, 
  DomainError,
  ok,
  err
} from '@packages/domain';
import { MessageRepository, UserRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import type { ConversationHistoryQuery, ConversationHistoryResponse } from '@packages/contracts';

/**
 * Use Case: Get Conversation History (Sprint #12 Module 3 - Messaging System)
 * 
 * Responsabilidades:
 * 1. Validar formato de userId (autenticado) y otherUserId
 * 2. Verificar que ambos usuarios existen
 * 3. Validar que el usuario autenticado tiene al otro usuario como contacto
 * 4. Obtener historial paginado con query bidireccional (puede ser vacío)
 * 5. Retornar resultado estructurado con metadata de paginación
 * 
 * Reglas de negocio:
 * - Query bidireccional: mensajes donde (A→B) OR (B→A)
 * - Orden: sentAt DESC (más recientes primero)
 * - Paginación obligatoria: min 1 mensaje, max 50 por página
 * - SÍ valida relación de contacto actual antes de mostrar historial
 * - Si no son contactos → 403 Forbidden
 * - Si son contactos pero no tienen mensajes → 200 OK con array vacío
 * 
 * Casos de uso válidos:
 * 1. Usuario A y B son contactos con mensajes previos → Retorna historial
 * 2. Usuario A y B son contactos SIN mensajes previos → Retorna array vacío (OK)
 * 3. Usuario A y B NO son contactos → 403 Forbidden (aunque tuvieran mensajes antiguos)
 * 4. Usuario B no existe → 404 Not Found
 * 
 * @example
 * const useCase = new GetConversationHistoryUseCase();
 * const result = await useCase.execute(
 *   'user_abc123',     // userId autenticado (JWT)
 *   'user_def456',     // otherUserId (debe ser contacto)
 *   { page: 1, limit: 20 }
 * );
 */
export class GetConversationHistoryUseCase {
  private messageRepository: MessageRepository;
  private userRepository: UserRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Ejecuta el caso de uso de obtener historial de conversación
   * 
   * @param userId - ID del usuario autenticado (JWT)
   * @param otherUserId - ID del otro usuario de la conversación
   * @param query - Opciones de paginación (page, limit)
   * @returns Result con historial paginado o error de dominio
   */
  async execute(
    userId: string,
    otherUserId: string,
    query: ConversationHistoryQuery
  ): Promise<Result<ConversationHistoryResponse, DomainError>> {
    logger.info({ 
      userId, 
      otherUserId,
      page: query.page,
      limit: query.limit
    }, 'Getting conversation history');

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

      const otherUserIdResult = UserId.create(otherUserId);
      if (!otherUserIdResult.success) {
        logger.warn({ 
          otherUserId, 
          error: otherUserIdResult.error.message 
        }, 'Invalid other user ID format');
        return err(DomainError.create('INVALID_INPUT', `Invalid other user ID: ${otherUserIdResult.error.message}`));
      }

      // =================================================================
      // 2. VERIFICAR QUE AMBOS USUARIOS EXISTEN
      // =================================================================
      // Verificar usuario autenticado existe
      logger.debug({ userId }, 'Looking up authenticated user');
      const userResult = await this.userRepository.findById(userIdResult.data);
      if (!userResult.success) {
        logger.warn({ 
          userId, 
          error: userResult.error.message 
        }, 'Authenticated user not found');
        return err(DomainError.notFound('User not found'));
      }
      logger.debug({ userId }, 'Authenticated user found');

      // Verificar otro usuario existe
      logger.debug({ otherUserId }, 'Looking up other user');
      const otherUserResult = await this.userRepository.findById(otherUserIdResult.data);
      if (!otherUserResult.success) {
        logger.warn({ 
          otherUserId, 
          error: otherUserResult.error.message 
        }, 'Other user not found');
        return err(DomainError.notFound('Other user not found'));
      }
      logger.debug({ otherUserId }, 'Other user found');

      // =================================================================
      // 3. VALIDAR RELACIÓN DE CONTACTO
      // =================================================================
      // Verificar que el usuario autenticado tiene al otro usuario como contacto
      logger.debug({ userId, otherUserId }, 'Checking contact relationship');
      const isContact = await this.userRepository.isContact(userIdResult.data, otherUserIdResult.data);
      logger.debug({ userId, otherUserId, isContact }, 'Contact relationship check result');
      
      if (!isContact) {
        logger.warn({ 
          userId, 
          otherUserId 
        }, 'User is not your contact');
        return err(DomainError.create('FORBIDDEN', 'User is not your contact'));
      }
      logger.debug({ userId, otherUserId }, 'Contact relationship confirmed');

      // =================================================================
      // 4. VALIDAR LÍMITES DE PAGINACIÓN
      // =================================================================
      // Aplicar límites de seguridad (prevenir queries masivas)
      const page = Math.max(1, query.page); // Min 1 (primera página)
      const limit = Math.min(Math.max(1, query.limit), 50); // Min 1, Max 50

      logger.debug({ 
        requestedPage: query.page,
        requestedLimit: query.limit,
        appliedPage: page,
        appliedLimit: limit
      }, 'Pagination limits applied');

      // =================================================================
      // 5. OBTENER HISTORIAL PAGINADO (QUERY BIDIRECCIONAL)
      // =================================================================
      const historyResult = await this.messageRepository.getConversationHistory(
        userIdResult.data,
        otherUserIdResult.data,
        { page, limit }
      );

      if (!historyResult.success) {
        logger.error({ 
          userId, 
          otherUserId, 
          error: historyResult.error.message 
        }, 'Failed to get conversation history');
        return err(historyResult.error);
      }

      // =================================================================
      // 6. CONSTRUIR RESPUESTA CON METADATA DE PAGINACIÓN
      // =================================================================
      const historyData = historyResult.data;
      const response: ConversationHistoryResponse = {
        messages: historyData.messages,
        total: historyData.total,
        page: historyData.page,
        limit: historyData.limit,
        totalPages: historyData.totalPages
      };

      logger.info({ 
        userId, 
        otherUserId,
        messagesReturned: response.messages.length,
        total: response.total,
        page: response.page,
        totalPages: response.totalPages
      }, 'Conversation history retrieved successfully');

      return ok(response);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ 
        userId,
        otherUserId,
        error: errorMessage
      }, 'Unexpected error getting conversation history');
      return err(DomainError.create('INTERNAL_ERROR', 'Failed to get conversation history'));
    }
  }

  // =============================================================================
  // 🔮 POST-MVP: FEATURES ESTRATÉGICOS (COMENTADOS)
  // =============================================================================

  /**
   * TODO: Validación opcional de contacto actual
   * Permitir restringir historial solo a contactos actuales (configurable)
   * 
   * @example
   * if (requireActiveContact) {
   *   const isContact = await this.userRepository.isContact(
   *     userIdResult.data,
   *     otherUserIdResult.data
   *   );
   *   if (!isContact) {
   *     return err(DomainError.create('NOT_CONTACT', 'Cannot view conversation with non-contact'));
   *   }
   * }
   */

  /**
   * TODO: Filtro por fecha
   * Permitir obtener mensajes de un rango específico
   * 
   * @example
   * interface ConversationHistoryQueryWithDate extends ConversationHistoryQuery {
   *   startDate?: Date;
   *   endDate?: Date;
   * }
   */

  /**
   * TODO: Búsqueda de mensajes
   * Permitir buscar mensajes por contenido dentro de una conversación
   * 
   * @example
   * interface ConversationHistoryQueryWithSearch extends ConversationHistoryQuery {
   *   searchTerm?: string;
   * }
   */

  /**
   * TODO: Cursor-based pagination
   * Reemplazar offset-based pagination con cursor para mejor performance
   * 
   * @example
   * interface CursorPaginationQuery {
   *   cursor?: string; // Último messageId visto
   *   limit: number;
   * }
   */

  /**
   * TODO: Metadata de otros participantes
   * Incluir info del otro usuario para mostrar en UI (nombre, avatar, etc)
   * 
   * @example
   * const response: ConversationHistoryResponseWithUser = {
   *   ...response,
   *   otherUser: {
   *     id: otherUserResult.data.getId().getValue(),
   *     profile: otherUserResult.data.toPublicInterface().profile,
   *     isActive: otherUserResult.data.isActive()
   *   }
   * };
   */

  /**
   * TODO: Unread count
   * Retornar cantidad de mensajes no leídos en esta conversación
   * 
   * @example
   * const unreadCount = await this.messageRepository.countUnreadMessages(
   *   userIdResult.data,
   *   otherUserIdResult.data
   * );
   * response.unreadCount = unreadCount;
   */

  /**
   * TODO: Mark as read
   * Auto-marcar mensajes como leídos al obtener historial
   * 
   * @example
   * if (autoMarkAsRead) {
   *   const messageIds = response.messages.map(m => m.id);
   *   await this.messageRepository.markAsRead(messageIds, userIdResult.data);
   * }
   */

  /**
   * TODO: Load older messages infinitely
   * Optimización para scroll infinito (cargar hacia atrás)
   * 
   * @example
   * interface InfiniteScrollQuery {
   *   beforeMessageId?: string; // Cargar mensajes anteriores a este ID
   *   limit: number;
   * }
   */
}
