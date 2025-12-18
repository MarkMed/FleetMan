import { Response } from 'express';
import { logger } from '../config/logger.config';
import {
  GetUserNotificationsUseCase,
  MarkNotificationsAsSeenUseCase,
  CountUnreadNotificationsUseCase
} from '../application/notifications';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { GetNotificationsQuery } from '@packages/contracts';

/**
 * NotificationController handles Notification-related HTTP requests
 * 
 * Responsibilities:
 * - Call appropriate Use Cases
 * - Transform domain responses to HTTP responses
 * - Handle HTTP-specific concerns (status codes, headers)
 * - Map domain errors to HTTP status codes
 * - Validate ownership (user can only access their own notifications)
 * 
 * Note: AddNotificationUseCase is NOT exposed here - it's internal, 
 * called by other features (QuickCheck, Events, Maintenance)
 * 
 * Sprint #9 - Sistema de Notificaciones
 */
export class NotificationController {
  private getUserNotificationsUseCase: GetUserNotificationsUseCase;
  private markAsSeenUseCase: MarkNotificationsAsSeenUseCase;
  private countUnreadUseCase: CountUnreadNotificationsUseCase;

  constructor() {
    this.getUserNotificationsUseCase = new GetUserNotificationsUseCase();
    this.markAsSeenUseCase = new MarkNotificationsAsSeenUseCase();
    this.countUnreadUseCase = new CountUnreadNotificationsUseCase();
  }

  /**
   * Validates authentication - req.user must be present
   * @returns true if valid, false otherwise
   */
  private validateAuthentication(req: AuthenticatedRequest, res: Response): boolean {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized - Authentication required',
        error: 'MISSING_AUTH'
      });
      return false;
    }
    return true;
  }

  /**
   * Validates ownership - user can only access their own resources
   * @returns true if valid, false otherwise
   */
  private validateOwnership(req: AuthenticatedRequest, res: Response, userId: string): boolean {
    if (req.user!.userId !== userId) {
      logger.warn({ 
        authenticatedUserId: req.user!.userId,
        requestedUserId: userId
      }, 'Unauthorized access attempt - ownership validation failed');
      
      res.status(403).json({
        success: false,
        message: 'Forbidden - You can only access your own resources',
        error: 'FORBIDDEN'
      });
      return false;
    }
    return true;
  }

  /**
   * Maps errors to HTTP response with status code and error code
   */
  private handleError(error: Error): { statusCode: number; errorCode: string } {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('not found')) {
      return { statusCode: 404, errorCode: 'NOT_FOUND' };
    }

    if (errorMessage.includes('invalid') || errorMessage.includes('format')) {
      return { statusCode: 400, errorCode: 'INVALID_INPUT' };
    }

    if (errorMessage.includes('forbidden') || errorMessage.includes('access denied')) {
      return { statusCode: 403, errorCode: 'FORBIDDEN' };
    }

    return { statusCode: 500, errorCode: 'INTERNAL_ERROR' };
  }

  /**
   * GET /users/:userId/notifications
   * Retrieves user notifications with filters and pagination
   * 
   * Query params validated by Zod middleware (GetNotificationsQuerySchema):
   * - onlyUnread?: boolean - Filter only unread notifications
   * - page?: number - Current page (default: 1)
   * - limit?: number - Items per page (default: 20, max: 100)
   */
  async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!this.validateAuthentication(req, res)) return;

      const { userId } = req.params;
      
      if (!this.validateOwnership(req, res, userId)) return;

      // Query params already validated and parsed by Zod middleware
      // z.coerce automatically parses strings to correct types
      const validatedQuery = req.query as unknown as GetNotificationsQuery;
      const filters: GetNotificationsQuery = {
        onlyUnread: validatedQuery.onlyUnread,
        page: validatedQuery.page,
        limit: validatedQuery.limit
      };

      logger.info({ userId, filters }, 'Getting user notifications');

      const result = await this.getUserNotificationsUseCase.execute(userId, filters);

      res.status(200).json({
        success: true,
        message: 'Notifications retrieved successfully',
        data: {
          notifications: result.notifications,
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      });

    } catch (error) {
      const { statusCode, errorCode } = this.handleError(error as Error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        userId: req.params.userId,
        authenticatedUserId: req.user?.userId
      }, 'Failed to get notifications');

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: errorCode
      });
    }
  }

  /**
   * PATCH /users/:userId/notifications/mark-as-seen
   * Marks notifications as seen (batch update)
   * 
   * Body validated by Zod middleware (MarkAsSeenRequestSchema):
   * - notificationIds: string[] - Array of MongoDB ObjectIds (min: 1, max: 100)
   */
  async markAsSeen(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!this.validateAuthentication(req, res)) return;

      const { userId } = req.params;
      const request = req.body;
      
      if (!this.validateOwnership(req, res, userId)) return;

      logger.info({ 
        userId,
        notificationCount: request.notificationIds.length
      }, 'Marking notifications as seen');

      await this.markAsSeenUseCase.execute(userId, request);

      res.status(200).json({
        success: true,
        message: 'Notifications marked as seen successfully',
        data: {
          markedCount: request.notificationIds.length
        }
      });

    } catch (error) {
      const { statusCode, errorCode } = this.handleError(error as Error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        userId: req.params.userId,
        authenticatedUserId: req.user?.userId
      }, 'Failed to mark notifications as seen');

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: errorCode
      });
    }
  }

  /**
   * GET /users/:userId/notifications/unread-count
   * Gets the count of unread notifications
   * 
   * Used for badge in navbar/header (polling every 30s)
   * Lightweight endpoint without pagination or complex filters
   */
  async countUnread(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!this.validateAuthentication(req, res)) return;

      const { userId } = req.params;
      
      if (!this.validateOwnership(req, res, userId)) return;

      logger.debug({ userId }, 'Counting unread notifications');

      const unreadCount = await this.countUnreadUseCase.execute(userId);

      res.status(200).json({
        success: true,
        message: 'Unread count retrieved successfully',
        data: {
          unreadCount
        }
      });

    } catch (error) {
      const { statusCode, errorCode } = this.handleError(error as Error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        userId: req.params.userId,
        authenticatedUserId: req.user?.userId
      }, 'Failed to count unread notifications');

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: errorCode
      });
    }
  }
}
