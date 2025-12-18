import { Response } from 'express';
import { logger } from '../config/logger.config';
import {
  GetUserNotificationsUseCase,
  MarkNotificationsAsSeenUseCase,
  CountUnreadNotificationsUseCase
} from '../application/notifications';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';

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
   * GET /users/:userId/notifications
   * Obtiene las notificaciones del usuario con filtros y paginación
   * 
   * Query params validados por Zod middleware (GetNotificationsQuerySchema):
   * - onlyUnread?: boolean - Filtrar solo no vistas
   * - page?: number - Página actual (default: 1)
   * - limit?: number - Items por página (default: 20, max: 100)
   */
  async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - Authentication required',
          error: 'MISSING_AUTH'
        });
        return;
      }

      const { userId } = req.params;
      
      // Validar ownership: usuario solo puede ver sus propias notificaciones
      if (req.user.userId !== userId) {
        logger.warn({ 
          authenticatedUserId: req.user.userId,
          requestedUserId: userId
        }, 'Unauthorized access attempt to notifications');
        
        res.status(403).json({
          success: false,
          message: 'Forbidden - You can only access your own notifications',
          error: 'FORBIDDEN'
        });
        return;
      }

      // Query params ya validados por Zod middleware
      const filters = {
        onlyUnread: req.query.onlyUnread === 'true',
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      logger.info({ 
        userId,
        filters
      }, 'Getting user notifications');

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
      const statusCode = this.mapErrorToHttpStatus(error as Error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        userId: req.params.userId,
        authenticatedUserId: req.user?.userId
      }, 'Failed to get notifications');

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: this.getErrorCode(error as Error)
      });
    }
  }

  /**
   * PATCH /users/:userId/notifications/mark-as-seen
   * Marca notificaciones como vistas (batch update)
   * 
   * Body validado por Zod middleware (MarkAsSeenRequestSchema):
   * - notificationIds: string[] - Array de MongoDB ObjectIds (min: 1, max: 100)
   */
  async markAsSeen(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - Authentication required',
          error: 'MISSING_AUTH'
        });
        return;
      }

      const { userId } = req.params;
      const request = req.body;
      
      // Validar ownership: usuario solo puede marcar sus propias notificaciones
      if (req.user.userId !== userId) {
        logger.warn({ 
          authenticatedUserId: req.user.userId,
          requestedUserId: userId
        }, 'Unauthorized attempt to mark notifications as seen');
        
        res.status(403).json({
          success: false,
          message: 'Forbidden - You can only mark your own notifications',
          error: 'FORBIDDEN'
        });
        return;
      }

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
      const statusCode = this.mapErrorToHttpStatus(error as Error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        userId: req.params.userId,
        authenticatedUserId: req.user?.userId
      }, 'Failed to mark notifications as seen');

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: this.getErrorCode(error as Error)
      });
    }
  }

  /**
   * GET /users/:userId/notifications/unread-count
   * Obtiene el conteo de notificaciones no vistas
   * 
   * Usado para badge en navbar/header (polling cada 30s)
   * Endpoint lightweight sin paginación ni filtros complejos
   */
  async countUnread(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - Authentication required',
          error: 'MISSING_AUTH'
        });
        return;
      }

      const { userId } = req.params;
      
      // Validar ownership: usuario solo puede ver su propio conteo
      if (req.user.userId !== userId) {
        logger.warn({ 
          authenticatedUserId: req.user.userId,
          requestedUserId: userId
        }, 'Unauthorized access attempt to unread count');
        
        res.status(403).json({
          success: false,
          message: 'Forbidden - You can only access your own notification count',
          error: 'FORBIDDEN'
        });
        return;
      }

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
      const statusCode = this.mapErrorToHttpStatus(error as Error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        userId: req.params.userId,
        authenticatedUserId: req.user?.userId
      }, 'Failed to count unread notifications');

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: this.getErrorCode(error as Error)
      });
    }
  }

  /**
   * Mapea errores de dominio/use case a códigos HTTP
   */
  private mapErrorToHttpStatus(error: Error): number {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('not found')) {
      return 404;
    }

    if (errorMessage.includes('invalid') || errorMessage.includes('format')) {
      return 400;
    }

    if (errorMessage.includes('forbidden') || errorMessage.includes('access denied')) {
      return 403;
    }

    // Default: Internal Server Error
    return 500;
  }

  /**
   * Genera código de error para response
   */
  private getErrorCode(error: Error): string {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('not found')) {
      return 'NOT_FOUND';
    }

    if (errorMessage.includes('invalid') || errorMessage.includes('format')) {
      return 'INVALID_INPUT';
    }

    if (errorMessage.includes('forbidden') || errorMessage.includes('access denied')) {
      return 'FORBIDDEN';
    }

    return 'INTERNAL_ERROR';
  }
}
