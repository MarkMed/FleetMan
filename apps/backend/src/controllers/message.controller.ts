import { Response } from 'express';
import { logger } from '../config/logger.config';
import { 
  DOMAIN_ERROR_HTTP_MAPPINGS, 
  ERROR_MESSAGE_KEYWORDS, 
  HTTP_STATUS 
} from '../config/error-mappings';
import {
  SendMessageUseCase,
  GetConversationHistoryUseCase,
  AcceptChatUseCase,
  BlockUserUseCase,
  ListConversationsUseCase
} from '../application/comms';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import type { 
  SendMessageRequest,
  ConversationHistoryQuery,
  ConversationHistoryResponse,
  MessageDTO,
  RecentConversationsQuery,
  RecentConversationsResponse
} from '@packages/contracts';

/**
 * MessageController handles Message-related HTTP requests
 * 
 * Responsibilities:
 * - Call appropriate Use Cases (SendMessage, GetConversationHistory)
 * - Transform domain responses to HTTP responses
 * - Handle HTTP-specific concerns (status codes, headers)
 * - Map domain errors to HTTP status codes
 * - Extract userId from JWT token (authMiddleware)
 * 
 * Security:
 * - senderId is extracted from JWT (req.user) - never from body
 * - Only authenticated users can send/receive messages
 * - Validation of contact relationship enforced by use case
 * 
 * Sprint #12 - Module 3: Messaging System
 */
export class MessageController {
  private sendMessageUseCase: SendMessageUseCase;
  private getConversationHistoryUseCase: GetConversationHistoryUseCase;
  private acceptChatUseCase: AcceptChatUseCase;
  private blockUserUseCase: BlockUserUseCase;
  private listConversationsUseCase: ListConversationsUseCase;

  constructor() {
    this.sendMessageUseCase = new SendMessageUseCase();
    this.getConversationHistoryUseCase = new GetConversationHistoryUseCase();
    this.acceptChatUseCase = new AcceptChatUseCase();
    this.blockUserUseCase = new BlockUserUseCase();
    this.listConversationsUseCase = new ListConversationsUseCase();
  }

  /**
   * Maps domain errors to HTTP response with status code and error code
   * 
   * Sprint #13 Task 9.3f-h: Improved error mapping using DomainError.code
   * Uses centralized DOMAIN_ERROR_HTTP_MAPPINGS for SSOT
   * 
   * Strategy:
   * 1. Check if error has 'code' property (DomainError)
   * 2. Use DOMAIN_ERROR_HTTP_MAPPINGS for precise mapping
   * 3. Fallback to message-based keyword detection
   * 4. Default to 500 Internal Server Error
   */
  private handleError(error: Error): { statusCode: number; errorCode: string } {
    // Step 1: Check if it's a DomainError with code property
    const isDomainError = error instanceof Error && 'code' in error;
    const domainErrorCode = isDomainError ? (error as any).code : null;

    // Step 2: Use centralized mapping for DomainError codes
    if (domainErrorCode && DOMAIN_ERROR_HTTP_MAPPINGS[domainErrorCode]) {
      const mapping = DOMAIN_ERROR_HTTP_MAPPINGS[domainErrorCode];
      logger.debug({ 
        domainErrorCode, 
        statusCode: mapping.statusCode, 
        errorCode: mapping.errorCode 
      }, 'Mapped DomainError to HTTP response');
      return mapping;
    }

    // Step 3: Fallback to message-based keyword detection for non-DomainErrors
    const errorMessage = error.message.toLowerCase();

    // Not found errors
    if (ERROR_MESSAGE_KEYWORDS.notFound.some(keyword => errorMessage.includes(keyword))) {
      return { statusCode: HTTP_STATUS.NOT_FOUND, errorCode: 'NOT_FOUND' };
    }

    // Invalid input errors
    if (ERROR_MESSAGE_KEYWORDS.invalidInput.some(keyword => errorMessage.includes(keyword))) {
      return { statusCode: HTTP_STATUS.BAD_REQUEST, errorCode: 'INVALID_INPUT' };
    }

    // Forbidden/access denied errors (Sprint #13: includes "blocked")
    if (ERROR_MESSAGE_KEYWORDS.forbidden.some(keyword => errorMessage.includes(keyword))) {
      return { statusCode: HTTP_STATUS.FORBIDDEN, errorCode: 'FORBIDDEN' };
    }

    // Contact validation errors
    if (ERROR_MESSAGE_KEYWORDS.notContact.some(keyword => errorMessage.includes(keyword))) {
      return { statusCode: HTTP_STATUS.FORBIDDEN, errorCode: 'NOT_CONTACT' };
    }

    // User inactive errors
    if (ERROR_MESSAGE_KEYWORDS.inactive.some(keyword => errorMessage.includes(keyword))) {
      return { statusCode: HTTP_STATUS.FORBIDDEN, errorCode: 'INVALID_STATE' };
    }

    // Conflict errors
    if (ERROR_MESSAGE_KEYWORDS.conflict.some(keyword => errorMessage.includes(keyword))) {
      return { statusCode: HTTP_STATUS.CONFLICT, errorCode: 'CONFLICT' };
    }

    // Step 4: Default to 500 Internal Server Error
    logger.warn({ 
      errorMessage: error.message, 
      errorCode: domainErrorCode 
    }, 'Unmapped error, defaulting to 500 Internal Server Error');
    return { statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, errorCode: 'INTERNAL_ERROR' };
  }

  /**
   * POST /api/v1/messages
   * Send a message to another user (contact)
   * 
   * Body validated by Zod middleware (SendMessageRequestSchema):
   * - recipientId: string - ID of the recipient user (must be a contact)
   * - content: string - Message content (min: 1, max: 1000 chars)
   * 
   * senderId is extracted from JWT token (req.user.userId) - NOT from body
   * 
   * Validations (enforced by use case):
   * - Both users must exist and be active
   * - Sender must have recipient as contact (unidirectional)
   * - No self-messaging (senderId ≠ recipientId)
   * - Content max 1000 chars
   * 
   * SSE Integration:
   * - Message is saved FIRST (critical)
   * - SSE notification sent AFTER (fire-and-forget)
   * - If SSE fails, message is still saved
   */
  async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Extract senderId from JWT token (authenticated by authMiddleware)
      const senderId = req.user!.userId;
      
      // Body already validated by Zod middleware
      const body = req.body as SendMessageRequest;

      logger.info({ 
        senderId, 
        recipientId: body.recipientId,
        contentLength: body.content.length
      }, 'Sending message via HTTP controller');

      // Execute use case with senderId from JWT
      const result = await this.sendMessageUseCase.execute({
        senderId,
        recipientId: body.recipientId,
        content: body.content
      });

      // Handle domain errors
      if (!result.success) {
        const { statusCode, errorCode } = this.handleError(result.error);
        logger.warn({ 
          senderId,
          recipientId: body.recipientId,
          error: result.error.message,
          errorCode
        }, 'Failed to send message');

        res.status(statusCode).json({
          success: false,
          message: result.error.message,
          error: errorCode
        });
        return;
      }

      // Success response with saved message
      const savedMessage: MessageDTO = result.data;
      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: {
          message: savedMessage
        }
      });

    } catch (error) {
      const { statusCode, errorCode } = this.handleError(error as Error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        senderId: req.user?.userId,
        recipientId: req.body?.recipientId
      }, 'Unexpected error sending message');

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: errorCode
      });
    }
  }

  /**
   * GET /api/v1/messages/conversations/:otherUserId
   * Get conversation history with another user
   * 
   * Path params validated by Zod middleware (ConversationParamsSchema):
   * - otherUserId: string - ID of the other user in the conversation
   * 
   * Query params validated by Zod middleware (ConversationHistoryQuerySchema):
   * - page?: number - Page number (default: 1, min: 1)
   * - limit?: number - Messages per page (default: 20, max: 50)
   * 
   * userId is extracted from JWT token (req.user.userId)
   * 
   * Response:
   * - Bidirectional messages: (A→B) OR (B→A)
   * - Ordered by sentAt DESC (most recent first)
   * - Paginated result with metadata (total, totalPages)
   * 
   * Design Decision:
   * - NO validation of current contact relationship
   * - Allows viewing historical messages even if no longer contacts
   * - History is immutable (audit trail)
   */
  async getConversationHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Extract userId from JWT token
      const userId = req.user!.userId;
      
      // Path params already validated by Zod middleware
      const { otherUserId } = req.params;
      
      // Query params already validated and coerced by Zod middleware
      const query = req.query as unknown as ConversationHistoryQuery;

      logger.info({ 
        userId, 
        otherUserId,
        page: query.page,
        limit: query.limit
      }, 'Getting conversation history via HTTP controller');

      // Execute use case
      const result = await this.getConversationHistoryUseCase.execute(
        userId,
        otherUserId,
        query
      );

      // Handle domain errors
      if (!result.success) {
        const { statusCode, errorCode } = this.handleError(result.error);
        logger.warn({ 
          userId,
          otherUserId,
          error: result.error.message,
          errorCode
        }, 'Failed to get conversation history');

        res.status(statusCode).json({
          success: false,
          message: result.error.message,
          error: errorCode
        });
        return;
      }

      // Success response with paginated messages
      const history: ConversationHistoryResponse = result.data;
      res.status(200).json({
        success: true,
        message: 'Conversation history retrieved successfully',
        data: history
      });

    } catch (error) {
      const { statusCode, errorCode } = this.handleError(error as Error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        userId: req.user?.userId,
        otherUserId: req.params?.otherUserId
      }, 'Unexpected error getting conversation history');

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: errorCode
      });
    }
  }

  // =============================================================================
  // 🔐 CHAT ACCESS CONTROL ENDPOINTS (Sprint #13 Task 9.3g)
  // =============================================================================

  /**
   * POST /api/v1/messages/chats/:userId/accept
   * Accept chat from a specific user (whitelist)
   * 
   * Sprint #13 Task 9.3g: Interfaces Layer Backend
   * 
   * Params validated by Zod middleware (ChatAccessControlParamsSchema):
   * - userId: string - ID of the user to accept chats from
   * 
   * Authenticated user (from JWT) accepts receiving chats from userId
   * 
   * Validations (enforced by use case):
   * - Both users must exist and be active
   * - Cannot accept chat from yourself
   * - Cannot accept chat from blocked user (unblock first)
   * - Idempotent: OK if already accepted
   */
  async acceptChat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Extract authenticated userId from JWT token
      const userId = req.user!.userId;
      
      // Extract fromUserId from path params (already validated by Zod)
      const { userId: fromUserId } = req.params;

      logger.info({ 
        userId, 
        fromUserId
      }, 'Accepting chat via HTTP controller');

      // Execute use case
      const result = await this.acceptChatUseCase.execute(userId, fromUserId);

      // Handle domain errors
      if (!result.success) {
        const { statusCode, errorCode } = this.handleError(result.error);
        logger.warn({ 
          userId,
          fromUserId,
          error: result.error.message,
          errorCode
        }, 'Failed to accept chat');

        res.status(statusCode).json({
          success: false,
          message: result.error.message,
          error: errorCode
        });
        return;
      }

      // Success response
      res.status(200).json({
        success: true,
        message: 'Chat accepted successfully'
      });

    } catch (error) {
      const { statusCode, errorCode } = this.handleError(error as Error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        userId: req.user?.userId,
        fromUserId: req.params?.userId
      }, 'Unexpected error accepting chat');

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: errorCode
      });
    }
  }

  /**
   * POST /api/v1/messages/chats/:userId/block
   * Block a specific user (blacklist)
   * 
   * Sprint #13 Task 9.3g: Interfaces Layer Backend
   * 
   * Params validated by Zod middleware (ChatAccessControlParamsSchema):
   * - userId: string - ID of the user to block
   * 
   * Authenticated user (from JWT) blocks userId
   * Blocked user cannot send messages to authenticated user (403 Forbidden)
   * 
   * Atomic operation: Adds to blacklist AND removes from whitelist
   * 
   * Validations (enforced by use case):
   * - Both users must exist and be active
   * - Cannot block yourself
   * - Idempotent: OK if already blocked
   * - Removes from acceptedChatsFrom if exists
   */
  async blockUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Extract authenticated userId from JWT token
      const userId = req.user!.userId;
      
      // Extract userIdToBlock from path params (already validated by Zod)
      const { userId: userIdToBlock } = req.params;

      logger.info({ 
        userId, 
        userIdToBlock
      }, 'Blocking user via HTTP controller');

      // Execute use case
      const result = await this.blockUserUseCase.execute(userId, userIdToBlock);

      // Handle domain errors
      if (!result.success) {
        const { statusCode, errorCode } = this.handleError(result.error);
        logger.warn({ 
          userId,
          userIdToBlock,
          error: result.error.message,
          errorCode
        }, 'Failed to block user');

        res.status(statusCode).json({
          success: false,
          message: result.error.message,
          error: errorCode
        });
        return;
      }

      // Success response
      res.status(200).json({
        success: true,
        message: 'User blocked successfully'
      });

    } catch (error) {
      const { statusCode, errorCode } = this.handleError(error as Error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        userId: req.user?.userId,
        userIdToBlock: req.params?.userId
      }, 'Unexpected error blocking user');

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: errorCode
      });
    }
  }

  /**
   * GET /api/v1/messages/conversations
   * List recent conversations (inbox view)
   * 
   * Returns paginated list of unique conversations ordered by last message timestamp.
   * Supports filtering by contacts and search by displayName.
   * 
   * Sprint #13 - Recent Conversations Inbox Feature
   */
  async listConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Extract userId from JWT token
      const userId = req.user!.userId;
      
      // Query params already validated and coerced by Zod middleware
      const query = req.query as unknown as RecentConversationsQuery;

      logger.info({ 
        userId, 
        page: query.page, 
        limit: query.limit,
        onlyContacts: query.onlyContacts,
        search: query.search
      }, 'Listing recent conversations via HTTP controller');

      // Execute use case
      const result = await this.listConversationsUseCase.execute(userId, query);

      // Handle domain errors
      if (!result.success) {
        const { statusCode, errorCode } = this.handleError(result.error);
        logger.warn({ 
          userId, 
          error: result.error.message, 
          errorCode 
        }, 'Failed to list recent conversations');

        res.status(statusCode).json({
          success: false,
          message: result.error.message,
          error: errorCode
        });
        return;
      }

      // Success response
      logger.info({ 
        userId, 
        conversationsCount: result.data.conversations.length,
        total: result.data.total,
        page: result.data.page
      }, 'Recent conversations retrieved successfully');

      res.status(200).json({
        success: true,
        message: 'Conversations retrieved successfully',
        data: result.data
      });

    } catch (error) {
      const { statusCode, errorCode } = this.handleError(error as Error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      logger.error({ 
        userId: req.user?.userId, 
        error: errorMessage 
      }, 'Unexpected error in listConversations controller');

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: errorCode
      });
    }
  }

  // =============================================================================
  // 🔮 POST-MVP: ENDPOINTS ESTRATÉGICOS (COMENTADOS)
  // =============================================================================

  /**
   * ✅ IMPLEMENTED: GET /api/v1/messages/conversations
   * List recent conversations with pagination and filters
   * 
   * See listConversations() method above (Sprint #13)
   * 
   * Original TODO: List recent conversations with unread counts
   * 
   * Use case: Display inbox/conversation list screen
   * 
   * Response:
   * {
   *   conversations: [
   *     {
   *       otherUser: { id, profile: { companyName }, type },
   *       lastMessage: { id, content, sentAt, senderId },
   *       unreadCount: number,
   *       lastMessageAt: Date
   *     }
   *   ],
   *   total: number
   * }
   * 
   * @example
   * async listConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
   *   const userId = req.user!.userId;
   *   const result = await this.listConversationsUseCase.execute(userId);
   *   // ...
   * }
   */

  /**
   * TODO: PATCH /api/v1/messages/:messageId/read
   * Mark specific message as read
   * 
   * Use case: Read receipts, update unread badge
   * 
   * @example
   * async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
   *   const { messageId } = req.params;
   *   const userId = req.user!.userId;
   *   await this.markAsReadUseCase.execute(userId, messageId);
   *   // ...
   * }
   */

  /**
   * TODO: DELETE /api/v1/messages/:messageId
   * Delete a message (soft delete, only hide from sender)
   * 
   * Use case: Allow users to delete sent messages from their view
   * 
   * @example
   * async deleteMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
   *   const { messageId } = req.params;
   *   const userId = req.user!.userId;
   *   await this.deleteMessageUseCase.execute(userId, messageId);
   *   // ...
   * }
   */

  /**
   * TODO: GET /api/v1/messages/search
   * Search messages by content
   * 
   * Query: ?q=search+term&userId=optional_user_filter
   * Use case: Find specific messages in conversations
   * 
   * @example
   * async searchMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
   *   const userId = req.user!.userId;
   *   const { q, userId: filterUserId } = req.query;
   *   await this.searchMessagesUseCase.execute(userId, q, filterUserId);
   *   // ...
   * }
   */
}
