import { UserId } from '@packages/domain';
import { UserRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import type { MarkAsSeenRequest } from '@packages/contracts';

/**
 * Use Case: Mark Notifications as Seen
 * 
 * Responsabilidades:
 * 1. Validar formato de userId
 * 2. Marcar notificaciones como vistas en batch
 * 3. Actualizar estado wasSeen = true
 * 
 * Comportamiento:
 * - Batch update: hasta 100 notificaciones simultáneas
 * - IDs inválidos se ignoran silenciosamente (MongoDB behavior)
 * - No se valida ownership de cada notificación (se asume validado en controller)
 * 
 * Sprint #9 - Sistema de Notificaciones
 */
export class MarkNotificationsAsSeenUseCase {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Ejecuta el caso de uso de marcar notificaciones como vistas
   * 
   * @param userId - ID del usuario propietario de las notificaciones
   * @param request - Array de notificationIds a marcar (validados por Zod)
   * @returns Promise<void>
   * @throws Error si userId inválido o usuario no existe
   */
  async execute(
    userId: string,
    request: MarkAsSeenRequest
  ): Promise<void> {
    logger.info({ 
      userId,
      notificationCount: request.notificationIds.length 
    }, 'Marking notifications as seen');

    try {
      // 1. Validar formato de userId
      const userIdResult = UserId.create(userId);
      if (!userIdResult.success) {
        throw new Error(`Invalid user ID format: ${userIdResult.error.message}`);
      }

      // 2. Marcar notificaciones como vistas usando repositorio
      const markResult = await this.userRepository.markNotificationsAsSeen(
        userIdResult.data,
        request.notificationIds
      );

      if (!markResult.success) {
        // Mapear errores de dominio a mensajes HTTP-friendly
        const error = markResult.error;
        
        if (error.message.includes('not found')) {
          throw new Error(`User with ID ${userId} not found`);
        }
        
        throw new Error(error.message);
      }

      logger.info({ 
        userId,
        markedCount: request.notificationIds.length
      }, 'Notifications marked as seen successfully');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ 
        userId,
        notificationIds: request.notificationIds,
        error: errorMessage
      }, 'Failed to mark notifications as seen');
      
      throw error;
    }
  }
}
