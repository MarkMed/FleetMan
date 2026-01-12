import { Response } from 'express';
import { logger } from '../config/logger.config';
import {
  SendMessageUseCase,
  GetConversationHistoryUseCase
} from '../application/comms';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import type { 
  SendMessageRequest,
  ConversationHistoryQuery,
  ConversationHistoryResponse,
  MessageDTO
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

  constructor() {
    this.sendMessageUseCase = new SendMessageUseCase();
    this.getConversationHistoryUseCase = new GetConversationHistoryUseCase();
  }

  /**
   * Maps domain errors to HTTP response with status code and error code
   */
  private handleError(error: Error): { statusCode: number; errorCode: string } {
    const errorMessage = error.message.toLowerCase();

    // Not found errors (user not found, recipient not found)
    if (errorMessage.includes('not found')) {
      return { statusCode: 404, errorCode: 'NOT_FOUND' };
    }

    // Invalid input errors (invalid ID format, validation errors)
    if (errorMessage.includes('invalid') || errorMessage.includes('format')) {
      return { statusCode: 400, errorCode: 'INVALID_INPUT' };
    }

    // Contact validation errors (not a contact)
    if (errorMessage.includes('not_contact') || errorMessage.includes('non-contact')) {
      return { statusCode: 403, errorCode: 'NOT_CONTACT' };
    }

    // User inactive errors
    if (errorMessage.includes('not active') || errorMessage.includes('inactive')) {
      return { statusCode: 403, errorCode: 'INVALID_STATE' };
    }

    // Forbidden/access denied errors
    if (errorMessage.includes('forbidden') || errorMessage.includes('access denied')) {
      return { statusCode: 403, errorCode: 'FORBIDDEN' };
    }

    // Default internal error
    return { statusCode: 500, errorCode: 'INTERNAL_ERROR' };
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
  // 🔮 POST-MVP: ENDPOINTS ESTRATÉGICOS (COMENTADOS)
  // =============================================================================

  /**
   * TODO: GET /api/v1/messages/conversations
   * List recent conversations with unread counts
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
