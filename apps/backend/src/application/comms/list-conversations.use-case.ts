import { 
  UserId, 
  Result, 
  DomainError,
  ok,
  err
} from '@packages/domain';
import { MessageRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import type { 
  RecentConversationsQuery, 
  RecentConversationsResponse,
  ConversationSummary
} from '@packages/contracts';

/**
 * Use Case: List Recent Conversations
 * 
 * Retorna lista de conversaciones recientes del usuario autenticado ordenadas por
 * timestamp del último mensaje (más reciente primero).
 * 
 * Business Rules:
 * - Una conversación es un par único de usuarios (userA ↔ userB)
 * - Solo retorna el último mensaje de cada conversación
 * - Soporta filtrado por contactos (onlyContacts: true/false/undefined)
 * - Soporta búsqueda por nombre del otro usuario (search param)
 * - Paginación estándar (page, limit, total, totalPages)
 * 
 * Performance:
 * - Usa aggregation pipeline MongoDB (eficiente para grandes volúmenes)
 * - $group by otherUserId para obtener última conversación
 * - $lookup para join con User collection (displayName)
 * - $facet para paginación optimizada (1 query para count + data)
 * 
 * Sprint #13 - Recent Conversations Inbox Feature
 */
export class ListConversationsUseCase {
  private messageRepository: MessageRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
  }

  async execute(
    userId: string,
    query: RecentConversationsQuery
  ): Promise<Result<RecentConversationsResponse, DomainError>> {
    // 1. Validate userId format
    const userIdResult = UserId.create(userId);
    if (!userIdResult.success) {
      logger.warn({ userId, error: userIdResult.error.message }, 'Invalid user ID format in ListConversationsUseCase');
      return err(DomainError.create('INVALID_INPUT', `Invalid user ID: ${userIdResult.error.message}`));
    }

    const userIdVO = userIdResult.data;

    logger.info({ 
      userId: userIdVO.getValue(), 
      page: query.page, 
      limit: query.limit,
      onlyContacts: query.onlyContacts,
      search: query.search
    }, 'Listing recent conversations');

    // 2. Call repository with aggregation pipeline
    const result = await this.messageRepository.getRecentConversations(userIdVO, {
      page: query.page,
      limit: query.limit,
      onlyContacts: query.onlyContacts,
      search: query.search
    });

    if (!result.success) {
      logger.error({ 
        userId: userIdVO.getValue(), 
        error: result.error.message 
      }, 'Failed to list recent conversations');
      return err(result.error);
    }

    // 3. Map domain result to response DTO
    const { conversations, total, page, limit, totalPages } = result.data;

    const conversationDTOs: ConversationSummary[] = conversations.map(conv => ({
      otherUserId: conv.otherUserId,
      displayName: conv.displayName,
      lastMessageAt: conv.lastMessageAt,
      lastMessageContent: conv.lastMessageContent,
      lastMessageSenderId: conv.lastMessageSenderId,
      isContact: conv.isContact
    }));

    const response: RecentConversationsResponse = {
      conversations: conversationDTOs,
      total,
      page,
      limit,
      totalPages
    };

    logger.info({ 
      userId: userIdVO.getValue(), 
      conversationsCount: conversationDTOs.length,
      total,
      page
    }, 'Recent conversations retrieved successfully');

    return ok(response);
  }
}
